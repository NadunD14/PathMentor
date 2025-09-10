import httpx
import os
from typing import List, Dict, Any, Optional
from models import SearchQuery, LearningResource


class RedditClient:
    """Client for fetching learning resources and discussions from Reddit"""
    
    def __init__(self):
        # Reddit API requires OAuth, but we can use the public JSON endpoints for basic searches
        self.base_url = "https://www.reddit.com"
        self.user_agent = "PathMentor/1.0"
        
        # Common programming and learning subreddits
        self.learning_subreddits = [
            "learnprogramming", "programming", "webdev", "MachineLearning",
            "datascience", "Python", "javascript", "reactjs", "vuejs",
            "Frontend", "Backend", "DevOps", "cybersecurity", "gamedev"
        ]
    
    async def search(self, query: SearchQuery) -> List[LearningResource]:
        """Search for learning resources and discussions on Reddit"""
        try:
            async with httpx.AsyncClient() as client:
                # Set user agent
                client.headers.update({"User-Agent": self.user_agent})
                
                resources = []
                
                # Search in relevant subreddits
                relevant_subreddits = self._get_relevant_subreddits(query.query)
                
                for subreddit in relevant_subreddits[:3]:  # Limit to 3 subreddits
                    subreddit_resources = await self._search_subreddit(client, subreddit, query)
                    resources.extend(subreddit_resources)
                
                # Also do a general Reddit search
                general_resources = await self._search_reddit_general(client, query)
                resources.extend(general_resources)
                
                # Remove duplicates and limit results
                unique_resources = self._remove_duplicates(resources)
                return unique_resources[:10]  # Limit to 10 results
                
        except Exception as e:
            print(f"Error fetching from Reddit: {str(e)}")
            return self._get_mock_data(query)
    
    async def _search_subreddit(self, client: httpx.AsyncClient, subreddit: str, query: SearchQuery) -> List[LearningResource]:
        """Search within a specific subreddit"""
        try:
            # Use Reddit's JSON API
            url = f"{self.base_url}/r/{subreddit}/search.json"
            params = {
                "q": query.query,
                "restrict_sr": "true",
                "sort": "relevance",
                "limit": 5,
                "t": "year"  # Search within the last year
            }
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            posts = data.get("data", {}).get("children", [])
            
            resources = []
            for post_data in posts:
                post = post_data.get("data", {})
                resource = self._convert_reddit_post_to_resource(post, subreddit)
                if resource:
                    resources.append(resource)
            
            return resources
            
        except Exception as e:
            print(f"Error searching subreddit {subreddit}: {str(e)}")
            return []
    
    async def _search_reddit_general(self, client: httpx.AsyncClient, query: SearchQuery) -> List[LearningResource]:
        """Perform a general Reddit search"""
        try:
            url = f"{self.base_url}/search.json"
            params = {
                "q": f"{query.query} learning resources",
                "sort": "relevance",
                "limit": 5,
                "t": "year"
            }
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            posts = data.get("data", {}).get("children", [])
            
            resources = []
            for post_data in posts:
                post = post_data.get("data", {})
                subreddit = post.get("subreddit", "")
                resource = self._convert_reddit_post_to_resource(post, subreddit)
                if resource:
                    resources.append(resource)
            
            return resources
            
        except Exception as e:
            print(f"Error in general Reddit search: {str(e)}")
            return []
    
    def _convert_reddit_post_to_resource(self, post: Dict[str, Any], subreddit: str) -> Optional[LearningResource]:
        """Convert Reddit post data to LearningResource"""
        try:
            title = post.get("title", "")
            selftext = post.get("selftext", "")
            url = post.get("url", "")
            permalink = post.get("permalink", "")
            author = post.get("author", "")
            score = post.get("score", 0)
            num_comments = post.get("num_comments", 0)
            created_utc = post.get("created_utc", 0)
            
            # Skip if no meaningful content
            if not title or len(title) < 10:
                return None
            
            # Create description from post content
            description = selftext[:300] if selftext else f"Discussion from r/{subreddit} with {num_comments} comments"
            
            # Use Reddit URL if the post doesn't link to external content
            if not url or url.startswith("/r/") or "reddit.com" in url:
                resource_url = f"https://www.reddit.com{permalink}"
            else:
                resource_url = url
            
            # Calculate a simple rating based on score and comments
            rating = None
            if score > 0:
                # Simple scoring: more upvotes and comments = higher rating
                engagement_score = score + (num_comments * 2)
                rating = min(5.0, max(1.0, (engagement_score / 100) + 2.0))
            
            # Determine difficulty based on content
            difficulty = self._determine_reddit_difficulty(title + " " + description)
            
            # Convert timestamp to ISO format
            from datetime import datetime
            published_date = datetime.utcfromtimestamp(created_utc).isoformat() + "Z"
            
            # Generate tags
            tags = [subreddit, "reddit", "discussion"]
            if "tutorial" in title.lower():
                tags.append("tutorial")
            if "beginner" in title.lower():
                tags.append("beginner")
            if "resource" in title.lower():
                tags.append("resources")
            
            return LearningResource(
                title=title,
                description=description,
                url=resource_url,
                source="reddit",
                duration=f"~{max(2, num_comments // 10)} min read",  # Estimate reading time
                difficulty=difficulty,
                rating=rating,
                thumbnail=None,  # Reddit posts don't have thumbnails in the way videos do
                author=f"u/{author} on r/{subreddit}",
                view_count=score,  # Use score as a proxy for views
                published_date=published_date,
                tags=tags
            )
            
        except Exception as e:
            print(f"Error converting Reddit post: {str(e)}")
            return None
    
    def _get_relevant_subreddits(self, query: str) -> List[str]:
        """Get relevant subreddits based on the query"""
        query_lower = query.lower()
        relevant = []
        
        # Map keywords to subreddits
        subreddit_keywords = {
            "python": ["Python", "learnpython"],
            "javascript": ["javascript", "learnjavascript"],
            "react": ["reactjs", "Frontend"],
            "vue": ["vuejs", "Frontend"],
            "web": ["webdev", "Frontend"],
            "machine learning": ["MachineLearning", "datascience"],
            "data": ["datascience", "analytics"],
            "programming": ["programming", "learnprogramming"],
            "backend": ["Backend", "webdev"],
            "devops": ["DevOps", "sysadmin"],
            "cybersecurity": ["cybersecurity", "netsec"],
            "game": ["gamedev", "Unity3D"]
        }
        
        # Find matching subreddits
        for keyword, subreddits in subreddit_keywords.items():
            if keyword in query_lower:
                relevant.extend(subreddits)
        
        # Add default subreddits if no specific matches
        if not relevant:
            relevant = ["learnprogramming", "programming", "webdev"]
        
        # Remove duplicates while preserving order
        seen = set()
        unique_relevant = []
        for sub in relevant:
            if sub not in seen:
                seen.add(sub)
                unique_relevant.append(sub)
        
        return unique_relevant
    
    def _determine_reddit_difficulty(self, content_text: str) -> str:
        """Determine difficulty level based on Reddit post content"""
        content_lower = content_text.lower()
        
        beginner_keywords = ["beginner", "new to", "just started", "first time", "basic", "help", "eli5"]
        advanced_keywords = ["advanced", "expert", "complex", "deep dive", "optimization", "architecture"]
        
        beginner_count = sum(1 for keyword in beginner_keywords if keyword in content_lower)
        advanced_count = sum(1 for keyword in advanced_keywords if keyword in content_lower)
        
        if beginner_count > advanced_count:
            return "beginner"
        elif advanced_count > beginner_count:
            return "advanced"
        else:
            return "intermediate"
    
    def _remove_duplicates(self, resources: List[LearningResource]) -> List[LearningResource]:
        """Remove duplicate resources based on URL and title similarity"""
        unique_resources = {}
        
        for resource in resources:
            # Use URL as primary key, fall back to title
            key = resource.url if resource.url else resource.title.lower()
            
            if key not in unique_resources:
                unique_resources[key] = resource
            else:
                # Keep the one with higher rating if both exist
                existing = unique_resources[key]
                if resource.rating and (not existing.rating or resource.rating > existing.rating):
                    unique_resources[key] = resource
        
        return list(unique_resources.values())
    
    def _get_mock_data(self, query: SearchQuery) -> List[LearningResource]:
        """Return mock data when Reddit API is not available"""
        topic = query.query.split()[0] if query.query else "Programming"
        
        mock_resources = [
            LearningResource(
                title=f"Best {topic} learning resources for beginners?",
                description=f"Community discussion about the best resources to learn {topic}. Lots of great recommendations from experienced developers.",
                url="https://www.reddit.com/r/learnprogramming/mock1",
                source="reddit",
                duration="~5 min read",
                difficulty="beginner",
                rating=4.2,
                thumbnail=None,
                author="u/learner123 on r/learnprogramming",
                view_count=156,
                published_date="2024-02-15T10:30:00Z",
                tags=["reddit", "discussion", "resources", "beginner"]
            ),
            LearningResource(
                title=f"{topic} learning roadmap - what order should I learn things?",
                description=f"Detailed roadmap for learning {topic} with step-by-step progression and resource recommendations.",
                url="https://www.reddit.com/r/programming/mock2",
                source="reddit",
                duration="~8 min read",
                difficulty="intermediate",
                rating=4.6,
                thumbnail=None,
                author="u/mentor_dev on r/programming",
                view_count=284,
                published_date="2024-01-28T16:45:00Z",
                tags=["reddit", "roadmap", "learning-path", "intermediate"]
            ),
            LearningResource(
                title=f"Common {topic} mistakes to avoid",
                description=f"Experienced developers share common pitfalls and mistakes to avoid when learning {topic}.",
                url="https://www.reddit.com/r/webdev/mock3",
                source="reddit",
                duration="~6 min read",
                difficulty="intermediate",
                rating=4.4,
                thumbnail=None,
                author="u/senior_dev on r/webdev",
                view_count=198,
                published_date="2024-03-01T12:20:00Z",
                tags=["reddit", "tips", "mistakes", "advice"]
            )
        ]
        
        return mock_resources
