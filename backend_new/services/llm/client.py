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
    
    def __init__(self, api_key: Optional[str] = None, model: str = "llama3-8b-8192"):
        """Initialize LLM service."""
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
    
    async def generate_search_queries(
        self,
        user_profile: UserProfile,
        topic: str,
        platforms: List[Platform]
    ) -> List[SearchQuery]:
        """Generate search queries for different platforms."""
        if not self.api_key:
            return self._fallback_search_queries(topic, platforms)
        
        try:
            prompt = self.query_gen_template.format(
                goal=user_profile.goal,
                experience_level=user_profile.experience_level.value,
                learning_style=user_profile.learning_style.value,
                topic=topic,
                platforms=[p.value for p in platforms]
            )
            
            response = await self._call_llm(prompt)
            queries_dict = json.loads(response)
            
            search_queries = []
            priority = 1
            
            for platform_name, queries in queries_dict.items():
                platform = Platform(platform_name.lower())
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
            return self._fallback_search_queries(topic, platforms)
    
    async def synthesize_learning_path(
        self,
        user_profile: UserProfile,
        topic: str,
        resources: List[Resource],
        duration_preference: Optional[str] = None
    ) -> LearningPath:
        """Synthesize a learning path from resources."""
        if not self.api_key:
            return self._fallback_learning_path(user_profile, topic, resources)
        
        try:
            # Format resources for prompt
            resources_text = "\n".join([
                f"- {r.title} ({r.platform.value}): {r.description or 'No description'}"
                for r in resources
            ])
            
            prompt = self.path_synth_template.format(
                goal=user_profile.goal,
                experience_level=user_profile.experience_level.value,
                learning_style=user_profile.learning_style.value,
                topic=topic,
                duration_preference=duration_preference or "flexible",
                resources=resources_text
            )
            
            response = await self._call_llm(prompt)
            
            # Parse the response and create learning path
            return self._parse_learning_path_response(response, resources, user_profile)
            
        except Exception as e:
            logger.error(f"Error synthesizing learning path: {e}")
            return self._fallback_learning_path(user_profile, topic, resources)
    
    async def _call_llm(self, prompt: str) -> str:
        """Make API call to LLM service."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 2000
                }
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
    
    def _fallback_search_queries(self, topic: str, platforms: List[Platform]) -> List[SearchQuery]:
        """Generate fallback search queries without LLM."""
        queries = []
        priority = 1
        
        for platform in platforms:
            platform_queries = [
                f"{topic} tutorial",
                f"learn {topic}",
                f"{topic} course",
                f"{topic} guide"
            ]
            
            for query in platform_queries:
                queries.append(SearchQuery(
                    platform=platform,
                    query=query,
                    priority=priority
                ))
                priority += 1
        
        return queries
    
    def _fallback_learning_path(
        self, 
        user_profile: UserProfile, 
        topic: str, 
        resources: List[Resource]
    ) -> LearningPath:
        """Generate fallback learning path without LLM."""
        steps = []
        resources_per_step = max(1, len(resources) // 4)
        
        for i in range(0, len(resources), resources_per_step):
            step_resources = resources[i:i + resources_per_step]
            step_number = len(steps) + 1
            
            steps.append(PathStep(
                step_number=step_number,
                title=f"Step {step_number}: Learn {topic}",
                description=f"Study {topic} using the provided resources",
                resources=step_resources,
                estimated_duration="1-2 hours",
                learning_objectives=[f"Understand {topic} concepts"]
            ))
        
        return LearningPath(
            title=f"Learn {topic}",
            description=f"A learning path for {topic}",
            total_duration="1-2 weeks",
            difficulty=user_profile.experience_level,
            steps=steps
        )
    
    def _parse_learning_path_response(
        self, 
        response: str, 
        resources: List[Resource], 
        user_profile: UserProfile
    ) -> LearningPath:
        """Parse LLM response into learning path structure."""
        # This is a simplified parser - in production, you'd want more robust parsing
        try:
            # Try to extract JSON if present
            if "{" in response and "}" in response:
                start = response.find("{")
                end = response.rfind("}") + 1
                json_str = response[start:end]
                data = json.loads(json_str)
                
                # Convert parsed data to LearningPath
                return self._convert_parsed_data_to_path(data, resources, user_profile)
            else:
                # Fallback to simple parsing
                return self._fallback_learning_path(user_profile, "the topic", resources)
                
        except Exception as e:
            logger.error(f"Error parsing LLM response: {e}")
            return self._fallback_learning_path(user_profile, "the topic", resources)
    
    def _convert_parsed_data_to_path(
        self, 
        data: Dict[str, Any], 
        resources: List[Resource], 
        user_profile: UserProfile
    ) -> LearningPath:
        """Convert parsed JSON data to LearningPath object."""
        # Implementation would depend on the expected JSON structure
        # This is a placeholder implementation
        return self._fallback_learning_path(user_profile, "the topic", resources)