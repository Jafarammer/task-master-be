# GET PENDING TASK API SPEC

## Endpoint : GET /api/task/pending

### Request Header:

- Content-Type: application/json
- Authorization : Bearer <token>

### Query Params:

- page : number
- limit : number
- sortBy : createdAt | updatedAt
- order : asc | desc
- query : string

### Response Body Success (200) :

```json
{
  "data": [
    {
      "id": "xxxxx",
      "title": "Title task",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "startDate": "2026-01-01",
      "endDate": "2026-06-01",
      "priority": "low | medium | high",
      "isCompleted": false,
      "isExpired": true | false
    }
  ],
  "metaData": {
    "page": 1,
    "limit": 5,
    "total": 5,
    "totalPages": 1
  },
  "message": "Get task completed successfully"
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
