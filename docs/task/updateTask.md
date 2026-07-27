# PATCH TASK API SPEC

## Endpoint : PUT /api/task/:id

### Request Header:

- Authorization : Bearer <token>

### Request Body :

```json
{
  "title": "Meeting with CEO",
  "description": "xxxxx",
  "startDate": "2026-01-23",
  "endDate": "2026-01-23",
  "priority": "high | medium | low"
}
```

### Response Body Success (201) :

```json
{
  "message": "Update task successfully"
}
```

### Error Response:

#### Bad Request (400)

Title not filled in

```json
{
  "message": "Title is required"
}
```

Description not filled in

```json
{
  "message": "Description is required"
}
```

End date is greater than start date

```json
{
  "message": "End date must be greater than start date"
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

Task not created

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
