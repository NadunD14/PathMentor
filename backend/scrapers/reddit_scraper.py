"""
Reddit scraper for fetching discussion posts and educational content.
"""

import logging
import os
from typing import List, Optional
import aiohttp
import asyncio

from database.models import Resource, Platform, ExperienceLevel

logger = logging.getLogger(__name__)


class RedditScraper:
    """
    Scraper for fetching Reddit posts and discussions.
    """
    
    def __init__(self, client_id: Optional[str] = None, client_secret: Optional[str] = None, user_agent: Optional[str] = None):
        """Initialize Reddit scraper."""
        self.client_id = client_id or os.getenv("REDDIT_CLIENT_ID")
        self.client_secret = client_secret or os.getenv("REDDIT_CLIENT_SECRET")
        self.user_agent = user_agent or os.getenv("REDDIT_USER_AGENT", "PathMentor/1.0")
        self.base_url = "https://www.reddit.com"
        self.access_token = None
        
        if not self.client_id or not self.client_secret:
            logger.warning("Reddit API credentials not provided. Using mock data.")
        
        logger.info("Reddit scraper initialized")
    
    async def search_posts(
        self,
        query: str,
        max_results: int = 10,
        subreddit: Optional[str] = None,
        sort: str = "relevance"  # "relevance", "hot", "top", "new"
    ) -> List[Resource]:
        """
        Search for Reddit posts based on query.
        
        Args:
            query: Search query string
            max_results: Maximum number of results to return
            subreddit: Specific subreddit to search in (optional)
            sort: Sort order for results
        
        Returns:
            List of Resource objects representing Reddit posts
        """
        try:
            logger.info(f"Searching Reddit for: {query}")
            
            if not self.client_id or not self.client_secret:
                return self._get_mock_reddit_resources(query, max_results)
            
            # Get access token if not already obtained
            if not self.access_token:
                await self._get_access_token()
            
            # Prepare search parameters
            params = {
                "q": query,
                "limit": max_results,
                "sort": sort,
                "type": "link"
            }
            
            # Choose search URL based on subreddit
            if subreddit:
                search_url = f"{self.base_url}/r/{subreddit}/search.json"
                params["restrict_sr"] = "true"
            else:
                search_url = f"{self.base_url}/search.json"
            
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "User-Agent": self.user_agent
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(search_url, params=params, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_reddit_response(data)
                    else:
                        logger.error(f"Reddit API error: {response.status}")
                        return self._get_mock_reddit_resources(query, max_results)
            
        except Exception as e:
            logger.error(f"Error searching Reddit: {e}")
            return self._get_mock_reddit_resources(query, max_results)
    
    async def _get_access_token(self):
        """Get OAuth access token for Reddit API."""
        try:
            auth_url = "https://www.reddit.com/api/v1/access_token"
            
            auth = aiohttp.BasicAuth(self.client_id, self.client_secret)
            headers = {"User-Agent": self.user_agent}
            data = {"grant_type": "client_credentials"}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(auth_url, auth=auth, headers=headers, data=data) as response:
                    if response.status == 200:
                        token_data = await response.json()
                        self.access_token = token_data["access_token"]
                        logger.info("Reddit access token obtained")
                    else:
                        logger.error(f"Failed to get Reddit access token: {response.status}")
            
        except Exception as e:
            logger.error(f"Error getting Reddit access token: {e}")
    
    def _parse_reddit_response(self, data: dict) -> List[Resource]:
        """Parse Reddit API response into Resource objects."""
        resources = []
        
        posts = data.get("data", {}).get("children", [])
        
        for post_container in posts:
            try:
                post = post_container["data"]
                
                # Skip removed or deleted posts
                if post.get("removed_by_category") or post.get("selftext") == "[deleted]":
                    continue
                
                resource = Resource(
                    id=f"reddit_{post['id']}",
                    title=post["title"],
                    description=self._clean_description(post.get("selftext", post.get("url", ""))),
                    url=f"https://www.reddit.com{post['permalink']}",
                    platform=Platform.REDDIT,
                    duration=self._estimate_read_time(post),
                    difficulty=self._estimate_difficulty_from_post(post),
                    rating=self._calculate_reddit_score(post),
                    tags=self._extract_tags_from_post(post)
                )
                
                resources.append(resource)
                
            except Exception as e:
                logger.warning(f"Error parsing Reddit post: {e}")
                continue
        
        logger.info(f"Parsed {len(resources)} Reddit resources")
        return resources
    
    def _get_mock_reddit_resources(self, query: str, max_results: int) -> List[Resource]:
        """Get mock Reddit resources for testing."""
        mock_resources = []
        
        subreddits = ["learnprogramming", "explainlikeimfive", "AskReddit", "programming", "webdev"]
        post_types = ["Tutorial", "Discussion", "Q&A", "Resource", "Guide"]
        
        for i in range(min(max_results, 5)):
            subreddit = subreddits[i % len(subreddits)]
            post_type = post_types[i % len(post_types)]
            
            resource = Resource(
                id=f"reddit_mock_{i}_{hash(query) % 10000}",
                title=f"[{post_type}] {query} - What you need to know",
                description=f"Community discussion about {query} with practical tips and insights from experienced practitioners. Includes resources and recommendations.",
                url=f"https://www.reddit.com/r/{subreddit}/comments/mock_{i}/",
                platform=Platform.REDDIT,
                duration="5-10 minutes",
                difficulty=ExperienceLevel.BEGINNER if i < 2 else ExperienceLevel.INTERMEDIATE,
                rating=3.5 + (i * 0.3),
                tags=[query.lower(), subreddit, post_type.lower(), "discussion"]
            )
            mock_resources.append(resource)
        
        logger.info(f"Generated {len(mock_resources)} mock Reddit resources")
        return mock_resources
    
    def _clean_description(self, text: str) -> str:
        """Clean and truncate Reddit post text."""
        if not text or text in ["[deleted]", "[removed]"]:
            return "Reddit discussion with community insights and resources."
        
        # Remove markdown formatting
        cleaned = text.replace("**", "").replace("*", "").replace("`", "")
        
        # Truncate if too long
        if len(cleaned) > 300:
            cleaned = cleaned[:300] + "..."
        
        return cleaned
    
    def _estimate_read_time(self, post: dict) -> str:
        """Estimate reading time for Reddit post."""
        selftext_len = len(post.get("selftext", ""))
        num_comments = post.get("num_comments", 0)
        
        if selftext_len > 1000 or num_comments > 50:
            return "10-20 minutes"
        elif selftext_len > 500 or num_comments > 20:
            return "5-10 minutes"
        else:
            return "2-5 minutes"
    
    def _estimate_difficulty_from_post(self, post: dict) -> ExperienceLevel:
        """Estimate difficulty level from Reddit post."""
        title = post.get("title", "").lower()
        selftext = post.get("selftext", "").lower()
        subreddit = post.get("subreddit", "").lower()
        
        text = f"{title} {selftext}"
        
        if any(word in text for word in ["beginner", "new to", "just started", "eli5", "explain like"]):
            return ExperienceLevel.BEGINNER
        elif any(word in text for word in ["advanced", "expert", "professional", "complex"]):
            return ExperienceLevel.ADVANCED
        elif subreddit in ["learnprogramming", "explainlikeimfive"]:
            return ExperienceLevel.BEGINNER
        else:
            return ExperienceLevel.INTERMEDIATE
    
    def _calculate_reddit_score(self, post: dict) -> float:
        """Calculate a rating based on Reddit metrics."""
        score = post.get("score", 0)
        num_comments = post.get("num_comments", 0)
        upvote_ratio = post.get("upvote_ratio", 0.5)
        
        # Normalize score to 1-5 scale
        normalized_score = min(5.0, max(1.0, (score / 100) + 1))
        
        # Adjust based on engagement and ratio
        engagement_bonus = min(1.0, num_comments / 20)
        ratio_bonus = upvote_ratio - 0.5
        
        final_score = normalized_score + engagement_bonus + ratio_bonus
        return min(5.0, max(1.0, final_score))
    
    def _extract_tags_from_post(self, post: dict) -> List[str]:
        """Extract relevant tags from Reddit post."""
        tags = []
        
        # Add subreddit as tag
        subreddit = post.get("subreddit", "")
        if subreddit:
            tags.append(subreddit.lower())
        
        # Extract from title and content
        title = post.get("title", "").lower()
        selftext = post.get("selftext", "").lower()
        
        tag_keywords = [
            "tutorial", "guide", "tips", "help", "question", "discussion",
            "programming", "python", "javascript", "web", "development",
            "beginner", "advanced", "career", "advice"
        ]
        
        text = f"{title} {selftext}"
        
        for keyword in tag_keywords:
            if keyword in text:
                tags.append(keyword)
        
        # Add post flair if available
        flair = post.get("link_flair_text", "")
        if flair:
            tags.append(flair.lower())
        
        return tags[:5]  # Limit to 5 tags
