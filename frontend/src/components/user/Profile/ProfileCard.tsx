'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';
import { useUserStore } from '@/lib/store/useUserStore';

export default function ProfileCard() {
    const { name, setName } = useUserStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(name);
    const [avatar, setAvatar] = useState('/file.svg');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setName(editName);
        setIsEditing(false);
    };

    return (
        <Card>
            <div className="flex flex-col items-center">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {avatar ? (
                            <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-blue-600">
                                {name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </span>
                        )}
                    </div>
                    <button
                        className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white"
                        aria-label="Change profile picture"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditName(name);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{name}</h2>
                        <p className="text-gray-500 mb-4">user@example.com</p>

                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Edit Profile
                        </button>
                    </>
                )}
            </div>
        </Card>
    );
}
