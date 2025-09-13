"""
Machine Learning service for platform recommendations.
"""

import os
import logging
from typing import List, Optional, Dict, Any
import random

from models.schemas import UserProfile, PlatformRecommendation, Platform
from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)


class MLPredictor:
    """Machine Learning predictor for platform recommendations."""
    
    def __init__(self, model_path: Optional[str] = None):
        """Initialize ML predictor."""
        self.model_path = model_path or settings.rl_model_path
        self.model = None  # Placeholder for actual ML model
        logger.info("ML Predictor initialized")
    
    async def predict_platforms(
        self,
        user_profile: UserProfile,
        topic: str,
        platform_preferences: Optional[List[Platform]] = None
    ) -> List[PlatformRecommendation]:
        """
        Predict best platforms for a user and topic.
        
        This is a simplified implementation. In production, this would use
        a trained reinforcement learning model or other ML algorithms.
        """
        try:
            # If user has platform preferences, prioritize those
            if platform_preferences:
                recommendations = []
                for i, platform in enumerate(platform_preferences):
                    confidence = max(0.7, 0.9 - (i * 0.1))  # Decreasing confidence
                    recommendations.append(PlatformRecommendation(
                        platform=platform,
                        confidence_score=confidence,
                        reasoning=f"User preferred platform for {topic}"
                    ))
                return recommendations
            
            # Default platform recommendations based on learning style and experience
            platform_scores = self._calculate_platform_scores(user_profile, topic)
            
            # Sort by score and return top recommendations
            sorted_platforms = sorted(
                platform_scores.items(), 
                key=lambda x: x[1]["score"], 
                reverse=True
            )
            
            recommendations = []
            for platform_name, data in sorted_platforms[:4]:  # Top 4 platforms
                recommendations.append(PlatformRecommendation(
                    platform=Platform(platform_name),
                    confidence_score=data["score"],
                    reasoning=data["reasoning"]
                ))
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error predicting platforms: {e}")
            return self._fallback_recommendations()
    
    def _calculate_platform_scores(
        self, 
        user_profile: UserProfile, 
        topic: str
    ) -> Dict[str, Dict[str, Any]]:
        """Calculate platform scores based on user profile and topic."""
        
        scores = {
            "youtube": {"score": 0.5, "reasoning": "Good for visual learning"},
            "udemy": {"score": 0.5, "reasoning": "Structured courses available"},
            "reddit": {"score": 0.3, "reasoning": "Community discussions"},
            "coursera": {"score": 0.4, "reasoning": "Academic content"},
            "github": {"score": 0.3, "reasoning": "Code examples and projects"},
            "medium": {"score": 0.4, "reasoning": "Articles and tutorials"}
        }
        
        # Adjust scores based on learning style
        if user_profile.learning_style == "visual":
            scores["youtube"]["score"] += 0.3
            scores["youtube"]["reasoning"] = "Excellent for visual learners with video content"
        elif user_profile.learning_style == "auditory":
            scores["youtube"]["score"] += 0.2
            scores["udemy"]["score"] += 0.2
        elif user_profile.learning_style == "kinesthetic":
            scores["github"]["score"] += 0.3
            scores["github"]["reasoning"] = "Hands-on coding projects"
        elif user_profile.learning_style == "reading_writing":
            scores["medium"]["score"] += 0.3
            scores["medium"]["reasoning"] = "Rich written content and tutorials"
        else:  # multimodal
            # Boost all platforms slightly
            for platform in scores:
                scores[platform]["score"] += 0.1
        
        # Adjust scores based on experience level
        if user_profile.experience_level == "beginner":
            scores["youtube"]["score"] += 0.2
            scores["udemy"]["score"] += 0.2
        elif user_profile.experience_level == "advanced":
            scores["github"]["score"] += 0.2
            scores["medium"]["score"] += 0.2
        
        # Add some randomness to prevent always getting the same results
        for platform in scores:
            scores[platform]["score"] += random.uniform(-0.1, 0.1)
            scores[platform]["score"] = max(0.1, min(1.0, scores[platform]["score"]))
        
        return scores
    
    def _fallback_recommendations(self) -> List[PlatformRecommendation]:
        """Provide fallback recommendations when prediction fails."""
        return [
            PlatformRecommendation(
                platform=Platform.YOUTUBE,
                confidence_score=0.8,
                reasoning="Popular platform for learning content"
            ),
            PlatformRecommendation(
                platform=Platform.UDEMY,
                confidence_score=0.7,
                reasoning="Structured courses and tutorials"
            ),
            PlatformRecommendation(
                platform=Platform.MEDIUM,
                confidence_score=0.6,
                reasoning="Quality articles and tutorials"
            )
        ]
    
    async def update_model_with_feedback(
        self,
        user_id: str,
        platform: Platform,
        rating: int,
        topic: str
    ) -> bool:
        """
        Update the ML model with user feedback.
        
        In a production system, this would retrain or update the model
        based on user feedback to improve future recommendations.
        """
        try:
            logger.info(f"Received feedback: user={user_id}, platform={platform.value}, rating={rating}, topic={topic}")
            
            # In production, you would:
            # 1. Store the feedback in a training dataset
            # 2. Periodically retrain the model
            # 3. Update model parameters based on the feedback
            
            # For now, just log the feedback
            return True
            
        except Exception as e:
            logger.error(f"Error updating model with feedback: {e}")
            return False


class ModelTrainer:
    """Service for training ML models."""
    
    def __init__(self):
        """Initialize model trainer."""
        self.training_data_path = "data/training"
        logger.info("Model Trainer initialized")
    
    async def train_recommendation_model(self, training_data: List[Dict[str, Any]]) -> bool:
        """
        Train the recommendation model with historical data.
        
        In production, this would implement reinforcement learning or
        collaborative filtering algorithms.
        """
        try:
            logger.info(f"Training model with {len(training_data)} samples")
            
            # In production implementation:
            # 1. Prepare training data (user profiles, choices, outcomes)
            # 2. Train RL model or collaborative filtering model
            # 3. Validate model performance
            # 4. Save trained model
            
            # Placeholder implementation
            return True
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            return False