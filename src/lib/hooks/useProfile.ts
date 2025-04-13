import {
  createOrUpdateUserProfile,
  getUserProfile,
} from "@/lib/firebase/users";
import { UserProfile } from "@/types/user";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile when auth user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try to get existing profile
        let userProfile = await getUserProfile(user.uid);

        // If no profile exists, create one from Firebase Auth data
        if (!userProfile) {
          userProfile = await createOrUpdateUserProfile(user.uid, {
            email: user.email || "",
            username: user.displayName || "",
            photoURL: user.photoURL || "",
          });
        }

        setProfile(userProfile);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      await createOrUpdateUserProfile(user.uid, data);
      const updatedProfile = await getUserProfile(user.uid);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
  };
};
