# REGISTER API SPEC

## Endpoint : POST /api/auth/register

### Request Body :

```json
{
  "fullName": "Jhone Doe",
  "email": "jhon@example.com",
  "password": "@Jhondoe123",
  "confirmPassword": "@Jhondoe123"
}
```

### Response Body Success (201) :

```json
{
  "message": "Registered successfully. Check your email to activate account."
}
```

### Error Response:

#### Bad Request (400)

Full name not filled in

```json
{
  "error": true,
  "message": "fullName is required",
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "fullName": ["fullName is required"]
    }
  }
}
```

Incorrect email format or email not filled in

```json
{
  "error": true,
  "message": "Email format not valid",
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "email": ["Email format not valid"]
    }
  }
}
```

Password is invalid

```json
{
  "error": true,
  "message": "Password must contain uppercase letters, lowercase letters, numbers, and special characters.",
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "password": [
        "Password must contain uppercase letters, lowercase letters, numbers, and special characters."
      ]
    }
  }
}
```

Password not match with confirm password

```json
{
  "error": true,
  "message": "Password and confirm password not match",
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "confirmPassword": ["Password and confirm password not match"]
    }
  }
}
```

### Conflict (409)

```json
{
  "message": "Email already registered"
}
```

### Internal Server Error (500)

```json
{
  "message": "Internal server error"
}
```
