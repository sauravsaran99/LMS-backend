/**
 * Pagination Utility
 * Provides helper functions for implementing pagination across the API
 */

/**
 * Parse pagination parameters from query string
 * @param {Object} query - Query object from request
 * @param {number} defaultLimit - Default items per page (default: 10)
 * @param {number} maxLimit - Maximum items per page (default: 100)
 * @returns {Object} Object with page, limit, offset
 */
const getPaginationParams = (query, defaultLimit = 10, maxLimit = 100) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || defaultLimit;

  // Validation
  if (page < 1) page = 1;
  if (limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

/**
 * Format paginated response
 * @param {Array} data - Array of items
 * @param {number} total - Total count of items in database
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Formatted pagination response
 */
const getPaginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  };
};

/**
 * Format paginated response with custom metadata
 * @param {Array} data - Array of items
 * @param {Object} paginationInfo - Object containing total, page, limit
 * @param {Object} metadata - Additional metadata to include
 * @returns {Object} Formatted pagination response with metadata
 */
const getPaginatedResponseWithMetadata = (
  data,
  paginationInfo,
  metadata = {},
) => {
  const { total, page, limit } = paginationInfo;
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
    ...metadata,
  };
};

/**
 * Calculate offset from page and limit
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {number} Offset value
 */
const calculateOffset = (page, limit) => {
  return (Math.max(1, page) - 1) * limit;
};

/**
 * Calculate total pages
 * @param {number} total - Total items
 * @param {number} limit - Items per page
 * @returns {number} Total pages
 */
const calculateTotalPages = (total, limit) => {
  return Math.ceil(total / limit);
};

module.exports = {
  getPaginationParams,
  getPaginatedResponse,
  getPaginatedResponseWithMetadata,
  calculateOffset,
  calculateTotalPages,
};
