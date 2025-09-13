"""
LLM service client for generating search queries and synthesizing learning paths.
Updated to use Groq Cloud instead of OpenAI.
"""

import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import asyncio
import httpx

from database.models import (
    UserProfile,
    Resource,
    PathStep,
    ExperienceLevel,
    LearningStyle,
    Platform
)

# Initialize logger
logger = logging.getLogger(__name__)


class LLMClient:
    """
    Client for interacting with Groq Cloud API to generate search queries
    and synthesize learning paths.
    """
    
    def __init__(self, api_key: Optional[str] = None, model: str = "llama3-8b-8192"):
        """
        Initialize the LLM client.
        
        Args:
            api_key: Groq API key (if None, will use environment variable)
            model: Groq model to use for generation
        """
        self.api_key = api_key
        self.model = model
        self.base_url = "https://api.groq.com/openai/v1"
        self.prompts_dir = Path(__file__).parent / "prompts"
        
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
            logger.warning(f"Prompt template {filename} not found. Using default template.")
            return self._get_default_template(filename)
    
    def _get_default_template(self, filename: str) -> str:
        """Get default prompt templates if files are not found."""
        if filename == "query_gen.txt":
            return """You are an expert educational content curator. Generate targeted search queries for finding the best learning resources.

User Profile:
- Goal: {goal}
- Experience Level: {experience_level}
- Learning Style: {learning_style}
- Topic: {topic}

For each platform provided, generate 3-5 specific search queries that would help find the most relevant and high-quality learning resources. Consider the user's experience level and learning style.

Platforms: {platforms}

Return your response as a JSON object where each platform maps to a list of search queries:
{{
    "platform_name": ["query1", "query2", "query3"],
    ...
}}

Focus on:
1. Queries appropriate for the user's experience level
2. Content that matches their learning style
3. Specific, actionable search terms
4. Varied approaches to the topic"""

        elif filename == "path_synth.txt":
            return """You are an expert learning path designer. Create a structured, personalized learning journey using the provided resources.

User Profile:
- Goal: {goal}
- Experience Level: {experience_level}
- Learning Style: {learning_style}
- Topic: {topic}
- Duration Preference: {duration_preference}

Available Resources:
{resources}

Create a learning path with 4-8 steps that:
1. Progresses logically from basic to advanced concepts
2. Matches the user's learning style and experience level
3. Utilizes the best available resources
4. Includes clear learning objectives for each step
5. Considers the duration preference

Return your response as a JSON array of learning steps:
[
    {{
        "step_number": 1,
        "title": "Step Title",
        "description": "What the user will learn in this step",
        "resources": [
            {{
                "id": "resource_id",
                "title": "Resource Title",
                "description": "Resource Description",
                "url": "Resource URL",
                "platform": "platform_name",
                "duration": "estimated_duration",
                "difficulty": "difficulty_level",
                "rating": 4.5,
                "tags": ["tag1", "tag2"]
            }}
        ],
        "estimated_duration": "2 hours",
        "prerequisites": ["previous knowledge required"],
        "learning_objectives": ["objective1", "objective2"]
    }}
]

Ensure each step builds upon previous ones and the path flows naturally."""
        
        return ""
    
    async def generate_search_queries(
        self,
        user_profile: UserProfile,
        platforms: List[str],
        topic: str
    ) -> Dict[str, List[str]]:
        """
        Generate search queries for each platform based on user profile and topic.
        
        Args:
            user_profile: User's learning profile and preferences
            platforms: List of platform names to generate queries for
            topic: The learning topic/subject
            
        Returns:
            Dictionary mapping platform names to lists of search queries
        """
        try:
            logger.info(f"Generating search queries for topic: {topic} across {len(platforms)} platforms")
            
            # Format the prompt with user data
            prompt = self.query_gen_template.format(
                goal=user_profile.goal,
                experience_level=user_profile.experience_level.value,
                learning_style=user_profile.learning_style.value,
                topic=topic,
                platforms=", ".join(platforms)
            )
            
            # Call Groq API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are an expert educational content curator. Always respond with valid JSON."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
            
            # Parse the JSON response
            response_text = result["choices"][0]["message"]["content"]
            queries_dict = json.loads(response_text)
            
            # Validate and clean the response
            validated_queries = self._validate_queries_response(queries_dict, platforms)
            
            logger.info(f"Successfully generated queries for {len(validated_queries)} platforms")
            return validated_queries
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            return self._fallback_queries(platforms, topic)
        except Exception as e:
            logger.error(f"Error generating search queries: {e}")
            return self._fallback_queries(platforms, topic)
    
    async def synthesize_learning_path(
        self,
        resources: List[Resource],
        user_profile: UserProfile,
        topic: str,
        duration_preference: Optional[str] = None
    ) -> List[PathStep]:
        """
        Synthesize a structured learning path from available resources.
        
        Args:
            resources: List of available learning resources
            user_profile: User's learning profile and preferences
            topic: The learning topic/subject
            duration_preference: User's preferred duration for the path
            
        Returns:
            List of PathStep objects representing the learning journey
        """
        try:
            logger.info(f"Synthesizing learning path for topic: {topic} with {len(resources)} resources")
            
            # Format resources for the prompt
            resources_text = self._format_resources_for_prompt(resources)
            
            # Format the prompt with user data and resources
            prompt = self.path_synth_template.format(
                goal=user_profile.goal,
                experience_level=user_profile.experience_level.value,
                learning_style=user_profile.learning_style.value,
                topic=topic,
                duration_preference=duration_preference or "flexible",
                resources=resources_text
            )
            
            # Call Groq API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are an expert learning path designer. Always respond with valid JSON array."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.6,
                        "max_tokens": 2000
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
            
            # Parse the JSON response
            response_text = result["choices"][0]["message"]["content"]
            steps_data = json.loads(response_text)
            
            # Convert to PathStep objects
            path_steps = self._convert_to_path_steps(steps_data, resources)
            
            logger.info(f"Successfully synthesized learning path with {len(path_steps)} steps")
            return path_steps
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            return self._fallback_learning_path(resources, user_profile, topic)
        except Exception as e:
            logger.error(f"Error synthesizing learning path: {e}")
            return self._fallback_learning_path(resources, user_profile, topic)
    
    def _validate_queries_response(
        self,
        queries_dict: Dict[str, List[str]],
        expected_platforms: List[str]
    ) -> Dict[str, List[str]]:
        """Validate and clean the queries response from LLM."""
        validated = {}
        
        for platform in expected_platforms:
            if platform in queries_dict and isinstance(queries_dict[platform], list):
                # Filter out empty or invalid queries
                valid_queries = [
                    q for q in queries_dict[platform] 
                    if isinstance(q, str) and len(q.strip()) > 0
                ]
                if valid_queries:
                    validated[platform] = valid_queries[:5]  # Limit to 5 queries max
                else:
                    validated[platform] = [f"{platform} tutorial basics"]
            else:
                validated[platform] = [f"{platform} tutorial basics"]
        
        return validated
    
    def _format_resources_for_prompt(self, resources: List[Resource]) -> str:
        """Format resources list for inclusion in the prompt."""
        formatted_resources = []
        
        for resource in resources:
            resource_text = f"""
ID: {resource.id}
Title: {resource.title}
Platform: {resource.platform.value}
URL: {resource.url}
Duration: {resource.duration or 'Not specified'}
Difficulty: {resource.difficulty.value if resource.difficulty else 'Not specified'}
Rating: {resource.rating or 'Not rated'}
Description: {resource.description or 'No description'}
Tags: {', '.join(resource.tags) if resource.tags else 'None'}
"""
            formatted_resources.append(resource_text.strip())
        
        return "\n---\n".join(formatted_resources)
    
    def _convert_to_path_steps(
        self,
        steps_data: List[Dict[str, Any]],
        available_resources: List[Resource]
    ) -> List[PathStep]:
        """Convert JSON step data to PathStep objects."""
        path_steps = []
        resource_lookup = {r.id: r for r in available_resources}
        
        for step_data in steps_data:
            try:
                # Extract resources for this step
                step_resources = []
                for resource_data in step_data.get("resources", []):
                    resource_id = resource_data.get("id")
                    if resource_id in resource_lookup:
                        step_resources.append(resource_lookup[resource_id])
                    else:
                        # Create resource from the data if not found in lookup
                        step_resources.append(Resource(**resource_data))
                
                # Create PathStep object
                path_step = PathStep(
                    step_number=step_data.get("step_number", len(path_steps) + 1),
                    title=step_data.get("title", f"Learning Step {len(path_steps) + 1}"),
                    description=step_data.get("description", ""),
                    resources=step_resources,
                    estimated_duration=step_data.get("estimated_duration", "2 hours"),
                    prerequisites=step_data.get("prerequisites", []),
                    learning_objectives=step_data.get("learning_objectives", [])
                )
                
                path_steps.append(path_step)
                
            except Exception as e:
                logger.warning(f"Failed to convert step data: {e}")
                continue
        
        return path_steps
    
    def _fallback_queries(self, platforms: List[str], topic: str) -> Dict[str, List[str]]:
        """Generate fallback queries if LLM fails."""
        logger.info("Using fallback query generation")
        
        fallback = {}
        for platform in platforms:
            fallback[platform] = [
                f"{topic} tutorial",
                f"{topic} beginner guide",
                f"learn {topic}",
                f"{topic} course",
                f"{topic} fundamentals"
            ]
        
        return fallback
    
    def _fallback_learning_path(
        self,
        resources: List[Resource],
        user_profile: UserProfile,
        topic: str
    ) -> List[PathStep]:
        """Generate a fallback learning path if LLM fails."""
        logger.info("Using fallback path synthesis")
        
        # Simple fallback: divide resources into steps based on difficulty
        beginner_resources = [r for r in resources if r.difficulty == ExperienceLevel.BEGINNER]
        intermediate_resources = [r for r in resources if r.difficulty == ExperienceLevel.INTERMEDIATE]
        advanced_resources = [r for r in resources if r.difficulty == ExperienceLevel.ADVANCED]
        other_resources = [r for r in resources if r.difficulty is None]
        
        steps = []
        
        if beginner_resources or other_resources:
            steps.append(PathStep(
                step_number=1,
                title=f"Introduction to {topic}",
                description=f"Get started with the fundamentals of {topic}",
                resources=beginner_resources + other_resources[:3],
                estimated_duration="3-4 hours",
                prerequisites=[],
                learning_objectives=[f"Understand basic concepts of {topic}"]
            ))
        
        if intermediate_resources:
            steps.append(PathStep(
                step_number=2,
                title=f"Intermediate {topic}",
                description=f"Build upon your foundational knowledge of {topic}",
                resources=intermediate_resources,
                estimated_duration="4-6 hours",
                prerequisites=["Basic understanding of the topic"],
                learning_objectives=[f"Apply intermediate concepts of {topic}"]
            ))
        
        if advanced_resources:
            steps.append(PathStep(
                step_number=3,
                title=f"Advanced {topic}",
                description=f"Master advanced concepts and techniques in {topic}",
                resources=advanced_resources,
                estimated_duration="6-8 hours",
                prerequisites=["Intermediate knowledge"],
                learning_objectives=[f"Master advanced {topic} techniques"]
            ))
        
        return steps if steps else [
            PathStep(
                step_number=1,
                title=f"Learn {topic}",
                description=f"Comprehensive introduction to {topic}",
                resources=resources[:10],  # Limit to first 10 resources
                estimated_duration="5-7 hours",
                prerequisites=[],
                learning_objectives=[f"Gain proficiency in {topic}"]
            )
        ]
