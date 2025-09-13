"""
Udemy API client for fetching course resources.
"""

import logging
import os
from typing import List, Optional
import aiohttp
import base64

from database.models import Resource, Platform, ExperienceLevel

logger = logging.getLogger(__name__)


class UdemyClient:
    """
    Client for fetching Udemy course resources.
    """
    
    def __init__(self, client_id: Optional[str] = None, client_secret: Optional[str] = None):
        """Initialize Udemy client."""
        self.client_id = client_id or os.getenv("UDEMY_CLIENT_ID")
        self.client_secret = client_secret or os.getenv("UDEMY_CLIENT_SECRET")
        self.base_url = "https://www.udemy.com/api-2.0"
        
        if not self.client_id or not self.client_secret:
            logger.warning("Udemy API credentials not provided. Using mock data.")
        
        logger.info("Udemy client initialized")
    
    async def search_courses(
        self,
        query: str,
        max_results: int = 10,
        price: str = "all"  # "free", "paid", "all"
    ) -> List[Resource]:
        """
        Search for Udemy courses based on query.
        
        Args:
            query: Search query string
            max_results: Maximum number of results to return
            price: Price filter for courses
        
        Returns:
            List of Resource objects representing Udemy courses
        """
        try:
            logger.info(f"Searching Udemy for: {query}")
            
            if not self.client_id or not self.client_secret:
                return self._get_mock_udemy_resources(query, max_results)
            
            # Prepare API request parameters
            params = {
                "search": query,
                "page_size": max_results,
                "ordering": "relevance",
                "fields[course]": "title,headline,url,price,image_240x135,visible_instructors,rating,num_reviews,is_paid"
            }
            
            if price == "free":
                params["price"] = "price-free"
            elif price == "paid":
                params["price"] = "price-paid"
            
            # Create authorization header
            auth_string = f"{self.client_id}:{self.client_secret}"
            auth_bytes = auth_string.encode('ascii')
            auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
            
            headers = {
                "Authorization": f"Basic {auth_b64}",
                "Accept": "application/json, text/plain, */*"
            }
            
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/courses/"
                async with session.get(url, params=params, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_udemy_response(data)
                    else:
                        logger.error(f"Udemy API error: {response.status}")
                        return self._get_mock_udemy_resources(query, max_results)
            
        except Exception as e:
            logger.error(f"Error searching Udemy: {e}")
            return self._get_mock_udemy_resources(query, max_results)
    
    def _parse_udemy_response(self, data: dict) -> List[Resource]:
        """Parse Udemy API response into Resource objects."""
        resources = []
        
        for course in data.get("results", []):
            try:
                resource = Resource(
                    id=f"udemy_{course['id']}",
                    title=course["title"],
                    description=course.get("headline", ""),
                    url=f"https://www.udemy.com{course['url']}",
                    platform=Platform.UDEMY,
                    duration=self._estimate_course_duration(course),
                    difficulty=self._estimate_difficulty_from_course(course),
                    rating=course.get("rating"),
                    tags=self._extract_tags_from_course(course)
                )
                
                resources.append(resource)
                
            except Exception as e:
                logger.warning(f"Error parsing Udemy course: {e}")
                continue
        
        logger.info(f"Parsed {len(resources)} Udemy resources")
        return resources
    
    def _get_mock_udemy_resources(self, query: str, max_results: int) -> List[Resource]:
        """Get mock Udemy resources for testing."""
        mock_resources = []
        
        course_types = [
            "Complete Course",
            "Masterclass",
            "Bootcamp",
            "Fundamentals",
            "Advanced Guide"
        ]
        
        for i in range(min(max_results, 3)):
            course_type = course_types[i % len(course_types)]
            
            resource = Resource(
                id=f"udemy_mock_{i}_{hash(query) % 10000}",
                title=f"{query} {course_type}",
                description=f"Master {query} with this comprehensive course covering everything from basics to advanced techniques. Perfect for all skill levels.",
                url=f"https://www.udemy.com/course/mock-{query.replace(' ', '-').lower()}-{i}/",
                platform=Platform.UDEMY,
                duration=f"{(i+1)*10} hours",
                difficulty=ExperienceLevel.BEGINNER if i == 0 else ExperienceLevel.INTERMEDIATE if i == 1 else ExperienceLevel.ADVANCED,
                rating=4.2 + (i * 0.3),
                tags=[query.lower(), "course", "online learning", course_type.lower()]
            )
            mock_resources.append(resource)
        
        logger.info(f"Generated {len(mock_resources)} mock Udemy resources")
        return mock_resources
    
    def _estimate_course_duration(self, course: dict) -> str:
        """Estimate course duration from course data."""
        # Udemy API might provide content_info with duration
        # For now, use heuristics based on title and other factors
        title = course.get("title", "").lower()
        
        if any(word in title for word in ["complete", "comprehensive", "masterclass", "bootcamp"]):
            return "20-40 hours"
        elif any(word in title for word in ["intro", "basics", "fundamentals"]):
            return "5-15 hours"
        elif any(word in title for word in ["advanced", "expert", "deep dive"]):
            return "15-30 hours"
        else:
            return "10-20 hours"
    
    def _estimate_difficulty_from_course(self, course: dict) -> ExperienceLevel:
        """Estimate difficulty level from course data."""
        title = course.get("title", "").lower()
        headline = course.get("headline", "").lower()
        
        text = f"{title} {headline}"
        
        if any(word in text for word in ["beginner", "intro", "basics", "fundamentals", "getting started"]):
            return ExperienceLevel.BEGINNER
        elif any(word in text for word in ["advanced", "expert", "master", "professional", "pro"]):
            return ExperienceLevel.ADVANCED
        else:
            return ExperienceLevel.INTERMEDIATE
    
    def _extract_tags_from_course(self, course: dict) -> List[str]:
        """Extract relevant tags from course data."""
        tags = []
        title = course.get("title", "").lower()
        headline = course.get("headline", "").lower()
        
        # Common course tags
        tag_keywords = [
            "python", "javascript", "java", "react", "node", "web development",
            "data science", "machine learning", "ai", "design", "business",
            "programming", "coding", "software", "development", "course"
        ]
        
        text = f"{title} {headline}"
        
        for keyword in tag_keywords:
            if keyword in text:
                tags.append(keyword)
        
        # Add payment type
        if course.get("is_paid", True):
            tags.append("paid")
        else:
            tags.append("free")
        
        return tags[:6]  # Limit to 6 tags
