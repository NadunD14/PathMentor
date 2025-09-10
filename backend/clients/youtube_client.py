import httpx
import os
from typing import List, Dict, Any, Optional
from models import SearchQuery, LearningResource


class YouTubeClient:
    """Client for fetching learning resources from YouTube Data API"""
    
    def __init__(self):
        self.api_key = os.getenv("YOUTUBE_API_KEY")
        self.base_url = "https://www.googleapis.com/youtube/v3"
        self.default_params = {
            "part": "snippet,statistics",
            "type": "video",
            "maxResults": 10,
            "order": "relevance"
        }
    
    async def search(self, query: SearchQuery) -> List[LearningResource]:
        """Search for videos on YouTube based on the query"""
        if not self.api_key:
            print("YouTube API key not found, returning mock data")
            return self._get_mock_data(query)
        
        async with httpx.AsyncClient() as client:
            try:
                # Search for videos
                search_url = f"{self.base_url}/search"
                params = {
                    **self.default_params,
                    "key": self.api_key,
                    "q": query.query
                }
                
                # Add filters based on query properties
                if query.content_type == "tutorial":
                    params["q"] += " tutorial"
                elif query.content_type == "course":
                    params["q"] += " course"
                elif query.content_type == "project":
                    params["q"] += " project"
                
                response = await client.get(search_url, params=params)
                response.raise_for_status()
                
                data = response.json()
                video_ids = [item["id"]["videoId"] for item in data.get("items", []) if item["id"]["kind"] == "youtube#video"]
                
                if not video_ids:
                    return []
                
                # Get detailed video information
                videos_data = await self._get_video_details(client, video_ids)
                
                # Convert to LearningResource objects
                resources = []
                for video in videos_data:
                    resource = self._convert_to_learning_resource(video, query)
                    if resource:
                        resources.append(resource)
                
                return resources
                
            except Exception as e:
                print(f"Error fetching from YouTube: {str(e)}")
                return self._get_mock_data(query)
    
    async def _get_video_details(self, client: httpx.AsyncClient, video_ids: List[str]) -> List[Dict[str, Any]]:
        """Get detailed information for specific videos"""
        try:
            details_url = f"{self.base_url}/videos"
            params = {
                "key": self.api_key,
                "part": "snippet,statistics,contentDetails",
                "id": ",".join(video_ids)
            }
            
            response = await client.get(details_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            return data.get("items", [])
            
        except Exception as e:
            print(f"Error getting video details: {str(e)}")
            return []
    
    def _convert_to_learning_resource(self, video_data: Dict[str, Any], query: SearchQuery) -> Optional[LearningResource]:
        """Convert YouTube video data to LearningResource"""
        try:
            snippet = video_data.get("snippet", {})
            statistics = video_data.get("statistics", {})
            content_details = video_data.get("contentDetails", {})
            
            # Extract basic information
            video_id = video_data.get("id")
            title = snippet.get("title", "")
            description = snippet.get("description", "")[:500]  # Truncate description
            channel_title = snippet.get("channelTitle", "")
            published_at = snippet.get("publishedAt", "")
            
            # Extract statistics
            view_count = int(statistics.get("viewCount", 0))
            like_count = int(statistics.get("likeCount", 0))
            
            # Calculate simple rating based on engagement
            rating = None
            if view_count > 0 and like_count > 0:
                # Simple engagement-based rating (0-5 scale)
                engagement_ratio = like_count / view_count
                rating = min(5.0, max(1.0, engagement_ratio * 1000 + 3.0))
            
            # Extract duration
            duration_iso = content_details.get("duration", "")
            duration = self._parse_duration(duration_iso)
            
            # Generate thumbnail URL
            thumbnails = snippet.get("thumbnails", {})
            thumbnail = thumbnails.get("medium", {}).get("url") or thumbnails.get("default", {}).get("url")
            
            # Extract tags
            tags = snippet.get("tags", [])[:5]  # Limit to first 5 tags
            
            # Determine difficulty based on title and description
            difficulty = self._determine_difficulty(title + " " + description, query.difficulty)
            
            return LearningResource(
                title=title,
                description=description,
                url=f"https://www.youtube.com/watch?v={video_id}",
                source="youtube",
                duration=duration,
                difficulty=difficulty,
                rating=rating,
                thumbnail=thumbnail,
                author=channel_title,
                view_count=view_count,
                published_date=published_at,
                tags=tags
            )
            
        except Exception as e:
            print(f"Error converting YouTube video data: {str(e)}")
            return None
    
    def _parse_duration(self, duration_iso: str) -> str:
        """Parse ISO 8601 duration format (PT1H2M3S) to readable format"""
        if not duration_iso or not duration_iso.startswith("PT"):
            return "Unknown"
        
        try:
            # Remove PT prefix
            duration = duration_iso[2:]
            
            hours = 0
            minutes = 0
            seconds = 0
            
            # Parse hours
            if "H" in duration:
                hours_str, duration = duration.split("H", 1)
                hours = int(hours_str)
            
            # Parse minutes
            if "M" in duration:
                minutes_str, duration = duration.split("M", 1)
                minutes = int(minutes_str)
            
            # Parse seconds
            if "S" in duration:
                seconds_str = duration.split("S")[0]
                seconds = int(seconds_str)
            
            # Format duration
            if hours > 0:
                return f"{hours}:{minutes:02d}:{seconds:02d}"
            else:
                return f"{minutes}:{seconds:02d}"
                
        except Exception:
            return "Unknown"
    
    def _determine_difficulty(self, content_text: str, query_difficulty: str) -> str:
        """Determine difficulty level based on content analysis"""
        content_lower = content_text.lower()
        
        beginner_keywords = ["beginner", "intro", "basic", "fundamentals", "getting started", "tutorial"]
        intermediate_keywords = ["intermediate", "practical", "hands-on", "project", "build"]
        advanced_keywords = ["advanced", "expert", "deep", "complex", "professional", "mastery"]
        
        beginner_count = sum(1 for keyword in beginner_keywords if keyword in content_lower)
        intermediate_count = sum(1 for keyword in intermediate_keywords if keyword in content_lower)
        advanced_count = sum(1 for keyword in advanced_keywords if keyword in content_lower)
        
        # Determine difficulty based on keyword frequency
        if beginner_count > max(intermediate_count, advanced_count):
            return "beginner"
        elif advanced_count > max(beginner_count, intermediate_count):
            return "advanced"
        elif intermediate_count > 0:
            return "intermediate"
        else:
            # Fall back to query difficulty
            return query_difficulty if query_difficulty in ["beginner", "intermediate", "advanced"] else "intermediate"
    
    def _get_mock_data(self, query: SearchQuery) -> List[LearningResource]:
        """Return mock data when API is not available"""
        topic = query.query.split()[0] if query.query else "Programming"
        
        mock_resources = [
            LearningResource(
                title=f"{topic} Complete Tutorial for Beginners",
                description=f"Learn {topic} from scratch with this comprehensive tutorial. Perfect for beginners who want to master the fundamentals.",
                url="https://www.youtube.com/watch?v=mock1",
                source="youtube",
                duration="2:30:45",
                difficulty="beginner",
                rating=4.5,
                thumbnail="https://i.ytimg.com/vi/mock1/mqdefault.jpg",
                author="TechEducator",
                view_count=125000,
                published_date="2024-01-15T10:00:00Z",
                tags=[topic.lower(), "tutorial", "beginner"]
            ),
            LearningResource(
                title=f"Advanced {topic} Techniques",
                description=f"Deep dive into advanced {topic} concepts and best practices for experienced developers.",
                url="https://www.youtube.com/watch?v=mock2",
                source="youtube",
                duration="1:45:20",
                difficulty="advanced",
                rating=4.8,
                thumbnail="https://i.ytimg.com/vi/mock2/mqdefault.jpg",
                author="CodeMaster",
                view_count=89000,
                published_date="2024-02-10T14:30:00Z",
                tags=[topic.lower(), "advanced", "techniques"]
            ),
            LearningResource(
                title=f"Build a {topic} Project from Scratch",
                description=f"Follow along as we build a complete {topic} project step by step. Great for hands-on learning.",
                url="https://www.youtube.com/watch?v=mock3",
                source="youtube",
                duration="3:15:10",
                difficulty="intermediate",
                rating=4.6,
                thumbnail="https://i.ytimg.com/vi/mock3/mqdefault.jpg",
                author="ProjectBuilder",
                view_count=67000,
                published_date="2024-03-05T09:15:00Z",
                tags=[topic.lower(), "project", "hands-on"]
            )
        ]
        
        return mock_resources
