# Task Master API

RESTful API for task management built with Express.js, TypeScript, MongoDB, JWT Authentication, Cloudinary Upload, and Zod Validation.

## Features

- User Authentication (Register, Login)
- JWT Authorization
- Task Management (CRUD)
- Profile Management
- Profile Picture Upload
- MongoDB Integration
- Request Validation with Zod
- Cloudinary Image Upload

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- Multer
- Cloudinary
- Zod

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd task-master-be
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory.

Example:

```env
PORT=8000

MONGO_URI=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_SMTP_SECURE=
EMAIL_SMTP_PASS=
EMAIL_SMTP_PORT=
EMAIL_SMTP_HOST=
EMAIL_SMTP_SERVICE_NAME=

CLIENT_HOST=
VERIFICATION_HOST=http://localhost:8000

NODE_ENV=
```

### Run Development Server

```bash
npm run dev
```

### Build Project

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

## API Testing

This project uses the VS Code REST Client extension for manual API testing.

See:

```text
REST_CLIENT.md
```

## Project Structure

```text
src/
├── app/
├── controllers/
├── helpers/
├── interfaces/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
└── validations/

api/
├── auth.http
├── task.http
└── profile.http

docs/
├── auth/
├── profile/
├── task/
```

## License

ISC
