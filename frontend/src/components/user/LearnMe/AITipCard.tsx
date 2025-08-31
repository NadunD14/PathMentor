'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';
import { AITip, mockAITips } from '@/lib/mockData';

export default function AITipCard() {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [tips] = useState<AITip[]>(mockAITips);

    const currentTip = tips[currentTipIndex];

    const handleNextTip = () => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    };

    const getIconForType = (type: AITip['type']) => {
        switch (type) {
            case 'tip':
                return '💡';
            case 'motivation':
                return '🚀';
            case 'reminder':
                return '🔔';
            case 'achievement':
                return '🏆';
            default:
                return '🤖';
        }
    };

    return (
        <Card className="h-full">
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-100 rounded-full p-2">
                        <span className="text-xl" role="img" aria-label="AI Assistant">
                            {getIconForType(currentTip.type)}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">AI Assistant</h3>
                        <p className="text-sm text-gray-500">Here to help you learn better</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex-grow">
                    <p className="text-gray-700">{currentTip.message}</p>
                </div>

                <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs text-gray-500">Tip {currentTipIndex + 1} of {tips.length}</span>
                    <button
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        onClick={handleNextTip}
                    >
                        Next tip
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </Card>
    );
}
