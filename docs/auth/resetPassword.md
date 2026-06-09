# RESET PASSWORD API SPEC

## Endpoint : POST /api/auth/reset-password

### Request Body :

```json
{
  "token": "xxxxxxxxxx",
  "newPassword": "@Jhondoe321",
  "confirmPassword": "@Jhondoe321"
}
```

### Response Body Success (201) :

```json
{
  "message": "Password reset successfully"
}
```

### Error Response:

#### Bad Request (400)

Current password is same new password

```json
{
  "message": "New password cannot be the same as current password"
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

Link reset password expired

```json
{
  "message": "Invalid reset token"
}
```

### Internal Server Error (500)

```json
{
  "message": "Internal server error"
}
```
