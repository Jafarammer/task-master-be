# REFRESH ACCESS TOKEN

## Endpoint : POST /api/auth/refresh-token

**NOTE**

- Does not require requset header
- Does not require requset body
- Does not require authentication

### Dev Config Cookie

```text
Name     : refreshToken
HttpOnly : true
Secure   : false
SameSite : lax
Path     : /api/auth
Max-Age  : 7 days
```

### Prod Config Cookie

```text
HttpOnly : true
Secure   : true
SameSite : none
Path     : /api/auth
```

### Response Cookie

```http
Set-Cookie: refreshToken=<refresh_token>; HttpOnly; Path=/api/auth
```

### Response Body Success (200) :

```json
{
  "message": "Welcome xxx",
  "accessToken": "<refresh_token>"
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
