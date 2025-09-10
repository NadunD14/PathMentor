from typing import List, Dict, Any
import asyncio
from models import SearchQuery, LearningResource
from clients.youtube_client import YouTubeClient
from clients.udemy_client import UdemyClient
from clients.reddit_client import RedditClient


class ScraperManager:
    """Orchestrates calls to different external API clients"""
    
    def __init__(self):
        self.youtube_client = YouTubeClient()
        self.udemy_client = UdemyClient()
        self.reddit_client = RedditClient()
        
        self.source_clients = {
            "youtube": self.youtube_client,
            "udemy": self.udemy_client,
            "reddit": self.reddit_client
        }
    
    async def fetch_all_resources(self, queries: List[SearchQuery]) -> Dict[str, List[LearningResource]]:
        """Fetch resources from all sources based on the generated queries"""
        results = {
            "youtube": [],
            "udemy": [],
            "reddit": []
        }
        
        # Group queries by source
        queries_by_source = {}
        for query in queries:
            if query.source not in queries_by_source:
                queries_by_source[query.source] = []
            queries_by_source[query.source].append(query)
        
        # Fetch from each source concurrently
        tasks = []
        for source, source_queries in queries_by_source.items():
            if source in self.source_clients:
                task = self._fetch_from_source(source, source_queries)
                tasks.append(task)
        
        # Wait for all tasks to complete
        source_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Combine results
        for i, (source, _) in enumerate(queries_by_source.items()):
            if i < len(source_results) and not isinstance(source_results[i], Exception):
                results[source] = source_results[i]
        
        return results
    
    async def _fetch_from_source(self, source: str, queries: List[SearchQuery]) -> List[LearningResource]:
        """Fetch resources from a specific source"""
        client = self.source_clients.get(source)
        if not client:
            return []
        
        all_resources = []
        
        # Fetch resources for each query
        for query in queries:
            try:
                resources = await client.search(query)
                all_resources.extend(resources)
            except Exception as e:
                print(f"Error fetching from {source} with query '{query.query}': {str(e)}")
                continue
        
        # Remove duplicates based on URL
        unique_resources = {}
        for resource in all_resources:
            if resource.url not in unique_resources:
                unique_resources[resource.url] = resource
        
        return list(unique_resources.values())
    
    async def fetch_specific_content(self, source: str, query: str, content_type: str = "all", limit: int = 10) -> List[LearningResource]:
        """Fetch specific content from a single source"""
        client = self.source_clients.get(source)
        if not client:
            return []
        
        search_query = SearchQuery(
            query=query,
            source=source,
            difficulty="all",
            content_type=content_type
        )
        
        try:
            resources = await client.search(search_query)
            return resources[:limit]
        except Exception as e:
            print(f"Error fetching specific content from {source}: {str(e)}")
            return []
    
    def filter_resources_by_type(self, resources: List[LearningResource], content_type: str) -> List[LearningResource]:
        """Filter resources by content type"""
        if content_type == "all":
            return resources
        
        filtered = []
        for resource in resources:
            # Simple filtering based on title and description
            resource_text = f"{resource.title} {resource.description}".lower()
            
            if content_type == "tutorial" and any(word in resource_text for word in ["tutorial", "how to", "guide", "step by step"]):
                filtered.append(resource)
            elif content_type == "course" and any(word in resource_text for word in ["course", "full", "complete", "series"]):
                filtered.append(resource)
            elif content_type == "project" and any(word in resource_text for word in ["project", "build", "create", "make"]):
                filtered.append(resource)
            elif content_type == "video" and resource.source == "youtube":
                filtered.append(resource)
        
        return filtered
    
    def get_content_statistics(self, resources: Dict[str, List[LearningResource]]) -> Dict[str, Any]:
        """Get statistics about the fetched content"""
        stats = {
            "total_resources": 0,
            "by_source": {},
            "by_type": {},
            "average_rating": 0,
            "total_duration_estimate": "0 hours"
        }
        
        all_resources = []
        for source, source_resources in resources.items():
            stats["by_source"][source] = len(source_resources)
            all_resources.extend(source_resources)
        
        stats["total_resources"] = len(all_resources)
        
        # Calculate average rating
        ratings = [r.rating for r in all_resources if r.rating is not None]
        if ratings:
            stats["average_rating"] = sum(ratings) / len(ratings)
        
        # Estimate total duration (simplified)
        duration_minutes = 0
        for resource in all_resources:
            if resource.duration:
                # Simple parsing for common duration formats
                try:
                    if ":" in resource.duration:
                        parts = resource.duration.split(":")
                        if len(parts) == 2:
                            duration_minutes += int(parts[0]) * 60 + int(parts[1])
                        elif len(parts) == 3:
                            duration_minutes += int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
                except:
                    pass
        
        hours = duration_minutes // 60
        stats["total_duration_estimate"] = f"{hours} hours"
        
        return stats
