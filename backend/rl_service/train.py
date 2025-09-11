"""
Training script for RL model.
"""

import logging
import numpy as np
from typing import List, Dict, Any
import json
import os
from datetime import datetime

from .model import RLModel, UserState, PlatformAction

logger = logging.getLogger(__name__)


class RLTrainer:
    """
    Trainer for the RL platform recommendation model.
    """
    
    def __init__(self, model: RLModel = None):
        """Initialize trainer."""
        self.model = model or RLModel()
        self.training_data = []
        self.validation_data = []
        
        logger.info("RL Trainer initialized")
    
    def collect_training_data(self, feedback_data: List[Dict[str, Any]]):
        """
        Collect and process training data from user feedback.
        
        Args:
            feedback_data: List of feedback records from database
        """
        try:
            logger.info(f"Processing {len(feedback_data)} feedback records")
            
            for feedback in feedback_data:
                # Convert feedback to training example
                training_example = self._process_feedback_record(feedback)
                if training_example:
                    self.training_data.append(training_example)
            
            logger.info(f"Collected {len(self.training_data)} training examples")
            
        except Exception as e:
            logger.error(f"Error collecting training data: {e}")
    
    def train_model(self, epochs: int = 1000, batch_size: int = 32):
        """
        Train the RL model using collected data.
        
        Args:
            epochs: Number of training epochs
            batch_size: Batch size for training
        """
        try:
            logger.info(f"Starting training for {epochs} epochs")
            
            if not self.training_data:
                logger.warning("No training data available")
                return
            
            for epoch in range(epochs):
                # Sample batch
                batch_indices = np.random.choice(
                    len(self.training_data), 
                    min(batch_size, len(self.training_data)), 
                    replace=False
                )
                
                epoch_loss = 0.0
                
                for idx in batch_indices:
                    example = self.training_data[idx]
                    
                    # Update model with training example
                    self.model.update(
                        state=example['state'],
                        action=example['action'],
                        reward=example['reward'],
                        next_state=example['next_state']
                    )
                    
                    epoch_loss += abs(example['reward'])  # Simple loss proxy
                
                # Log progress
                if epoch % 100 == 0:
                    avg_loss = epoch_loss / len(batch_indices)
                    logger.info(f"Epoch {epoch}, Average Loss: {avg_loss:.4f}, Epsilon: {self.model.epsilon:.4f}")
            
            logger.info("Training completed")
            
        except Exception as e:
            logger.error(f"Error during training: {e}")
    
    def evaluate_model(self) -> Dict[str, float]:
        """
        Evaluate model performance on validation data.
        
        Returns:
            Dictionary of evaluation metrics
        """
        try:
            if not self.validation_data:
                logger.warning("No validation data available")
                return {}
            
            correct_predictions = 0
            total_predictions = len(self.validation_data)
            
            for example in self.validation_data:
                # Get model prediction
                predictions = self.model.predict(example['state'])
                
                # Check if correct action is in top 3 predictions
                top_actions = [p.platform_id for p in predictions[:3]]
                if example['action'] in top_actions:
                    correct_predictions += 1
            
            accuracy = correct_predictions / total_predictions
            
            metrics = {
                'accuracy_top3': accuracy,
                'total_examples': total_predictions,
                'model_epsilon': self.model.epsilon
            }
            
            logger.info(f"Model evaluation: {metrics}")
            return metrics
            
        except Exception as e:
            logger.error(f"Error during evaluation: {e}")
            return {}
    
    def save_training_session(self, filepath: str):
        """Save training session data."""
        try:
            session_data = {
                'timestamp': datetime.now().isoformat(),
                'training_examples': len(self.training_data),
                'validation_examples': len(self.validation_data),
                'model_state': {
                    'epsilon': self.model.epsilon,
                    'state_size': self.model.state_size,
                    'action_size': self.model.action_size
                }
            }
            
            with open(filepath, 'w') as f:
                json.dump(session_data, f, indent=2)
            
            logger.info(f"Training session saved to {filepath}")
            
        except Exception as e:
            logger.error(f"Error saving training session: {e}")
    
    def _process_feedback_record(self, feedback: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a single feedback record into a training example.
        
        Args:
            feedback: Feedback record from database
            
        Returns:
            Training example dictionary or None if invalid
        """
        try:
            # Extract user characteristics (would come from user profile)
            # For now, use dummy values - in production, join with user data
            user_state = UserState(
                experience_level=1,  # Would come from user profile
                learning_style=0,    # Would come from user profile
                goal_category=0,     # Would come from user profile
                past_preferences=[]  # Would come from user history
            )
            
            # Create state vector
            state = self.model.encode_state(user_state, "generic_topic")
            
            # Map platform to action ID
            platform_to_action = {
                "youtube": 0,
                "udemy": 1,
                "coursera": 2,
                "reddit": 3,
                "github": 4,
                "medium": 5
            }
            
            # Extract action from resource platform
            resource_platform = feedback.get('resource_platform', 'youtube')
            action = platform_to_action.get(resource_platform, 0)
            
            # Calculate reward from feedback
            reward = self._calculate_reward(feedback)
            
            # Create next state (simplified - same as current state for now)
            next_state = state.copy()
            
            return {
                'state': state,
                'action': action,
                'reward': reward,
                'next_state': next_state,
                'feedback_id': feedback.get('id')
            }
            
        except Exception as e:
            logger.warning(f"Error processing feedback record: {e}")
            return None
    
    def _calculate_reward(self, feedback: Dict[str, Any]) -> float:
        """
        Calculate reward from user feedback.
        
        Args:
            feedback: Feedback record
            
        Returns:
            Reward value between -1 and 1
        """
        interaction_type = feedback.get('interaction_type', 'neutral')
        rating = feedback.get('rating', 3)
        
        # Base reward from interaction type
        interaction_rewards = {
            'completed': 1.0,
            'liked': 0.8,
            'bookmarked': 0.6,
            'started': 0.2,
            'skipped': -0.3,
            'disliked': -0.8
        }
        
        base_reward = interaction_rewards.get(interaction_type, 0.0)
        
        # Adjust based on rating if available
        if rating is not None:
            rating_adjustment = (rating - 3) / 2.0  # Scale to -1 to 1
            base_reward = (base_reward + rating_adjustment) / 2.0
        
        return np.clip(base_reward, -1.0, 1.0)


def train_from_database():
    """
    Main training function that loads data from database and trains model.
    """
    try:
        logger.info("Starting RL model training from database")
        
        # Initialize trainer
        trainer = RLTrainer()
        
        # Load existing model if available
        model_path = os.getenv("RL_MODEL_PATH", "models/rl_model.json")
        if os.path.exists(model_path):
            trainer.model.load_model(model_path)
            logger.info("Loaded existing model")
        
        # In production, this would fetch actual feedback data from database
        # For now, use dummy data
        dummy_feedback = [
            {
                'id': 'feedback_1',
                'interaction_type': 'completed',
                'rating': 5,
                'resource_platform': 'youtube'
            },
            {
                'id': 'feedback_2',
                'interaction_type': 'skipped',
                'rating': 2,
                'resource_platform': 'udemy'
            }
        ]
        
        # Collect training data
        trainer.collect_training_data(dummy_feedback)
        
        # Train model
        trainer.train_model(epochs=500)
        
        # Evaluate model
        metrics = trainer.evaluate_model()
        
        # Save updated model
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        trainer.model.save_model(model_path)
        
        # Save training session
        session_path = model_path.replace('.json', f'_session_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
        trainer.save_training_session(session_path)
        
        logger.info("Training completed successfully")
        
    except Exception as e:
        logger.error(f"Error in training: {e}")


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Run training
    train_from_database()
