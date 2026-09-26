import type { PaginationQuery } from "../validators/collection.validators.js";

// Formato de resposta paginada (06_API §7.1).
export type Paginated<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export function paginate<T>(items: T[], total: number, { page, limit }: PaginationQuery): Paginated<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
