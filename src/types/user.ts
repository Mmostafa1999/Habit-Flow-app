import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  photoURL: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
