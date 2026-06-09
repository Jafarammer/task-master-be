# POST TASK API SPEC

## Endpoint : POST /api/task

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
  "message": "Create task successfully"
}
```

### Error Response:

#### Bad Request (400)

```json
{
  "error": true,
  "message": "Title is required | Description is required | Date cannot be earlier than today | priority must be one of, low, medium, high",
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "title": ["Title is required"],
      "description": ["Description is required"],
      "startDate": ["Date cannot be earlier than today"],
      "endDate": ["Date cannot be earlier than today"],
      "priority": ["priority must be one of, low, medium, high "]
    }
  }
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
