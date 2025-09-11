"""
RL model definitions for platform recommendation.
"""

import numpy as np
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class UserState:
    """Represents the state of a user for RL model input."""
    experience_level: int  # 0-3 (beginner to expert)
    learning_style: int    # 0-4 (visual, auditory, kinesthetic, reading_writing, multimodal)
    goal_category: int     # 0-N (programming, design, business, etc.)
    past_preferences: List[int]  # Historical platform preferences


@dataclass
class PlatformAction:
    """Represents a platform recommendation action."""
    platform_id: int
    confidence: float


class RLModel:
    """
    Reinforcement Learning model for platform recommendations.
    
    This is a placeholder implementation. In production, this would be
    a more sophisticated model like DQN, Policy Gradient, or Actor-Critic.
    """
    
    def __init__(self, state_size: int = 10, action_size: int = 6):
        """
        Initialize RL model.
        
        Args:
            state_size: Size of the state vector
            action_size: Number of possible platform actions
        """
        self.state_size = state_size
        self.action_size = action_size
        self.q_table = np.random.rand(state_size, action_size)
        self.learning_rate = 0.1
        self.epsilon = 0.1
        self.epsilon_decay = 0.995
        self.epsilon_min = 0.01
        
        logger.info(f"RL Model initialized with state_size={state_size}, action_size={action_size}")
    
    def encode_state(self, user_state: UserState, topic: str) -> np.ndarray:
        """
        Encode user state and topic into a feature vector.
        
        Args:
            user_state: User's current state
            topic: Learning topic
            
        Returns:
            Encoded state vector
        """
        # Create feature vector from user characteristics
        features = [
            user_state.experience_level / 3.0,  # Normalize to 0-1
            user_state.learning_style / 4.0,    # Normalize to 0-1
            user_state.goal_category / 10.0,    # Normalize to 0-1
        ]
        
        # Add topic features (simplified - would use embeddings in production)
        topic_hash = hash(topic.lower()) % 1000
        features.extend([
            topic_hash / 1000.0,
            len(topic) / 50.0,  # Topic complexity proxy
        ])
        
        # Add historical preferences (padded/truncated to fixed size)
        pref_features = user_state.past_preferences[:5]  # Take last 5
        while len(pref_features) < 5:
            pref_features.append(0)  # Pad with zeros
        
        features.extend([p / 6.0 for p in pref_features])  # Normalize platform IDs
        
        return np.array(features[:self.state_size])  # Ensure correct size
    
    def predict(self, state: np.ndarray) -> List[PlatformAction]:
        """
        Predict platform recommendations for given state.
        
        Args:
            state: Encoded user state
            
        Returns:
            List of platform actions with confidence scores
        """
        try:
            # Get Q-values for all actions
            state_index = int(np.sum(state * 100) % self.state_size)  # Simple state discretization
            q_values = self.q_table[state_index]
            
            # Add exploration noise
            if np.random.rand() < self.epsilon:
                q_values += np.random.normal(0, 0.1, self.action_size)
            
            # Convert to platform actions
            actions = []
            platform_names = ["youtube", "udemy", "coursera", "reddit", "github", "medium"]
            
            # Sort by Q-value and create actions
            sorted_indices = np.argsort(q_values)[::-1]  # Descending order
            
            for i, platform_idx in enumerate(sorted_indices):
                if i < len(platform_names):
                    confidence = self._sigmoid(q_values[platform_idx])
                    action = PlatformAction(
                        platform_id=platform_idx,
                        confidence=confidence
                    )
                    actions.append(action)
            
            return actions
            
        except Exception as e:
            logger.error(f"Error in model prediction: {e}")
            return self._get_fallback_actions()
    
    def update(self, state: np.ndarray, action: int, reward: float, next_state: np.ndarray):
        """
        Update model based on user feedback.
        
        Args:
            state: Previous state
            action: Action taken (platform recommended)
            reward: Reward received (based on user feedback)
            next_state: New state after action
        """
        try:
            # Simple Q-learning update
            state_index = int(np.sum(state * 100) % self.state_size)
            next_state_index = int(np.sum(next_state * 100) % self.state_size)
            
            # Q-learning formula: Q(s,a) = Q(s,a) + α[r + γ*max(Q(s',a')) - Q(s,a)]
            gamma = 0.95  # Discount factor
            max_next_q = np.max(self.q_table[next_state_index])
            
            current_q = self.q_table[state_index, action]
            new_q = current_q + self.learning_rate * (reward + gamma * max_next_q - current_q)
            
            self.q_table[state_index, action] = new_q
            
            # Decay exploration rate
            if self.epsilon > self.epsilon_min:
                self.epsilon *= self.epsilon_decay
            
            logger.debug(f"Updated Q-value for state {state_index}, action {action}: {current_q} -> {new_q}")
            
        except Exception as e:
            logger.error(f"Error updating model: {e}")
    
    def save_model(self, filepath: str):
        """Save model state to file."""
        try:
            model_data = {
                'q_table': self.q_table.tolist(),
                'epsilon': self.epsilon,
                'state_size': self.state_size,
                'action_size': self.action_size
            }
            
            import json
            with open(filepath, 'w') as f:
                json.dump(model_data, f)
            
            logger.info(f"Model saved to {filepath}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def load_model(self, filepath: str):
        """Load model state from file."""
        try:
            import json
            with open(filepath, 'r') as f:
                model_data = json.load(f)
            
            self.q_table = np.array(model_data['q_table'])
            self.epsilon = model_data['epsilon']
            self.state_size = model_data['state_size']
            self.action_size = model_data['action_size']
            
            logger.info(f"Model loaded from {filepath}")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
    
    def _sigmoid(self, x: float) -> float:
        """Apply sigmoid function to convert Q-value to confidence."""
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))  # Prevent overflow
    
    def _get_fallback_actions(self) -> List[PlatformAction]:
        """Get fallback actions if prediction fails."""
        return [
            PlatformAction(platform_id=0, confidence=0.8),  # YouTube
            PlatformAction(platform_id=1, confidence=0.7),  # Udemy
            PlatformAction(platform_id=3, confidence=0.6),  # Reddit
        ]
