import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler


class ProgressAnalyzer:
    """ML-powered learning progress analysis"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.progress_model = LinearRegression()
        self.is_trained = False
    
    def analyze_learning_patterns(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user's learning patterns and predict performance"""
        
        # Extract features from user data
        features = self._extract_features(user_data)
        
        # Calculate learning metrics
        metrics = {
            'learning_velocity': self._calculate_learning_velocity(user_data),
            'consistency_score': self._calculate_consistency(user_data),
            'difficulty_progression': self._analyze_difficulty_progression(user_data),
            'strengths': self._identify_strengths(user_data),
            'weaknesses': self._identify_weaknesses(user_data),
            'predicted_performance': self._predict_performance(features)
        }
        
        return metrics
    
    def _extract_features(self, user_data: Dict[str, Any]) -> np.ndarray:
        """Extract numerical features from user data"""
        answers = user_data.get('answers', [])
        
        if not answers:
            return np.array([0, 0, 0, 0, 0]).reshape(1, -1)
        
        # Calculate feature metrics
        total_answers = len(answers)
        correct_answers = sum(1 for a in answers if a.get('is_correct', False))
        accuracy = correct_answers / total_answers if total_answers > 0 else 0
        
        # Time-based features
        avg_response_time = np.mean([a.get('response_time', 60) for a in answers])
        
        # Difficulty distribution
        easy_count = sum(1 for a in answers if a.get('difficulty', 'medium') == 'easy')
        medium_count = sum(1 for a in answers if a.get('difficulty', 'medium') == 'medium')
        hard_count = sum(1 for a in answers if a.get('difficulty', 'medium') == 'hard')
        
        features = np.array([
            accuracy,
            avg_response_time,
            easy_count / total_answers,
            medium_count / total_answers,
            hard_count / total_answers
        ]).reshape(1, -1)
        
        return features
    
    def _calculate_learning_velocity(self, user_data: Dict[str, Any]) -> float:
        """Calculate how quickly the user is learning"""
        answers = user_data.get('answers', [])
        
        if len(answers) < 2:
            return 0.0
        
        # Sort by timestamp
        sorted_answers = sorted(answers, key=lambda x: x.get('timestamp', datetime.now()))
        
        # Calculate improvement over time
        window_size = min(10, len(sorted_answers) // 2)
        recent_accuracy = np.mean([
            1 if a.get('is_correct', False) else 0 
            for a in sorted_answers[-window_size:]
        ])
        early_accuracy = np.mean([
            1 if a.get('is_correct', False) else 0 
            for a in sorted_answers[:window_size]
        ])
        
        return max(0, recent_accuracy - early_accuracy)
    
    def _calculate_consistency(self, user_data: Dict[str, Any]) -> float:
        """Calculate learning consistency score"""
        answers = user_data.get('answers', [])
        
        if len(answers) < 5:
            return 0.5  # Neutral score for insufficient data
        
        # Group answers by day and calculate daily accuracy
        daily_scores = {}
        for answer in answers:
            date = answer.get('timestamp', datetime.now()).date()
            if date not in daily_scores:
                daily_scores[date] = []
            daily_scores[date].append(1 if answer.get('is_correct', False) else 0)
        
        # Calculate variance in daily performance
        daily_averages = [np.mean(scores) for scores in daily_scores.values()]
        consistency = 1 - np.std(daily_averages)  # Lower std = higher consistency
        
        return max(0, min(1, consistency))
    
    def _analyze_difficulty_progression(self, user_data: Dict[str, Any]) -> Dict[str, float]:
        """Analyze performance across different difficulty levels"""
        answers = user_data.get('answers', [])
        
        difficulty_performance = {
            'easy': {'correct': 0, 'total': 0},
            'medium': {'correct': 0, 'total': 0},
            'hard': {'correct': 0, 'total': 0}
        }
        
        for answer in answers:
            difficulty = answer.get('difficulty', 'medium')
            if difficulty in difficulty_performance:
                difficulty_performance[difficulty]['total'] += 1
                if answer.get('is_correct', False):
                    difficulty_performance[difficulty]['correct'] += 1
        
        # Calculate accuracy for each difficulty
        progression = {}
        for difficulty, stats in difficulty_performance.items():
            if stats['total'] > 0:
                progression[difficulty] = stats['correct'] / stats['total']
            else:
                progression[difficulty] = 0.0
        
        return progression
    
    def _identify_strengths(self, user_data: Dict[str, Any]) -> List[str]:
        """Identify user's learning strengths"""
        answers = user_data.get('answers', [])
        
        # Group by category and calculate performance
        category_performance = {}
        for answer in answers:
            category = answer.get('category', 'General')
            if category not in category_performance:
                category_performance[category] = []
            category_performance[category].append(answer.get('is_correct', False))
        
        # Find categories with high performance (>70% accuracy)
        strengths = []
        for category, results in category_performance.items():
            if len(results) >= 3:  # Need at least 3 answers to be confident
                accuracy = np.mean(results)
                if accuracy >= 0.7:
                    strengths.append(category)
        
        return strengths
    
    def _identify_weaknesses(self, user_data: Dict[str, Any]) -> List[str]:
        """Identify user's learning weaknesses"""
        answers = user_data.get('answers', [])
        
        # Group by category and calculate performance
        category_performance = {}
        for answer in answers:
            category = answer.get('category', 'General')
            if category not in category_performance:
                category_performance[category] = []
            category_performance[category].append(answer.get('is_correct', False))
        
        # Find categories with low performance (<50% accuracy)
        weaknesses = []
        for category, results in category_performance.items():
            if len(results) >= 3:  # Need at least 3 answers to be confident
                accuracy = np.mean(results)
                if accuracy < 0.5:
                    weaknesses.append(category)
        
        return weaknesses
    
    def _predict_performance(self, features: np.ndarray) -> float:
        """Predict future performance based on current patterns"""
        # Simple heuristic prediction (in production, use trained ML model)
        if features.shape[1] >= 1:
            current_accuracy = features[0][0]
            # Predict slight improvement over time
            predicted = min(1.0, current_accuracy + 0.1)
            return float(predicted)
        
        return 0.5  # Neutral prediction
