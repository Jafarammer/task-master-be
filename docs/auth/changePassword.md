# CHANGE PASSWORD API SPEC

## Endpoint : POST /api/auth/change-password

### Request Header:

- Authorization : Bearer <token>

### Request Body :

```json
{
  "currentPassword": "@Jhondoe123",
  "newPassword": "@Jhondoe321",
  "confirmPassword": "@Jhondoe321"
}
```

### Response Body Success (201) :

```json
{
  "message": "Password changed successfully",
  "data": {
    "requireRelogin": true
  }
}
```

### Error Response:

#### Bad Request (400)

Current password is incorect

```json
{
  "message": "Current password is incorrect"
}
```

New password and confirm password not match

```json
{
  "error": true,
  "message": "New password and confirm password not match",
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "confirmPassword": ["New password and confirm password not match"]
    }
  }
}
```
