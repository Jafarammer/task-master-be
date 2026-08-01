# LOGIN API SPEC

## Endpoint : /api/auth/login

### Request Headers

- Content-Type: application/json

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

#### Forbidden (403)

Email has not been activated

```json
{
  "message": "Please activate your account via email"
}
```

### Internal Server Error (500)

```json
{
  "message": "Internal server error"
}
```
