# API Testing with REST Client

This project uses the VS Code REST Client extension for manual API testing.

## Prerequisites

Install the REST Client extension in VS Code:

- Extension Name: REST Client
- Publisher: Huachao Mao

## Setup

After cloning the repository:

```bash
npm install
cp .env.example .env
npm run dev
```

Make sure the API server is running before executing requests.

## HTTP Files

API requests are located in the `http/` directory:

```text
api/
├── auth.http
├── task.http
├── profile.http
└── files/
    └── avatar.jpg
```

## Environment Variables

Define variables at the top of each `.http` file:

```http
@baseUrl = http://localhost:8000/api
@token = YOUR_JWT_TOKEN
```

## Execute Requests

Open any `.http` file and click **Send Request** above the request.

Example:

```http
### Get Tasks
GET {{baseUrl}}/task?page=1&limit=10
Authorization: Bearer {{token}}
```

## File Upload Testing

Store test files inside the `files/` directory.

Example:

```http
PATCH {{baseUrl}}/profile/picture
Authorization: Bearer {{token}}
Content-Type: multipart/form-data; boundary=WebAppBoundary

--WebAppBoundary
Content-Disposition: form-data; name="profilePicture"; filename="avatar.jpg"
Content-Type: image/jpeg

< ./files/avatar.jpg
--WebAppBoundary--
```

The multipart field name must match the field configured in the NestJS FileInterceptor.

Example:

```ts
@UseInterceptors(FileInterceptor('profilePicture'))
```

## Authentication Flow

1. Execute Login request.
2. Copy the returned access token.
3. Paste the token into:

```http
@token = YOUR_ACCESS_TOKEN
```

4. Execute protected endpoints.

## Notes

- Do not commit real JWT tokens.
- Do not commit production credentials.
- Ensure the API server is running before testing requests.
- Query parameters should be passed directly in the request URL.

Example:

```http
GET {{baseUrl}}/task?page=1&limit=5&query=Test
```
