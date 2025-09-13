"""
RL model predictor for platform recommendations.
"""

import logging
from typing import List, Optional
import random

from database.models import UserProfile, PlatformRecommendation, Platform

logger = logging.getLogger(__name__)


class RLPredictor:
    """
    Reinforcement Learning predictor for recommending learning platforms.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """Initialize RL predictor."""
        self.model_path = model_path
        self.model = None  # Placeholder for the actual RL model
        logger.info("RL Predictor initialized")
    
    async def predict_platforms(
        self,
        user_profile: UserProfile,
        topic: str,
        platform_preferences: Optional[List[Platform]] = None
    ) -> List[PlatformRecommendation]:
        """
        Predict the best platforms for a user based on their profile and topic.
        
        Args:
            user_profile: User's learning profile
            topic: The topic they want to learn
            platform_preferences: User's preferred platforms (optional)
        
        Returns:
            List of platform recommendations with confidence scores
        """
        try:
            logger.info(f"Predicting platforms for user profile and topic: {topic}")
            
            # For now, implement a simple heuristic-based recommendation
            # In production, this would use a trained RL model
            
            recommendations = []
            
            # Base platform scores based on learning style
            platform_scores = self._get_base_platform_scores(user_profile)
            
            # Adjust scores based on experience level
            platform_scores = self._adjust_for_experience_level(platform_scores, user_profile.experience_level)
            
            # Adjust scores based on topic (simple keyword matching)
            platform_scores = self._adjust_for_topic(platform_scores, topic)
            
            # Boost preferred platforms if specified
            if platform_preferences:
                for platform in platform_preferences:
                    if platform.value in platform_scores:
                        platform_scores[platform.value] *= 1.2
            
            # Sort by score and create recommendations
            sorted_platforms = sorted(platform_scores.items(), key=lambda x: x[1], reverse=True)
            
            for platform_name, score in sorted_platforms[:5]:  # Top 5 platforms
                try:
                    platform = Platform(platform_name)
                    recommendation = PlatformRecommendation(
                        platform=platform,
                        confidence_score=min(score, 1.0),  # Cap at 1.0
                        reasoning=self._generate_reasoning(platform, user_profile, topic)
                    )
                    recommendations.append(recommendation)
                except ValueError:
                    # Skip invalid platform names
                    continue
            
            logger.info(f"Generated {len(recommendations)} platform recommendations")
            return recommendations
            
        except Exception as e:
            logger.error(f"Error predicting platforms: {e}")
            # Return fallback recommendations
            return self._get_fallback_recommendations()
    
    def _get_base_platform_scores(self, user_profile: UserProfile) -> dict:
        """Get base platform scores based on learning style."""
        if user_profile.learning_style.value == "visual":
            return {
                "youtube": 0.9,
                "udemy": 0.8,
                "coursera": 0.7,
                "medium": 0.5,
                "reddit": 0.4,
                "github": 0.6
            }
        elif user_profile.learning_style.value == "auditory":
            return {
                "youtube": 0.8,
                "udemy": 0.7,
                "coursera": 0.8,
                "medium": 0.6,
                "reddit": 0.7,
                "github": 0.4
            }
        elif user_profile.learning_style.value == "kinesthetic":
            return {
                "youtube": 0.7,
                "udemy": 0.8,
                "coursera": 0.6,
                "medium": 0.5,
                "reddit": 0.6,
                "github": 0.9
            }
        elif user_profile.learning_style.value == "reading_writing":
            return {
                "youtube": 0.5,
                "udemy": 0.6,
                "coursera": 0.7,
                "medium": 0.9,
                "reddit": 0.8,
                "github": 0.8
            }
        else:  # multimodal
            return {
                "youtube": 0.8,
                "udemy": 0.8,
                "coursera": 0.8,
                "medium": 0.7,
                "reddit": 0.7,
                "github": 0.7
            }
    
    def _adjust_for_experience_level(self, scores: dict, experience_level) -> dict:
        """Adjust platform scores based on experience level."""
        if experience_level.value == "beginner":
            # Beginners might prefer structured courses
            scores["udemy"] *= 1.2
            scores["coursera"] *= 1.2
            scores["youtube"] *= 1.1
        elif experience_level.value == "advanced" or experience_level.value == "expert":
            # Advanced users might prefer community discussions and code
            scores["reddit"] *= 1.3
            scores["github"] *= 1.3
            scores["medium"] *= 1.2
        
        return scores
    
    def _adjust_for_topic(self, scores: dict, topic: str) -> dict:
        """Adjust platform scores based on the topic."""
        topic_lower = topic.lower()
        
        # Programming-related topics
        if any(keyword in topic_lower for keyword in ["programming", "coding", "python", "javascript", "java", "c++"]):
            scores["github"] *= 1.3
            scores["youtube"] *= 1.2
            scores["udemy"] *= 1.2
        
        # Data science topics
        elif any(keyword in topic_lower for keyword in ["data science", "machine learning", "ai", "analytics"]):
            scores["github"] *= 1.2
            scores["coursera"] *= 1.3
            scores["udemy"] *= 1.2
        
        # Creative topics
        elif any(keyword in topic_lower for keyword in ["design", "art", "photography", "video"]):
            scores["youtube"] *= 1.4
            scores["udemy"] *= 1.3
        
        # Business topics
        elif any(keyword in topic_lower for keyword in ["business", "marketing", "management", "finance"]):
            scores["coursera"] *= 1.3
            scores["udemy"] *= 1.2
            scores["medium"] *= 1.2
        
        return scores
    
    def _generate_reasoning(self, platform: Platform, user_profile: UserProfile, topic: str) -> str:
        """Generate reasoning for platform recommendation."""
        reasoning_parts = []
        
        if platform == Platform.YOUTUBE:
            reasoning_parts.append("Great for visual learning with video tutorials")
        elif platform == Platform.UDEMY:
            reasoning_parts.append("Structured courses ideal for systematic learning")
        elif platform == Platform.REDDIT:
            reasoning_parts.append("Community discussions provide real-world insights")
        elif platform == Platform.GITHUB:
            reasoning_parts.append("Hands-on code examples and projects")
        elif platform == Platform.COURSERA:
            reasoning_parts.append("Academic-quality courses from universities")
        elif platform == Platform.MEDIUM:
            reasoning_parts.append("In-depth articles and tutorials")
        
        if user_profile.learning_style.value == "visual":
            reasoning_parts.append("matches your visual learning preference")
        elif user_profile.learning_style.value == "kinesthetic":
            reasoning_parts.append("supports hands-on learning")
        
        return ", ".join(reasoning_parts)
    
    def _get_fallback_recommendations(self) -> List[PlatformRecommendation]:
        """Get fallback recommendations if prediction fails."""
        return [
            PlatformRecommendation(
                platform=Platform.YOUTUBE,
                confidence_score=0.8,
                reasoning="Popular video platform for tutorials"
            ),
            PlatformRecommendation(
                platform=Platform.UDEMY,
                confidence_score=0.7,
                reasoning="Structured online courses"
            ),
            PlatformRecommendation(
                platform=Platform.REDDIT,
                confidence_score=0.6,
                reasoning="Community discussions and Q&A"
            )
        ]
