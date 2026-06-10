# GET TRASH STATISTICS TASK API SPEC

## Endpoint : GET /api/task/trash/statistics

### Request Header:

- Authorization : Bearer <token>

### Response Body Success (200) :

```json
{
  "data": {
    "totalItems": 0,
    "trashItems": 0,
    "activeItems": 0,
    "usedStorage": "0.00 KB",
    "maxStorage": "5.00 MB",
    "percentage": 0
  },
  "message": "Get trash statistics successfully"
}
```

### Error Response:

#### Unauthorized (401)

```json
{ "message": "Unauthorized" }
```

#### Forbidden (403)

Invalid token

```json
{
  "message": "Invalid or expired token"
}
```

#### Not Found (404)

User not registered

```json
{
  "message": "User not found"
}
```

### Internal Server Error (500)

```json
{
  "message": "Internal server error"
}
```
