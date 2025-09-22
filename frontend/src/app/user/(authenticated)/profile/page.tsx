'use client';

import ProfileCard from '@/components/user/Profile/ProfileCard';
import PreferencesCard from '@/components/user/Profile/PreferencesCard';
import SubscriptionCard from '@/components/user/Profile/SubscriptionCard';
import NotificationsCard from '@/components/user/Profile/NotificationsCard';
import PageHeader from '@/components/user/shared/PageHeader';

export default function ProfilePage() {
    return (
        <div className="container-custom py-6 sm:py-8">
            <PageHeader title="Profile" subtitle="Manage your account settings and preferences" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <ProfileCard />
                    <SubscriptionCard />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <PreferencesCard />
                    <NotificationsCard />

                    <div className="p-6 border border-red-300 bg-red-50 rounded-xl">
                        <h3 className="text-lg font-medium text-red-800 mb-2">Danger Zone</h3>
                        <p className="text-sm text-red-600 mb-4">
                            The following actions are destructive and cannot be undone. Please proceed with caution.
                        </p>
                        <div className="space-y-3">
                            <button className="w-full py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-100">
                                Download All My Data
                            </button>
                            <button className="w-full py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-100">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
