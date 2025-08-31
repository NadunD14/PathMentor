import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class RecommendationEngine:
    """ML-powered recommendation engine for learning content"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.content_vectors = None
        self.content_metadata = []
    
    def fit(self, content_data: List[Dict[str, Any]]):
        """Train the recommendation model with content data"""
        texts = [item['text'] for item in content_data]
        self.content_vectors = self.vectorizer.fit_transform(texts)
        self.content_metadata = content_data
    
    def get_content_recommendations(
        self, 
        user_profile: Dict[str, Any], 
        num_recommendations: int = 5
    ) -> List[Dict[str, Any]]:
        """Get personalized content recommendations"""
        if self.content_vectors is None:
            return []
        
        # Create user profile vector
        user_interests = user_profile.get('interests', [])
        user_text = ' '.join(user_interests)
        user_vector = self.vectorizer.transform([user_text])
        
        # Calculate similarities
        similarities = cosine_similarity(user_vector, self.content_vectors)[0]
        
        # Get top recommendations
        top_indices = np.argsort(similarities)[::-1][:num_recommendations]
        
        recommendations = []
        for idx in top_indices:
            recommendation = self.content_metadata[idx].copy()
            recommendation['similarity_score'] = float(similarities[idx])
            recommendations.append(recommendation)
        
        return recommendations
    
    def get_similar_content(self, content_id: int, num_similar: int = 3) -> List[Dict[str, Any]]:
        """Find similar content based on content features"""
        if self.content_vectors is None or content_id >= len(self.content_metadata):
            return []
        
        content_vector = self.content_vectors[content_id]
        similarities = cosine_similarity(content_vector, self.content_vectors)[0]
        
        # Exclude the content itself
        similarities[content_id] = -1
        
        top_indices = np.argsort(similarities)[::-1][:num_similar]
        
        similar_content = []
        for idx in top_indices:
            if similarities[idx] > 0:  # Only include if similarity is positive
                content = self.content_metadata[idx].copy()
                content['similarity_score'] = float(similarities[idx])
                similar_content.append(content)
        
        return similar_content
