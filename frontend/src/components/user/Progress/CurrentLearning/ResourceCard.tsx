'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LearningPathResource, useQuestionnaireStore } from '@/store/useQuestionnaireStore';

interface ResourceCardProps {
    resource: LearningPathResource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
    const { markResourceComplete } = useQuestionnaireStore();
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);

    const handleOpenResource = () => {
        window.open(resource.url, '_blank');
    };

    const handleMarkComplete = () => {
        markResourceComplete(resource.id);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    const handleProofUpload = () => {
        if (!proofFile) return;

        setIsUploading(true);

        // Simulate upload process
        setTimeout(() => {
            // In a real implementation, you would upload the file to your server/storage
            markResourceComplete(resource.id);
            setIsUploading(false);
            setProofFile(null);
        }, 1500);
    };

    // Format time function
    const formatTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            return `${hours}h ${minutes % 60}m`;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow">
            <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-semibold mb-1">{resource.title}</h2>
                        <div className="flex items-center text-sm text-gray-500">
                            <span className="capitalize">{resource.type}</span>
                            <span className="mx-2">•</span>
                            <span>{formatTime(resource.estimatedTime)}</span>
                            <span className="mx-2">•</span>
                            <span className={resource.completed ? 'text-green-600' : ''}>
                                {resource.completed ? 'Completed' : 'Not completed'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleOpenResource}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                            Open Resource
                        </button>
                        <button
                            onClick={() => router.push(`/user/learnme?explain=${encodeURIComponent(resource.id)}`)}
                            className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 border border-indigo-200"
                        >
                            Ask AI to Explain
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{resource.description}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Upload Proof of Completion</h3>
                    <div className="space-y-4">
                        <p className="text-gray-600 text-sm">
                            Upload screenshots, project files, or other proof that you've completed this resource.
                            This helps track your progress and build your portfolio.
                        </p>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {proofFile ? (
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{proofFile.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Drag and drop files, or{' '}
                                        <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                                            browse
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        PNG, JPG, PDF up to 10MB
                                    </p>
                                </>
                            )}
                        </div>

                        {proofFile && (
                            <div className="flex justify-end">
                                <button
                                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    onClick={handleProofUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Proof'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-between">
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
                    >
                        Back to Learning Path
                    </button>

                    {!resource.completed && (
                        <button
                            onClick={handleMarkComplete}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                        >
                            Mark as Complete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
