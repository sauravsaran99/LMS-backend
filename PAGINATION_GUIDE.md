# Pagination Implementation Guide

## Overview

Pagination has been implemented across the entire LMS Backend API to handle large datasets efficiently. The pagination system is flexible, allowing for both paginated and non-paginated responses based on query parameters.

## Pagination Utility

### Location

`src/utils/pagination.util.js`

### Available Functions

#### 1. `getPaginationParams(query, defaultLimit = 10, maxLimit = 100)`

Extracts and validates pagination parameters from query string.

**Parameters:**

- `query` - Request query object
- `defaultLimit` - Default items per page (default: 10)
- `maxLimit` - Maximum allowed items per page (default: 100)

**Returns:**

```javascript
{
  page: number,      // Current page (min: 1)
  limit: number,     // Items per page (min: 1, max: maxLimit)
  offset: number     // Offset for database query
}
```

**Example:**

```javascript
const paginationParams = getPaginationParams(req.query);
// Query: ?page=2&limit=20
// Returns: { page: 2, limit: 20, offset: 20 }
```

#### 2. `getPaginatedResponse(data, total, page, limit)`

Formats a paginated response with metadata.

**Parameters:**

- `data` - Array of items
- `total` - Total count of items in database
- `page` - Current page number
- `limit` - Items per page

**Returns:**

```javascript
{
  data: [],
  pagination: {
    total: number,        // Total items in database
    page: number,         // Current page
    limit: number,        // Items per page
    totalPages: number,   // Total number of pages
    hasNextPage: boolean, // Is there a next page?
    hasPreviousPage: boolean // Is there a previous page?
  }
}
```

**Example:**

```javascript
const response = getPaginatedResponse([...items], 150, 2, 20);
// Returns:
// {
//   data: [...items],
//   pagination: {
//     total: 150,
//     page: 2,
//     limit: 20,
//     totalPages: 8,
//     hasNextPage: true,
//     hasPreviousPage: true
//   }
// }
```

#### 3. `getPaginatedResponseWithMetadata(data, paginationInfo, metadata = {})`

Similar to `getPaginatedResponse` but allows custom metadata.

**Parameters:**

- `data` - Array of items
- `paginationInfo` - Object with `{ total, page, limit }`
- `metadata` - Additional custom metadata

#### 4. `calculateOffset(page, limit)`

Helper to calculate offset from page and limit.

#### 5. `calculateTotalPages(total, limit)`

Helper to calculate total pages.

## Implementation Pattern

### 1. Controllers

All controllers that return lists follow this pattern:

```javascript
const {
  getPaginationParams,
  getPaginatedResponse,
} = require("../utils/pagination.util");

exports.getBookings = async (req, res, next) => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await bookingService.getBookingsByStatus({
      status,
      user: req.user,
      pagination: paginationParams,
    });

    if (result.bookings) {
      // Pagination is enabled
      res.json(
        getPaginatedResponse(
          result.bookings,
          result.total,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    } else {
      // Legacy response without pagination
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
};
```

### 2. Services

Services accept an optional `pagination` parameter and pass it to repositories:

```javascript
async getBookingsByStatus({ status, user, pagination = null }) {
  const where = { status };

  if (user.role_name === "TECHNICIAN") {
    where.technician_id = user.id;
  }

  return bookingRepo.findAll(where, pagination);
}
```

### 3. Repositories

Repositories handle pagination logic:

```javascript
async findAll(whereClause, pagination = null) {
  const options = {
    where: whereClause,
    include: [...],
    order: [["created_at", "DESC"]],
  };

  if (pagination) {
    options.limit = pagination.limit;
    options.offset = pagination.offset;
  }

  if (pagination) {
    const total = await Booking.count({ where: whereClause });
    const bookings = await Booking.findAll(options);
    return { bookings, total };
  }

  return Booking.findAll(options);
}
```

## API Query Parameters

### Query String Format

```
GET /bookings?page=1&limit=10&status=CREATED
```

### Query Parameters

- `page` (optional, default: 1) - Page number (must be >= 1)
- `limit` (optional, default: 10) - Items per page (must be 1-100)

### Response Format

**With Pagination:**

```json
{
  "data": [
    {
      "id": 1,
      "booking_number": "BK001",
      ...
    },
    ...
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Without Pagination (legacy):**

```json
[
  {
    "id": 1,
    "booking_number": "BK001",
    ...
  },
  ...
]
```

## Implemented Endpoints

### Booking API

- `GET /bookings?status=CREATED&page=1&limit=20` - Get bookings by status with pagination

### Customer API

- `GET /customers?page=1&limit=10` - Get all customers
- `GET /customers/search?q=john&page=1&limit=10` - Search customers
- `GET /customers/bookings?page=1&limit=10` - Get customer's bookings
- `GET /customers/bookings/:bookingId/tests?page=1&limit=10` - Get booking tests
- `GET /customers/bookings/:bookingId/reports?page=1&limit=10` - Get booking reports
- `GET /customers/bookings/:bookingNumber/payments?page=1&limit=10` - Get booking payments

### Test API

- `GET /tests?page=1&limit=20` - Get all tests with pagination

### Doctor API

- `GET /doctors?page=1&limit=20` - Get all doctors with pagination

### Branch API

- `GET /branches?page=1&limit=20` - Get all branches with pagination

### User API

- `GET /users?role=TECHNICIAN&page=1&limit=10` - Get users by role with pagination

### Technician API

- `GET /technician?page=1&limit=10` - Get technician's bookings
- `GET /technician/completed?page=1&limit=10` - Get completed bookings

### Branch Admin API

- `GET /branch-admin/users?page=1&limit=10` - Get branch users

### Audit Log API

- `GET /audit-logs?page=1&limit=20` - Get audit logs with pagination

### Payment API

- `GET /payments?page=1&limit=10` - Get payment summaries

## Updated Files

### Utilities

- `src/utils/pagination.util.js` - NEW pagination utility

### Controllers

- `src/controllers/booking.controller.js`
- `src/controllers/customer.controller.js`
- `src/controllers/test.controller.js`
- `src/controllers/doctor.controller.js`
- `src/controllers/branch.controller.js`
- `src/controllers/user.controller.js`
- `src/controllers/technician.controller.js`
- `src/controllers/branchAdmin.controller.js`
- `src/controllers/auditLog.controller.js`
- `src/controllers/payment.controller.js`

### Services

- `src/services/booking.service.js`
- `src/services/customer.service.js`
- `src/services/branch.service.js`
- `src/services/user.service.js`
- `src/services/branchAdmin.service.js`
- `src/services/auditLog.service.js`
- `src/services/payment.service.js`

### Repositories

- `src/repositories/booking.repository.js`
- `src/repositories/customer.repository.js`
- `src/repositories/branch.repository.js`
- `src/repositories/user.repository.js`
- `src/repositories/auditLog.repository.js`
- `src/repositories/payment.repository.js`

## Testing Pagination

### Example Requests

**Get first page of 10 bookings:**

```bash
curl "http://localhost:5000/bookings?page=1&limit=10&status=CREATED"
```

**Get second page with custom limit:**

```bash
curl "http://localhost:5000/customers?page=2&limit=25"
```

**Search with pagination:**

```bash
curl "http://localhost:5000/customers/search?q=john&page=1&limit=10"
```

## Best Practices

1. **Always validate pagination parameters** - Use `getPaginationParams()` to ensure valid page and limit values
2. **Consistent response format** - Use `getPaginatedResponse()` for consistent pagination metadata
3. **Optional pagination** - Services and repositories support optional pagination, maintaining backward compatibility
4. **Efficient queries** - Use `LIMIT` and `OFFSET` in repository queries for better performance
5. **Document API endpoints** - Clearly document which endpoints support pagination
6. **Client-side handling** - Frontend should handle `hasNextPage` and `hasPreviousPage` for UI navigation

## Backward Compatibility

The implementation maintains backward compatibility:

- If no `page` and `limit` parameters are provided, all results are returned (without pagination metadata)
- Existing clients using the API without pagination parameters will continue to work
- Pagination is opt-in via query parameters

## Future Enhancements

- Add cursor-based pagination for better performance with large datasets
- Implement sorting with multiple columns
- Add filtering options per endpoint
- Cache frequently accessed pages
- Add rate limiting based on pagination parameters
