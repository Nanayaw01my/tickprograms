"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "@/hooks/useDebounce";

const CATEGORIES = [
  { slug: "music", name: "Music" },
  { slug: "sports", name: "Sports" },
  { slug: "arts", name: "Arts & Culture" },
  { slug: "food", name: "Food & Drink" },
  { slug: "technology", name: "Technology" },
  { slug: "business", name: "Business" },
  { slug: "education", name: "Education" },
  { slug: "comedy", name: "Comedy" },
];

export function EventSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");

  const updateSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/events?${params.toString()}`);
  }, 300);

  const handleCategoryChange = (slug: string) => {
    const newCategory = selectedCategory === slug ? "" : slug;
    setSelectedCategory(newCategory);
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory) {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`/events?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    router.push("/events");
  };

  const hasFilters = search || selectedCategory;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search events, venues, artists..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateSearch(e.target.value);
          }}
          className="h-14 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
          <Filter className="inline h-4 w-4 mr-1" />
          Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleCategoryChange(cat.slug)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === cat.slug
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex flex-shrink-0 items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
