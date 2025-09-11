"""
YouTube API client for fetching video resources.
"""

import logging
import os
from typing import List, Optional
import aiohttp
import asyncio

from ..database.models import Resource, Platform, ExperienceLevel

logger = logging.getLogger(__name__)


class YouTubeClient:
    """
    Client for fetching YouTube video resources.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize YouTube client."""
        self.api_key = api_key or os.getenv("YOUTUBE_API_KEY")
        self.base_url = "https://www.googleapis.com/youtube/v3"
        
        if not self.api_key:
            logger.warning("YouTube API key not provided. Using mock data.")
        
        logger.info("YouTube client initialized")
    
    async def search_videos(
        self,
        query: str,
        max_results: int = 10,
        duration: str = "any"  # "short", "medium", "long", "any"
    ) -> List[Resource]:
        """
        Search for YouTube videos based on query.
        
        Args:
            query: Search query string
            max_results: Maximum number of results to return
            duration: Video duration filter
        
        Returns:
            List of Resource objects representing YouTube videos
        """
        try:
            logger.info(f"Searching YouTube for: {query}")
            
            if not self.api_key:
                return self._get_mock_youtube_resources(query, max_results)
            
            # Prepare API request parameters
            params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": max_results,
                "order": "relevance",
                "key": self.api_key
            }
            
            if duration != "any":
                params["videoDuration"] = duration
            
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/search"
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_youtube_response(data)
                    else:
                        logger.error(f"YouTube API error: {response.status}")
                        return self._get_mock_youtube_resources(query, max_results)
            
        except Exception as e:
            logger.error(f"Error searching YouTube: {e}")
            return self._get_mock_youtube_resources(query, max_results)
    
    def _parse_youtube_response(self, data: dict) -> List[Resource]:
        """Parse YouTube API response into Resource objects."""
        resources = []
        
        for item in data.get("items", []):
            try:
                video_id = item["id"]["videoId"]
                snippet = item["snippet"]
                
                resource = Resource(
                    id=f"youtube_{video_id}",
                    title=snippet["title"],
                    description=snippet["description"][:500] + "..." if len(snippet["description"]) > 500 else snippet["description"],
                    url=f"https://www.youtube.com/watch?v={video_id}",
                    platform=Platform.YOUTUBE,
                    duration=self._estimate_duration_from_title(snippet["title"]),
                    difficulty=self._estimate_difficulty_from_title(snippet["title"]),
                    rating=None,  # Would need additional API call to get ratings
                    tags=self._extract_tags_from_title(snippet["title"])
                )
                
                resources.append(resource)
                
            except Exception as e:
                logger.warning(f"Error parsing YouTube item: {e}")
                continue
        
        logger.info(f"Parsed {len(resources)} YouTube resources")
        return resources
    
    def _get_mock_youtube_resources(self, query: str, max_results: int) -> List[Resource]:
        """Get mock YouTube resources for testing."""
        mock_resources = []
        
        for i in range(min(max_results, 5)):
            resource = Resource(
                id=f"youtube_mock_{i}_{hash(query) % 10000}",
                title=f"{query} Tutorial - Part {i+1}",
                description=f"Learn {query} with this comprehensive tutorial covering fundamental concepts and practical examples.",
                url=f"https://www.youtube.com/watch?v=mock_{i}",
                platform=Platform.YOUTUBE,
                duration="15 minutes" if i % 2 == 0 else "30 minutes",
                difficulty=ExperienceLevel.BEGINNER if i < 2 else ExperienceLevel.INTERMEDIATE,
                rating=4.0 + (i * 0.2),
                tags=[query.lower(), "tutorial", "beginner" if i < 2 else "intermediate"]
            )
            mock_resources.append(resource)
        
        logger.info(f"Generated {len(mock_resources)} mock YouTube resources")
        return mock_resources
    
    def _estimate_duration_from_title(self, title: str) -> str:
        """Estimate video duration from title."""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ["quick", "short", "minute", "intro"]):
            return "5-15 minutes"
        elif any(word in title_lower for word in ["complete", "full", "comprehensive", "course"]):
            return "1-3 hours"
        elif any(word in title_lower for word in ["masterclass", "bootcamp", "series"]):
            return "3+ hours"
        else:
            return "20-45 minutes"
    
    def _estimate_difficulty_from_title(self, title: str) -> ExperienceLevel:
        """Estimate difficulty level from title."""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ["beginner", "intro", "basics", "getting started", "101"]):
            return ExperienceLevel.BEGINNER
        elif any(word in title_lower for word in ["advanced", "expert", "master", "pro"]):
            return ExperienceLevel.ADVANCED
        else:
            return ExperienceLevel.INTERMEDIATE
    
    def _extract_tags_from_title(self, title: str) -> List[str]:
        """Extract relevant tags from video title."""
        tags = []
        title_lower = title.lower()
        
        # Common programming/learning tags
        tag_keywords = [
            "tutorial", "course", "lesson", "guide", "tips", "tricks",
            "python", "javascript", "java", "react", "node", "web",
            "data", "science", "machine learning", "ai", "design"
        ]
        
        for keyword in tag_keywords:
            if keyword in title_lower:
                tags.append(keyword)
        
        return tags[:5]  # Limit to 5 tags
