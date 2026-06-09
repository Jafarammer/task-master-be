# UPDATE STATUS TASK API SPEC

## Endpoint : PATCH /api/task/status/:taskId

### Request Header:

- Authorization : Bearer <token>

### Request Body :

```json
{
  "isCompleted": true | false
}
```

### Response Body Success (201) :

```json
{
  "message": "Create task successfully"
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
