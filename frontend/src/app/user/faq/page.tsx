"use client";

import { useState } from 'react';
import Link from 'next/link';

type FaqItem = {
    question: string;
    answer: string;
    category: string;
};

export default function FaqPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const faqItems: FaqItem[] = [
        {
            question: 'What is PathMentor?',
            answer: 'PathMentor is an AI-driven learning platform that helps users master new skills through personalized learning paths. Our platform adapts to your learning style, pace, and goals to create a customized learning experience.',
            category: 'general'
        },
        {
            question: 'How does the AI learning assistant work?',
            answer: 'Our AI learning assistant uses natural language processing to understand your questions and provide contextual guidance. It analyzes your learning patterns and progress to offer personalized recommendations and explanations tailored to your current understanding level.',
            category: 'features'
        },
        {
            question: 'Is PathMentor free to use?',
            answer: 'PathMentor offers a free basic plan with limited features. For full access to all features including unlimited learning paths, advanced analytics, and enhanced AI assistance, we offer Pro and Enterprise subscription plans. Visit our pricing page for more details.',
            category: 'pricing'
        },
        {
            question: 'Can I create my own learning paths?',
            answer: 'Yes! Pro and Enterprise subscribers can create custom learning paths. You can define your goals, select relevant resources, and the AI will organize them into an optimal learning sequence based on your preferences and learning style.',
            category: 'features'
        },
        {
            question: 'How do I track my learning progress?',
            answer: 'PathMentor provides comprehensive progress tracking through your personal dashboard. You can view your completion rates, time spent learning, mastery levels across different skills, and achievements. Visual charts and metrics help you understand your learning journey.',
            category: 'features'
        },
        {
            question: 'What subjects and skills does PathMentor cover?',
            answer: 'PathMentor covers a wide range of subjects including programming, languages, business skills, creative arts, science, mathematics, and more. We regularly add new content based on user demand and emerging skills.',
            category: 'content'
        },
        {
            question: 'Can I use PathMentor for my team or organization?',
            answer: 'Absolutely! Our Enterprise plan is designed for teams and organizations. It includes features like team management, organizational learning paths, team analytics, and dedicated support to help your team learn effectively together.',
            category: 'pricing'
        },
        {
            question: 'How do the community features work?',
            answer: 'Our community features allow you to connect with other learners studying similar subjects. You can join study groups, participate in discussion forums, share resources, and collaborate on projects. Pro users can create their own study groups and access premium community features.',
            category: 'features'
        },
        {
            question: 'Is my learning data private?',
            answer: 'We take privacy seriously. Your learning data is used to personalize your experience but is not shared with third parties without your consent. You can control your privacy settings in your profile, and we comply with all relevant data protection regulations.',
            category: 'privacy'
        },
        {
            question: 'Can I access PathMentor on mobile devices?',
            answer: 'Yes, PathMentor is fully responsive and works on all modern devices including smartphones and tablets. We also offer dedicated mobile apps for iOS and Android for an optimized mobile learning experience.',
            category: 'technical'
        },
        {
            question: 'What if I want to cancel my subscription?',
            answer: 'You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period. We don\'t offer refunds for partial subscription periods, but you\'re welcome to use the service until the period ends.',
            category: 'billing'
        },
        {
            question: 'How does PathMentor compare to traditional courses?',
            answer: 'Unlike traditional one-size-fits-all courses, PathMentor adapts to your individual needs. Our platform combines the best learning resources with AI-powered personalization to create an efficient, flexible learning experience that evolves with your progress.',
            category: 'general'
        }
    ];

    const categories = [
        { id: 'all', name: 'All Questions' },
        { id: 'general', name: 'General' },
        { id: 'features', name: 'Features' },
        { id: 'pricing', name: 'Pricing & Billing' },
        { id: 'content', name: 'Content' },
        { id: 'technical', name: 'Technical' },
        { id: 'privacy', name: 'Privacy & Security' }
    ];

    const filteredFaqs = faqItems.filter(faq => {
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
        const matchesSearch = searchQuery === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero bar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-800">
                <div className="container-custom py-16 sm:py-20">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h1>
                    <p className="mt-2 max-w-2xl text-indigo-100">
                        Find answers to common questions. Still stuck? Contact our support team.
                    </p>
                    <div className="mt-4">
                        <Link href="#" className="inline-flex items-center px-5 py-2 rounded-md border border-white/80 text-white hover:bg-white/10 transition">
                            Contact support
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container-custom py-6 sm:py-8">

                {/* Search */}
                <div className="max-w-xl mx-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search FAQs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category filters */}
                <div className="mt-12">
                    <div className="flex items-center justify-center flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${activeCategory === category.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQ list */}
                <div className="mt-12">
                    {filteredFaqs.length > 0 ? (
                        <dl className="space-y-8 divide-y divide-gray-200">
                            {filteredFaqs.map((faq, index) => (
                                <div key={index} className="pt-6 md:grid md:grid-cols-12 md:gap-8">
                                    <dt className="text-base font-medium text-gray-900 md:col-span-5">
                                        {faq.question}
                                    </dt>
                                    <dd className="mt-2 md:mt-0 md:col-span-7">
                                        <p className="text-base text-gray-500">
                                            {faq.answer}
                                        </p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    ) : (
                        <div className="text-center py-10">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try adjusting your search or filter to find what you're looking for.
                            </p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveCategory('all');
                                    }}
                                >
                                    Clear filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Still have questions */}
                <div className="mt-16 bg-blue-50 rounded-lg overflow-hidden shadow">
                    <div className="px-6 py-10 lg:py-12">
                        <div className="text-center">
                            <h3 className="text-xl font-medium text-gray-900">Still have questions?</h3>
                            <p className="mt-4 text-base text-gray-500">
                                Can't find the answer you're looking for? Please contact our friendly support team.
                            </p>
                            <div className="mt-6">
                                <a
                                    href="#"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resources */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Getting Started Guide</h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Learn the basics of PathMentor and how to set up your first learning path.
                                        </p>
                                        <a href="#" className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-500">
                                            Read the guide <span aria-hidden="true">&rarr;</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Tutorials & Webinars</h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Watch step-by-step tutorials and webinars on using PathMentor effectively.
                                        </p>
                                        <a href="#" className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-500">
                                            Browse tutorials <span aria-hidden="true">&rarr;</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Blog & Updates</h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Read our latest articles and stay updated on new features and improvements.
                                        </p>
                                        <a href="#" className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-500">
                                            Visit our blog <span aria-hidden="true">&rarr;</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/user/register" className="btn-primary">Get started with PathMentor</Link>
                </div>
            </div>
        </div>
    );
}
