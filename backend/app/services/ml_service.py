import numpy as np
from typing import List, Dict, Any, Optional
import logging
from app.core.config import settings
from app.schemas.ml import RecommendationResponse, ProgressAnalysis, CompleteSetupRequest, CompleteSetupResponse
from app.services.supabase_service import supabase_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import sentence transformers, but don't fail if not available
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    logger.warning("sentence-transformers not available. Using fallback embeddings.")
    SENTENCE_TRANSFORMERS_AVAILABLE = False


class MLService:
    def __init__(self):
        self.embeddings_model = None
        self._load_models()

    def _load_models(self):
        """Load ML models on initialization"""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            logger.warning("Sentence transformers not available. Using fallback mode.")
            return
            
        try:
            logger.info(f"Loading embeddings model: {settings.EMBEDDINGS_MODEL}")
            self.embeddings_model = SentenceTransformer(settings.EMBEDDINGS_MODEL)
            logger.info("Embeddings model loaded successfully")
        except Exception as e:
            logger.error(f"Could not load embeddings model: {e}")
            self.embeddings_model = None

    def generate_embeddings(self, text: str) -> List[float]:
        """Generate embeddings for text content"""
        if self.embeddings_model is None:
            # Return dummy embeddings if model not loaded
            logger.warning("Using fallback embeddings - model not available")
            return [0.1] * 384  # Standard dimension for all-MiniLM-L6-v2
        
        try:
            embeddings = self.embeddings_model.encode([text])
            return embeddings[0].tolist()
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return [0.1] * 384

    async def complete_setup_analysis(self, request: CompleteSetupRequest) -> CompleteSetupResponse:
        """Perform complete ML analysis when user finishes questionnaire setup"""
        user_id = request.user_id
        answers = request.answers
        selected_categories = request.selected_categories
        
        # Analyze user's answers
        analysis = await self._analyze_user_answers(user_id, answers)
        
        # Generate recommendations based on categories and answers
        recommendations = await self._generate_personalized_recommendations(
            user_id, selected_categories, answers
        )
        
        # Create learning paths for the user
        learning_path_created = await self._create_initial_learning_paths(
            user_id, selected_categories, analysis
        )
        
        return CompleteSetupResponse(
            success=True,
            user_id=user_id,
            analysis=analysis,
            recommendations=recommendations,
            learning_path_created=learning_path_created,
            message="Setup analysis completed successfully"
        )

    async def _analyze_user_answers(self, user_id: str, answers: List[Dict[str, Any]]) -> ProgressAnalysis:
        """Analyze user's answers to determine strengths, weaknesses, and learning profile"""
        if not answers:
            return ProgressAnalysis(
                user_id=user_id,
                overall_score=0.0,
                strengths=["Getting started with learning"],
                weaknesses=["Need to complete more assessments"],
                recommendations=["Start with beginner-friendly content"],
                learning_velocity=0.5,
                completion_prediction=30
            )

        # Analyze answer patterns
        text_answers = []
        multiple_choice_answers = []
        
        for answer in answers:
            if answer.get('answer_text'):
                text_answers.append(answer['answer_text'])
            if answer.get('option_id'):
                multiple_choice_answers.append(answer)

        # Analyze text complexity and content
        text_complexity_score = self._analyze_text_complexity(text_answers)
        
        # Analyze multiple choice patterns
        mc_analysis = self._analyze_multiple_choice_patterns(multiple_choice_answers)
        
        # Determine learning style preferences
        learning_style = self._determine_learning_style(answers)
        
        # Calculate overall readiness score
        overall_score = (text_complexity_score + mc_analysis['confidence_score']) / 2
        
        # Generate insights
        strengths = self._extract_strengths(learning_style, text_complexity_score, mc_analysis)
        weaknesses = self._extract_weaknesses(learning_style, text_complexity_score, mc_analysis)
        recommendations = self._generate_learning_recommendations(strengths, weaknesses, overall_score)
        
        return ProgressAnalysis(
            user_id=user_id,
            overall_score=overall_score,
            strengths=strengths,
            weaknesses=weaknesses,
            recommendations=recommendations,
            learning_velocity=min(1.0, overall_score + 0.3),
            completion_prediction=max(7, int(30 - (overall_score * 20)))
        )

    def _analyze_text_complexity(self, text_answers: List[str]) -> float:
        """Analyze complexity and depth of text answers"""
        if not text_answers:
            return 0.5
        
        total_score = 0
        for text in text_answers:
            # Simple complexity metrics
            word_count = len(text.split())
            sentence_count = text.count('.') + text.count('!') + text.count('?') + 1
            avg_word_length = sum(len(word) for word in text.split()) / max(word_count, 1)
            
            # Calculate complexity score (0-1)
            complexity = min(1.0, (word_count / 100) + (avg_word_length / 10) + (sentence_count / 10))
            total_score += complexity
        
        return total_score / len(text_answers)

    def _analyze_multiple_choice_patterns(self, mc_answers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze patterns in multiple choice responses"""
        if not mc_answers:
            return {'confidence_score': 0.5, 'consistency': 0.5}
        
        # For now, return baseline analysis
        # In a real implementation, this would analyze answer consistency, 
        # difficulty patterns, etc.
        return {
            'confidence_score': 0.7,
            'consistency': 0.8,
            'answer_speed': 'moderate'
        }

    def _determine_learning_style(self, answers: List[Dict[str, Any]]) -> str:
        """Determine user's preferred learning style based on answer patterns"""
        # Simplified learning style detection
        text_count = sum(1 for a in answers if a.get('answer_text'))
        mc_count = sum(1 for a in answers if a.get('option_id'))
        
        if text_count > mc_count:
            return "reflective"
        elif mc_count > text_count * 2:
            return "practical"
        else:
            return "balanced"

    def _extract_strengths(self, learning_style: str, text_complexity: float, mc_analysis: Dict) -> List[str]:
        """Extract user strengths based on analysis"""
        strengths = []
        
        if text_complexity > 0.7:
            strengths.append("Strong analytical thinking")
            strengths.append("Good written communication")
        
        if mc_analysis['confidence_score'] > 0.7:
            strengths.append("Quick decision making")
            strengths.append("Good pattern recognition")
        
        if learning_style == "reflective":
            strengths.append("Thoughtful problem solving")
        elif learning_style == "practical":
            strengths.append("Practical application focus")
        else:
            strengths.append("Balanced learning approach")
        
        return strengths if strengths else ["Eager to learn", "Open to new concepts"]

    def _extract_weaknesses(self, learning_style: str, text_complexity: float, mc_analysis: Dict) -> List[str]:
        """Extract areas for improvement based on analysis"""
        weaknesses = []
        
        if text_complexity < 0.3:
            weaknesses.append("Could expand on detailed explanations")
        
        if mc_analysis['confidence_score'] < 0.5:
            weaknesses.append("May need more structured guidance")
        
        if learning_style == "reflective":
            weaknesses.append("May benefit from more hands-on practice")
        elif learning_style == "practical":
            weaknesses.append("Could explore theoretical concepts more deeply")
        
        return weaknesses if weaknesses else ["Ready for skill development"]

    def _generate_learning_recommendations(self, strengths: List[str], weaknesses: List[str], overall_score: float) -> List[str]:
        """Generate personalized learning recommendations"""
        recommendations = []
        
        if overall_score < 0.3:
            recommendations.extend([
                "Start with fundamental concepts",
                "Use visual learning materials",
                "Practice with guided exercises"
            ])
        elif overall_score < 0.7:
            recommendations.extend([
                "Mix theoretical and practical content",
                "Try project-based learning",
                "Join study groups or communities"
            ])
        else:
            recommendations.extend([
                "Challenge yourself with advanced topics",
                "Consider teaching or mentoring others",
                "Explore specialized areas of interest"
            ])
        
        return recommendations

    async def _generate_personalized_recommendations(
        self, 
        user_id: str, 
        selected_categories: List[Dict[str, Any]], 
        answers: List[Dict[str, Any]]
    ) -> List[RecommendationResponse]:
        """Generate personalized learning path recommendations"""
        recommendations = []
        
        for category_selection in selected_categories:
            category = category_selection.get('categories', {})
            category_id = category.get('category_id', category_selection.get('category_id'))
            category_name = category.get('name', 'Unknown Category')
            
            # Calculate confidence based on user's answers in this category
            category_answers = [a for a in answers if a.get('category_id') == category_id]
            confidence = self._calculate_category_confidence(category_answers)
            
            # Estimate time based on complexity
            estimated_time = self._estimate_learning_time(category_answers, confidence)
            
            recommendation = RecommendationResponse(
                category_id=category_id,
                category_name=category_name,
                confidence_score=confidence,
                reason=f"Based on your responses and interest in {category_name}",
                estimated_time=estimated_time
            )
            recommendations.append(recommendation)
        
        return recommendations

    def _calculate_category_confidence(self, category_answers: List[Dict[str, Any]]) -> float:
        """Calculate confidence score for a specific category"""
        if not category_answers:
            return 0.8  # Default confidence for new categories
        
        # Simple confidence calculation based on answer completeness
        complete_answers = sum(1 for a in category_answers if a.get('answer_text') or a.get('option_id'))
        total_answers = len(category_answers)
        
        return min(1.0, complete_answers / max(total_answers, 1) + 0.2)

    def _estimate_learning_time(self, category_answers: List[Dict[str, Any]], confidence: float) -> int:
        """Estimate learning time in minutes for a category"""
        base_time = 180  # 3 hours base time
        
        # Adjust based on confidence and complexity
        if confidence > 0.8:
            return int(base_time * 0.7)  # Faster for confident learners
        elif confidence < 0.5:
            return int(base_time * 1.3)  # More time for beginners
        
        return base_time

    async def _create_initial_learning_paths(
        self, 
        user_id: str, 
        selected_categories: List[Dict[str, Any]], 
        analysis: ProgressAnalysis
    ) -> bool:
        """Create initial learning paths and progress tracking for the user"""
        try:
            for category_selection in selected_categories:
                category_id = category_selection.get('category_id')
                if not category_id:
                    continue
                
                # Fetch available paths for this category
                paths = await supabase_client.fetch_paths_by_category(category_id)
                
                if paths:
                    # Create progress entry for the first available path
                    path = paths[0]  # Start with the first path
                    
                    progress_data = {
                        "current_task_id": None,
                        "progress_percentage": 0,
                        "completion_status": "not_started"
                    }
                    
                    await supabase_client.create_user_progress(
                        user_id, 
                        path['path_id'], 
                        progress_data
                    )
            
            return True
        except Exception as e:
            print(f"Error creating learning paths: {e}")
            return False

    def get_recommendations(
        self, 
        user_id: int, 
        learning_goals: List[str] = None,
        skill_level: str = "beginner"
    ) -> List[RecommendationResponse]:
        """Generate ML-powered learning recommendations"""
        # Placeholder recommendation logic
        # In a real implementation, this would use user history, performance data, etc.
        
        recommendations = [
            RecommendationResponse(
                category_id=1,
                category_name="Python Fundamentals",
                confidence_score=0.85,
                reason="Based on your current progress and learning goals",
                estimated_time=120
            ),
            RecommendationResponse(
                category_id=2,
                category_name="Data Structures",
                confidence_score=0.72,
                reason="Natural progression from your current skill level",
                estimated_time=180
            )
        ]
        
        return recommendations

    def analyze_progress(self, user_id: int, user_answers: List[Dict[str, Any]]) -> ProgressAnalysis:
        """Analyze user's learning progress using ML"""
        # Placeholder analysis logic
        # In a real implementation, this would analyze answer patterns, time spent, etc.
        
        # Calculate dummy metrics
        total_answers = len(user_answers) if user_answers else 0
        correct_answers = sum(1 for answer in (user_answers or []) if answer.get('is_correct', False))
        overall_score = (correct_answers / total_answers) if total_answers > 0 else 0.0
        
        analysis = ProgressAnalysis(
            user_id=user_id,
            overall_score=overall_score,
            strengths=["Problem solving", "Logical thinking"],
            weaknesses=["Algorithm optimization", "Complex data structures"],
            recommendations=[
                "Focus on algorithm efficiency",
                "Practice more complex problems",
                "Review data structure implementations"
            ],
            learning_velocity=0.75,
            completion_prediction=14
        )
        
        return analysis

    def get_similar_content(self, content_embeddings: List[float], threshold: float = 0.7) -> List[int]:
        """Find similar content based on embeddings"""
        # Placeholder similarity search
        # In a real implementation, this would use a vector database like Pinecone or Weaviate
        return []

    def predict_difficulty(self, question_text: str) -> str:
        """Predict question difficulty using ML"""
        # Placeholder difficulty prediction
        # In a real implementation, this would use a trained model
        embeddings = self.generate_embeddings(question_text)
        
        # Simple heuristic based on text length (placeholder)
        if len(question_text) < 50:
            return "easy"
        elif len(question_text) < 150:
            return "medium"
        else:
            return "hard"
