"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { Camera, Upload, UserCircle } from "lucide-react";
import { toast } from "react-toastify";

interface ImageUploadProps {
    currentImage: string | null;
    onImageSelected: (file: File) => void;
}

const ImageUpload = ({ currentImage, onImageSelected }: ImageUploadProps) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size should be less than 2MB");
            return;
        }

        // Create a preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Notify parent component
        onImageSelected(file);

        // Clean up the object URL when component unmounts
        return () => URL.revokeObjectURL(objectUrl);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];

            // Validate the dropped file
            if (!file.type.startsWith("image/")) {
                toast.error("Please drop an image file");
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image size should be less than 2MB");
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            onImageSelected(file);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div
                className={`
                    relative w-36 h-36 mb-4 cursor-pointer 
                    transition-all duration-300 ease-in-out
                    ${isDragging ? 'scale-105 ring-4 ring-[#E50046] ring-opacity-50' : ''}
                `}
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload profile image"
            >
                {previewUrl ? (
                    <div className="relative w-full h-full rounded-full overflow-hidden shadow-md">
                        <Image
                            src={previewUrl}
                            alt="Profile"
                            fill
                            sizes="144px"
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                        <UserCircle className="w-36 h-36 text-gray-300" />
                    </div>
                )}

                {/* Camera icon overlay */}
                <div className="absolute bottom-0 right-0 bg-[#E50046] text-white p-2 rounded-full shadow-md transform transition-transform hover:scale-110">
                    <Camera className="w-5 h-5" />
                </div>

                {/* Drag overlay effect */}
                <div className={`
                    absolute inset-0 bg-black bg-opacity-40 rounded-full 
                    flex flex-col items-center justify-center
                    transition-opacity duration-200
                    ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}
                `}>
                    <Upload className="w-8 h-8 text-white mb-1" />
                    {isDragging && <span className="text-white text-xs font-medium">Drop image</span>}
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-1">
                Upload your photo
            </p>
            <p className="text-xs text-gray-500">
                JPG, PNG or GIF (max. 2MB)
            </p>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                aria-label="Upload profile picture"
            />
        </div>
    );
};

export default ImageUpload; 