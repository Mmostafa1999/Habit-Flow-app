"use client";

import React from 'react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onManageCategories?: () => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onManageCategories
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Categories</h3>
        {onManageCategories && (
          <button
            onClick={onManageCategories}
            className="text-sm text-[#E50046] hover:text-[#d81b60] transition-colors flex items-center"
            aria-label="Manage categories"
          >
            <span>Manage Categories</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-full text-sm transition-colors flex items-center ${selectedCategory === null
            ? 'bg-[#E50046] text-white'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          aria-label="Show all categories"
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm transition-colors flex items-center ${selectedCategory === category.id
              ? 'bg-[#E50046] text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            aria-label={`Filter by ${category.name} category`}
          >
            <span
              className="w-3 h-3 rounded-full inline-block mr-2"
              style={{ backgroundColor: category.color || '#E50046' }}
            />
            {category.name}
          </button>
        ))}

        {categories.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            No categories yet. Create one by clicking &quot;Manage Categories&quot;.
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter; 