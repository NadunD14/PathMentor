from typing import List, Dict, Any
from models import LearningResource, UserLearningProfile, ExperienceLevel
import random


class RankingService:
    """Simple ranking service for learning resources (placeholder for future RL model)"""
    
    def __init__(self):
        # Weight factors for different ranking criteria
        self.rating_weight = 0.3
        self.view_count_weight = 0.2
        self.recency_weight = 0.2
        self.relevance_weight = 0.3
        
        # Difficulty preferences based on experience level
        self.difficulty_preferences = {
            ExperienceLevel.BEGINNER: {"beginner": 1.0, "intermediate": 0.3, "advanced": 0.1},
            ExperienceLevel.INTERMEDIATE: {"beginner": 0.5, "intermediate": 1.0, "advanced": 0.7},
            ExperienceLevel.ADVANCED: {"beginner": 0.2, "intermediate": 0.6, "advanced": 1.0}
        }
    
    def rank_resources(self, resources: List[LearningResource], user_profile: UserLearningProfile) -> List[LearningResource]:
        """Rank learning resources based on user profile and resource quality metrics"""
        if not resources:
            return []
        
        # Calculate score for each resource
        scored_resources = []
        for resource in resources:
            score = self._calculate_resource_score(resource, user_profile)
            scored_resources.append((resource, score))
        
        # Sort by score (descending)
        scored_resources.sort(key=lambda x: x[1], reverse=True)
        
        # Return sorted resources
        return [resource for resource, score in scored_resources]
    
    def _calculate_resource_score(self, resource: LearningResource, user_profile: UserLearningProfile) -> float:
        """Calculate a composite score for a learning resource"""
        score = 0.0
        
        # Rating score (normalized to 0-1)
        if resource.rating:
            rating_score = min(resource.rating / 5.0, 1.0)
            score += rating_score * self.rating_weight
        
        # View count score (logarithmic scaling)
        if resource.view_count:
            # Normalize view count (log scale, capped at 1 million views = 1.0)
            import math
            view_score = min(math.log10(resource.view_count + 1) / 6.0, 1.0)
            score += view_score * self.view_count_weight
        
        # Recency score (simplified - higher for recent content)
        recency_score = self._calculate_recency_score(resource.published_date)
        score += recency_score * self.recency_weight
        
        # Relevance score based on title and description matching
        relevance_score = self._calculate_relevance_score(resource, user_profile)
        score += relevance_score * self.relevance_weight
        
        # Difficulty preference bonus
        difficulty_bonus = self._calculate_difficulty_bonus(resource, user_profile)
        score *= (1.0 + difficulty_bonus)
        
        return score
    
    def _calculate_recency_score(self, published_date: str) -> float:
        """Calculate recency score (placeholder implementation)"""
        if not published_date:
            return 0.5  # Default score for unknown date
        
        try:
            from datetime import datetime
            # Simple recency calculation
            # For now, just return a random score between 0.3 and 1.0
            # In a real implementation, this would compare the published date to current date
            return random.uniform(0.3, 1.0)
        except:
            return 0.5
    
    def _calculate_relevance_score(self, resource: LearningResource, user_profile: UserLearningProfile) -> float:
        """Calculate how relevant the resource is to the user's topic and goals"""
        relevance = 0.0
        topic_lower = user_profile.topic.lower()
        
        # Check title relevance
        title_lower = resource.title.lower()
        if topic_lower in title_lower:
            relevance += 0.5
        
        # Check description relevance
        if resource.description:
            desc_lower = resource.description.lower()
            if topic_lower in desc_lower:
                relevance += 0.3
        
        # Check tags relevance
        for tag in resource.tags:
            if topic_lower in tag.lower():
                relevance += 0.1
                break
        
        # Experience level keywords
        exp_keywords = {
            ExperienceLevel.BEGINNER: ["beginner", "intro", "basic", "fundamentals", "getting started"],
            ExperienceLevel.INTERMEDIATE: ["intermediate", "practical", "hands-on", "project"],
            ExperienceLevel.ADVANCED: ["advanced", "expert", "deep", "complex", "professional"]
        }
        
        content_text = f"{resource.title} {resource.description}".lower()
        for keyword in exp_keywords.get(user_profile.experience_level, []):
            if keyword in content_text:
                relevance += 0.1
                break
        
        return min(relevance, 1.0)
    
    def _calculate_difficulty_bonus(self, resource: LearningResource, user_profile: UserLearningProfile) -> float:
        """Calculate difficulty preference bonus"""
        if not resource.difficulty:
            return 0.0
        
        difficulty_prefs = self.difficulty_preferences.get(user_profile.experience_level, {})
        return difficulty_prefs.get(resource.difficulty.lower(), 0.0) * 0.2
    
    def diversify_results(self, resources: List[LearningResource], max_per_source: int = 3) -> List[LearningResource]:
        """Diversify results to avoid too many resources from the same source"""
        source_counts = {}
        diversified = []
        
        for resource in resources:
            source = resource.source
            if source not in source_counts:
                source_counts[source] = 0
            
            if source_counts[source] < max_per_source:
                diversified.append(resource)
                source_counts[source] += 1
        
        return diversified
    
    def filter_by_quality_threshold(self, resources: List[LearningResource], min_rating: float = 3.0) -> List[LearningResource]:
        """Filter resources by minimum quality threshold"""
        filtered = []
        for resource in resources:
            # Include resource if it has no rating (benefit of doubt) or meets threshold
            if resource.rating is None or resource.rating >= min_rating:
                filtered.append(resource)
        
        return filtered
    
    def get_ranking_explanation(self, resource: LearningResource, user_profile: UserLearningProfile) -> Dict[str, Any]:
        """Get explanation for why a resource was ranked as it was"""
        score = self._calculate_resource_score(resource, user_profile)
        
        explanation = {
            "total_score": round(score, 3),
            "factors": {
                "rating": resource.rating,
                "view_count": resource.view_count,
                "relevance": round(self._calculate_relevance_score(resource, user_profile), 3),
                "difficulty_match": resource.difficulty,
                "source": resource.source
            },
            "reasons": []
        }
        
        # Add specific reasons
        if resource.rating and resource.rating >= 4.0:
            explanation["reasons"].append("High user rating")
        
        if resource.view_count and resource.view_count > 100000:
            explanation["reasons"].append("Popular content")
        
        if user_profile.topic.lower() in resource.title.lower():
            explanation["reasons"].append("Title matches your topic")
        
        return explanation
