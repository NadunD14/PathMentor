'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import PublicHeader from '@/components/user/shared/PublicHeader';
import PublicFooter from '@/components/user/shared/PublicFooter';

export default function HomePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // If user is logged in, redirect to dashboard
        if (user) {
            router.push('/user/dashboard');
        }
        setMounted(true);
    }, [user, router]);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
            <PublicHeader />

            {/* Hero section */}
            <section className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 py-16 md:py-24 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

                <div className="container-custom relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="animate-fadeIn">
                            <h1 className="heading-lg mb-4 leading-tight">
                                Master New Skills with<br />
                                <span className="text-blue-600 relative">
                                    Personalized Learning
                                    <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 transform origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></span>
                                </span>
                            </h1>
                            <p className="text-body mb-8 max-w-xl leading-relaxed">
                                Discover your perfect learning path with our AI-powered platform.
                                Whether you're into video editing, programming, or graphic design
                                - we've got you covered with customized learning experiences.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/user/register"
                                    className="btn-primary flex items-center justify-center transform hover:scale-105 transition-all"
                                >
                                    <span>Get Started</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/user/pricing"
                                    className="btn-secondary flex items-center justify-center transform hover:scale-105 transition-all"
                                >
                                    <span>View Pricing</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                        <div className="flex justify-center animate-fadeInDelayed">
                            <div className="relative w-full max-w-md transform hover:scale-105 transition-transform duration-500 ease-in-out">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-2xl opacity-20 blur-lg -m-2"></div>
                                <img
                                    src="/window.svg"
                                    alt="PathMentor Learning Platform"
                                    className="relative w-full rounded-lg shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Choose Your Learning Path section */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="heading-md mb-4 inline-block relative">
                            Choose Your Learning Path
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-600 rounded-full"></div>
                        </h2>
                        <p className="text-body mb-0 max-w-3xl mx-auto">
                            Explore our specialized courses designed to help you master the skills that matter most
                            in today's digital world.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card border-t-4 border-red-500 hover:-translate-y-2 group">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="heading-sm mb-3">Video Editing</h3>
                            <p className="text-gray-600 mb-6">
                                Create stunning videos for YouTube, social media, or professional projects
                                with industry-standard tools and techniques.
                            </p>
                            <Link
                                href="/user/learn-more"
                                className="text-blue-600 font-medium flex items-center group-hover:text-blue-800 transition-colors"
                            >
                                <span className="mr-2">Learn More</span>
                                <span className="transform transition-transform group-hover:translate-x-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </Link>
                        </div>

                        <div className="card border-t-4 border-green-500 hover:-translate-y-2 group">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <h3 className="heading-sm mb-3">Programming</h3>
                            <p className="text-gray-600 mb-6">
                                Build web applications, mobile apps, or dive into data science with hands-on
                                coding projects and real-world examples.
                            </p>
                            <Link
                                href="/user/learn-more"
                                className="text-blue-600 font-medium flex items-center group-hover:text-blue-800 transition-colors"
                            >
                                <span className="mr-2">Learn More</span>
                                <span className="transform transition-transform group-hover:translate-x-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </Link>
                        </div>

                        <div className="card border-t-4 border-purple-500 hover:-translate-y-2 group">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="heading-sm mb-3">Graphic Design</h3>
                            <p className="text-gray-600 mb-6">
                                Design beautiful logos, websites, and marketing materials using professional
                                design principles and software.
                            </p>
                            <Link
                                href="/user/learn-more"
                                className="text-blue-600 font-medium flex items-center group-hover:text-blue-800 transition-colors"
                            >
                                <span className="mr-2">Learn More</span>
                                <span className="transform transition-transform group-hover:translate-x-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>            {/* CTA section */}
            <section className="relative py-20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 skew-y-2"></div>
                <div className="relative z-10 container-custom text-center">
                    <div className="max-w-4xl mx-auto px-4 py-16 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Start Your Learning Journey?</h2>
                        <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
                            Join thousands of learners who have transformed their careers with our personalized approach.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link
                                href="/user/register"
                                className="px-8 py-4 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transform hover:scale-105 transition-all shadow-lg"
                            >
                                Register Now
                            </Link>
                            <Link
                                href="/user/login"
                                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-md font-medium hover:bg-white/20 transform hover:scale-105 transition-all"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
