import { useState, useEffect, FormEvent, useRef } from "react";
import { Habit } from "@/types/habit";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "react-toastify";
import { FirebaseError } from "firebase/app";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { createCategory } from "@/lib/firebase/categories";

// Import custom CSS
import "../../styles/CustomScrollbar.css";

// Import constants
import { FREQUENCIES, Frequency } from "@/constants/habit";

// Import UI components
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { WeekDaySelector } from "@/components/ui/WeekDaySelector";
import { PlusIcon } from "@heroicons/react/24/outline";

interface HabitFormProps {
    initialData?: Partial<Habit>;
    onSubmit: (data: Omit<Habit, "id" | "userId" | "createdAt" | "completedDates">) => void;
    onCancel: () => void;
}

export default function HabitForm({ initialData, onSubmit, onCancel }: HabitFormProps) {
    const { user } = useAuth();
    const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState("");
    const newCategoryInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        frequency: "daily" as Frequency,
        targetDays: 1,
        color: "#E50046",
        icon: "🏃",
        weeklyDays: [] as string[],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

    // Fetch categories from Firestore
    const fetchCategories = async () => {
        if (!user) return;

        setIsLoadingCategories(true);
        try {
            // Get unique categories from habits collection
            const habitsQuery = query(
                collection(db, "habits"),
                where("userId", "==", user.uid)
            );
            const habitsSnapshot = await getDocs(habitsQuery);

            // Extract unique categories from habits
            const uniqueCategories = new Set<string>();
            habitsSnapshot.forEach(doc => {
                const habit = doc.data();
                if (habit.category) {
                    uniqueCategories.add(habit.category);
                }
            });

            // Get categories from dedicated categories collection
            const categoriesQuery = query(
                collection(db, "categories"),
                where("userId", "==", user.uid),
                orderBy("name", "asc")
            );
            const categoriesSnapshot = await getDocs(categoriesQuery);

            // Combine both sources
            categoriesSnapshot.forEach(doc => {
                const category = doc.data();
                if (category.name) {
                    uniqueCategories.add(category.name);
                }
            });

            // Transform to format needed for SelectField
            const formattedCategories = Array.from(uniqueCategories).sort().map(category => ({
                value: category,
                label: category
            }));

            setCategories(formattedCategories);

            // Set default category if none selected yet
            if (!formData.category && formattedCategories.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    category: formattedCategories[0].value
                }));
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load categories");
        } finally {
            setIsLoadingCategories(false);
        }
    };

    // Initial fetch of categories
    useEffect(() => {
        fetchCategories();
    }, [user]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name ?? "",
                category: initialData.category ?? "",
                frequency: (initialData.frequency ?? "daily") as Frequency,
                targetDays: initialData.targetDays ?? 1,
                color: initialData.color ?? "#E50046",
                icon: initialData.icon ?? "🏃",
                weeklyDays: initialData.weeklyDays ?? [],
            });
        }
    }, [initialData]);

    // Focus the new category input when adding a category
    useEffect(() => {
        if (isAddingCategory && newCategoryInputRef.current) {
            newCategoryInputRef.current.focus();
        }
    }, [isAddingCategory]);

    // Auto-update targetDays when weeklyDays changes for weekly frequency
    useEffect(() => {
        if (formData.frequency === 'weekly' && formData.weeklyDays.length > 0) {
            setFormData(prev => ({
                ...prev,
                targetDays: Math.min(prev.weeklyDays.length, prev.targetDays || 1)
            }));
        }
    }, [formData.frequency, formData.weeklyDays]);

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Habit name is required";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Habit name must be at least 2 characters";
        }

        if (!formData.category) {
            newErrors.category = "Category is required";
        }

        const maxDays = formData.frequency === "daily" ? 7 :
            formData.frequency === "weekly" ? 7 : 31;

        if (formData.targetDays < 1 || formData.targetDays > maxDays) {
            newErrors.targetDays = `Target days must be between 1 and ${maxDays}`;
        }

        if (!/\p{Emoji}/u.test(formData.icon)) {
            newErrors.icon = "Please enter a valid emoji";
        }

        if (formData.frequency === "weekly" && formData.weeklyDays.length === 0) {
            newErrors.weeklyDays = "Please select at least one day";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (name: keyof typeof formData, value: string | number | string[]) => {
        setFormData(prev => ({
            ...prev,
            [name]: name === "targetDays" ? parseInt(value.toString(), 10) || 1 : value,
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        handleChange(name as keyof typeof formData, value);
    };

    const handleWeeklyDaysChange = (days: string[]) => {
        handleChange('weeklyDays', days);
    };

    const handleIconChange = (emoji: string) => {
        handleChange('icon', emoji);
    };

    const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCategory(e.target.value);
        setCategoryError("");
    };

    const checkCategoryExists = (name: string): boolean => {
        return categories.some(
            category => category.value.toLowerCase() === name.toLowerCase()
        );
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            setCategoryError("Category name is required");
            return;
        }

        if (checkCategoryExists(newCategory.trim())) {
            setCategoryError("Category already exists");
            return;
        }

        if (!user) {
            toast.error("You must be logged in to add categories");
            return;
        }

        setIsSubmitting(true);

        try {
            // Add to Firestore
            await createCategory({
                userId: user.uid,
                name: newCategory.trim(),
                color: formData.color,
            });

            // Update local state
            const newCategoryObj = {
                value: newCategory.trim(),
                label: newCategory.trim()
            };

            setCategories(prev => [...prev, newCategoryObj].sort((a, b) => a.label.localeCompare(b.label)));

            // Select the new category
            setFormData(prev => ({
                ...prev,
                category: newCategory.trim()
            }));

            // Reset
            setNewCategory("");
            setIsAddingCategory(false);
            toast.success("Category added successfully!");
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error("Failed to add category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelAddCategory = () => {
        setIsAddingCategory(false);
        setNewCategory("");
        setCategoryError("");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!user) {
            toast.error("You must be logged in to create habits");
            return;
        }

        setIsSubmitting(true);

        try {
            const dataToSubmit = {
                name: formData.name,
                category: formData.category,
                frequency: formData.frequency,
                targetDays: formData.targetDays,
                color: formData.color,
                icon: formData.icon,
                ...(formData.frequency === "weekly" ? { weeklyDays: formData.weeklyDays } : { weeklyDays: [] }),
            };

            onSubmit(dataToSubmit);
        } catch (error) {
            const message = error instanceof FirebaseError ? error.message : "Failed to save habit";
            toast.error(`Error: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto max-h-[90vh] flex flex-col"
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                {initialData?.id ? "Edit Habit" : "Create a New Habit"}
            </h2>

            <div className="space-y-5 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                {/* Name */}
                <InputField
                    id="name"
                    name="name"
                    type="text"
                    label="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Exercise, Read, Meditate..."
                    required
                    error={errors.name}
                />

                {/* Category */}
                {isAddingCategory ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Category
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                ref={newCategoryInputRef}
                                type="text"
                                value={newCategory}
                                onChange={handleNewCategoryChange}
                                placeholder="Enter category name"
                                className={`block flex-1 w-full px-3 py-2 rounded-md border ${categoryError ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                disabled={isSubmitting}
                                className="px-3 py-2 text-sm bg-[#E50046] text-white rounded-md hover:bg-pink-700 disabled:opacity-60"
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelAddCategory}
                                className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                        {categoryError && <p className="text-red-500 text-xs mt-1">{categoryError}</p>}
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsAddingCategory(true)}
                                className="text-sm text-[#E50046] flex items-center font-bold hover:text-pink-700"
                            >
                                <PlusIcon className="w-3 h-3 mr-1" /> Add New
                            </button>
                        </div>
                        <SelectField
                            id="category"
                            name="category"
                            label=""
                            options={isLoadingCategories ? [{ value: "", label: "Loading..." }] : categories}
                            value={formData.category}
                            onChange={handleInputChange}
                            error={errors.category}
                        />
                    </div>
                )}

                {/* Frequency */}
                <SelectField
                    id="frequency"
                    name="frequency"
                    label="Frequency"
                    options={FREQUENCIES.map(freq => ({
                        value: freq,
                        label: freq.charAt(0).toUpperCase() + freq.slice(1)
                    }))}
                    value={formData.frequency}
                    onChange={handleInputChange}
                />

                {/* Weekly Days */}
                {formData.frequency === "weekly" && (
                    <>
                        <WeekDaySelector
                            selectedDays={formData.weeklyDays}
                            onChange={handleWeeklyDaysChange}
                            error={errors.weeklyDays}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            e.g. You can select days like Mon, Wed, Fri and set a goal of completing 2 out of 3.
                        </p>
                    </>
                )}

                {/* Target Days */}
                <InputField
                    id="targetDays"
                    name="targetDays"
                    type="number"
                    label="Target Days"
                    value={formData.targetDays.toString()}
                    onChange={handleInputChange}
                    min={1}
                    max={formData.frequency === "daily" ? 7 : formData.frequency === "weekly" ? formData.weeklyDays.length || 7 : 31}
                    error={errors.targetDays}
                    helperText={formData.frequency === "weekly" ? `Complete ${formData.targetDays} out of ${formData.weeklyDays.length} selected days` : undefined}
                />

                {/* Color Picker */}
                <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className="w-10 h-10 rounded-md border border-gray-300"
                        />
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: formData.color }} />
                    </div>
                </div>

                {/* Icon */}
                <EmojiPicker
                    id="icon"
                    label="Icon"
                    value={formData.icon}
                    onChange={handleIconChange}
                    error={errors.icon}
                    helperText="Choose an emoji to represent your habit"
                />
            </div>

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-60"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm text-white bg-[#E50046] rounded-md hover:bg-pink-700 disabled:opacity-60"
                >
                    {isSubmitting ? "Saving..." : initialData?.id ? "Update Habit" : "Create Habit"}
                </button>
            </div>
        </motion.form>
    );
}
