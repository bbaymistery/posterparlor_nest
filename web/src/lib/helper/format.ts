/**
 * Formatting utilities for displaying dates, currency, and numbers (US Locale & USD Currency)
 * Centralized to ensure consistency across the application
 */

// ============ Currency Formatting ============

/**
 * Format a number as US Dollars
 * @example formatPrice(1234.56) => "$1,234.56"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with US locale (with commas)
 * @example formatNumber(123456) => "123,456"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Format a compact number (1K, 1M, etc.)
 * @example formatCompactNumber(1500) => "1.5K"
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(num);
}

// ============ Date Formatting ============

/**
 * Format a date string as a readable date
 * @example formatDate("2024-01-15T10:30:00Z") => "Jan 15, 2024"
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date with time
 * @example formatDateTime("2024-01-15T10:30:00Z") => "Jan 15, 2024, 10:30 AM"
 */
export function formatDateTime(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Format a date for inputs (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toISOString().split("T")[0];
}

// ============ Time Duration ============

/**
 * Format duration in milliseconds to readable format
 * @example formatDuration(3661000) => "1h 1m"
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

// ============ Percentage ============

/**
 * Format a number as percentage
 * @example formatPercentage(0.156) => "15.6%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ============ Text Formatting ============

/**
 * Truncate text with ellipsis
 * @example truncateText("Hello World", 5) => "Hello..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Capitalize first letter of each word
 * @example titleCase("hello world") => "Hello World"
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============ ID Formatting ============

/**
 * Format an order/item ID for display
 * @example formatOrderId("507f1f77bcf86cd799439011") => "#BCF86CD7"
 * @example formatOrderId("507f1f77bcf86cd799439011", 6) => "#439011"
 */
export function formatOrderId(id: string, digits: number = 8): string {
  return `#${id.slice(-digits).toUpperCase()}`;
}

/**
 * Format a poster ID for display
 * @example formatPosterId("507f1f77bcf86cd799439011") => "Poster #439011"
 */
export function formatPosterId(id: string): string {
  return `Poster ${formatOrderId(id, 6)}`;
}
