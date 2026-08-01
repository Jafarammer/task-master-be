# LOGOUT API SPEC

## Endpoint : POST /api/auth/logout

**NOTE**

- Does not require requset body
- Does not require authentication

### Request Headers

```http
Cookie: refreshToken=<refresh_token>
```

### Response Cookie

```http
Set-Cookie: refreshToken=; Path=/api/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly
```

### Response Body Success (200)

```json
{
  "message": "Logout successfully"
}
```

### Error Response:

#### Unauthorized (401)

Refresh token not found

```json
{
  "message": "Refresh token is required"
}
```

### Internal Server Error (500)

```json
{
  "message": "Internal server error"
}
```
