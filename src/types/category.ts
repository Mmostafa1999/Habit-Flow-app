import { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface CategoryFormData {
  name: string;
  color: string;
}

export interface CategoryUpdateData extends Partial<CategoryFormData> {
  // Any additional fields for updates can be added here
}
