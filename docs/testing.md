# Testing Guide

This project uses:

- Jest
- Supertest
- MongoDB Memory Server

## Run All Tests

```bash
npm test
```

## Run Specific Test File

```bash
npm test -- tests/tasks.test.ts
```

## Run Tests in Band

```bash
npm test -- --runInBand
```

## Test Environment

Tests use MongoDB Memory Server, so they do not affect local or production databases.

```txt
MongoDB Local     ❌ Not Used
MongoDB Production ❌ Not Used
MongoMemoryServer ✅ Used
```

## Coverage

```bash
npm run test:coverage
```

## What Is Tested

### Authentication

- User Registration
- User Login
- Account Activation
- Forgot Password
- Reset Password

### Profile

- Get Profile
- Update Profile
- Update Profile Picture

### Task

- Create Task
- Get All Tasks
- Update Task
- Get Complete Task
- Get Pending Task
- Restore Task
- Soft Delete Task
- Hard Delete Task
- Get Trash Statistics
- Get List Trash
- Update Status Task
- Detail Task
- Delete All Task

## Notes

- External services such as Cloudinary and SMTP are mocked during testing.
- Each test runs against an isolated in-memory database.
- Database data is automatically cleaned after each test.
