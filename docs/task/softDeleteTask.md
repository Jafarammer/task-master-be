# SOFT DELETE API SPEC

## Endpoint : DELETE /api/task/soft/:taskId

### Request Header:

- Content-Type: application/json
- Authorization : Bearer <token>

### Response Body Success (201) :

```json
{
  "message": "Task moved to trash successfully"
}
```

### Error Response:

#### Bad Request (400)

```json
{
  "message": "Task not found or already deleted"
}
```

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
