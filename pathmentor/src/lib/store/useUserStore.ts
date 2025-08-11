import { create } from 'zustand';

type LearningType = 'visual' | 'audio' | 'reading';
type SubscriptionStatus = 'free' | 'basic' | 'premium';

interface UserPreferences {
    studyTime: number; // minutes
    breakFrequency: number; // minutes
    learningMode: LearningType;
}

interface UserState {
    name: string;
    learningType: LearningType;
    subscriptionStatus: SubscriptionStatus;
    preferences: UserPreferences;
    setName: (name: string) => void;
    setLearningType: (type: LearningType) => void;
    setSubscriptionStatus: (status: SubscriptionStatus) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

export const useUserStore = create<UserState>((set: any) => ({
    name: 'John Doe',
    learningType: 'visual',
    subscriptionStatus: 'basic',
    preferences: {
        studyTime: 25,
        breakFrequency: 5,
        learningMode: 'visual',
    },
    setName: (name: string) => set({ name }),
    setLearningType: (learningType: LearningType) => set({ learningType }),
    setSubscriptionStatus: (subscriptionStatus: SubscriptionStatus) => set({ subscriptionStatus }),
    updatePreferences: (preferences: Partial<UserPreferences>) =>
        set((state: UserState) => ({
            preferences: { ...state.preferences, ...preferences },
        })),
}));
