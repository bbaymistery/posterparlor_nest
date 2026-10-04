import { ChevronLeft, ChevronRight } from "lucide-react";

interface PosterPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PosterPagination({
  currentPage,
  totalPages,
  onPageChange,
}: PosterPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-secondary/60 border border-border/40 text-foreground hover:bg-secondary disabled:opacity-40 disabled:hover:bg-secondary transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`h-9 w-9 text-xs font-bold rounded-xl transition-all ${
            currentPage === pageNum
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
              : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          {pageNum}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-secondary/60 border border-border/40 text-foreground hover:bg-secondary disabled:opacity-40 disabled:hover:bg-secondary transition-colors cursor-pointer"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
