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
        
        # Configuration for free tier optimization
        self.max_resources = 8  # Limit resources sent to Groq
        self.max_description_length = 120  # Max chars for resource descriptions
        self.max_title_length = 60  # Max chars for resource titles
        self.max_goal_length = 80  # Max chars for user goals
        
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
        """Get default prompt templates (optimized for token usage)."""
        templates = {
            "query_gen.txt": """Generate search queries for learning resources.

Profile: {goal} | {experience_level} | {learning_style}
Topic: {topic}
Platforms: {platforms}

Return JSON: {{"platform": ["query1", "query2", "query3"]}}""",
            
            "path_synth.txt": """Create learning path from resources.

Profile: {goal} | {experience_level} | {learning_style}
Topic: {topic}
Resources: {resources}

Create 4-6 progressive steps with objectives and resources."""
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

    def _estimate_token_count(self, text: str) -> int:
        """Rough estimation of token count (1 token ≈ 4 characters)."""
        return len(text) // 4

    def _truncate_if_needed(self, text: str, max_tokens: int = 100) -> str:
        """Truncate text if it exceeds estimated token limit."""
        estimated_tokens = self._estimate_token_count(text)
        if estimated_tokens > max_tokens:
            max_chars = max_tokens * 4
            return text[:max_chars] + "..."
        return text
    
    def get_optimization_stats(self) -> Dict[str, Any]:
        """Get current optimization settings for monitoring."""
        return {
            "max_resources": self.max_resources,
            "max_description_length": self.max_description_length,
            "max_title_length": self.max_title_length,
            "max_goal_length": self.max_goal_length,
            "model": self.model,
            "estimated_tokens_per_resource": 50,  # Rough estimate
            "optimization_enabled": True
        }

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
            # Optimized payload for Groq free tier
            input_payload = {
                "instruction": "Generate 3-5 search queries per platform. Return JSON: {\"queries\": {\"platform\": [\"query\"]}}",
                "user_profile": {
                    "goal": self._truncate_if_needed(user_profile.goal, max_tokens=20),  # ~80 chars
                    "experience_level": self._enum_to_str(user_profile.experience_level),
                    "learning_style": self._enum_to_str(user_profile.learning_style)
                },
                "topic": topic[:40] if len(topic) > 40 else topic,  # Shorter topic limit
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
            # Optimized resources payload for Groq free tier - limit data sent
            # Limit resources and prioritize by relevance if possible
            limited_resources = resources[:self.max_resources] if len(resources) > self.max_resources else resources
            
            resources_payload = [
                {
                    "id": r.id,
                    "title": r.title[:self.max_title_length] if len(r.title) > self.max_title_length else r.title,
                    "description": self._truncate_if_needed(r.description or "", max_tokens=30),  # ~120 chars
                    "platform": self._enum_to_str(r.platform),
                    "duration": (r.duration or "")[:15] if r.duration and len(r.duration) > 15 else (r.duration or ""),
                    "difficulty": self._enum_to_str(r.difficulty) if r.difficulty else None,
                    "tags": (r.tags or [])[:2]  # Limit to first 2 tags only
                }
                for r in limited_resources
            ]
            
            logger.info(f"Sending {len(limited_resources)} resources (reduced from {len(resources)}) to Groq")

            input_payload = {
                "instruction": (
                    "Create learning path from resources. Return JSON: "
                    "{\"title\": string, \"description\": string, \"total_duration\": string, "
                    "\"difficulty\": \"beginner|intermediate|advanced|expert\", "
                    "\"steps\": [{\"step_number\": number, \"title\": string, \"description\": string, "
                    "\"estimated_duration\": string, \"learning_objectives\": [string], \"resource_ids\": [string]}]}"
                ),
                "user_profile": {
                    "goal": self._truncate_if_needed(user_profile.goal, max_tokens=20),  # ~80 chars
                    "experience_level": self._enum_to_str(user_profile.experience_level),
                    "learning_style": self._enum_to_str(user_profile.learning_style)
                },
                "topic": topic[:40] if len(topic) > 40 else topic,
                "duration_preference": (duration_preference or "flexible")[:30],  # Limit duration preference text
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
        # Log estimated token usage for monitoring
        estimated_tokens = self._estimate_token_count(prompt)
        logger.info(f"Sending ~{estimated_tokens} tokens to Groq API")
        
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 800  # Reduced from 1200 for free tier
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