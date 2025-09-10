from typing import List, Dict, Any
import uuid
from datetime import datetime
from models import (
    LearningPath, LearningPathStep, LearningResource, 
    UserLearningProfile, ExperienceLevel, LearningGoal
)


class PathBuilder:
    """Assembles final learning path structure from ranked resources"""
    
    def __init__(self):
        # Step templates based on experience level
        self.step_templates = {
            ExperienceLevel.BEGINNER: [
                {"title": "Introduction and Fundamentals", "description": "Get familiar with basic concepts", "order": 1},
                {"title": "Core Concepts", "description": "Learn the essential building blocks", "order": 2},
                {"title": "Practical Examples", "description": "See concepts in action", "order": 3},
                {"title": "Hands-On Practice", "description": "Apply what you've learned", "order": 4},
                {"title": "First Project", "description": "Build something real", "order": 5}
            ],
            ExperienceLevel.INTERMEDIATE: [
                {"title": "Review and Foundation", "description": "Solidify your existing knowledge", "order": 1},
                {"title": "Advanced Concepts", "description": "Dive deeper into complex topics", "order": 2},
                {"title": "Best Practices", "description": "Learn industry standards", "order": 3},
                {"title": "Real-World Projects", "description": "Build complex applications", "order": 4},
                {"title": "Optimization and Performance", "description": "Make it better and faster", "order": 5}
            ],
            ExperienceLevel.ADVANCED: [
                {"title": "Advanced Techniques", "description": "Master complex methodologies", "order": 1},
                {"title": "Architecture and Design", "description": "Learn system design principles", "order": 2},
                {"title": "Performance Optimization", "description": "Optimize for scale and efficiency", "order": 3},
                {"title": "Expert-Level Projects", "description": "Build production-ready systems", "order": 4},
                {"title": "Teaching and Leadership", "description": "Share knowledge and lead teams", "order": 5}
            ]
        }
        
        # Duration estimates by step type and experience level
        self.duration_estimates = {
            ExperienceLevel.BEGINNER: {"per_step": "1-2 weeks", "total": "6-10 weeks"},
            ExperienceLevel.INTERMEDIATE: {"per_step": "1-3 weeks", "total": "8-12 weeks"},
            ExperienceLevel.ADVANCED: {"per_step": "2-4 weeks", "total": "10-16 weeks"}
        }
    
    def build_learning_path(
        self, 
        user_profile: UserLearningProfile, 
        ranked_resources: List[LearningResource]
    ) -> LearningPath:
        """Build a complete learning path from user profile and ranked resources"""
        
        # Generate unique path ID
        path_id = str(uuid.uuid4())
        
        # Get step templates for user's experience level
        templates = self.step_templates.get(user_profile.experience_level, self.step_templates[ExperienceLevel.BEGINNER])
        
        # Distribute resources across steps
        steps = self._create_steps(templates, ranked_resources, user_profile)
        
        # Generate path metadata
        title = self._generate_path_title(user_profile)
        description = self._generate_path_description(user_profile, len(ranked_resources))
        total_duration = self.duration_estimates[user_profile.experience_level]["total"]
        difficulty_level = user_profile.experience_level.value
        tags = self._generate_tags(user_profile)
        
        # Create the learning path
        learning_path = LearningPath(
            path_id=path_id,
            user_profile=user_profile,
            title=title,
            description=description,
            total_duration=total_duration,
            difficulty_level=difficulty_level,
            steps=steps,
            created_at=datetime.utcnow().isoformat(),
            tags=tags
        )
        
        return learning_path
    
    def _create_steps(
        self, 
        templates: List[Dict], 
        resources: List[LearningResource], 
        user_profile: UserLearningProfile
    ) -> List[LearningPathStep]:
        """Create learning path steps with assigned resources"""
        steps = []
        
        # Calculate resources per step
        resources_per_step = max(1, len(resources) // len(templates))
        
        for i, template in enumerate(templates):
            # Get resources for this step
            start_idx = i * resources_per_step
            end_idx = start_idx + resources_per_step
            
            # For the last step, include any remaining resources
            if i == len(templates) - 1:
                step_resources = resources[start_idx:]
            else:
                step_resources = resources[start_idx:end_idx]
            
            # Create learning objectives for this step
            objectives = self._generate_learning_objectives(template, user_profile, step_resources)
            
            # Create prerequisites
            prerequisites = self._generate_prerequisites(template, i)
            
            # Estimate duration for this step
            step_duration = self._estimate_step_duration(step_resources, user_profile)
            
            step = LearningPathStep(
                step_number=template["order"],
                title=template["title"],
                description=template["description"],
                estimated_duration=step_duration,
                resources=step_resources,
                prerequisites=prerequisites,
                learning_objectives=objectives
            )
            
            steps.append(step)
        
        return steps
    
    def _generate_path_title(self, user_profile: UserLearningProfile) -> str:
        """Generate a title for the learning path"""
        topic = user_profile.topic.title()
        level = user_profile.experience_level.value.title()
        goal = user_profile.goal.value.replace("_", " ").title()
        
        return f"{topic} Learning Path for {level} ({goal})"
    
    def _generate_path_description(self, user_profile: UserLearningProfile, resource_count: int) -> str:
        """Generate a description for the learning path"""
        topic = user_profile.topic
        level = user_profile.experience_level.value
        goal = user_profile.goal.value.replace("_", " ")
        
        description = f"A comprehensive {level}-level learning path for {topic}, "
        description += f"designed for {goal}. This path includes {resource_count} carefully "
        description += f"curated resources including videos, tutorials, and courses to help you "
        description += f"master {topic} effectively."
        
        if user_profile.time_commitment:
            description += f" Designed for {user_profile.time_commitment} hours per week."
        
        return description
    
    def _generate_learning_objectives(
        self, 
        template: Dict, 
        user_profile: UserLearningProfile, 
        resources: List[LearningResource]
    ) -> List[str]:
        """Generate learning objectives for a step"""
        objectives = []
        topic = user_profile.topic
        
        # Base objectives based on step type
        step_title = template["title"].lower()
        
        if "introduction" in step_title or "fundamentals" in step_title:
            objectives = [
                f"Understand the basic concepts of {topic}",
                f"Learn the fundamental terminology and principles",
                f"Get familiar with the {topic} ecosystem"
            ]
        elif "core concepts" in step_title:
            objectives = [
                f"Master the essential {topic} concepts",
                f"Learn how different components work together",
                f"Understand best practices and common patterns"
            ]
        elif "practical" in step_title or "examples" in step_title:
            objectives = [
                f"See {topic} concepts applied in real scenarios",
                f"Understand common use cases and applications",
                f"Learn to identify when to use different approaches"
            ]
        elif "hands-on" in step_title or "practice" in step_title:
            objectives = [
                f"Practice implementing {topic} solutions",
                f"Build confidence through hands-on exercises",
                f"Develop problem-solving skills"
            ]
        elif "project" in step_title:
            objectives = [
                f"Apply {topic} knowledge to build a complete project",
                f"Learn project organization and structure",
                f"Practice debugging and troubleshooting"
            ]
        else:
            # Generic objectives
            objectives = [
                f"Advance your knowledge of {topic}",
                f"Learn new techniques and approaches",
                f"Build practical skills and experience"
            ]
        
        return objectives
    
    def _generate_prerequisites(self, template: Dict, step_index: int) -> List[str]:
        """Generate prerequisites for a step"""
        if step_index == 0:
            return []
        
        prerequisites = [f"Complete Step {step_index}"]
        
        step_title = template["title"].lower()
        if "advanced" in step_title:
            prerequisites.append("Strong understanding of core concepts")
        elif "project" in step_title:
            prerequisites.append("Practical experience with the fundamentals")
        
        return prerequisites
    
    def _estimate_step_duration(self, resources: List[LearningResource], user_profile: UserLearningProfile) -> str:
        """Estimate duration for a step based on resources and user profile"""
        if not resources:
            return "1 week"
        
        # Simple duration estimation based on number of resources and user level
        base_days = len(resources) * 2  # 2 days per resource on average
        
        # Adjust based on experience level
        if user_profile.experience_level == ExperienceLevel.BEGINNER:
            base_days = int(base_days * 1.5)  # Beginners need more time
        elif user_profile.experience_level == ExperienceLevel.ADVANCED:
            base_days = int(base_days * 0.7)  # Advanced users are faster
        
        # Convert to weeks
        weeks = max(1, base_days // 7)
        
        if weeks == 1:
            return "1 week"
        else:
            return f"{weeks} weeks"
    
    def _generate_tags(self, user_profile: UserLearningProfile) -> List[str]:
        """Generate tags for the learning path"""
        tags = [
            user_profile.topic.lower(),
            user_profile.experience_level.value,
            user_profile.learning_style.value,
            user_profile.goal.value
        ]
        
        # Add additional contextual tags
        if "programming" in user_profile.topic.lower() or "coding" in user_profile.topic.lower():
            tags.append("programming")
        
        if "web" in user_profile.topic.lower():
            tags.append("web-development")
        
        if "data" in user_profile.topic.lower():
            tags.append("data-science")
        
        return list(set(tags))  # Remove duplicates
    
    def update_step_progress(self, path: LearningPath, step_number: int, progress_data: Dict[str, Any]) -> bool:
        """Update progress for a specific step (placeholder for future implementation)"""
        # This would be implemented when adding progress tracking
        # For now, just return True to indicate successful update
        return True
    
    def get_next_recommended_step(self, path: LearningPath, completed_steps: List[int]) -> int:
        """Get the next recommended step based on completed steps"""
        for step in path.steps:
            if step.step_number not in completed_steps:
                return step.step_number
        
        return -1  # All steps completed
