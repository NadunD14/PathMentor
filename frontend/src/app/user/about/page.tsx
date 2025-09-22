"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
export default function AboutPage() {
    const [activeTab, setActiveTab] = useState('mission');

    const tabs = [
        { id: 'mission', name: 'Our Mission' },
        { id: 'team', name: 'Our Team' },
        { id: 'technology', name: 'Our Technology' },
    ];

    const teamMembers = [
        {
            name: 'Alex Chen',
            role: 'Founder & CEO',
            image: '/vercel.svg', // Placeholder image
            bio: 'Alex founded PathMentor after experiencing firsthand the challenges of self-directed learning in the digital age.'
        },
        {
            name: 'Sarah Johnson',
            role: 'Chief Learning Officer',
            image: '/vercel.svg', // Placeholder image
            bio: 'With 15 years in educational technology, Sarah designs our learning frameworks and pedagogical approaches.'
        },
        {
            name: 'Marcus Williams',
            role: 'CTO',
            image: '/vercel.svg', // Placeholder image
            bio: 'Marcus leads our engineering team and oversees the development of our AI-powered learning platform.'
        },
        {
            name: 'Priya Sharma',
            role: 'Head of AI Research',
            image: '/vercel.svg', // Placeholder image
            bio: 'Dr. Sharma specializes in adaptive learning systems and leads our AI development initiatives.'
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-800">
                <div className="container-custom py-16 sm:py-20">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-4xl">
                        About PathMentor
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg text-indigo-100">
                        We're transforming how people learn with AI-powered personalized learning paths.
                        Our platform adapts to your unique learning style, pace, and goals.
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                        <Link href="/user/register" className="btn-primary">Get started</Link>
                        <Link href="/user/pricing" className="btn-outline">See pricing</Link>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white">
                <div className="container-custom">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Mission Content */}
            {activeTab === 'mission' && (
                <div className="py-16 bg-white overflow-hidden">
                    <div className="container-custom">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                    Our Mission
                                </h2>
                                <p className="mt-3 max-w-3xl text-lg text-gray-500">
                                    At PathMentor, we believe everyone deserves a personalized learning experience tailored to their unique needs and goals.
                                </p>
                                <p className="mt-8 text-lg text-gray-500">
                                    Traditional education follows a one-size-fits-all approach, but we know that each person learns differently. Our mission is to democratize personalized learning by harnessing the power of AI to create adaptive learning experiences that respond to your individual learning style, pace, and goals.
                                </p>
                                <p className="mt-8 text-lg text-gray-500">
                                    We're committed to helping you discover your potential, overcome learning obstacles, and master new skills efficiently. Whether you're upskilling for your career, pursuing a passion project, or exploring new horizons, PathMentor is your AI learning companion on the journey.
                                </p>
                            </div>
                            <div className="mt-12 relative lg:mt-0">
                                <div className="relative mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-0 lg:max-w-none">
                                    <div className="relative shadow-xl rounded-2xl overflow-hidden h-96">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-90">
                                            <div className="absolute inset-0 bg-white opacity-10 backdrop-filter backdrop-blur-sm"></div>
                                        </div>
                                        <div className="relative h-full flex flex-col justify-center items-center p-6 text-center text-white">
                                            <h3 className="text-2xl font-bold mb-4">Our Core Values</h3>
                                            <ul className="space-y-3 text-left w-full max-w-xs mx-auto">
                                                <li className="flex items-center">
                                                    <svg className="h-6 w-6 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Personalization First</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="h-6 w-6 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Continuous Innovation</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="h-6 w-6 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Ethical AI Development</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="h-6 w-6 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Community Collaboration</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="h-6 w-6 mr-2 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Learning Accessibility</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Content */}
            {activeTab === 'team' && (
                <div className="py-16 bg-white overflow-hidden">
                    <div className="container-custom">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Meet Our Team
                            </h2>
                            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                                A passionate group of educators, engineers, and researchers dedicated to revolutionizing learning.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-8 lg:grid-cols-4 sm:grid-cols-2">
                            {teamMembers.map((member) => (
                                <div key={member.name} className="bg-gray-50 rounded-lg p-6 text-center">
                                    <div className="mx-auto h-20 w-20 rounded-full overflow-hidden">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            width={80}
                                            height={80}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">{member.name}</h3>
                                    <p className="text-sm text-blue-600">{member.role}</p>
                                    <p className="mt-3 text-base text-gray-500">{member.bio}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 text-center">
                            <h3 className="text-2xl font-bold text-gray-900">Join Our Team</h3>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                                We're always looking for talented individuals passionate about education and technology.
                            </p>
                            <div className="mt-6">
                                <a href="#" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                    View Career Opportunities
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Technology Content */}
            {activeTab === 'technology' && (
                <div className="py-16 bg-white overflow-hidden">
                    <div className="container-custom">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                    Our Technology
                                </h2>
                                <p className="mt-3 max-w-3xl text-lg text-gray-500">
                                    PathMentor leverages cutting-edge AI technology to deliver personalized learning experiences.
                                </p>

                                <div className="mt-8 space-y-10">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Adaptive Learning Engine</h3>
                                            <p className="mt-2 text-base text-gray-500">
                                                Our proprietary algorithm analyzes your learning patterns, strengths, and areas for improvement to continuously adjust your learning path for optimal results.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Natural Language Processing</h3>
                                            <p className="mt-2 text-base text-gray-500">
                                                Our AI assistant uses advanced NLP to understand your questions and provide relevant, contextual guidance that matches your learning level.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Progress Analytics</h3>
                                            <p className="mt-2 text-base text-gray-500">
                                                Our sophisticated analytics system tracks your progress across multiple dimensions, providing insights that help you understand your learning journey.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 relative lg:mt-0">
                                <div className="relative shadow-xl rounded-lg overflow-hidden">
                                    <div className="relative h-96 bg-gray-900">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center p-8">
                                                <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Learning</h3>
                                                <div className="bg-black bg-opacity-30 p-6 rounded-lg">
                                                    <div className="h-48 flex items-center justify-center">
                                                        <div className="text-blue-400 text-xs md:text-sm font-mono overflow-hidden">
                                                            <p>{'> Analyzing learning patterns'}</p>
                                                            <p>{'> Generating personalized path'}</p>
                                                            <p>{'> Optimizing content sequence'}</p>
                                                            <p>{'> Adapting to user feedback'}</p>
                                                            <p className="text-green-400">{'> Path optimization complete'}</p>
                                                            <p>{'> Recommendation confidence: 94.7%'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 relative pt-1">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-xs font-semibold inline-block text-blue-300">
                                                                    AI Processing
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-xs font-semibold inline-block text-blue-300">
                                                                    Complete
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-900">
                                                            <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 w-full"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Call to Action */}
            <div className="bg-blue-700">
                <div className="container-custom py-12 lg:py-16 lg:flex lg:items-center lg:justify-between">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        <span className="block">Ready to transform your learning journey?</span>
                        <span className="block text-blue-200">Start with PathMentor today.</span>
                    </h2>
                    <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 gap-3">
                        <Link href="/user/register" className="btn-outline bg-white text-blue-600 hover:bg-blue-50 border-white">Get started</Link>
                        <Link href="/user/login" className="btn-primary bg-blue-800 hover:bg-blue-900">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
