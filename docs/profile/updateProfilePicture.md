# UPDATE PROFILE PICTURE API SPEC

## Endpoint : PATCH /api/profile/picture

### Request Header:

- Content-Type : multipart/form-data
- Authorization : Bearer <token>

### Request Body :

| Field          | Type | Required |
| -------------- | ---- | -------- |
| profilePicture | File | Yes      |

### Response Body Success (201) :

```json
{
  "message": "Profile picture updated successfully"
}
```

### Error Response:

#### Bad Request (400)

```json
{
  "message": "Profile picture is required"
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
