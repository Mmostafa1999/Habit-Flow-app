"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { UserProfile } from "@/types/user";
import ImageUpload from "./ImageUpload";
import { uploadImageToCloudinary } from "@/lib/cloudinary/uploadImage";
import { useRouter } from "next/navigation";
import { Save, Mail, User as UserIcon } from "lucide-react";

interface ProfileFormProps {
    profile: UserProfile | null;
    isLoading: boolean;
    onUpdateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
}

const ProfileForm = ({ profile, isLoading, onUpdateProfile }: ProfileFormProps) => {
    const [username, setUsername] = useState(profile?.username || "");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleImageSelected = (file: File) => {
        setSelectedImage(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSaving) return;

        // Validate form data
        if (!username.trim()) {
            toast.error("Username cannot be empty");
            return;
        }

        setIsSaving(true);

        try {
            const updates: Partial<UserProfile> = {
                username: username.trim()
            };

            // Upload image if one was selected
            if (selectedImage) {
                const uploadResult = await uploadImageToCloudinary(selectedImage);

                if (uploadResult.error) {
                    throw new Error(uploadResult.error);
                }

                if (uploadResult.secure_url) {
                    updates.photoURL = uploadResult.secure_url;
                }
            }

            // Update the profile
            const updatedProfile = await onUpdateProfile(updates);

            if (updatedProfile) {
                toast.success("Profile updated successfully");
                router.push("/dashboard");
                setSelectedImage(null); // Reset selected image after successful upload
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error instanceof Error ? error.message : "An error occurred while updating your profile");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Profile picture upload */}
                <div className="w-full md:w-auto flex justify-center">
                    <ImageUpload
                        currentImage={profile?.photoURL || null}
                        onImageSelected={handleImageSelected}
                    />
                </div>

                {/* Form fields */}
                <div className="flex-1 w-full space-y-6">
                    {/* Username field */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                        >
                            <UserIcon size={16} className="text-gray-400" />
                            Username
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50046] focus:border-transparent transition-colors"
                                placeholder="Your username"
                                disabled={isLoading || isSaving}
                                aria-required="true"
                            />
                        </div>
                    </div>

                    {/* Email field (non-editable) */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                        >
                            <Mail size={16} className="text-gray-400" />
                            Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={profile?.email || ""}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
                                disabled
                                aria-readonly="true"
                            />
                            <p className="mt-1.5 text-xs text-gray-500">
                                Email address cannot be changed
                            </p>
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#E50046] text-white py-3 px-6 rounded-lg hover:bg-[#CC0040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E50046] focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isLoading || isSaving}
                            aria-label="Save Profile Changes"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ProfileForm; 