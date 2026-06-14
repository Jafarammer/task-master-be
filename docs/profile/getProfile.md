# GET PROFILE API SPEC

## Endpoint : GET /api/profile

### Request Header:

- Authorization : Bearer <token>

### Response Body Success (200) :

```json
{
  "message": "Fetch profile successfully",
  "data": {
    "fullName": "Jhone Doe",
    "email": "jhonedoe@example.com",
    "profilePicture": "https://xxxx"
  }
}
```

### Error Response:

#### Unauthorized (401)

Token is missing

```json
{
  "message": "Unauthorized"
}
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
