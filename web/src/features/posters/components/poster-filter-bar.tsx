"use client";

import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { CategoryWithCount } from "@/store/api/inventory.api";

interface PosterFilterBarProps {
  categories: CategoryWithCount[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  totalResults: number;
}

export function PosterFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  totalResults,
}: PosterFilterBarProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      
      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectCategory("All")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
            selectedCategory === "All"
              ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => (
          <button
            key={cat.category}
            onClick={() => onSelectCategory(cat.category)}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === cat.category
                ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span>{cat.category}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.category
                  ? "bg-black/20 text-black"
                  : "bg-background/60 text-muted-foreground"
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/40">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search poster title or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl bg-secondary/50 border border-border/50 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Count & Sort Selector */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground font-medium">
            Showing <strong className="text-foreground">{totalResults}</strong> posters
          </span>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-amber-500 hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-secondary/60 border border-border/50 text-foreground focus:outline-none focus:border-amber-500/50 transition-colors cursor-pointer"
            >
              <option value="createdAt-desc">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Title: A-Z</option>
              <option value="stock-desc">In Stock First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
