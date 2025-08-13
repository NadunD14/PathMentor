'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';

interface StudyGroup {
    id: string;
    name: string;
    category: string;
    members: number;
    description: string;
    isMember: boolean;
}

// Mock data for study groups
const mockStudyGroups: StudyGroup[] = [
    {
        id: '1',
        name: 'React Enthusiasts',
        category: 'Web Development',
        members: 42,
        description: 'A group for React developers to share knowledge, discuss best practices, and help each other with challenges.',
        isMember: true,
    },
    {
        id: '2',
        name: 'Python Data Scientists',
        category: 'Data Science',
        members: 78,
        description: 'For those learning data science with Python. We discuss libraries, techniques, and work on real-world problems.',
        isMember: false,
    },
    {
        id: '3',
        name: 'Machine Learning Beginners',
        category: 'Machine Learning',
        members: 56,
        description: 'A supportive community for those just getting started with machine learning concepts and applications.',
        isMember: false,
    },
    {
        id: '4',
        name: 'UI/UX Design Circle',
        category: 'Design',
        members: 34,
        description: 'Share your designs, get feedback, and discuss trends in user interface and experience design.',
        isMember: true,
    },
];

export default function StudyGroupsCard() {
    const [groups, setGroups] = useState<StudyGroup[]>(mockStudyGroups);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleMembership = (groupId: string) => {
        setGroups((prevGroups) =>
            prevGroups.map((group) =>
                group.id === groupId
                    ? {
                        ...group,
                        isMember: !group.isMember,
                        members: group.isMember ? group.members - 1 : group.members + 1,
                    }
                    : group
            )
        );
    };

    // Filter groups by search query
    const filteredGroups = searchQuery
        ? groups.filter(
            (group) =>
                group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : groups;

    return (
        <Card title="Study Groups">
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search study groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredGroups.map((group) => (
                    <div
                        key={group.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900">{group.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {group.members} member{group.members !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                {group.category}
                            </span>
                        </div>

                        <p className="text-sm text-gray-700 mt-2 mb-4">{group.description}</p>

                        <div className="flex justify-between items-center">
                            <button className="text-sm text-blue-600 hover:text-blue-800">
                                View Group
                            </button>

                            <button
                                onClick={() => toggleMembership(group.id)}
                                className={`px-3 py-1 rounded-md text-sm ${group.isMember
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {group.isMember ? 'Leave Group' : 'Join Group'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
                    Create New Study Group
                </button>
            </div>
        </Card>
    );
}
