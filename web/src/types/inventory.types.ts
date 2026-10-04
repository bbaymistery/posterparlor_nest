import { PosterImage } from "./order.types";
export type { PosterImage };

export interface Poster {
  _id: string;
  title: string;
  description: string;
  category: string;
  dimensions: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  tags: string[];
  images: PosterImage[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface InventoryPaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PosterFilter {
  isAvailable?: boolean;
  category?: string;
  tags?: string | string[];
  title?: string;
  dimensions?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  search?: string;
  sortBy?: "price" | "stock" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface GetAllInventoryResponse {
  data: {
    posters: Poster[];
    pagination: InventoryPaginationInfo;
    filters: PosterFilter;
  };
}

export interface GetFeaturedPostersResponse {
  data: Array<Poster[]>;
}

export interface GetInventoryItemResponse {
  data: Poster;
}

export interface SearchInventoryResponse {
  data: {
    posters: Poster[];
    total: number;
  };
}

export interface CreateInventoryResponse {
  success: boolean;
  message: string;
  data: {
    poster: Poster;
  };
}

export interface UpdateInventoryResponse {
  success: boolean;
  message: string;
  data: {
    poster: Poster;
  };
}

export interface DeleteInventoryResponse {
  success: boolean;
  message: string;
}

export interface CategoryWithCount {
  category: string;
  count: number;
}

export interface FiltersResponse {
  data: {
    categories: CategoryWithCount[];
    materials: string[];
    dimensions: string[];
    tags: string[];
  };
}

export interface GetAllInventoryParams {
  page?: number;
  limit?: number;
  filters?: PosterFilter;
}

export interface CreateInventoryItemParams {
  images: File[];
  itemDetails: {
    title: string;
    description: string;
    category: string;
    dimensions: string;
    price: number;
    stock: number;
    isAvailable?: boolean;
    tags?: string[];
    material?: string;
  };
}

export interface UpdateInventoryItemParams {
  id: string;
  images?: File[];
  updateDetails: Partial<{
    title: string;
    description: string;
    category: string;
    dimensions: string;
    price: number;
    stock: number;
    isAvailable: boolean;
    tags: string[];
    material: string;
    imagesToDelete: string[];
  }>;
}

export interface SearchInventoryParams {
  query: string;
  limit?: number;
}
