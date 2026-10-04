import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./base.query";

import {
  ReviewImage,
  ReviewUser,
  Review,
  ReviewPagination,
  ReviewStats,
  GetProductReviewsResponse,
  GetProductReviewsParams,
  CreateReviewParams,
  UpdateReviewParams,
} from "@/types";

export type {
  ReviewImage,
  ReviewUser,
  Review,
  ReviewPagination,
  ReviewStats,
  GetProductReviewsResponse,
  GetProductReviewsParams,
  CreateReviewParams,
  UpdateReviewParams,
};

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Reviews"],
  endpoints: (builder) => ({

    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/review/:posterId (ReviewController -> getProductReview)
    // Postere yazılmış rəyləri gətirir
    // -------------------------------------------------------------
    getProductReviews: builder.query<GetProductReviewsResponse, GetProductReviewsParams>({
      query: ({ posterId, page = 1, limit = 10, sort = "newest", rating, hasImage }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        params.append("sort", sort);
        if (rating) params.append("rating", rating.toString());
        if (hasImage) params.append("hasImage", "true");

        return { url: `/review/${posterId}?${params.toString()}`, method: "GET" };
      },
      providesTags: (_result, _error, { posterId }) => [
        { type: "Reviews", id: posterId },
      ],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: POST /api/review/:id (ReviewController -> createReview)
    // Postere yeni qiymətləndirmə/rəy (və istəyə bağlı şəkillər) əlavə edir
    // -------------------------------------------------------------
    createReview: builder.mutation<Review, CreateReviewParams>({
      query: ({ posterId, rating, comment, images }) => {
        const formData = new FormData();
        formData.append("rating", rating.toString());
        if (comment) formData.append("comment", comment);
        if (images) {
          images.forEach((image) => {
            formData.append("images", image);
          });
        }

        return {
          url: `/review/${posterId}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { posterId }) => [
        { type: "Reviews", id: posterId },
      ],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: PUT /api/review/:id (ReviewController -> updateReview)
    // Rəyi (rating, comment, şəkillər) yeniləyir
    // -------------------------------------------------------------
    updateReview: builder.mutation<Review, UpdateReviewParams>({
      query: ({ reviewId, rating, comment, images, deleteImagePublicIds }) => {
        const formData = new FormData();
        if (rating !== undefined) formData.append("rating", rating.toString());
        if (comment !== undefined) formData.append("comment", comment);
        if (images && images.length > 0) {
          images.forEach((image) => {
            formData.append("images", image);
          });
        }
        if (deleteImagePublicIds && deleteImagePublicIds.length > 0) {
          formData.append("deleteImagePublicIds", JSON.stringify(deleteImagePublicIds));
        }

        return {
          url: `/review/${reviewId}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { posterId }) => [
        { type: "Reviews", id: posterId },
      ],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: DELETE /api/review/:id (ReviewController -> deleteReview)
    // Rəyi silir (Admin və ya rəy sahibi)
    // -------------------------------------------------------------
    deleteReview: builder.mutation<{ success: boolean; message: string }, { reviewId: string; posterId: string }>({
      query: ({ reviewId }) => ({
        url: `/review/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { posterId }) => [
        { type: "Reviews", id: posterId },
      ],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
