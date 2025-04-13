import * as admin from "firebase-admin";

// Check if Firebase Admin is already initialized
const apps = admin.apps;

// Log environment variable availability for debugging
if (!process.env.FIREBASE_PROJECT_ID) {
  console.error("FIREBASE_PROJECT_ID is missing in environment variables");
}

// Prepare the service account configuration
const serviceAccountConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Initialize Firebase Admin if it's not already initialized
export const firebaseAdmin =
  apps.length === 0
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccountConfig),
      })
    : apps[0];

// Get Admin SDK Firestore and Auth
export const adminDb = firebaseAdmin!.firestore();
export const adminAuth = firebaseAdmin!.auth();
