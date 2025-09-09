'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ActivityType, ProblemSolvingResult } from '@/lib/types/learningTypes';

interface ProblemSolvingActivityProps {
    userId: string;
    onComplete: (result: ProblemSolvingResult) => void;
    onBack: () => void;
}

interface PuzzlePiece {
    id: string;
    color: string;
    shape: 'square' | 'circle' | 'triangle';
    size: 'small' | 'medium' | 'large';
    position: { x: number; y: number };
    isPlaced: boolean;
    targetSlot?: string;
}

interface TargetSlot {
    id: string;
    shape: 'square' | 'circle' | 'triangle';
    size: 'small' | 'medium' | 'large';
    position: { x: number; y: number };
    filled: boolean;
}

export default function ProblemSolvingActivity({
    userId,
    onComplete,
    onBack
}: ProblemSolvingActivityProps) {
    const [phase, setPhase] = useState<'intro' | 'tutorial' | 'puzzle1' | 'puzzle2' | 'puzzle3' | 'complete'>('intro');
    const [currentPuzzle, setCurrentPuzzle] = useState(1);
    const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
    const [slots, setSlots] = useState<TargetSlot[]>([]);
    const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
    const [interactions, setInteractions] = useState(0);
    const [dragActions, setDragActions] = useState(0);
    const [clickActions, setClickActions] = useState(0);
    const [startTime] = useState(new Date());
    const [puzzleStartTime, setPuzzleStartTime] = useState<number>(0);
    const [puzzleResults, setPuzzleResults] = useState<Array<{
        puzzle: number;
        time: number;
        interactions: number;
        steps: number;
        completed: boolean;
    }>>([]);

    const containerRef = useRef<HTMLDivElement>(null);

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    const totalPuzzles = 3;

    const generatePuzzle = (puzzleNumber: number) => {
        const complexity = puzzleNumber; // Increases with each puzzle
        const pieceCount = 3 + complexity;

        // Generate target slots
        const newSlots: TargetSlot[] = [];
        const shapes: Array<'square' | 'circle' | 'triangle'> = ['square', 'circle', 'triangle'];
        const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

        for (let i = 0; i < pieceCount; i++) {
            newSlots.push({
                id: `slot-${i}`,
                shape: shapes[i % shapes.length],
                size: sizes[i % sizes.length],
                position: {
                    x: 100 + (i % 3) * 120,
                    y: 200 + Math.floor(i / 3) * 120
                },
                filled: false
            });
        }

        // Generate puzzle pieces (shuffled)
        const newPieces: PuzzlePiece[] = newSlots.map((slot, index) => ({
            id: `piece-${index}`,
            color: colors[index % colors.length],
            shape: slot.shape,
            size: slot.size,
            position: {
                x: 50 + (index % 4) * 80,
                y: 50 + Math.floor(index / 4) * 80
            },
            isPlaced: false,
            targetSlot: slot.id
        }));

        // Shuffle pieces
        for (let i = newPieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
        }

        setSlots(newSlots);
        setPieces(newPieces);
        setPuzzleStartTime(Date.now());
        setInteractions(0);
    };

    const handleDragStart = (e: React.DragEvent, pieceId: string) => {
        setDraggedPiece(pieceId);
        setDragActions(prev => prev + 1);
        setInteractions(prev => prev + 1);
        e.dataTransfer.setData('text/plain', pieceId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, slotId: string) => {
        e.preventDefault();
        const pieceId = e.dataTransfer.getData('text/plain');

        setInteractions(prev => prev + 1);

        setPieces(prevPieces =>
            prevPieces.map(piece => {
                if (piece.id === pieceId) {
                    const targetSlot = slots.find(slot => slot.id === slotId);
                    if (targetSlot && piece.shape === targetSlot.shape && piece.size === targetSlot.size) {
                        // Correct placement
                        return {
                            ...piece,
                            position: targetSlot.position,
                            isPlaced: true
                        };
                    }
                }
                return piece;
            })
        );

        setSlots(prevSlots =>
            prevSlots.map(slot => {
                if (slot.id === slotId) {
                    const piece = pieces.find(p => p.id === pieceId);
                    if (piece && piece.shape === slot.shape && piece.size === slot.size) {
                        return { ...slot, filled: true };
                    }
                }
                return slot;
            })
        );

        setDraggedPiece(null);
    };

    const handlePieceClick = (pieceId: string) => {
        setClickActions(prev => prev + 1);
        setInteractions(prev => prev + 1);
    };

    const checkPuzzleComplete = () => {
        return pieces.every(piece => piece.isPlaced) && slots.every(slot => slot.filled);
    };

    const nextPuzzle = () => {
        const puzzleTime = Date.now() - puzzleStartTime;
        const steps = interactions;

        setPuzzleResults(prev => [...prev, {
            puzzle: currentPuzzle,
            time: puzzleTime,
            interactions,
            steps,
            completed: checkPuzzleComplete()
        }]);

        if (currentPuzzle < totalPuzzles) {
            setCurrentPuzzle(prev => prev + 1);
            const nextPhase = `puzzle${currentPuzzle + 1}` as typeof phase;
            setPhase(nextPhase);
            generatePuzzle(currentPuzzle + 1);
        } else {
            completeActivity();
        }
    };

    const completeActivity = () => {
        const endTime = new Date();
        const totalInteractions = puzzleResults.reduce((sum, r) => sum + r.interactions, 0) + interactions;
        const totalSteps = puzzleResults.reduce((sum, r) => sum + r.steps, 0);
        const allCompleted = puzzleResults.every(r => r.completed) && checkPuzzleComplete();

        const result: ProblemSolvingResult = {
            activityId: `problem-solving-${Date.now()}`,
            activityType: ActivityType.PROBLEM_SOLVING,
            userId,
            startTime,
            endTime,
            completionTime: endTime.getTime() - startTime.getTime(),
            timestamp: new Date(),
            interactionCount: totalInteractions,
            stepsToComplete: totalSteps,
            efficiency: allCompleted ? Math.max(1, 100 - totalSteps) : 0,
            dragDropActions: dragActions,
            clickActions: clickActions,
            taskCompleted: allCompleted
        };

        onComplete(result);
        setPhase('complete');
    };

    useEffect(() => {
        if (phase.startsWith('puzzle')) {
            const puzzleNum = parseInt(phase.replace('puzzle', ''));
            generatePuzzle(puzzleNum);
        }
    }, [phase]);

    const renderIntro = () => (
        <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🧩</div>
            <h2 className="text-3xl font-bold text-gray-900">Interactive Puzzle Challenge</h2>
            <div className="max-w-2xl mx-auto space-y-4">
                <p className="text-lg text-gray-600">
                    Solve interactive puzzles by dragging and dropping pieces into their correct positions.
                    This tests your hands-on problem-solving abilities.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                    <ul className="text-left text-blue-700 space-y-1">
                        <li>• Drag puzzle pieces to matching slots</li>
                        <li>• Match shapes and sizes correctly</li>
                        <li>• Complete 3 puzzles of increasing complexity</li>
                        <li>• We track your interaction patterns</li>
                    </ul>
                </div>
            </div>
            <button
                onClick={() => setPhase('tutorial')}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
                Start Puzzle Challenge
            </button>
        </div>
    );

    const renderPuzzle = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                    Puzzle {currentPuzzle} of {totalPuzzles}
                </h3>
                <div className="text-sm text-gray-600">
                    Interactions: {interactions}
                </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800">
                    Drag the colored pieces below to their matching slots. Match both shape and size!
                </p>
            </div>

            <div
                ref={containerRef}
                className="relative bg-gray-100 rounded-lg mx-auto"
                style={{ width: '500px', height: '400px' }}
            >
                {/* Target Slots */}
                {slots.map((slot) => (
                    <div
                        key={slot.id}
                        className={`absolute border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center ${slot.filled ? 'bg-green-100 border-green-400' : 'bg-white'
                            }`}
                        style={{
                            left: `${slot.position.x}px`,
                            top: `${slot.position.y}px`,
                            width: slot.size === 'small' ? '60px' : slot.size === 'medium' ? '80px' : '100px',
                            height: slot.size === 'small' ? '60px' : slot.size === 'medium' ? '80px' : '100px',
                        }}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, slot.id)}
                    >
                        <div className="text-gray-500 text-xs text-center">
                            {slot.shape}<br />{slot.size}
                        </div>
                    </div>
                ))}

                {/* Puzzle Pieces */}
                {pieces.map((piece) => (
                    <div
                        key={piece.id}
                        draggable={!piece.isPlaced}
                        onDragStart={(e) => handleDragStart(e, piece.id)}
                        onClick={() => handlePieceClick(piece.id)}
                        className={`absolute rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center ${piece.isPlaced ? 'opacity-75' : 'hover:scale-105 shadow-lg'
                            } ${draggedPiece === piece.id ? 'opacity-50' : ''}`}
                        style={{
                            left: `${piece.position.x}px`,
                            top: `${piece.position.y}px`,
                            width: piece.size === 'small' ? '60px' : piece.size === 'medium' ? '80px' : '100px',
                            height: piece.size === 'small' ? '60px' : piece.size === 'medium' ? '80px' : '100px',
                            backgroundColor: piece.color,
                            clipPath: piece.shape === 'circle'
                                ? 'circle(50%)'
                                : piece.shape === 'triangle'
                                    ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                    : 'none'
                        }}
                    >
                        <span className="text-white font-bold text-xs">
                            {piece.shape[0].toUpperCase()}
                        </span>
                    </div>
                ))}
            </div>

            <div className="text-center">
                {checkPuzzleComplete() ? (
                    <button
                        onClick={nextPuzzle}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                        {currentPuzzle < totalPuzzles ? 'Next Puzzle' : 'Complete Challenge'}
                    </button>
                ) : (
                    <p className="text-gray-600">
                        Place all pieces in their correct slots to continue
                    </p>
                )}
            </div>
        </div>
    );

    const renderComplete = () => (
        <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900">Puzzle Challenge Complete!</h2>
            <div className="max-w-md mx-auto bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Your Results</h3>
                <div className="space-y-2 text-green-800">
                    <p>Total Interactions: {puzzleResults.reduce((sum, r) => sum + r.interactions, 0) + interactions}</p>
                    <p>Drag & Drop Actions: {dragActions}</p>
                    <p>Click Actions: {clickActions}</p>
                    <p>Puzzles Completed: {puzzleResults.filter(r => r.completed).length + (checkPuzzleComplete() ? 1 : 0)}/{totalPuzzles}</p>
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
                    Activity 2 of 4 • Problem Solving
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                {phase === 'intro' && renderIntro()}
                {(phase === 'tutorial' || phase.startsWith('puzzle')) && renderPuzzle()}
                {phase === 'complete' && renderComplete()}
            </div>
        </div>
    );
}
