"""
Reddit scraper service.
"""

import logging
import os
from typing import List, Optional
import aiohttp

from models.schemas import Resource, Platform, ExperienceLevel
from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)


class RedditScraper:
    """Scraper for Reddit discussion and resource links."""
    
    def __init__(self):
        """Initialize Reddit scraper."""
        self.user_agent = (
            settings.reddit_user_agent 
            or os.getenv("REDDIT_USER_AGENT") 
            or "PathMentor/1.0"
        )
        logger.info("Reddit scraper initialized")
    
    async def search_posts(
        self,
        query: str,
        subreddits: Optional[List[str]] = None,
        max_results: int = 10
    ) -> List[Resource]:
        """
        Search for Reddit posts and discussions.
        
        This uses Reddit's public API which doesn't require authentication
        for read-only access.
        """
        try:
            logger.info(f"Searching Reddit for: {query}")
            
            if not subreddits:
                subreddits = self._get_relevant_subreddits(query)
            
            all_resources = []
            
            for subreddit in subreddits:
                resources = await self._search_subreddit(query, subreddit, max_results // len(subreddits))
                all_resources.extend(resources)
            
            # Sort by relevance and return top results
            return all_resources[:max_results]
            
        except Exception as e:
            logger.error(f"Error searching Reddit: {e}")
            return self._mock_reddit_results(query, max_results)
    
    async def _search_subreddit(
        self,
        query: str,
        subreddit: str,
        max_results: int
    ) -> List[Resource]:
        """Search a specific subreddit."""
        try:
            headers = {"User-Agent": self.user_agent}
            url = f"https://www.reddit.com/r/{subreddit}/search.json"
            
            params = {
                "q": query,
                "restrict_sr": "1",
                "sort": "relevance",
                "limit": max_results
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_reddit_results(data, subreddit)
                    else:
                        logger.warning(f"Reddit API returned status {response.status}")
                        return []
                        
        except Exception as e:
            logger.error(f"Error searching subreddit {subreddit}: {e}")
            return []
    
    def _parse_reddit_results(self, data: dict, subreddit: str) -> List[Resource]:
        """Parse Reddit API response into Resource objects."""
        resources = []
        
        posts = data.get("data", {}).get("children", [])
        
        for post_wrapper in posts:
            post = post_wrapper.get("data", {})
            
            # Filter out removed/deleted posts
            if post.get("removed_by_category") or not post.get("title"):
                continue
            
            resource = Resource(
                id=post.get("id", ""),
                title=post.get("title", ""),
                description=self._clean_text(post.get("selftext", "")),
                url=f"https://www.reddit.com{post.get('permalink', '')}",
                platform=Platform.REDDIT,
                duration="5-15 minutes",
                difficulty=self._estimate_difficulty(post.get("title", "")),
                rating=self._calculate_reddit_score(post),
                tags=[subreddit, "discussion", "community"]
            )
            
            resources.append(resource)
        
        return resources
    
    def _get_relevant_subreddits(self, query: str) -> List[str]:
        """Get relevant subreddits based on the query."""
        query_lower = query.lower()
        
        # Tech-related subreddits
        tech_subreddits = [
            "learnprogramming", "programming", "coding", "webdev",
            "MachineLearning", "artificial", "datascience", "Python",
            "javascript", "reactjs", "node", "css", "html"
        ]
        
        # General learning subreddits
        learning_subreddits = [
            "explainlikeimfive", "YouShouldKnow", "todayilearned",
            "LifeProTips", "selfimprovement", "GetStudying"
        ]
        
        # Default subreddits
        default_subreddits = ["learnprogramming", "explainlikeimfive", "YouShouldKnow"]
        
        # Try to match query to relevant subreddits
        relevant_subreddits = []
        
        for subreddit in tech_subreddits + learning_subreddits:
            if any(keyword in query_lower for keyword in [
                subreddit.lower(), 
                subreddit.lower().replace("learn", ""),
                subreddit.lower().replace("programming", "")
            ]):
                relevant_subreddits.append(subreddit)
        
        # If no specific match, use defaults
        if not relevant_subreddits:
            relevant_subreddits = default_subreddits
        
        return relevant_subreddits[:3]  # Limit to 3 subreddits
    
    def _calculate_reddit_score(self, post: dict) -> float:
        """Calculate a relevance score for a Reddit post."""
        score = post.get("score", 0)
        num_comments = post.get("num_comments", 0)
        
        # Normalize score (Reddit scores can vary widely)
        normalized_score = min(5.0, max(1.0, (score / 10) + (num_comments / 5)))
        return round(normalized_score, 1)
    
    def _estimate_difficulty(self, title: str) -> Optional[ExperienceLevel]:
        """Estimate difficulty level from post title."""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ["eli5", "beginner", "newbie", "help", "started"]):
            return ExperienceLevel.BEGINNER
        elif any(word in title_lower for word in ["advanced", "expert", "complex", "deep"]):
            return ExperienceLevel.ADVANCED
        else:
            return ExperienceLevel.INTERMEDIATE
    
    def _clean_text(self, text: str) -> str:
        """Clean Reddit post text."""
        if not text:
            return "Community discussion and Q&A"
        
        # Remove Reddit formatting and truncate
        cleaned = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
        if len(cleaned) > 200:
            cleaned = cleaned[:200] + "..."
        
        return cleaned
    
    def _mock_reddit_results(self, query: str, max_results: int) -> List[Resource]:
        """Generate mock Reddit results."""
        mock_posts = [
            f"Best resources to learn {query}?",
            f"How I learned {query} in 3 months",
            f"{query} roadmap for beginners",
            f"Common mistakes when learning {query}",
            f"Free {query} resources that actually work",
            f"{query} project ideas for practice",
            f"ELI5: What is {query}?",
            f"Career advice: Getting started with {query}"
        ]
        
        resources = []
        for i, title in enumerate(mock_posts[:max_results]):
            resource = Resource(
                id=f"reddit_mock_{i}",
                title=title,
                description="Community discussion with helpful tips and resources",
                url=f"https://www.reddit.com/r/learnprogramming/comments/mock_{i}",
                platform=Platform.REDDIT,
                duration="5-15 minutes",
                difficulty=ExperienceLevel.BEGINNER,
                rating=3.5 + (i % 5) * 0.3,
                tags=["discussion", "community", "tips"]
            )
            resources.append(resource)
        
        return resources