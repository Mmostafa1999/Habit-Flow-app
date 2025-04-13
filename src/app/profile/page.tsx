"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import PageTransition from "@/components/common/PageTransition";
import LoadingScreen from "@/components/common/LoadingScreen";
import ProfileForm from "@/components/profile/ProfileForm";
import { User, AlertCircle } from "lucide-react";

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const { profile, isLoading: profileLoading, error, updateProfile } = useProfile();
    const router = useRouter();

    useEffect(() => {
        // Redirect to login if not authenticated after auth state is known
        if (!authLoading && !user) {
            router.push("/");
        }

        // Redirect to verify email if not verified
        if (user && !user.emailVerified) {
            router.push("/verify-email");
        }
    }, [user, authLoading, router]);

    // Show loading while auth or profile data is loading
    if (authLoading || profileLoading) {
        return <LoadingScreen />;
    }

    // Don't render anything if user is not authenticated (will redirect)
    if (!user) {
        return null;
    }

    return (
        <PageTransition>
            <div className="w-full max-w-5xl mx-auto px-4 py-8">
                {/* Profile Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
                            aria-label="Back to Dashboard"
                        >
                            <span className="hidden sm:inline">Back to Dashboard</span>
                        </button>
                    </div>
                    <p className="text-gray-600 mt-2">
                        Manage your personal information and profile settings
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 sm:p-8">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-start gap-3">
                                        <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <ProfileForm
                                    profile={profile}
                                    isLoading={profileLoading}
                                    onUpdateProfile={updateProfile}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Account Info Card */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <User className="h-5 w-5 text-[#E50046]" />
                                <h2 className="text-lg font-semibold">Account Information</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{profile?.email || user.email}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Account Created</p>
                                    <p className="font-medium">
                                        {user.metadata?.creationTime
                                            ? new Date(user.metadata.creationTime).toLocaleDateString()
                                            : "Not available"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Email Verification</p>
                                    <div className={`flex items-center mt-1 ${user.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.emailVerified ? 'bg-green-600' : 'bg-amber-600'}`}></span>
                                        <span>{user.emailVerified ? 'Verified' : 'Not Verified'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips Card */}
                        <div className="bg-gradient-to-br from-[#E50046] to-[#FF4D7D] text-white rounded-xl shadow-sm mt-6 p-6">
                            <h3 className="text-lg font-semibold mb-3">Profile Tips</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="inline-block h-5 w-5 rounded-full bg-white bg-opacity-20 flex-shrink-0 text-center leading-5">✓</span>
                                    <span>Add a profile picture to personalize your account</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="inline-block h-5 w-5 rounded-full bg-white bg-opacity-20 flex-shrink-0 text-center leading-5">✓</span>
                                    <span>Choose a username that reflects your identity</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
} 