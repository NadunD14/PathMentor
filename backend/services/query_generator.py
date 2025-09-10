from typing import List, Dict
from models import UserLearningProfile, SearchQuery, ExperienceLevel, LearningStyle, LearningGoal


class QueryGenerator:
    """Rule-based query generation service for different learning profiles"""
    
    def __init__(self):
        self.difficulty_modifiers = {
            ExperienceLevel.BEGINNER: ["beginner", "introduction", "basics", "tutorial", "getting started", "fundamentals"],
            ExperienceLevel.INTERMEDIATE: ["intermediate", "practical", "projects", "hands-on", "implementation"],
            ExperienceLevel.ADVANCED: ["advanced", "expert", "mastery", "deep dive", "professional", "complex"]
        }
        
        self.style_modifiers = {
            LearningStyle.VISUAL: ["visual", "diagram", "infographic", "chart", "demonstration"],
            LearningStyle.AUDITORY: ["explained", "lecture", "podcast", "audio", "discussion"],
            LearningStyle.HANDS_ON: ["project", "tutorial", "coding", "practice", "workshop", "lab"],
            LearningStyle.READING: ["guide", "documentation", "article", "book", "text"]
        }
        
        self.goal_modifiers = {
            LearningGoal.SKILL_BUILDING: ["skills", "techniques", "methods", "practical"],
            LearningGoal.CAREER_CHANGE: ["career", "job", "employment", "professional", "industry"],
            LearningGoal.CERTIFICATION: ["certification", "exam", "test", "credential", "official"],
            LearningGoal.HOBBY: ["fun", "hobby", "personal", "creative", "interesting"],
            LearningGoal.ACADEMIC: ["academic", "theory", "research", "study", "course"]
        }
    
    def generate_queries(self, profile: UserLearningProfile) -> List[SearchQuery]:
        """Generate multiple search queries based on the user's learning profile"""
        base_topic = profile.topic
        queries = []
        
        # Get modifiers based on profile
        difficulty_mods = self.difficulty_modifiers[profile.experience_level]
        style_mods = self.style_modifiers[profile.learning_style]
        goal_mods = self.goal_modifiers[profile.goal]
        
        # Generate YouTube queries
        youtube_queries = self._generate_youtube_queries(base_topic, difficulty_mods, style_mods, goal_mods)
        queries.extend(youtube_queries)
        
        # Generate Udemy queries
        udemy_queries = self._generate_udemy_queries(base_topic, difficulty_mods, goal_mods)
        queries.extend(udemy_queries)
        
        # Generate Reddit queries
        reddit_queries = self._generate_reddit_queries(base_topic, difficulty_mods, goal_mods)
        queries.extend(reddit_queries)
        
        return queries
    
    def _generate_youtube_queries(self, topic: str, difficulty_mods: List[str], style_mods: List[str], goal_mods: List[str]) -> List[SearchQuery]:
        """Generate YouTube-specific search queries"""
        queries = []
        current_year = "2024"
        
        # Basic tutorial queries
        for diff_mod in difficulty_mods[:2]:  # Use first 2 modifiers
            query = f"{topic} {diff_mod} tutorial {current_year}"
            queries.append(SearchQuery(
                query=query,
                source="youtube",
                difficulty=diff_mod,
                content_type="tutorial"
            ))
        
        # Style-specific queries
        for style_mod in style_mods[:2]:
            query = f"{topic} {style_mod} course"
            queries.append(SearchQuery(
                query=query,
                source="youtube",
                difficulty=difficulty_mods[0],
                content_type="course"
            ))
        
        # Project-based queries
        if "project" in style_mods or any("hands" in mod for mod in style_mods):
            query = f"{topic} project {difficulty_mods[0]} {current_year}"
            queries.append(SearchQuery(
                query=query,
                source="youtube",
                difficulty=difficulty_mods[0],
                content_type="project"
            ))
        
        return queries
    
    def _generate_udemy_queries(self, topic: str, difficulty_mods: List[str], goal_mods: List[str]) -> List[SearchQuery]:
        """Generate Udemy-specific search queries"""
        queries = []
        
        # Complete course queries
        for diff_mod in difficulty_mods[:2]:
            query = f"{topic} {diff_mod} complete course"
            queries.append(SearchQuery(
                query=query,
                source="udemy",
                difficulty=diff_mod,
                content_type="course"
            ))
        
        # Goal-specific queries
        for goal_mod in goal_mods[:2]:
            query = f"{topic} {goal_mod}"
            queries.append(SearchQuery(
                query=query,
                source="udemy",
                difficulty=difficulty_mods[0],
                content_type="course"
            ))
        
        return queries
    
    def _generate_reddit_queries(self, topic: str, difficulty_mods: List[str], goal_mods: List[str]) -> List[SearchQuery]:
        """Generate Reddit-specific search queries"""
        queries = []
        
        # Learning path queries
        query = f"{topic} learning path {difficulty_mods[0]}"
        queries.append(SearchQuery(
            query=query,
            source="reddit",
            difficulty=difficulty_mods[0],
            content_type="discussion"
        ))
        
        # Resource recommendation queries
        query = f"best {topic} resources {difficulty_mods[0]}"
        queries.append(SearchQuery(
            query=query,
            source="reddit",
            difficulty=difficulty_mods[0],
            content_type="recommendations"
        ))
        
        # Career/goal specific
        if goal_mods:
            query = f"{topic} {goal_mods[0]} advice"
            queries.append(SearchQuery(
                query=query,
                source="reddit",
                difficulty=difficulty_mods[0],
                content_type="advice"
            ))
        
        return queries
    
    def generate_follow_up_queries(self, topic: str, subtopic: str, difficulty: str) -> List[SearchQuery]:
        """Generate follow-up queries for specific subtopics"""
        queries = []
        current_year = "2024"
        
        # Specific subtopic queries
        base_queries = [
            f"{subtopic} {topic} {difficulty}",
            f"how to {subtopic} in {topic}",
            f"{subtopic} {topic} tutorial {current_year}",
            f"{subtopic} {topic} examples"
        ]
        
        for query_text in base_queries:
            queries.append(SearchQuery(
                query=query_text,
                source="youtube",
                difficulty=difficulty,
                content_type="tutorial"
            ))
        
        return queries
