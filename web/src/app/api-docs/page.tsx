"use client";

import { useState } from "react";
import { API_ENDPOINTS, API_MODULES } from "@/lib/constants";
import {
  ApiDocsHeader,
  ApiDocsFilterBar,
  ApiEndpointCard,
} from "@/components/api-docs";

export default function ApiDocsPage() {
  const [selectedModule, setSelectedModule] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredEndpoints = API_ENDPOINTS.filter((endpoint) => {
    const matchesModule =
      selectedModule === "All" || endpoint.module === selectedModule;
    const matchesSearch =
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.whyNeeded.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const handleCopy = (path: string, id: string) => {
    const fullUrl = `http://localhost:3000${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-6xl">
      {/* Page Header & Architecture Guides */}
      <ApiDocsHeader />

      {/* Filter Categories & Search Bar */}
      <ApiDocsFilterBar
        modules={API_MODULES}
        selectedModule={selectedModule}
        onSelectModule={setSelectedModule}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalResults={filteredEndpoints.length}
      />

      {/* Endpoints List */}
      <div className="flex flex-col gap-3">
        {filteredEndpoints.map((endpoint) => (
          <ApiEndpointCard
            key={endpoint.id}
            endpoint={endpoint}
            isExpanded={expandedId === endpoint.id}
            isCopied={copiedId === endpoint.id}
            onToggleExpand={() =>
              setExpandedId(expandedId === endpoint.id ? null : endpoint.id)
            }
            onCopy={handleCopy}
          />
        ))}
      </div>
    </div>
  );
}
