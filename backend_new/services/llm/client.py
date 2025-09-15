"""
LLM service for generating search queries and learning paths.
"""

import json
import os
from typing import List, Dict, Any, Optional
from pathlib import Path
import httpx

from models.schemas import UserProfile, Resource, PathStep, LearningPath, SearchQuery, Platform
from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)


class LLMService:
    """Service for LLM-based content generation."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "openai/gpt-oss-20b"):
        """Initialize LLM service."""
        # Use configured API key from settings or environment; do not hardcode secrets
        self.api_key = api_key or settings.groq_api_key or os.getenv("GROQ_API_KEY")
        self.model = model
        self.base_url = "https://api.groq.com/openai/v1"
        self.prompts_dir = Path(__file__).parent / "prompts"
        
        if not self.api_key:
            logger.warning("No Groq API key provided - LLM service will not function")
        
        # Load prompt templates
        self.query_gen_template = self._load_prompt_template("query_gen.txt")
        self.path_synth_template = self._load_prompt_template("path_synth.txt")
    
    def _load_prompt_template(self, filename: str) -> str:
        """Load a prompt template from file."""
        try:
            template_path = self.prompts_dir / filename
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            logger.warning(f"Prompt template {filename} not found. Using default.")
            return self._get_default_template(filename)
    
    def _get_default_template(self, filename: str) -> str:
        """Get default prompt templates."""
        templates = {
            "query_gen.txt": """Generate targeted search queries for learning resources.

User Profile:
- Goal: {goal}
- Experience Level: {experience_level}
- Learning Style: {learning_style}
- Topic: {topic}

For each platform, create 3-5 specific search queries.
Platforms: {platforms}

Return JSON format:
{{
    "platform_name": ["query1", "query2", "query3"]
}}""",
            
            "path_synth.txt": """Create a structured learning path using provided resources.

User Profile:
- Goal: {goal}
- Experience Level: {experience_level}
- Learning Style: {learning_style}
- Topic: {topic}

Resources:
{resources}

Create 4-8 progressive learning steps with clear objectives and proper resource allocation."""
        }
        return templates.get(filename, "")
    
    # Internal helpers
    def _enum_to_str(self, v: Any) -> str:
        """Return string from Enum or string without relying on .value when not present."""
        if isinstance(v, str):
            return v
        try:
            return v.value  # type: ignore[attr-defined]
        except Exception:
            return str(v)

    def _normalize_platforms(self, platforms: List[Platform]) -> List[str]:
        return [self._enum_to_str(p).lower() for p in platforms]

    async def generate_search_queries(
        self,
        user_profile: UserProfile,
        topic: str,
        platforms: List[Platform]
    ) -> List[SearchQuery]:
        """Generate search queries for different platforms."""
        if not self.api_key:
            raise RuntimeError("GROQ_API_KEY is not configured; cannot generate search queries via Groq")
        
        try:
            # Structured JSON instruction for Groq
            input_payload = {
                "instruction": "Generate 3-5 targeted search queries per platform. Return ONLY JSON with the shape {\"queries\": {\"platform\": [\"query\"]}} and no extra text.",
                "user_profile": {
                    "goal": user_profile.goal,
                    "experience_level": self._enum_to_str(user_profile.experience_level),
                    "learning_style": self._enum_to_str(user_profile.learning_style)
                },
                "topic": topic,
                "platforms": self._normalize_platforms(platforms)
            }

            response_text = await self._call_llm(json.dumps(input_payload), json_only=True)

            # Enforce JSON-only response
            queries_obj = json.loads(response_text)
            if not isinstance(queries_obj, dict) or "queries" not in queries_obj:
                raise ValueError("Groq response missing 'queries' key")
            queries_dict = queries_obj["queries"]
            
            search_queries = []
            priority = 1
            
            for platform_name, queries in queries_dict.items():
                platform_name_l = str(platform_name).lower()
                # Skip unknown platforms
                if platform_name_l not in {p.lower() for p in self._normalize_platforms(platforms)}:
                    continue
                platform = Platform(platform_name_l)
                for query in queries:
                    search_queries.append(SearchQuery(
                        platform=platform,
                        query=query,
                        priority=priority
                    ))
                    priority += 1
            
            return search_queries
            
        except Exception as e:
            logger.error(f"Error generating search queries: {e}")
            raise
    
    async def synthesize_learning_path(
        self,
        user_profile: UserProfile,
        topic: str,
        resources: List[Resource],
        duration_preference: Optional[str] = None
    ) -> LearningPath:
        """Synthesize a learning path from resources."""
        if not self.api_key:
            raise RuntimeError("GROQ_API_KEY is not configured; cannot synthesize learning path via Groq")
        
        try:
            # Provide structured JSON input and require strict JSON output
            resources_payload = [
                {
                    "id": r.id,
                    "title": r.title,
                    "description": r.description or "",
                    "url": r.url,
                    "platform": self._enum_to_str(r.platform),
                    "duration": r.duration or "",
                    "difficulty": self._enum_to_str(r.difficulty) if r.difficulty else None,
                    "tags": r.tags or []
                }
                for r in resources
            ]

            input_payload = {
                "instruction": (
                    "Create a structured learning path using provided resources. "
                    "Return ONLY JSON matching the schema exactly: {\n"
                    "  \"title\": string,\n"
                    "  \"description\": string,\n"
                    "  \"total_duration\": string,\n"
                    "  \"difficulty\": one of ['beginner','intermediate','advanced','expert'],\n"
                    "  \"steps\": [ {\n"
                    "    \"step_number\": number,\n"
                    "    \"title\": string,\n"
                    "    \"description\": string,\n"
                    "    \"estimated_duration\": string,\n"
                    "    \"learning_objectives\": [string],\n"
                    "    \"resource_ids\": [string]  // must reference ids from 'resources'\n"
                    "  } ]\n"
                    "} with no additional text."
                ),
                "user_profile": {
                    "goal": user_profile.goal,
                    "experience_level": self._enum_to_str(user_profile.experience_level),
                    "learning_style": self._enum_to_str(user_profile.learning_style)
                },
                "topic": topic,
                "duration_preference": duration_preference or "flexible",
                "resources": resources_payload
            }

            response_text = await self._call_llm(json.dumps(input_payload), json_only=True)

            data = json.loads(response_text)
            return self._convert_parsed_data_to_path(data, resources, user_profile)
            
        except Exception as e:
            logger.error(f"Error synthesizing learning path: {e}")
            raise
    
    async def _call_llm(self, prompt: str, json_only: bool = False) -> str:
        """Make API call to LLM service."""
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a service that returns only valid JSON objects, with no additional commentary."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 1200
        }
        if json_only:
            # Request JSON-only output in OpenAI-compatible way
            payload["response_format"] = {"type": "json_object"}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            body = e.response.text if e.response is not None else "<no body>"
            logger.error(f"Groq HTTP error {e.response.status_code if e.response else 'unknown'}: {body}")
            raise
        except Exception as e:
            logger.error(f"Error calling Groq API: {e}")
            raise
    
    # Fallbacks removed by request; rely on Groq strictly.
    
    # Fallbacks removed by request; rely on Groq strictly.
    
    def _parse_learning_path_response(
        self, 
        response: str, 
        resources: List[Resource], 
        user_profile: UserProfile
    ) -> LearningPath:
        """Parse LLM response into learning path structure."""
        # The response must be valid JSON; no fallback behavior.
        try:
            data = json.loads(response)
            return self._convert_parsed_data_to_path(data, resources, user_profile)
        except Exception as e:
            logger.error(f"Error parsing LLM response: {e}")
            raise
    
    def _convert_parsed_data_to_path(
        self, 
        data: Dict[str, Any], 
        resources: List[Resource], 
        user_profile: UserProfile
    ) -> LearningPath:
        """Convert parsed JSON data to LearningPath object."""
        # Validate required keys
        required_keys = {"title", "description", "total_duration", "difficulty", "steps"}
        if not isinstance(data, dict) or not required_keys.issubset(data.keys()):
            raise ValueError("Groq response missing required learning_path fields")

        # Map resources by id for lookup
        resource_by_id = {r.id: r for r in resources}

        # Build steps with resource mapping
        steps: List[PathStep] = []
        for step in data.get("steps", []):
            res_ids = step.get("resource_ids", []) or []
            step_resources = [resource_by_id[rid] for rid in res_ids if rid in resource_by_id]
            steps.append(PathStep(
                step_number=int(step.get("step_number", len(steps) + 1)),
                title=str(step.get("title", "Untitled Step")),
                description=str(step.get("description", "")),
                resources=step_resources,
                estimated_duration=str(step.get("estimated_duration", "1-2 hours")),
                learning_objectives=[str(x) for x in (step.get("learning_objectives", []) or [])]
            ))

        # Coerce difficulty to enum if string
        difficulty_str = str(data.get("difficulty", "beginner")).lower()
        from models.schemas import ExperienceLevel  # import here to avoid cycle
        try:
            difficulty = ExperienceLevel(difficulty_str)
        except Exception:
            difficulty = ExperienceLevel.BEGINNER

        return LearningPath(
            title=str(data.get("title")),
            description=str(data.get("description")),
            total_duration=str(data.get("total_duration")),
            difficulty=difficulty,
            steps=steps
        )