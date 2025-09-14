"""
YouTube scraper service.
"""

import os
import logging
from typing import List, Optional
import aiohttp
import asyncio

from models.schemas import Resource, Platform, ExperienceLevel
from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)


class YouTubeScraper:
    """Scraper for YouTube video resources."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize YouTube scraper."""
        self.api_key = api_key or settings.youtube_api_key or os.getenv("YOUTUBE_API_KEY")
        self.base_url = "https://www.googleapis.com/youtube/v3"
        
        if not self.api_key:
            logger.warning("YouTube API key not provided. Using mock data.")
        
        logger.info("YouTube scraper initialized")
    
    async def search_videos(
        self,
        query: str,
        max_results: int = 10,
        duration: str = "any"
    ) -> List[Resource]:
        """Search for YouTube videos."""
        try:
            logger.info(f"Searching YouTube for: {query}")
            
            if not self.api_key:
                return self._mock_youtube_results(query, max_results)
            
            async with aiohttp.ClientSession() as session:
                params = {
                    "part": "snippet",
                    "q": query,
                    "type": "video",
                    "maxResults": max_results,
                    "key": self.api_key,
                    "order": "relevance"
                }
                
                if duration != "any":
                    params["videoDuration"] = duration
                
                async with session.get(f"{self.base_url}/search", params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_youtube_results(data)
                    else:
                        logger.error(f"YouTube API error: {response.status}")
                        return self._mock_youtube_results(query, max_results)
                        
        except Exception as e:
            logger.error(f"Error searching YouTube: {e}")
            return self._mock_youtube_results(query, max_results)
    
    def _parse_youtube_results(self, data: dict) -> List[Resource]:
        """Parse YouTube API response into Resource objects."""
        resources = []
        
        for item in data.get("items", []):
            snippet = item.get("snippet", {})
            video_id = item.get("id", {}).get("videoId")
            
            if not video_id:
                continue
            
            resource = Resource(
                id=video_id,
                title=snippet.get("title", "Unknown Title"),
                description=snippet.get("description", ""),
                url=f"https://www.youtube.com/watch?v={video_id}",
                platform=Platform.YOUTUBE,
                duration=self._estimate_duration(snippet.get("title", "")),
                difficulty=self._estimate_difficulty(snippet.get("title", "")),
                tags=self._extract_tags(snippet)
            )
            
            resources.append(resource)
        
        return resources
    
    def _mock_youtube_results(self, query: str, max_results: int) -> List[Resource]:
        """Generate mock YouTube results when API is not available."""
        query_lower = query.lower()
        
        # Software Engineering specific content
        if "software" in query_lower or "engineering" in query_lower:
            mock_videos = [
                "Software Engineering Fundamentals - Complete Course",
                "How to Become a Software Engineer in 2024",
                "Software Design Patterns Explained",
                "Clean Code Principles for Beginners",
                "Git and GitHub Tutorial for Software Engineers",
                "Object-Oriented Programming in Practice",
                "Software Architecture Patterns",
                "Agile Development Methodology Explained"
            ]
        else:
            mock_videos = [
                f"{query} - Complete Tutorial",
                f"Learn {query} in 10 Minutes",
                f"{query} for Beginners",
                f"Advanced {query} Techniques",
                f"{query} Project Tutorial",
                f"{query} Step by Step Guide",
                f"Master {query} - Full Course",
                f"{query} Tips and Tricks"
            ]
        
        resources = []
        for i, title in enumerate(mock_videos[:max_results]):
            resource = Resource(
                id=f"mock_yt_{i}",
                title=title,
                description=f"A comprehensive tutorial about {query}" if "software" not in query_lower else "Learn software engineering concepts with practical examples and hands-on coding",
                url=f"https://www.youtube.com/watch?v=mock_{i}",
                platform=Platform.YOUTUBE,
                duration=self._estimate_duration(title),
                difficulty=self._estimate_difficulty(title),
                rating=4.2 + (i % 8) * 0.1,
                tags=[query.lower(), "tutorial", "video", "programming"] if "software" in query_lower else [query.lower(), "tutorial", "video"]
            )
            resources.append(resource)
        
        return resources
    
    def _estimate_duration(self, title: str) -> str:
        """Estimate video duration from title."""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ["quick", "10 minutes", "5 minutes", "short"]):
            return "5-15 minutes"
        elif any(word in title_lower for word in ["complete", "full course", "masterclass"]):
            return "2-4 hours"
        elif any(word in title_lower for word in ["series", "playlist"]):
            return "1-3 hours"
        else:
            return "20-45 minutes"
    
    def _estimate_difficulty(self, title: str) -> Optional[ExperienceLevel]:
        """Estimate difficulty level from title."""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ["beginner", "basics", "introduction", "getting started"]):
            return ExperienceLevel.BEGINNER
        elif any(word in title_lower for word in ["advanced", "expert", "mastery", "deep dive"]):
            return ExperienceLevel.ADVANCED
        elif any(word in title_lower for word in ["intermediate", "practical", "hands-on"]):
            return ExperienceLevel.INTERMEDIATE
        else:
            return ExperienceLevel.BEGINNER
    
    def _extract_tags(self, snippet: dict) -> List[str]:
        """Extract relevant tags from video snippet."""
        tags = []
        
        # Add channel title as tag
        channel_title = snippet.get("channelTitle", "")
        if channel_title:
            tags.append(channel_title.lower())
        
        # Add some default tags
        tags.extend(["video", "tutorial", "youtube"])
        
        return tags