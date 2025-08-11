'use client';

import { useState } from 'react';
import Card from '@/components/user/shared-authenticated/Card';
import { useUserStore } from '@/lib/store/useUserStore';

export default function SubscriptionCard() {
    const { subscriptionStatus, setSubscriptionStatus } = useUserStore();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const subscriptionPlans = [
        {
            id: 'free',
            name: 'Free',
            price: '$0',
            description: 'Basic access to learning resources',
            features: [
                'Access to basic courses',
                'Limited progress tracking',
                'Community access',
            ],
            limitations: [
                'No AI personalization',
                'Limited content library',
                'No priority support',
            ],
        },
        {
            id: 'basic',
            name: 'Basic',
            price: '$9.99',
            period: 'monthly',
            description: 'Unlock more learning tools',
            features: [
                'Full access to courses',
                'Complete progress tracking',
                'Basic AI recommendations',
                'Priority community support',
            ],
            limitations: [
                'Limited AI personalization',
            ],
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '$19.99',
            period: 'monthly',
            description: 'Full AI-powered experience',
            features: [
                'Everything in Basic plan',
                'Advanced AI personalization',
                'Exclusive premium courses',
                '24/7 priority support',
                'Offline learning',
            ],
            limitations: [],
        },
    ];

    const currentPlan = subscriptionPlans.find(plan => plan.id === subscriptionStatus) || subscriptionPlans[0];

    return (
        <>
            <Card title="Subscription">
                <div className="mb-4">
                    <div className="flex items-center mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                            {currentPlan.name} Plan
                        </h3>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${subscriptionStatus === 'premium'
                            ? 'bg-purple-100 text-purple-800'
                            : subscriptionStatus === 'basic'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {subscriptionStatus === 'free' ? 'Current' : 'Active'}
                        </span>
                    </div>

                    <p className="text-2xl font-bold mb-1">
                        {currentPlan.price}
                        {currentPlan.period && <span className="text-sm text-gray-500 font-normal">/{currentPlan.period}</span>}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">{currentPlan.description}</p>

                    <div className="space-y-2">
                        {currentPlan.features.map((feature, index) => (
                            <div key={index} className="flex items-center">
                                <svg className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {currentPlan.limitations.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {currentPlan.limitations.map((limitation, index) => (
                                <div key={index} className="flex items-center text-gray-500">
                                    <svg className="h-4 w-4 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">{limitation}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {subscriptionStatus !== 'premium' && (
                    <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Upgrade Subscription
                    </button>
                )}

                {subscriptionStatus !== 'free' && (
                    <p className="mt-3 text-xs text-gray-500 text-center">
                        Your subscription will renew on September 11, 2025.
                    </p>
                )}
            </Card>

            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold">Upgrade Your Subscription</h3>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {subscriptionPlans
                                .filter(plan => plan.id !== 'free' && plan.id !== subscriptionStatus)
                                .map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer"
                                        onClick={() => {
                                            setSubscriptionStatus(plan.id as 'free' | 'basic' | 'premium');
                                            setShowUpgradeModal(false);
                                        }}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold">{plan.name} Plan</h4>
                                            <span className="text-lg font-bold">
                                                {plan.price}
                                                <span className="text-sm text-gray-500 font-normal">/{plan.period}</span>
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

                                        <ul className="space-y-1">
                                            {plan.features.slice(0, 3).map((feature, index) => (
                                                <li key={index} className="flex items-center text-sm">
                                                    <svg className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                            {plan.features.length > 3 && (
                                                <li className="text-sm text-blue-600">+{plan.features.length - 3} more features</li>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                        </div>

                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="mt-4 w-full py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
