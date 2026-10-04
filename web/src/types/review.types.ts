/**
 * ⭐ REVIEW & RATING TYPES
 */

export interface ReviewImage {
  url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
}

export interface ReviewUser {
  _id: string;
  name: string;
  email: string;
}

export interface Review {
  _id: string;
  userId: ReviewUser;
  posterId: string;
  rating: number;
  comment?: string;
  images?: ReviewImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPagination {
  currentPage: number;
  totalPages: number;
  totalReviews: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface GetProductReviewsResponse {
  reviews?: Review[];
  pagination?: ReviewPagination;
  stats?: ReviewStats;
  data?: {
    reviews: Review[];
    pagination: ReviewPagination;
    stats: ReviewStats;
  };
  success?: boolean;
  message?: string;
}

export interface GetProductReviewsParams {
  posterId: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "highest" | "lowest";
  rating?: number;
  hasImage?: boolean;
}

export interface CreateReviewParams {
  posterId: string;
  rating: number;
  comment?: string;
  images?: File[];
}

export interface UpdateReviewParams {
  reviewId: string;
  posterId: string;
  rating?: number;
  comment?: string;
  images?: File[];
  deleteImagePublicIds?: string[];
}
