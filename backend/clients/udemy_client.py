import httpx
import os
from typing import List, Dict, Any, Optional
from models import SearchQuery, LearningResource


class UdemyClient:
    """Client for fetching learning resources from Udemy (using mock data for now)"""
    
    def __init__(self):
        # Udemy API requires approval and partnership
        # For now, we'll use mock data based on common Udemy course patterns
        self.api_key = os.getenv("UDEMY_API_KEY")
        self.base_url = "https://www.udemy.com/api-2.0"
    
    async def search(self, query: SearchQuery) -> List[LearningResource]:
        """Search for courses on Udemy based on the query"""
        # For now, return mock data since Udemy API requires partnership
        return self._get_mock_data(query)
    
    def _get_mock_data(self, query: SearchQuery) -> List[LearningResource]:
        """Return mock data based on common Udemy course patterns"""
        topic = self._extract_topic(query.query)
        difficulty = query.difficulty
        
        mock_resources = []
        
        # Generate different types of courses based on the query
        course_templates = [
            {
                "title_template": "The Complete {topic} Course 2024",
                "description_template": "Master {topic} with the most comprehensive course available. From beginner to advanced level.",
                "duration": "40 hours",
                "rating": 4.6,
                "price": "$89.99",
                "instructor": "Expert Academy"
            },
            {
                "title_template": "{topic} for Beginners - Complete Guide",
                "description_template": "Learn {topic} from scratch with hands-on projects and real-world examples.",
                "duration": "25 hours",
                "rating": 4.4,
                "price": "$49.99",
                "instructor": "Tech Learning Hub"
            },
            {
                "title_template": "Advanced {topic} Masterclass",
                "description_template": "Take your {topic} skills to the next level with advanced techniques and best practices.",
                "duration": "30 hours",
                "rating": 4.7,
                "price": "$79.99",
                "instructor": "Professional Dev"
            },
            {
                "title_template": "{topic} Projects - Build Real Applications",
                "description_template": "Build 10+ real-world {topic} projects to strengthen your portfolio and skills.",
                "duration": "35 hours",
                "rating": 4.5,
                "price": "$69.99",
                "instructor": "Project Masters"
            },
            {
                "title_template": "{topic} Certification Prep Course",
                "description_template": "Prepare for {topic} certification with practice tests and comprehensive coverage.",
                "duration": "20 hours",
                "rating": 4.3,
                "price": "$59.99",
                "instructor": "Cert Prep Academy"
            }
        ]
        
        # Select appropriate templates based on difficulty and content type
        selected_templates = self._select_templates(course_templates, difficulty, query.content_type)
        
        for i, template in enumerate(selected_templates):
            course_id = f"course_{topic.lower().replace(' ', '_')}_{i+1}"
            
            resource = LearningResource(
                title=template["title_template"].format(topic=topic.title()),
                description=template["description_template"].format(topic=topic),
                url=f"https://www.udemy.com/course/{course_id}/",
                source="udemy",
                duration=template["duration"],
                difficulty=self._determine_course_difficulty(template["title_template"], difficulty),
                rating=template["rating"],
                thumbnail=f"https://img-c.udemycdn.com/course/750x422/{course_id}.jpg",
                author=template["instructor"],
                view_count=self._generate_student_count(),
                published_date="2024-01-01T00:00:00Z",
                tags=self._generate_course_tags(topic, template["title_template"])
            )
            
            mock_resources.append(resource)
        
        return mock_resources
    
    def _extract_topic(self, query: str) -> str:
        """Extract the main topic from the search query"""
        # Remove common query modifiers to get the core topic
        stop_words = ["beginner", "intermediate", "advanced", "tutorial", "course", "complete", "2024", "guide"]
        words = query.split()
        
        # Find the main topic (usually the first significant word)
        for word in words:
            if word.lower() not in stop_words and len(word) > 2:
                return word
        
        return "Programming"  # Default fallback
    
    def _select_templates(self, templates: List[Dict], difficulty: str, content_type: str) -> List[Dict]:
        """Select appropriate course templates based on query parameters"""
        selected = []
        
        # Always include a complete course
        selected.append(templates[0])
        
        # Add difficulty-specific course
        if difficulty == "beginner":
            selected.append(templates[1])
        elif difficulty == "advanced":
            selected.append(templates[2])
        
        # Add content-type specific course
        if content_type == "project":
            selected.append(templates[3])
        elif content_type == "certification":
            selected.append(templates[4])
        else:
            # Add a project-based course by default
            selected.append(templates[3])
        
        # Remove duplicates while preserving order
        seen = set()
        unique_selected = []
        for template in selected:
            template_id = template["title_template"]
            if template_id not in seen:
                seen.add(template_id)
                unique_selected.append(template)
        
        return unique_selected[:3]  # Limit to 3 courses
    
    def _determine_course_difficulty(self, title_template: str, query_difficulty: str) -> str:
        """Determine course difficulty based on title and query"""
        title_lower = title_template.lower()
        
        if "beginner" in title_lower or "complete guide" in title_lower:
            return "beginner"
        elif "advanced" in title_lower or "masterclass" in title_lower:
            return "advanced"
        elif "complete" in title_lower and "course" in title_lower:
            return "intermediate"  # Complete courses are usually comprehensive
        else:
            return query_difficulty if query_difficulty in ["beginner", "intermediate", "advanced"] else "intermediate"
    
    def _generate_student_count(self) -> int:
        """Generate a realistic student count for courses"""
        import random
        # Udemy courses typically have between 1,000 and 100,000 students
        return random.randint(1000, 100000)
    
    def _generate_course_tags(self, topic: str, title_template: str) -> List[str]:
        """Generate relevant tags for the course"""
        tags = [topic.lower()]
        
        title_lower = title_template.lower()
        
        if "complete" in title_lower:
            tags.append("complete")
        if "beginner" in title_lower:
            tags.append("beginner")
        if "advanced" in title_lower:
            tags.append("advanced")
        if "project" in title_lower:
            tags.append("projects")
        if "certification" in title_lower:
            tags.append("certification")
        
        # Add common course-related tags
        tags.extend(["course", "online-learning", "udemy"])
        
        return tags[:5]  # Limit to 5 tags
    
    async def get_course_details(self, course_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific course (mock implementation)"""
        # This would fetch detailed course information in a real implementation
        return {
            "course_id": course_id,
            "sections_count": 15,
            "lectures_count": 120,
            "has_certificate": True,
            "language": "English",
            "has_captions": True,
            "last_updated": "2024-01-15"
        }
    
    async def get_instructor_courses(self, instructor_id: str) -> List[LearningResource]:
        """Get all courses by a specific instructor (mock implementation)"""
        # This would fetch all courses by an instructor in a real implementation
        return []
