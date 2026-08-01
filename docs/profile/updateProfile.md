# UPDATE PROFILE API SPEC

## Endpoint : PATCH /api/profile

### Request Header:

- Content-Type: application/json
- Authorization : Bearer <token>

### Request Body :

```json
{
  "fullName": "Jhone Does",
  "email": "jhon@example.com"
}
```

### Response Body Success (201) :

Only full name

```json
{
  "message": "Update profile successfully",
  "data": {
    "fullName": "Jhone Does",
    "email": "jhon@example.com",
    "profilePicture": "https://xxx",
    "requireRelogin": false
  }
}
```

Only email or full name with email

```json
{
  "message": "Verification email sent to your new email address",
  "data": {
    "fullName": "Jhone Does",
    "email": "jhon321@example.com",
    "profilePicture": "https://xxx",
    "requireRelogin": true
  }
}
```

### Error Response:

#### Bad Request (400)

Full name not filled in

```json
{
  "message": "Full name is required"
}
```

Invalid email

```json
{
  "message": "Email format not valid"
}
```

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
