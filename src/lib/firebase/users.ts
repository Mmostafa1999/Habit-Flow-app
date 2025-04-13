import { UserProfile } from "@/types/user";
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Collection reference
const usersCollection = collection(db, "users");

// Get a user profile by ID
export const getUserProfile = async (
  userId: string,
): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(usersCollection, userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Create or update a user profile
export const createOrUpdateUserProfile = async (
  userId: string,
  userData: Partial<UserProfile>,
) => {
  try {
    const userDocRef = doc(usersCollection, userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userDocRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });
      return { id: userId, ...userDoc.data(), ...userData } as UserProfile;
    } else {
      // Create new user
      const newUserData = {
        ...userData,
        id: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, newUserData);
      return newUserData as UserProfile;
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Update specific fields in a user profile
export const updateUserProfile = async (
  userId: string,
  userData: Partial<UserProfile>,
) => {
  try {
    const userDocRef = doc(usersCollection, userId);
    await updateDoc(userDocRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
