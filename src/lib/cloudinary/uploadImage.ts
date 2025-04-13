/**
 * Utility for uploading images to Cloudinary
 */

interface UploadResponse {
  secure_url: string;
  public_id: string;
  error?: string;
}

export const uploadImageToCloudinary = async (
  file: File,
): Promise<UploadResponse> => {
  try {
    // Create a FormData instance for uploading
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
    );
    formData.append(
      "cloud_name",
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    );

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to upload image");
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);

    // Return a structured error
    return {
      secure_url: "",
      public_id: "",
      error:
        error instanceof Error ? error.message : "Unknown error during upload",
    };
  }
};
