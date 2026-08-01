# DELETE ALL TASK TRASH API SPEC

## End Point : DELETE /api/task/trash/all

### Request Header:

- Content-Type: application/json
- Authorization : Bearer <token>

### Response Body Success (200) :

```json
{
  "message": "Trash emptied successfully"
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

Trash is empty

```json
{
  "message": "Trash is empty"
}
```

### Internal Server Error (500)

```json
{
  "message": "Internal server error"
}
```
