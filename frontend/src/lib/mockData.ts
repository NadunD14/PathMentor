export interface AITip {
    id: string;
    message: string;
    type: 'tip' | 'motivation' | 'reminder' | 'achievement';
}

export const mockAITips: AITip[] = [
    {
        id: '1',
        message: 'I noticed you had focus issues last time. Try the Pomodoro technique with 25-minute focused sessions and 5-minute breaks.',
        type: 'tip',
    },
    {
        id: '2',
        message: 'Great job this week! You completed 3 lessons and spent 4 hours learning.',
        type: 'motivation',
    },
    {
        id: '3',
        message: 'You seem to learn best with visual content. I\'ve prioritized video tutorials in your upcoming recommendations.',
        type: 'tip',
    },
    {
        id: '4',
        message: 'Don\'t forget about your Web Development assignment due tomorrow!',
        type: 'reminder',
    },
    {
        id: '5',
        message: 'Congratulations! You\'ve earned the "Week Streak" badge for consistent learning.',
        type: 'achievement',
    },
];

export interface AIConversation {
    id: string;
    messages: {
        id: string;
        content: string;
        sender: 'user' | 'ai';
        timestamp: string;
    }[];
}

export const mockConversationHistory: AIConversation[] = [
    {
        id: '1',
        messages: [
            {
                id: '1',
                content: 'I\'m struggling with the React hooks section. Can you help me?',
                sender: 'user',
                timestamp: '2025-08-10T14:30:00',
            },
            {
                id: '2',
                content: 'Of course! React hooks can be tricky. Let\'s break down useEffect first. This hook allows you to perform side effects in function components. Think of it as componentDidMount, componentDidUpdate, and componentWillUnmount combined.',
                sender: 'ai',
                timestamp: '2025-08-10T14:31:00',
            },
            {
                id: '3',
                content: 'What about managing state with useState?',
                sender: 'user',
                timestamp: '2025-08-10T14:32:00',
            },
            {
                id: '4',
                content: 'useState is for adding state to function components. It returns a pair: the current state value and a function to update it. Try practicing with a simple counter: const [count, setCount] = useState(0)',
                sender: 'ai',
                timestamp: '2025-08-10T14:33:00',
            },
        ],
    },
];

export interface LearningRecommendation {
    id: string;
    title: string;
    category: string;
    description: string;
    estimatedTime: number; // minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const mockRecommendations: LearningRecommendation[] = [
    {
        id: '1',
        title: 'Advanced React Patterns',
        category: 'Web Development',
        description: 'Learn advanced design patterns in React to build scalable and maintainable applications.',
        estimatedTime: 120,
        difficulty: 'advanced',
    },
    {
        id: '2',
        title: 'Data Visualization with D3.js',
        category: 'Data Science',
        description: 'Create interactive data visualizations for the web using D3.js.',
        estimatedTime: 90,
        difficulty: 'intermediate',
    },
    {
        id: '3',
        title: 'Introduction to TensorFlow',
        category: 'Machine Learning',
        description: 'Get started with TensorFlow for machine learning and neural networks.',
        estimatedTime: 60,
        difficulty: 'beginner',
    },
];
