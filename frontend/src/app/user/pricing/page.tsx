"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState('monthly');

    const plans = [
        {
            name: 'Free',
            price: billingCycle === 'monthly' ? '$0' : '$0',
            description: 'Basic access to learning paths',
            features: [
                'Access to 5 learning paths',
                'Basic progress tracking',
                'Community forum access',
                'Limited AI assistance'
            ],
            isPopular: false,
            buttonText: 'Get Started',
            buttonVariant: 'outline'
        },
        {
            name: 'Pro',
            price: billingCycle === 'monthly' ? '$14.99' : '$149.90',
            description: 'Enhanced learning with advanced features',
            features: [
                'Unlimited learning paths',
                'Advanced progress analytics',
                'Priority community support',
                'Full AI learning assistant access',
                'Study group creation',
                'Custom learning path creation'
            ],
            isPopular: true,
            buttonText: 'Subscribe',
            buttonVariant: 'solid'
        },
        {
            name: 'Enterprise',
            price: billingCycle === 'monthly' ? '$49.99' : '$499.90',
            description: 'Team-based learning for organizations',
            features: [
                'Everything in Pro plan',
                'Team management dashboard',
                'Custom organization paths',
                'Learning analytics for teams',
                'API access',
                'Dedicated support manager',
                'Single sign-on (SSO)'
            ],
            isPopular: false,
            buttonText: 'Contact Sales',
            buttonVariant: 'outline'
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero bar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-800">
                <div className="container-custom py-16 sm:py-24">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Choose the right plan for your journey</h1>
                    <p className="mt-2 max-w-2xl text-indigo-100">Start for free, then upgrade to unlock premium features that accelerate your learning.</p>
                </div>
            </div>

            <div className="container-custom py-6 sm:py-8">

                <div className="mt-12 flex justify-center">
                    <div className="relative bg-white rounded-lg p-0.5 flex">
                        <button
                            type="button"
                            className={`relative py-2 px-6 border border-transparent rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto ${billingCycle === 'monthly'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700'
                                }`}
                            onClick={() => setBillingCycle('monthly')}
                        >
                            Monthly billing
                        </button>
                        <button
                            type="button"
                            className={`ml-0.5 relative py-2 px-6 border border-transparent rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto ${billingCycle === 'annually'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700'
                                }`}
                            onClick={() => setBillingCycle('annually')}
                        >
                            Annual billing
                            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${plan.isPopular ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
                                }`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-blue-500 rounded-full text-xs font-semibold uppercase tracking-wide text-white">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-5">
                                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                <p className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                    {plan.name !== 'Free' && (
                                        <span className="ml-1 text-xl font-semibold text-gray-500">
                                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                                        </span>
                                    )}
                                </p>
                                <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                            </div>

                            <div className="flex-1">
                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-sm font-medium text-gray-900">What's included</h4>
                                    <ul className="mt-4 space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <svg
                                                        className="h-5 w-5 text-green-500"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="ml-3 text-sm text-gray-700">{feature}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${plan.buttonVariant === 'solid'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    {plan.buttonText}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-8">
                        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                        <dl className="mt-6 space-y-6 divide-y divide-gray-200">
                            <div className="pt-6">
                                <dt className="text-lg font-medium text-gray-900">
                                    Can I change plans later?
                                </dt>
                                <dd className="mt-2 text-base text-gray-500">
                                    Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings.
                                </dd>
                            </div>
                            <div className="pt-6">
                                <dt className="text-lg font-medium text-gray-900">
                                    Is there a free trial for paid plans?
                                </dt>
                                <dd className="mt-2 text-base text-gray-500">
                                    Yes, all paid plans come with a 14-day free trial so you can experience all features before committing.
                                </dd>
                            </div>
                            <div className="pt-6">
                                <dt className="text-lg font-medium text-gray-900">
                                    What payment methods do you accept?
                                </dt>
                                <dd className="mt-2 text-base text-gray-500">
                                    We accept all major credit cards, PayPal, and in some regions, bank transfers for Enterprise plans.
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Ready to accelerate your learning?</h2>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <Link href="/user/register" className="btn-primary">Get started now</Link>
                        <Link href="/user/about" className="btn-outline">Learn more</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
