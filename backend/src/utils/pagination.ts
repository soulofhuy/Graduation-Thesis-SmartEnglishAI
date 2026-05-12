import { MINIMUM_ITEMS_PER_PAGE } from './constants';

export const DEFAULT_ITEMS_PER_PAGE = MINIMUM_ITEMS_PER_PAGE;

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const calculatePaginationValues = (
  page: number,
  limit: number
): { skip: number; take: number } => {
  const validPage = Math.max(page || 1, 1);
  const validLimit = Math.max(limit || DEFAULT_ITEMS_PER_PAGE, 1);
  const skip = (validPage - 1) * validLimit;

  return {
    skip,
    take: validLimit
  };
};

export const buildPagination = (
  page: number,
  limit: number,
  totalItems: number
): PaginatedResponse<any>['pagination'] => {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page * limit < totalItems,
    hasPrevPage: page > 1
  };
};
