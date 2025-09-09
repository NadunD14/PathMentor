'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ActivityType, MemoryChallengeResult } from '@/lib/types/learningTypes';

interface MemoryChallengeActivityProps {
    userId: string;
    onComplete: (result: MemoryChallengeResult) => void;
    onBack: () => void;
}

interface MemoryItem {
    id: string;
    type: 'shape' | 'color' | 'pattern';
    value: string;
    position: { x: number; y: number };
}

const shapes = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚫', '⚪'];
const patterns = ['▲', '●', '■', '♦', '★', '▼', '♠', '♣'];

export default function MemoryChallengeActivity({
    userId,
    onComplete,
    onBack
}: MemoryChallengeActivityProps) {
    const [phase, setPhase] = useState<'intro' | 'study' | 'test' | 'complete'>('intro');
    const [currentRound, setCurrentRound] = useState(1);
    const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
    const [userSelections, setUserSelections] = useState<string[]>([]);
    const [studyTime, setStudyTime] = useState(10);
    const [responseStartTime, setResponseStartTime] = useState<number>(0);
    const [results, setResults] = useState<{
        round: number;
        correct: number;
        total: number;
        responseTime: number;
        engagementScore: number;
    }[]>([]);
    const [startTime] = useState(new Date());

    const totalRounds = 3;

    const generateMemoryItems = useCallback((round: number) => {
        const itemCount = 4 + round; // 5, 6, 7 items for rounds 1, 2, 3
        const items: MemoryItem[] = [];

        for (let i = 0; i < itemCount; i++) {
            const types = ['shape', 'pattern'] as const;
            const type = types[Math.floor(Math.random() * types.length)];
            const values = type === 'shape' ? shapes : patterns;

            items.push({
                id: `item-${i}`,
                type,
                value: values[Math.floor(Math.random() * values.length)],
                position: {
                    x: Math.random() * 300 + 50,
                    y: Math.random() * 200 + 50
                }
            });
        }

        return items;
    }, []);

    const startStudyPhase = () => {
        const items = generateMemoryItems(currentRound);
        setMemoryItems(items);
        setPhase('study');
        setStudyTime(10);
    };

    const startTestPhase = () => {
        setPhase('test');
        setUserSelections([]);
        setResponseStartTime(Date.now());
    };

    const handleItemSelect = (itemValue: string) => {
        if (!userSelections.includes(itemValue)) {
            setUserSelections([...userSelections, itemValue]);
        }
    };

    const submitRound = () => {
        const responseTime = Date.now() - responseStartTime;
        const correctItems = memoryItems.map(item => item.value);
        const correctSelections = userSelections.filter(selection =>
            correctItems.includes(selection)
        );

        const roundResult = {
            round: currentRound,
            correct: correctSelections.length,
            total: memoryItems.length,
            responseTime,
            engagementScore: Math.min(10, (correctSelections.length / memoryItems.length) * 10)
        };

        setResults([...results, roundResult]);

        if (currentRound < totalRounds) {
            setCurrentRound(currentRound + 1);
            setPhase('intro');
        } else {
            completeActivity();
        }
    };

    const completeActivity = () => {
        const endTime = new Date();
        const totalCorrect = results.reduce((sum, r) => sum + r.correct, 0);
        const totalQuestions = results.reduce((sum, r) => sum + r.total, 0);
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        const avgEngagement = results.reduce((sum, r) => sum + r.engagementScore, 0) / results.length;

        const result: MemoryChallengeResult = {
            activityId: `memory-${Date.now()}`,
            activityType: ActivityType.MEMORY_CHALLENGE,
            userId,
            startTime,
            endTime,
            completionTime: endTime.getTime() - startTime.getTime(),
            timestamp: new Date(),
            recallAccuracy: (totalCorrect / totalQuestions) * 100,
            responseTime: avgResponseTime,
            engagementLevel: avgEngagement,
            correctAnswers: totalCorrect,
            totalQuestions,
            visualElementsRecalled: totalCorrect
        };

        onComplete(result);
        setPhase('complete');
    };

    // Study timer effect
    useEffect(() => {
        if (phase === 'study' && studyTime > 0) {
            const timer = setTimeout(() => setStudyTime(studyTime - 1), 1000);
            return () => clearTimeout(timer);
        } else if (phase === 'study' && studyTime === 0) {
            startTestPhase();
        }
    }, [phase, studyTime]);

    const renderIntro = () => (
        <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-3xl font-bold text-gray-900">Memory Challenge</h2>
            <div className="max-w-2xl mx-auto space-y-4">
                <p className="text-lg text-gray-600">
                    Test your visual memory! You'll see a pattern of shapes and symbols for 10 seconds,
                    then try to recall what you saw.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Round {currentRound} of {totalRounds}</h3>
                    <p className="text-blue-700">
                        This round will show {4 + currentRound} items. Study them carefully!
                    </p>
                </div>
            </div>
            <button
                onClick={startStudyPhase}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
                Start Round {currentRound}
            </button>
        </div>
    );

    const renderStudyPhase = () => (
        <div className="text-center space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Study These Items</h3>
                <div className="text-xl font-bold text-blue-600">
                    {studyTime}s remaining
                </div>
            </div>

            <div className="relative bg-gray-100 rounded-lg" style={{ height: '400px', width: '500px', margin: '0 auto' }}>
                {memoryItems.map((item) => (
                    <div
                        key={item.id}
                        className="absolute text-4xl"
                        style={{
                            left: `${item.position.x}px`,
                            top: `${item.position.y}px`,
                        }}
                    >
                        {item.value}
                    </div>
                ))}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${((10 - studyTime) / 10) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    const renderTestPhase = () => {
        const allOptions = [...shapes, ...patterns];

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        What did you see? (Select {memoryItems.length} items)
                    </h3>
                    <p className="text-gray-600">
                        Click on the items you remember seeing in the previous screen
                    </p>
                </div>

                <div className="grid grid-cols-8 gap-4 max-w-2xl mx-auto">
                    {allOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleItemSelect(option)}
                            className={`p-4 text-3xl rounded-lg border-2 transition-all ${userSelections.includes(option)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                        Selected: {userSelections.length} / {memoryItems.length}
                    </p>
                    <button
                        onClick={submitRound}
                        disabled={userSelections.length !== memoryItems.length}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Round {currentRound}
                    </button>
                </div>
            </div>
        );
    };

    const renderComplete = () => (
        <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900">Memory Challenge Complete!</h2>
            <div className="max-w-md mx-auto bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Your Results</h3>
                <div className="space-y-2 text-green-800">
                    <p>Total Correct: {results.reduce((sum, r) => sum + r.correct, 0)} / {results.reduce((sum, r) => sum + r.total, 0)}</p>
                    <p>Accuracy: {Math.round((results.reduce((sum, r) => sum + r.correct, 0) / results.reduce((sum, r) => sum + r.total, 0)) * 100)}%</p>
                    <p>Average Response Time: {Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length / 1000)}s</p>
                </div>
            </div>
        </div>
    );

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
                    Activity 1 of 4 • Memory Challenge
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                {phase === 'intro' && renderIntro()}
                {phase === 'study' && renderStudyPhase()}
                {phase === 'test' && renderTestPhase()}
                {phase === 'complete' && renderComplete()}
            </div>
        </div>
    );
}
