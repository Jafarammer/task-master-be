# FORGOT PASSWORD API SPEC

## Endpoint : POST /api/auth/forgot-password

### Request Header:

- Content-Type: application/json

### Request Body :

```json
{
  "email": "jhon@example.com"
}
```

### Response Body Success (201) :

```json
{
  "message": "Reset password email sent"
}
```

### Error Response:

#### Bad Request (400)

Incorrect email format

```json
{
  "message": "Email format not valid"
}
```

#### Not Found (404)

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
