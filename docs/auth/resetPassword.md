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
  "message": "New password and confirm password not match"
}
```

Link reset password expired

```json
{
  "message": "Reset password expired"
}
```

Password is invalid

```json
{
  "message": "Password must contain uppercase letters, lowercase letters, numbers, and special characters."
}
```

Token reset password is invalid

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
