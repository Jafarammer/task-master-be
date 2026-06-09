# HARD DELETE API SPEC

## Endpoint : DELETE /api/task/hard/:taskId

### Request Header:

- Authorization : Bearer <token>

### Response Body Success (201) :

```json
{
  "message": "Task deleted successfully"
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
  "message": "Task not found or already deleted"
}
```

### Internal Server Error (500)

```json
{
  "message": "Internal server error"
}
```
