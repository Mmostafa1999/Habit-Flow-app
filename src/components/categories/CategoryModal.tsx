"use client";

import React, { useState, useEffect } from 'react';
import { CategoryFormData } from '@/types/category';
import { useCategories } from '@/lib/hooks/useCategories';
import { generateRandomColor } from '@/lib/actions/categoryActions';
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/components/common/ConfirmModal';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoryChange?: () => void; // Optional callback when categories change
}

const CategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    onCategoryChange
}) => {
    const { categories, isLoading, isSubscribed, addCategory, updateCategory, removeCategory } = useCategories();
    const [formData, setFormData] = useState<CategoryFormData>({ name: '', color: generateRandomColor() });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ name?: string }>({});
    const [loading, setLoading] = useState(false);
    const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
    const [deletingCategoryName, setDeletingCategoryName] = useState<string>('');

    // Reset form when opening modal
    useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', color: generateRandomColor() });
            setEditingId(null);
            setErrors({});
        }
    }, [isOpen]);

    // Check if we have a properly subscribed listener for categories
    useEffect(() => {
        if (isOpen && !isLoading && !isSubscribed) {
            console.warn("Categories listener not subscribed. Data may not be real-time.");
        }
    }, [isOpen, isLoading, isSubscribed]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, color: e.target.value }));
    };

    const handleRandomColor = () => {
        setFormData(prev => ({ ...prev, color: generateRandomColor() }));
    };

    const checkCategoryExists = (name: string, excludeId?: string): boolean => {
        return categories.some(
            category => category.name.toLowerCase() === name.toLowerCase() && category.id !== excludeId
        );
    };

    const validateForm = (): boolean => {
        const newErrors: { name?: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        } else if (checkCategoryExists(formData.name, editingId || undefined)) {
            newErrors.name = 'Category already exists';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            if (editingId) {
                await updateCategory(editingId, formData);
            } else {
                await addCategory(formData);
            }

            // Reset form after successful submission
            setFormData({ name: '', color: generateRandomColor() });
            setEditingId(null);

            // Notify parent about category changes
            if (onCategoryChange) {
                onCategoryChange();
            }
        } catch (error) {
            console.error('Error saving category:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: string, name: string, color: string) => {
        setEditingId(id);
        setFormData({ name, color });
        setErrors({});
    };

    const openDeleteConfirmation = (id: string, name: string) => {
        setDeletingCategoryId(id);
        setDeletingCategoryName(name);
    };

    const handleConfirmDelete = async () => {
        if (!deletingCategoryId) return;

        setLoading(true);
        try {
            await removeCategory(deletingCategoryId);
            // If currently editing this category, reset the form
            if (editingId === deletingCategoryId) {
                setEditingId(null);
                setFormData({ name: '', color: generateRandomColor() });
            }

            // Notify parent about category changes
            if (onCategoryChange) {
                onCategoryChange();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        } finally {
            setLoading(false);
            setDeletingCategoryId(null);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ name: '', color: generateRandomColor() });
        setErrors({});
    };

    const handleCloseModal = () => {
        // Make sure any pending changes are cleared before closing
        setEditingId(null);
        setFormData({ name: '', color: generateRandomColor() });
        setErrors({});
        onClose();

        // Notify parent about category changes
        if (onCategoryChange) {
            onCategoryChange();
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Manage Categories</h2>
                        <button
                            onClick={handleCloseModal}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Close modal"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#E50046]/20 focus:border-[#E50046]'
                                        }`}
                                    placeholder="Enter category name"
                                    disabled={loading}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Color
                                </label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        id="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleColorChange}
                                        className="h-10 w-10 border-0 p-0 cursor-pointer rounded"
                                        disabled={loading}
                                    />
                                    <div
                                        className="flex-1 h-10 rounded-md"
                                        style={{ backgroundColor: formData.color }}
                                    ></div>
                                    <button
                                        type="button"
                                        onClick={handleRandomColor}
                                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm text-gray-700 transition-colors"
                                        disabled={loading}
                                    >
                                        Random
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className={`px-4 py-2 rounded-md text-white transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E50046] hover:bg-[#d81b60]'
                                        }`}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : editingId ? 'Update Category' : 'Add Category'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">
                                Your Categories {isLoading && <span className="text-sm text-gray-400">(Loading...)</span>}
                            </h3>
                            {categories.length === 0 ? (
                                <p className="text-gray-500 italic">
                                    {isLoading ? 'Loading categories...' : 'No categories yet. Add one above.'}
                                </p>
                            ) : (
                                <ul className="space-y-2 max-h-64 overflow-y-auto">
                                    {categories.map(category => (
                                        <li
                                            key={category.id}
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-5 h-5 rounded-full"
                                                    style={{ backgroundColor: category.color }}
                                                ></div>
                                                <span className="font-medium">{category.name}</span>
                                            </div>
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => handleEdit(category.id, category.name, category.color)}
                                                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                                                    aria-label={`Edit ${category.name}`}
                                                    disabled={loading}
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirmation(category.id, category.name)}
                                                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                                    aria-label={`Delete ${category.name}`}
                                                    disabled={loading}
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={!!deletingCategoryId}
                onClose={() => setDeletingCategoryId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Category"
                description={`Are you sure you want to delete the category "${deletingCategoryName}"? This action cannot be undone.`}
                confirmText="Yes, delete"
                cancelText="Cancel"
                icon={
                    <TrashIcon className="mx-auto mb-4 w-12 h-12 text-red-500" />
                }
            />
        </>
    );
};

export default CategoryModal; 