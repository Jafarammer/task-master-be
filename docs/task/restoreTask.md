# RESTORE TASK API SPEC

## Endpoint : PATCH /api/task/restore/:taskId

### Request Header:

- Authorization : Bearer <token>

### Response Body Success (201) :

```json
{
  "message": "Task restored successfully"
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
  "message": "Task not found or not deleted"
}
```

### Internal Server Error (500)

```json
{
  "message": "Internal server error"
}
```
