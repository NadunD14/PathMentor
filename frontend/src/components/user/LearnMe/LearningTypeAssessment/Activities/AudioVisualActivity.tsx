'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ActivityType, AudioVisualResult } from '@/lib/types/learningTypes';

interface AudioVisualActivityProps {
    userId: string;
    onComplete: (result: AudioVisualResult) => void;
    onBack: () => void;
}

interface Question {
    id: string;
    question: string;
    options: string[];
    correct: number;
    type: 'audio' | 'visual' | 'both';
}

const sampleQuestions: Question[] = [
    {
        id: 'q1',
        question: 'What is the primary benefit of active listening?',
        options: [
            'It helps you respond faster',
            'It improves understanding and retention',
            'It makes you appear more intelligent',
            'It reduces the need to take notes'
        ],
        correct: 1,
        type: 'audio'
    },
    {
        id: 'q2',
        question: 'Which learning strategy was mentioned as most effective for visual learners?',
        options: [
            'Reading aloud',
            'Group discussions',
            'Mind mapping and diagrams',
            'Listening to podcasts'
        ],
        correct: 2,
        type: 'visual'
    },
    {
        id: 'q3',
        question: 'What percentage of information is typically retained through visual learning?',
        options: ['30%', '50%', '65%', '80%'],
        correct: 2,
        type: 'both'
    },
    {
        id: 'q4',
        question: 'Which sound pattern was demonstrated in the audio example?',
        options: [
            'Crescendo (getting louder)',
            'Diminuendo (getting quieter)',
            'Staccato (short bursts)',
            'Legato (smooth and connected)'
        ],
        correct: 0,
        type: 'audio'
    }
];

export default function AudioVisualActivity({
    userId,
    onComplete,
    onBack
}: AudioVisualActivityProps) {
    const [phase, setPhase] = useState<'intro' | 'content1' | 'content2' | 'content3' | 'questions' | 'complete'>('intro');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [videoMuted, setVideoMuted] = useState(false);
    const [timeWatching, setTimeWatching] = useState(0);
    const [timeListening, setTimeListening] = useState(0);
    const [startTime] = useState(new Date());
    const [contentStartTime, setContentStartTime] = useState<number>(0);
    const [audioFocusEvents, setAudioFocusEvents] = useState<number>(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const startContentTracking = () => {
        setContentStartTime(Date.now());
        intervalRef.current = setInterval(() => {
            if (videoMuted) {
                setTimeListening(prev => prev + 1000);
            } else {
                setTimeWatching(prev => prev + 1000);
            }
        }, 1000);
    };

    const stopContentTracking = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const handleVideoToggle = () => {
        const newMuted = !videoMuted;
        setVideoMuted(newMuted);
        if (newMuted) {
            setAudioFocusEvents(prev => prev + 1);
        }
    };

    const handleAnswerSelect = (answerIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answerIndex;
        setAnswers(newAnswers);

        if (currentQuestion < sampleQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            completeActivity();
        }
    };

    const completeActivity = () => {
        stopContentTracking();
        const endTime = new Date();
        const correctAnswers = answers.filter((answer, index) =>
            answer === sampleQuestions[index].correct
        ).length;

        const totalTime = timeWatching + timeListening;
        const audioFocusRatio = totalTime > 0 ? timeListening / totalTime : 0;

        const result: AudioVisualResult = {
            activityId: `audio-visual-${Date.now()}`,
            activityType: ActivityType.AUDIO_VISUAL,
            userId,
            startTime,
            endTime,
            completionTime: endTime.getTime() - startTime.getTime(),
            timestamp: new Date(),
            audioPreference: audioFocusEvents > 2 ? 8 : audioFocusEvents > 0 ? 5 : 2,
            answerAccuracy: (correctAnswers / sampleQuestions.length) * 100,
            timeListening,
            timeViewing: timeWatching,
            videoMuted,
            audioFocusRatio
        };

        onComplete(result);
        setPhase('complete');
    };

    const renderIntro = () => (
        <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-3xl font-bold text-gray-900">Audio-Visual Learning Test</h2>
            <div className="max-w-2xl mx-auto space-y-4">
                <p className="text-lg text-gray-600">
                    Watch and listen to educational content, then answer questions about what you learned.
                    You can toggle between video and audio-only modes to see which works better for you.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">What we're testing:</h3>
                    <ul className="text-left text-blue-700 space-y-1">
                        <li>• How you prefer to consume multimedia content</li>
                        <li>• Whether you focus more on audio or visual elements</li>
                        <li>• Your retention of audio vs visual information</li>
                        <li>• Your natural learning preferences</li>
                    </ul>
                </div>
            </div>
            <button
                onClick={() => {
                    setPhase('content1');
                    startContentTracking();
                }}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
                Start Learning Session
            </button>
        </div>
    );

    const renderContent = () => {
        const contentData = {
            content1: {
                title: 'Introduction to Learning Styles',
                videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4', // Placeholder
                transcript: `Learning styles refer to the different ways people prefer to take in and process information. 
        The four main types are Visual, Auditory, Kinesthetic, and Reading/Writing learners. 
        Visual learners prefer charts, diagrams, and images. They think in pictures and benefit from seeing information presented graphically.`
            },
            content2: {
                title: 'Visual Learning Strategies',
                videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4', // Placeholder
                transcript: `Visual learners retain about 65% of information when it's presented visually, compared to only 10% when presented verbally alone. 
        Effective strategies include mind mapping, color-coding, flowcharts, and diagrams. These learners often say "I see what you mean" and prefer written instructions.`
            },
            content3: {
                title: 'Audio Learning Techniques',
                videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4', // Placeholder
                transcript: `Auditory learners process information best through listening and speaking. They benefit from discussions, lectures, and audio recordings. 
        These learners often repeat information aloud, enjoy music, and prefer verbal instructions. They typically have strong listening skills and remember conversations well.`
            }
        };

        const currentContent = contentData[phase as keyof typeof contentData];

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {currentContent.title}
                    </h3>
                    <p className="text-gray-600">
                        You can toggle between video and audio-only mode using the button below
                    </p>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 text-center">
                    {/* Simulated Video Player */}
                    <div className="bg-black rounded-lg mb-4 relative" style={{ height: '300px' }}>
                        {!videoMuted ? (
                            <div className="flex items-center justify-center h-full text-white">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">📺</div>
                                    <p>Video Content Playing</p>
                                    <p className="text-sm opacity-75">Visual learning content with diagrams and animations</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🔊</div>
                                    <p>Audio-Only Mode</p>
                                    <p className="text-sm opacity-75">Listening to narration and explanations</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleVideoToggle}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${videoMuted
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {videoMuted ? '📻 Audio Mode' : '📺 Video Mode'}
                    </button>
                </div>

                {/* Transcript */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Content Summary:</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {currentContent.transcript}
                    </p>
                </div>

                <div className="flex justify-between">
                    <div className="text-sm text-gray-600">
                        Time: {videoMuted ? 'Listening' : 'Watching'} • Focus Events: {audioFocusEvents}
                    </div>
                    <button
                        onClick={() => {
                            const nextPhases = ['content2', 'content3', 'questions'];
                            const currentIndex = ['content1', 'content2', 'content3'].indexOf(phase);
                            if (currentIndex < 2) {
                                setPhase(nextPhases[currentIndex] as typeof phase);
                            } else {
                                stopContentTracking();
                                setPhase('questions');
                            }
                        }}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {phase === 'content3' ? 'Continue to Questions' : 'Next Section'}
                    </button>
                </div>
            </div>
        );
    };

    const renderQuestions = () => {
        const question = sampleQuestions[currentQuestion];

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Question {currentQuestion + 1} of {sampleQuestions.length}
                    </h3>
                    <p className="text-gray-600">
                        Based on the content you just experienced
                    </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4">
                        {question.question}
                    </h4>

                    <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                className="w-full text-left p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <span className="font-medium text-gray-900">
                                    {String.fromCharCode(65 + index)}. {option}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                    Progress: {currentQuestion + 1} / {sampleQuestions.length}
                </div>
            </div>
        );
    };

    const renderComplete = () => {
        const correctAnswers = answers.filter((answer, index) =>
            answer === sampleQuestions[index].correct
        ).length;
        const accuracy = Math.round((correctAnswers / sampleQuestions.length) * 100);
        const totalTime = timeWatching + timeListening;
        const audioPreference = totalTime > 0 ? Math.round((timeListening / totalTime) * 100) : 0;

        return (
            <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900">Audio-Visual Test Complete!</h2>
                <div className="max-w-md mx-auto bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Your Results</h3>
                    <div className="space-y-2 text-green-800">
                        <p>Questions Correct: {correctAnswers} / {sampleQuestions.length} ({accuracy}%)</p>
                        <p>Audio Focus Preference: {audioPreference}%</p>
                        <p>Mode Switches: {audioFocusEvents}</p>
                        <p>Total Learning Time: {Math.round((totalTime) / 1000)}s</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    ← Back to Activities
                </button>
                <div className="text-sm text-gray-500">
                    Activity 3 of 4 • Audio-Visual Learning
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                {phase === 'intro' && renderIntro()}
                {(phase === 'content1' || phase === 'content2' || phase === 'content3') && renderContent()}
                {phase === 'questions' && renderQuestions()}
                {phase === 'complete' && renderComplete()}
            </div>
        </div>
    );
}
