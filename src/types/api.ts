/**
 * Shared, cross-feature API types.
 * Keep this file small — feature-specific types live inside their feature.
 */

export type ApiError = {
  code: string;
  message: string;
};

export type ApiResponse<TData> =
  { success: true; data: TData } | { success: false; error: ApiError };
