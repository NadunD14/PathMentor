from typing import Optional, List, Dict, Any
from datetime import datetime
import numpy as np
from sqlalchemy.orm import Session
from app.schemas.learning import (
    UserLearningProfile, UserLearningProfileCreate, UserLearningProfileUpdate,
    BaseActivityResult, LearningType, ActivityType, LearningTypeScores,
    LearningTypePrediction, PersonalizedRecommendations, ContentRecommendation
)

class LearningService:
    """Service for managing learning type assessment and ML operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_user_profile(self, profile_data: UserLearningProfileCreate) -> UserLearningProfile:
        """Create a new user learning profile."""
        profile = UserLearningProfile(
            user_id=profile_data.user_id,
            primary_learning_type=LearningType.UNDETERMINED,
            learning_type_scores=LearningTypeScores(),
            confidence=0.0,
            activities_completed=[],
            total_activities=4,
            last_updated=datetime.utcnow(),
            assessment_complete=False
        )
        
        # In a real implementation, save to database
        # db_profile = models.UserLearningProfile(**profile.dict())
        # self.db.add(db_profile)
        # self.db.commit()
        # self.db.refresh(db_profile)
        
        return profile
    
    def get_user_profile(self, user_id: str) -> Optional[UserLearningProfile]:
        """Get user learning profile by user ID."""
        # In a real implementation, query from database
        # return self.db.query(models.UserLearningProfile).filter(
        #     models.UserLearningProfile.user_id == user_id
        # ).first()
        
        # Placeholder return
        return None
    
    def update_user_profile(self, user_id: str, update_data: UserLearningProfileUpdate) -> Optional[UserLearningProfile]:
        """Update user learning profile."""
        # In a real implementation, update database record
        # profile = self.get_user_profile(user_id)
        # if profile:
        #     for field, value in update_data.dict(exclude_unset=True).items():
        #         setattr(profile, field, value)
        #     profile.last_updated = datetime.utcnow()
        #     self.db.commit()
        #     self.db.refresh(profile)
        #     return profile
        
        # Placeholder return
        return None
    
    def save_activity_result(self, result: BaseActivityResult) -> bool:
        """Save activity result to database."""
        try:
            # In a real implementation, save to database
            # db_result = models.ActivityResult(**result.dict())
            # self.db.add(db_result)
            # self.db.commit()
            
            # Update user learning scores based on activity result
            self._update_learning_scores(result)
            
            return True
        except Exception as e:
            print(f"Error saving activity result: {e}")
            return False
    
    def _update_learning_scores(self, result: BaseActivityResult):
        """Update user learning type scores based on activity result."""
        user_profile = self.get_user_profile(result.user_id)
        if not user_profile:
            return
        
        # Calculate score updates based on activity type and performance
        score_updates = self._calculate_score_updates(result)
        
        # Update scores
        current_scores = user_profile.learning_type_scores
        for learning_type, score_delta in score_updates.items():
            current_value = getattr(current_scores, learning_type)
            setattr(current_scores, learning_type, current_value + score_delta)
        
        # Check if assessment is complete
        if len(user_profile.activities_completed) == 4:
            user_profile.primary_learning_type = self._determine_primary_learning_type(current_scores)
            user_profile.confidence = self._calculate_confidence(current_scores)
            user_profile.assessment_complete = True
        
        # Update database
        self.update_user_profile(result.user_id, UserLearningProfileUpdate(
            learning_type_scores=current_scores,
            primary_learning_type=user_profile.primary_learning_type,
            confidence=user_profile.confidence,
            assessment_complete=user_profile.assessment_complete
        ))
    
    def _calculate_score_updates(self, result: BaseActivityResult) -> Dict[str, float]:
        """Calculate learning type score updates based on activity performance."""
        updates = {"visual": 0, "auditory": 0, "kinesthetic": 0, "reading_writing": 0}
        
        if result.activity_type == ActivityType.MEMORY_CHALLENGE:
            # Strong performance in memory challenge indicates visual learning
            from app.schemas.learning import MemoryChallengeResult
            memory_result = MemoryChallengeResult(**result.dict())
            updates["visual"] = (memory_result.recall_accuracy / 100) * 25
            
        elif result.activity_type == ActivityType.PROBLEM_SOLVING:
            # High interaction and successful completion indicates kinesthetic learning
            from app.schemas.learning import ProblemSolvingResult
            problem_result = ProblemSolvingResult(**result.dict())
            interaction_score = min(1.0, problem_result.interaction_count / 50)
            updates["kinesthetic"] = interaction_score * 25
            
        elif result.activity_type == ActivityType.AUDIO_VISUAL:
            # Audio focus ratio indicates auditory vs visual preference
            from app.schemas.learning import AudioVisualResult
            av_result = AudioVisualResult(**result.dict())
            updates["auditory"] = av_result.audio_focus_ratio * 25
            updates["visual"] = (1 - av_result.audio_focus_ratio) * 15
            
        elif result.activity_type == ActivityType.READING_WRITING:
            # Strong performance indicates reading/writing learning preference
            from app.schemas.learning import ReadingWritingResult
            rw_result = ReadingWritingResult(**result.dict())
            updates["reading_writing"] = (rw_result.response_accuracy / 100) * 25
        
        return updates
    
    def _determine_primary_learning_type(self, scores: LearningTypeScores) -> LearningType:
        """Determine primary learning type from scores."""
        score_dict = {
            LearningType.VISUAL: scores.visual,
            LearningType.AUDITORY: scores.auditory,
            LearningType.KINESTHETIC: scores.kinesthetic,
            LearningType.READING_WRITING: scores.reading_writing
        }
        
        return max(score_dict, key=score_dict.get)
    
    def _calculate_confidence(self, scores: LearningTypeScores) -> float:
        """Calculate confidence in learning type classification."""
        score_values = [scores.visual, scores.auditory, scores.kinesthetic, scores.reading_writing]
        total = sum(score_values)
        
        if total == 0:
            return 0.0
        
        max_score = max(score_values)
        second_max = sorted(score_values, reverse=True)[1]
        
        # Confidence is higher when there's a clear winner
        confidence = min(1.0, (max_score - second_max) / total)
        return confidence
    
    def predict_learning_type(self, behavior_data: Dict[str, Any]) -> LearningTypePrediction:
        """Use ML model to predict learning type (placeholder implementation)."""
        # This would use a trained ML model in production
        # For now, return a simple prediction based on activity performance
        
        scores = {
            LearningType.VISUAL: np.random.uniform(0.1, 0.9),
            LearningType.AUDITORY: np.random.uniform(0.1, 0.9),
            LearningType.KINESTHETIC: np.random.uniform(0.1, 0.9),
            LearningType.READING_WRITING: np.random.uniform(0.1, 0.9)
        }
        
        predicted_type = max(scores, key=scores.get)
        confidence = scores[predicted_type]
        
        return LearningTypePrediction(
            predicted_type=predicted_type,
            confidence=confidence,
            scores={k.value: v for k, v in scores.items()}
        )
    
    def get_personalized_recommendations(
        self, 
        user_id: str, 
        learning_type: LearningType,
        current_path: Optional[str] = None
    ) -> PersonalizedRecommendations:
        """Get personalized content recommendations based on learning type."""
        
        # Sample recommendations based on learning type
        recommendations_by_type = {
            LearningType.VISUAL: [
                ContentRecommendation(
                    id="vis_1",
                    title="Interactive Data Visualization Tutorial",
                    type="interactive",
                    difficulty=3,
                    estimated_time=15,
                    learning_type_match=0.95
                ),
                ContentRecommendation(
                    id="vis_2",
                    title="Mind Mapping Techniques Video",
                    type="video",
                    difficulty=2,
                    estimated_time=12,
                    learning_type_match=0.90
                )
            ],
            LearningType.AUDITORY: [
                ContentRecommendation(
                    id="aud_1",
                    title="Learning Strategies Podcast",
                    type="audio",
                    difficulty=2,
                    estimated_time=20,
                    learning_type_match=0.95
                ),
                ContentRecommendation(
                    id="aud_2",
                    title="Study Music for Focus",
                    type="audio",
                    difficulty=1,
                    estimated_time=60,
                    learning_type_match=0.85
                )
            ],
            LearningType.KINESTHETIC: [
                ContentRecommendation(
                    id="kin_1",
                    title="Hands-on Programming Exercise",
                    type="interactive",
                    difficulty=4,
                    estimated_time=30,
                    learning_type_match=0.95
                ),
                ContentRecommendation(
                    id="kin_2",
                    title="Virtual Lab Simulation",
                    type="interactive",
                    difficulty=3,
                    estimated_time=25,
                    learning_type_match=0.90
                )
            ],
            LearningType.READING_WRITING: [
                ContentRecommendation(
                    id="rw_1",
                    title="Comprehensive Study Guide",
                    type="article",
                    difficulty=3,
                    estimated_time=35,
                    learning_type_match=0.95
                ),
                ContentRecommendation(
                    id="rw_2",
                    title="Note-Taking Strategies Article",
                    type="article",
                    difficulty=2,
                    estimated_time=15,
                    learning_type_match=0.90
                )
            ]
        }
        
        recommendations = recommendations_by_type.get(learning_type, [])
        
        return PersonalizedRecommendations(recommendations=recommendations)
    
    def track_user_behavior(self, tracking_data: Dict[str, Any]) -> bool:
        """Track user behavior for ML model improvement."""
        try:
            # In a real implementation, save to database for ML training
            # db_tracking = models.UserBehaviorTracking(**tracking_data)
            # self.db.add(db_tracking)
            # self.db.commit()
            
            return True
        except Exception as e:
            print(f"Error tracking user behavior: {e}")
            return False
    
    def get_learning_type_description(self, learning_type: LearningType) -> Dict[str, Any]:
        """Get description and characteristics of a learning type."""
        descriptions = {
            LearningType.VISUAL: {
                "title": "Visual Learner",
                "description": "You learn best through seeing and observing. Visual aids, diagrams, and imagery help you understand and remember information.",
                "characteristics": [
                    "Prefers charts, diagrams, and visual aids",
                    "Thinks in pictures and mental images",
                    "Notices visual details and patterns",
                    "Benefits from color-coding and highlighting",
                    "Remembers faces better than names"
                ],
                "strategies": [
                    "Use mind maps and flowcharts",
                    "Watch educational videos and tutorials",
                    "Create visual study notes with diagrams",
                    "Use color-coding for organization",
                    "Practice with interactive visual tools"
                ]
            },
            LearningType.AUDITORY: {
                "title": "Auditory Learner",
                "description": "You learn best through listening and speaking. Discussions, lectures, and audio content are most effective for you.",
                "characteristics": [
                    "Prefers lectures and discussions",
                    "Learns through listening and talking",
                    "Remembers spoken instructions well",
                    "Benefits from reading aloud",
                    "Enjoys music and sound patterns"
                ],
                "strategies": [
                    "Listen to podcasts and audio books",
                    "Participate in study groups and discussions",
                    "Read material aloud",
                    "Use mnemonic devices and rhymes",
                    "Record and replay lessons"
                ]
            },
            LearningType.KINESTHETIC: {
                "title": "Kinesthetic Learner",
                "description": "You learn best through hands-on activities and physical engagement. Movement and touch help you understand concepts.",
                "characteristics": [
                    "Prefers hands-on activities",
                    "Learns through movement and touch",
                    "Needs frequent breaks and activity",
                    "Benefits from practical application",
                    "Remembers through muscle memory"
                ],
                "strategies": [
                    "Use interactive simulations and tools",
                    "Take frequent study breaks with movement",
                    "Practice with real-world applications",
                    "Use manipulatives and models",
                    "Engage in project-based learning"
                ]
            },
            LearningType.READING_WRITING: {
                "title": "Reading/Writing Learner",
                "description": "You learn best through reading and writing activities. Text-based information and note-taking are your preferred methods.",
                "characteristics": [
                    "Prefers reading and writing",
                    "Learns through text-based information",
                    "Enjoys taking detailed notes",
                    "Benefits from lists and written instructions",
                    "Likes to research and read extensively"
                ],
                "strategies": [
                    "Take comprehensive written notes",
                    "Read extensively on topics",
                    "Write summaries and outlines",
                    "Use written practice exercises",
                    "Create glossaries and word lists"
                ]
            }
        }
        
        return descriptions.get(learning_type, {})
