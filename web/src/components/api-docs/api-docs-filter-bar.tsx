import { Search } from "lucide-react";
import { ApiModule } from "@/types";

interface ApiDocsFilterBarProps {
  modules: (ApiModule | "All")[];
  selectedModule: string;
  onSelectModule: (module: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
}

export function ApiDocsFilterBar({
  modules,
  selectedModule,
  onSelectModule,
  searchQuery,
  onSearchChange,
  totalResults,
}: ApiDocsFilterBarProps) {
  return (
    <>
      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* Module Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {modules.map((mod) => (
            <button
              key={mod}
              onClick={() => onSelectModule(mod)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                selectedModule === mod
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {mod === "All" ? "All Endpoints" : `${mod} Module`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search endpoint..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs font-medium rounded-lg bg-secondary/50 border border-border/50 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Endpoints Count */}
      <div className="text-xs text-muted-foreground mb-4 font-medium">
        Showing <span className="text-foreground font-bold">{totalResults}</span> API endpoints
      </div>
    </>
  );
}
