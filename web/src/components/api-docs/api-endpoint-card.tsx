import {
  Lock,
  Unlock,
  ShieldCheck,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { ApiEndpoint } from "@/types";

interface ApiEndpointCardProps {
  endpoint: ApiEndpoint;
  isExpanded: boolean;
  isCopied: boolean;
  onToggleExpand: () => void;
  onCopy: (path: string, id: string) => void;
}

export function ApiEndpointCard({
  endpoint,
  isExpanded,
  isCopied,
  onToggleExpand,
  onCopy,
}: ApiEndpointCardProps) {
  const getMethodBadgeClass = (method: ApiEndpoint["method"]) => {
    switch (method) {
      case "GET":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "POST":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "PUT":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "PATCH":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "DELETE":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    }
  };

  const getAuthBadge = (authType: ApiEndpoint["authType"]) => {
    switch (authType) {
      case "Public":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Unlock className="h-3 w-3" /> Public
          </span>
        );
      case "User":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Lock className="h-3 w-3" /> Auth User
          </span>
        );
      case "Admin":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="h-3 w-3" /> Admin Only
          </span>
        );
    }
  };

  return (
    <div className="group border border-border/40 hover:border-border/80 bg-card rounded-xl transition-all duration-200 shadow-sm overflow-hidden">
      {/* Header Card */}
      <div
        onClick={onToggleExpand}
        className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Method Badge */}
          <span
            className={`font-mono text-xs font-black px-2.5 py-1 rounded-md border ${getMethodBadgeClass(
              endpoint.method
            )}`}
          >
            {endpoint.method}
          </span>

          {/* Path */}
          <code className="font-mono text-sm font-bold text-foreground tracking-tight">
            {endpoint.path}
          </code>

          {/* Title */}
          <span className="text-xs text-muted-foreground font-medium hidden md:inline">
            • {endpoint.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {getAuthBadge(endpoint.authType)}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(endpoint.path, endpoint.id);
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Copy URL"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>

          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 border-t border-border/40 bg-secondary/20 flex flex-col gap-4 text-xs">
          {/* Why Needed Explanation */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-400">
                Developer Architecture Note:
              </span>
              <p className="mt-0.5 text-[11px] leading-relaxed text-amber-200/90">
                {endpoint.whyNeeded}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-foreground mb-1">Overview:</h4>
            <p className="text-muted-foreground leading-relaxed">
              {endpoint.description}
            </p>
          </div>

          {/* Query Parameters */}
          {endpoint.queryParams && (
            <div>
              <h4 className="font-bold text-foreground mb-2">
                Query Parameters:
              </h4>
              <div className="bg-background rounded-lg p-3 border border-border/40 font-mono text-[11px] flex flex-col gap-1">
                {Object.entries(endpoint.queryParams).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-amber-500 font-semibold">{key}:</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body */}
          {endpoint.requestBody && (
            <div>
              <h4 className="font-bold text-foreground mb-2">
                Request Body (JSON Format):
              </h4>
              <pre className="bg-background rounded-lg p-3 border border-border/40 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                {JSON.stringify(endpoint.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Example */}
          {endpoint.responseExample && (
            <div>
              <h4 className="font-bold text-foreground mb-2">
                Response Example:
              </h4>
              <pre className="bg-background rounded-lg p-3 border border-border/40 font-mono text-[11px] text-blue-400 overflow-x-auto">
                {JSON.stringify(endpoint.responseExample, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
