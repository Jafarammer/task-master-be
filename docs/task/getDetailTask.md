# GET DETAIL TASK API SPEC

## Endpoint : GET /api/task/detail/:id

### Request Header:

- Content-Type: application/json
- Authorization : Bearer <token>

### Response Body Success (200) :

```json
{
  "data": {
      "id": "xxxxx",
      "title": "Title task",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "startDate": "2026-01-01",
      "endDate": "2026-06-01",
      "priority": "low | medium | high",
      "isCompleted": true | false,
      "isExpired": true | false
    },
  "message": "Get task detail successfully"
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

Task not found

```json
{
  "message": "Task not found"
}
```

### Internal Server Error (500)

```json
{
  "message": "Internal server error"
}
```
