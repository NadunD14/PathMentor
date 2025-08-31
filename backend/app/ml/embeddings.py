import numpy as np
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
import pickle
import os


class EmbeddingsManager:
    """Manage text embeddings for semantic search and similarity"""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self.embeddings_cache = {}
        self.load_model()
    
    def load_model(self):
        """Load the sentence transformer model"""
        try:
            self.model = SentenceTransformer(self.model_name)
        except Exception as e:
            print(f"Warning: Could not load embeddings model {self.model_name}: {e}")
            self.model = None
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a list of texts"""
        if self.model is None:
            # Return dummy embeddings if model not loaded
            return np.random.rand(len(texts), 384)
        
        # Check cache first
        cached_embeddings = []
        new_texts = []
        new_indices = []
        
        for i, text in enumerate(texts):
            if text in self.embeddings_cache:
                cached_embeddings.append((i, self.embeddings_cache[text]))
            else:
                new_texts.append(text)
                new_indices.append(i)
        
        # Generate embeddings for new texts
        if new_texts:
            new_embeddings = self.model.encode(new_texts)
            
            # Cache new embeddings
            for text, embedding in zip(new_texts, new_embeddings):
                self.embeddings_cache[text] = embedding
        else:
            new_embeddings = np.array([])
        
        # Combine cached and new embeddings
        all_embeddings = np.zeros((len(texts), self.model.get_sentence_embedding_dimension()))
        
        # Fill in cached embeddings
        for idx, embedding in cached_embeddings:
            all_embeddings[idx] = embedding
        
        # Fill in new embeddings
        if len(new_embeddings) > 0:
            for new_idx, orig_idx in enumerate(new_indices):
                all_embeddings[orig_idx] = new_embeddings[new_idx]
        
        return all_embeddings
    
    def compute_similarity(self, embeddings1: np.ndarray, embeddings2: np.ndarray) -> np.ndarray:
        """Compute cosine similarity between two sets of embeddings"""
        from sklearn.metrics.pairwise import cosine_similarity
        return cosine_similarity(embeddings1, embeddings2)
    
    def find_similar_content(
        self, 
        query_text: str, 
        content_texts: List[str], 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Find most similar content to a query"""
        if not content_texts:
            return []
        
        # Generate embeddings
        query_embedding = self.generate_embeddings([query_text])
        content_embeddings = self.generate_embeddings(content_texts)
        
        # Compute similarities
        similarities = self.compute_similarity(query_embedding, content_embeddings)[0]
        
        # Get top similar content
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            results.append({
                'index': int(idx),
                'text': content_texts[idx],
                'similarity': float(similarities[idx])
            })
        
        return results
    
    def cluster_content(self, texts: List[str], num_clusters: int = 5) -> Dict[int, List[int]]:
        """Cluster content based on semantic similarity"""
        if len(texts) < num_clusters:
            # If fewer texts than clusters, each text is its own cluster
            return {i: [i] for i in range(len(texts))}
        
        # Generate embeddings
        embeddings = self.generate_embeddings(texts)
        
        # Perform clustering
        from sklearn.cluster import KMeans
        kmeans = KMeans(n_clusters=num_clusters, random_state=42)
        cluster_labels = kmeans.fit_predict(embeddings)
        
        # Group by clusters
        clusters = {}
        for idx, label in enumerate(cluster_labels):
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(idx)
        
        return clusters
    
    def save_embeddings_cache(self, filepath: str):
        """Save embeddings cache to disk"""
        try:
            with open(filepath, 'wb') as f:
                pickle.dump(self.embeddings_cache, f)
        except Exception as e:
            print(f"Error saving embeddings cache: {e}")
    
    def load_embeddings_cache(self, filepath: str):
        """Load embeddings cache from disk"""
        try:
            if os.path.exists(filepath):
                with open(filepath, 'rb') as f:
                    self.embeddings_cache = pickle.load(f)
        except Exception as e:
            print(f"Error loading embeddings cache: {e}")
            self.embeddings_cache = {}
