# Task Master API

RESTful API for task management built with Express.js, TypeScript, MongoDB, JWT Authentication, Cloudinary Upload, and Zod Validation.

## Features

- User Authentication (Register, Login, Account Activation)
- JWT Authorization
- Task Management (CRUD)
- Profile Management
- Profile Picture Upload
- MongoDB Integration
- Request Validation with Zod
- Cloudinary Image Upload
- Email Verification
- Password Reset
- Integration Testing with Jest & Supertest

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
- Jest
- Supertest
- MongoDB Memory Server

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

NODE_ENV=development
```

## Running the Application

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Documentation

### API Specifications

API specifications are available in:

```text
docs/
├── auth/
├── profile/
└── task/
```

### REST Client Testing

This project uses the VS Code REST Client extension for manual API testing.

See:

```text
REST_CLIENT.md
```

### Automated Testing

This project uses:

- Jest
- Supertest
- MongoDB Memory Server

See:

```text
docs/testing.md
```

## Testing

Run all tests:

```bash
npm test
```

Run a specific test file:

```bash
npm test -- tests/task.test.ts
```

Run tests in band:

```bash
npm test -- --runInBand
```

Generate coverage report:

```bash
npm run test:coverage
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
├── profile.http
├── task.http
└── files/

docs/
├── auth/
├── profile/
├── task/
└── testing.md

tests/
├── setup.ts
├── auth.test.ts
├── profile.test.ts
└── task.test.ts
```

## Test Environment

Automated tests use MongoDB Memory Server.

```text
Production Database  ❌ Not Used
Local Database       ❌ Not Used
MongoMemoryServer    ✅ Used
```

Database collections are automatically cleaned after each test run.

## License

ISC
