'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ActivityType, ReadingWritingResult } from '@/lib/types/learningTypes';

interface ReadingWritingActivityProps {
    userId: string;
    onComplete: (result: ReadingWritingResult) => void;
    onBack: () => void;
}

const sampleArticle = `
# Understanding Learning Preferences: A Comprehensive Guide

Learning preferences, also known as learning styles, are the different ways individuals prefer to receive, process, and retain information. While everyone can learn through various methods, most people have natural inclinations toward certain approaches that make learning more effective and enjoyable.

## The Four Primary Learning Types

### 1. Visual Learners
Visual learners process information best when it's presented in a visual format. They prefer:
- Charts, diagrams, and infographics
- Mind maps and flowcharts
- Color-coded materials
- Written instructions
- Spatial organization of information

Research indicates that approximately 65% of the population has strong visual learning preferences. These individuals often think in pictures and have excellent spatial awareness.

### 2. Auditory Learners
Auditory learners thrive when information is presented through sound. They benefit from:
- Lectures and discussions
- Audio recordings and podcasts
- Group conversations
- Reading aloud
- Musical mnemonics

About 30% of learners show strong auditory preferences. They often have excellent listening skills and remember verbal instructions well.

### 3. Kinesthetic Learners
Kinesthetic learners need hands-on experiences to fully grasp concepts. They prefer:
- Interactive activities
- Physical manipulation of objects
- Real-world applications
- Movement during learning
- Trial-and-error approaches

Approximately 5% of learners are primarily kinesthetic, though most people benefit from some hands-on learning experiences.

### 4. Reading/Writing Learners
These learners excel with text-based information and written communication. They prefer:
- Reading comprehensive materials
- Taking detailed notes
- Written assignments
- Lists and written instructions
- Research and documentation

## Practical Applications

Understanding learning preferences can significantly improve educational outcomes. Teachers can incorporate multiple modalities to reach all learners, while students can identify their strengths and adapt their study strategies accordingly.

## Conclusion

While learning preferences provide valuable insights, it's important to remember that effective learning often involves multiple modalities. The key is understanding your natural inclinations while remaining open to diverse learning experiences.
`;

const comprehensionQuestions = [
    {
        question: "What percentage of the population has strong visual learning preferences?",
        options: ["30%", "65%", "5%", "95%"],
        correct: 1
    },
    {
        question: "Which learning type benefits most from hands-on experiences?",
        options: ["Visual", "Auditory", "Kinesthetic", "Reading/Writing"],
        correct: 2
    },
    {
        question: "What is a key characteristic of auditory learners?",
        options: ["They prefer charts and diagrams", "They need physical manipulation", "They have excellent listening skills", "They take detailed notes"],
        correct: 2
    },
    {
        question: "According to the article, what is important to remember about learning preferences?",
        options: [
            "Only one method should be used",
            "Visual learning is always best",
            "Effective learning often involves multiple modalities",
            "Learning preferences never change"
        ],
        correct: 2
    }
];

export default function ReadingWritingActivity({
    userId,
    onComplete,
    onBack
}: ReadingWritingActivityProps) {
    const [phase, setPhase] = useState<'intro' | 'reading' | 'summary' | 'questions' | 'complete'>('intro');
    const [readingStartTime, setReadingStartTime] = useState(0);
    const [readingTime, setReadingTime] = useState(0);
    const [summary, setSummary] = useState('');
    const [highlights, setHighlights] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [textInteractions, setTextInteractions] = useState(0);
    const [startTime] = useState(new Date());
    const [selectedText, setSelectedText] = useState('');

    const articleRef = useRef<HTMLDivElement>(null);

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 5) {
            const text = selection.toString();
            setSelectedText(text);
            setTextInteractions(prev => prev + 1);

            // Add to highlights if not already there
            if (!highlights.includes(text)) {
                setHighlights(prev => [...prev, text]);
            }
        }
    };

    const startReading = () => {
        setPhase('reading');
        setReadingStartTime(Date.now());
    };

    const finishReading = () => {
        setReadingTime(Date.now() - readingStartTime);
        setPhase('summary');
    };

    const submitSummary = () => {
        setPhase('questions');
    };

    const handleAnswer = (answerIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answerIndex;
        setAnswers(newAnswers);

        if (currentQuestion < comprehensionQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            completeActivity();
        }
    };

    const calculateReadingSpeed = () => {
        const wordCount = sampleArticle.split(' ').length;
        const readingTimeMinutes = readingTime / (1000 * 60);
        return Math.round(wordCount / readingTimeMinutes);
    };

    const calculateSummaryQuality = () => {
        const summaryWords = summary.trim().split(' ').length;
        const keyTerms = ['visual', 'auditory', 'kinesthetic', 'reading', 'learning', 'preferences'];
        const keyTermsUsed = keyTerms.filter(term =>
            summary.toLowerCase().includes(term)
        ).length;

        // Quality based on length and key term usage
        let quality = 0;
        if (summaryWords >= 50) quality += 3;
        else if (summaryWords >= 25) quality += 2;
        else if (summaryWords >= 10) quality += 1;

        quality += (keyTermsUsed / keyTerms.length) * 7;

        return Math.min(10, Math.round(quality));
    };

    const completeActivity = () => {
        const endTime = new Date();
        const correctAnswers = answers.filter((answer, index) =>
            answer === comprehensionQuestions[index].correct
        ).length;

        const result: ReadingWritingResult = {
            activityId: `reading-writing-${Date.now()}`,
            activityType: ActivityType.READING_WRITING,
            userId,
            startTime,
            endTime,
            completionTime: endTime.getTime() - startTime.getTime(),
            timestamp: new Date(),
            readingSpeed: calculateReadingSpeed(),
            textInteractions: textInteractions + highlights.length,
            responseAccuracy: (correctAnswers / comprehensionQuestions.length) * 100,
            summaryQuality: calculateSummaryQuality(),
            wordsWritten: summary.split(' ').length + notes.split(' ').length,
            timeSpentReading: readingTime
        };

        onComplete(result);
        setPhase('complete');
    };

    const renderIntro = () => (
        <div className="text-center space-y-6">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-3xl font-bold text-gray-900">Reading & Writing Assessment</h2>
            <div className="max-w-2xl mx-auto space-y-4">
                <p className="text-lg text-gray-600">
                    Read an article about learning preferences, then write a summary and answer comprehension questions.
                    This assessment evaluates your text-based learning abilities.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">What we're measuring:</h3>
                    <ul className="text-left text-blue-700 space-y-1">
                        <li>• Reading speed and comprehension</li>
                        <li>• Text interaction patterns (highlighting, notes)</li>
                        <li>• Writing quality and summarization skills</li>
                        <li>• Retention of written information</li>
                    </ul>
                </div>
            </div>
            <button
                onClick={startReading}
                className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
                Start Reading
            </button>
        </div>
    );

    const renderReading = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Read the Article</h3>
                <div className="text-sm text-gray-600">
                    Time: {Math.floor((Date.now() - readingStartTime) / 1000)}s
                </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800">
                    Read the article carefully. You can highlight important text by selecting it.
                    Take your time to understand the content - you'll be asked to summarize and answer questions.
                </p>
            </div>

            <div
                ref={articleRef}
                className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto"
                onMouseUp={handleTextSelection}
                style={{ userSelect: 'text' }}
            >
                <div className="prose max-w-none">
                    {sampleArticle.split('\n').map((paragraph, index) => {
                        if (paragraph.startsWith('# ')) {
                            return <h1 key={index} className="text-2xl font-bold mb-4">{paragraph.substring(2)}</h1>;
                        } else if (paragraph.startsWith('## ')) {
                            return <h2 key={index} className="text-xl font-semibold mb-3 mt-6">{paragraph.substring(3)}</h2>;
                        } else if (paragraph.startsWith('### ')) {
                            return <h3 key={index} className="text-lg font-semibold mb-2 mt-4">{paragraph.substring(4)}</h3>;
                        } else if (paragraph.trim().startsWith('- ')) {
                            return <li key={index} className="ml-4">{paragraph.substring(2)}</li>;
                        } else if (paragraph.trim()) {
                            return <p key={index} className="mb-3 leading-relaxed">{paragraph}</p>;
                        }
                        return null;
                    })}
                </div>
            </div>

            {/* Highlights Panel */}
            {highlights.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Your Highlights ({highlights.length})</h4>
                    <div className="space-y-1">
                        {highlights.slice(-3).map((highlight, index) => (
                            <p key={index} className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                                "{highlight}"
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes Section */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Take Notes (Optional)</h4>
                <textarea
                    value={notes}
                    onChange={(e) => {
                        setNotes(e.target.value);
                        setTextInteractions(prev => prev + 1);
                    }}
                    placeholder="Write any notes or thoughts about the article..."
                    className="w-full h-24 p-3 border rounded-lg resize-none"
                />
            </div>

            <div className="text-center">
                <button
                    onClick={finishReading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                    Finished Reading
                </button>
            </div>
        </div>
    );

    const renderSummary = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Write a Summary</h3>
                <p className="text-gray-600">
                    Summarize the key points from the article in your own words (aim for 50-100 words)
                </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
                <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Write your summary here..."
                    className="w-full h-40 p-4 border rounded-lg resize-none"
                />
                <div className="mt-2 text-sm text-gray-600">
                    Word count: {summary.trim().split(' ').filter(word => word).length}
                </div>
            </div>

            <div className="text-center">
                <button
                    onClick={submitSummary}
                    disabled={summary.trim().length < 10}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue to Questions
                </button>
            </div>
        </div>
    );

    const renderQuestions = () => {
        const question = comprehensionQuestions[currentQuestion];

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Question {currentQuestion + 1} of {comprehensionQuestions.length}
                    </h3>
                    <p className="text-gray-600">
                        Answer based on what you read in the article
                    </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-orange-900 mb-4">
                        {question.question}
                    </h4>

                    <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                className="w-full text-left p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-colors"
                            >
                                <span className="font-medium text-gray-900">
                                    {String.fromCharCode(65 + index)}. {option}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                    Progress: {currentQuestion + 1} / {comprehensionQuestions.length}
                </div>
            </div>
        );
    };

    const renderComplete = () => {
        const correctAnswers = answers.filter((answer, index) =>
            answer === comprehensionQuestions[index].correct
        ).length;
        const accuracy = Math.round((correctAnswers / comprehensionQuestions.length) * 100);

        return (
            <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900">Reading & Writing Complete!</h2>
                <div className="max-w-md mx-auto bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Your Results</h3>
                    <div className="space-y-2 text-green-800">
                        <p>Reading Speed: {calculateReadingSpeed()} words/min</p>
                        <p>Questions Correct: {correctAnswers} / {comprehensionQuestions.length} ({accuracy}%)</p>
                        <p>Text Interactions: {textInteractions + highlights.length}</p>
                        <p>Summary Quality: {calculateSummaryQuality()}/10</p>
                        <p>Words Written: {summary.split(' ').length + notes.split(' ').length}</p>
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
                    Activity 4 of 4 • Reading & Writing
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                {phase === 'intro' && renderIntro()}
                {phase === 'reading' && renderReading()}
                {phase === 'summary' && renderSummary()}
                {phase === 'questions' && renderQuestions()}
                {phase === 'complete' && renderComplete()}
            </div>
        </div>
    );
}
