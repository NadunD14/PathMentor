import os
from supabase import create_client, Client
from typing import Optional, Dict, Any, List
import json
from datetime import datetime

class SupabaseManager:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if (not self.supabase_url or not self.supabase_key or 
            self.supabase_url == "https://your-project.supabase.co" or 
            self.supabase_key == "your-anon-key-here"):
            print("Warning: Supabase credentials not found or using placeholder values. Database features will be disabled.")
            print("Please set valid SUPABASE_URL and SUPABASE_ANON_KEY environment variables.")
            self.client = None
        else:
            try:
                self.client: Client = create_client(self.supabase_url, self.supabase_key)
                print("Successfully connected to Supabase database")
            except Exception as e:
                print(f"Failed to connect to Supabase: {str(e)}")
                self.client = None
    
    async def save_learning_path(self, learning_path_data: Dict[str, Any]) -> Optional[str]:
        """Save a generated learning path to the database"""
        if not self.client:
            print("Database not available, skipping save operation")
            return learning_path_data.get("path_id")
            
        try:
            # Prepare data for insertion
            path_record = {
                "path_id": learning_path_data["path_id"],
                "user_id": learning_path_data.get("user_profile", {}).get("user_id"),
                "topic": learning_path_data.get("user_profile", {}).get("topic"),
                "goal": learning_path_data.get("user_profile", {}).get("goal"),
                "experience_level": learning_path_data.get("user_profile", {}).get("experience_level"),
                "learning_style": learning_path_data.get("user_profile", {}).get("learning_style"),
                "title": learning_path_data.get("title"),
                "description": learning_path_data.get("description"),
                "total_duration": learning_path_data.get("total_duration"),
                "difficulty_level": learning_path_data.get("difficulty_level"),
                "steps_count": len(learning_path_data.get("steps", [])),
                "path_data": json.dumps(learning_path_data),
                "created_at": datetime.utcnow().isoformat(),
                "tags": learning_path_data.get("tags", [])
            }
            
            result = self.client.table("learning_paths").insert(path_record).execute()
            
            if result.data:
                return result.data[0]["path_id"]
            return None
            
        except Exception as e:
            print(f"Error saving learning path: {str(e)}")
            return None
    
    async def get_learning_path(self, path_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a learning path by ID"""
        if not self.client:
            print("Database not available, cannot retrieve learning path")
            return None
            
        try:
            result = self.client.table("learning_paths").select("*").eq("path_id", path_id).execute()
            
            if result.data and len(result.data) > 0:
                path_record = result.data[0]
                return json.loads(path_record["path_data"])
            return None
            
        except Exception as e:
            print(f"Error retrieving learning path: {str(e)}")
            return None
    
    async def get_user_learning_paths(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all learning paths for a specific user"""
        if not self.client:
            print("Database not available, cannot retrieve user learning paths")
            return []
            
        try:
            result = self.client.table("learning_paths").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            
            paths = []
            if result.data:
                for record in result.data:
                    path_data = json.loads(record["path_data"])
                    paths.append(path_data)
            
            return paths
            
        except Exception as e:
            print(f"Error retrieving user learning paths: {str(e)}")
            return []
    
    async def log_search_query(self, query_data: Dict[str, Any]) -> bool:
        """Log search queries for analytics"""
        if not self.client:
            print("Database not available, skipping search query logging")
            return True
            
        try:
            log_record = {
                "user_id": query_data.get("user_id"),
                "query": query_data.get("query"),
                "source": query_data.get("source"),
                "results_count": query_data.get("results_count", 0),
                "created_at": datetime.utcnow().isoformat()
            }
            
            result = self.client.table("search_logs").insert(log_record).execute()
            return result.data is not None
            
        except Exception as e:
            print(f"Error logging search query: {str(e)}")
            return False


# Global database instance
db_manager = SupabaseManager()
