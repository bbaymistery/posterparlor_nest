"use client";

import { useState } from "react";
import {
  useGetAllInventoryQuery,
  useGetAllFiltersQuery,
} from "@/store/api/inventory.api";
import {
  PosterCard,
  PosterFilterBar,
  PosterGridSkeleton,
  PosterPagination,
} from "@/features/posters/components";
import { Sparkles, PackageSearch } from "lucide-react";

export default function CatalogPage() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt-desc");

  // Parse sortBy into field and order
  const [sortField, sortOrder] = sortBy.split("-") as [
    "price" | "stock" | "createdAt" | "title",
    "asc" | "desc"
  ];

  // Fetch available categories and filter counts
  const { data: filtersData } = useGetAllFiltersQuery();
  const categoriesList = filtersData?.data?.categories || [];

  // Fetch Posters with active filters and pagination
  const {
    data: inventoryData,
    isLoading,
    isFetching,
  } = useGetAllInventoryQuery({
    page,
    limit: 8,
    filters: {
      category: selectedCategory === "All" ? undefined : selectedCategory,
      search: searchQuery.trim() !== "" ? searchQuery : undefined,
      sortBy: sortField,
      sortOrder: sortOrder,
    },
  });

  const posters = inventoryData?.data?.posters || [];
  const pagination = inventoryData?.data?.pagination;

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>Curated Poster Collection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Poster Catalog
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Explore high-definition futuristic, anime, movie, and vintage art prints delivered directly to your door.
        </p>
      </div>

      {/* Filter Toolbar */}
      <PosterFilterBar
        categories={categoriesList}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalResults={pagination?.total || posters.length}
      />

      {/* Posters Grid / Loading Skeleton / Empty State */}
      {isLoading || isFetching ? (
        <PosterGridSkeleton count={8} />
      ) : posters.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl bg-card border border-border/40 my-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4 border border-amber-500/20">
            <PackageSearch className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            No Posters Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mb-6">
            We couldn&apos;t find any posters matching your search criteria. Try clearing your filters or searching for different keywords.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posters.map((poster) => (
            <PosterCard key={poster._id} poster={poster} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && (
        <PosterPagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
