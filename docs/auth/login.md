# LOGIN API SPEC

## Endpoint : /api/auth/login

### Request Body

```json
{
  "email": "jhon@example.com",
  "password": "@Jhondoe123"
}
```

### Response Body Success (200)

```json
{
  "accessToken": "xxxxxxxxx",
  "message": "Welcome Jhone doe"
}
```

### Error Response:

#### Bad Request (400)

```json
{
  "message": "Email or password is invalid"
}
```

### Internal Server Error (500)

```json
{
  "message": "Internal server error"
}
```
