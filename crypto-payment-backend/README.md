# Crypto Payment Backend API

A merchant-focused crypto payment backend built with NestJS. This system enables merchants to create crypto payment requests, generate QR codes, track transaction history, export CSV reports, and simulate payment completion flows.

## Why This Matters

This project is designed to help small businesses in Nigeria accept payments in a fast, modern way. Many market stalls, roadside stores, and growing shops still rely on cash or manual transfers. This backend makes it easier for merchants to send a simple payment request, share a QR code, and keep track of payments without paper records.

Imagine a young entrepreneur in Lagos selling fresh bread and drinks. Instead of waiting for a customer to count cash or ask for bank details, the seller can send a payment link or show a QR code. The customer taps the link and pays quickly. The seller can then see the sale in a safe, organized record. That simple flow can save time, reduce mistakes, and make daily business feel more reliable.

For communities across Nigeria, a system like this can support local traders, help new businesses grow, and make everyday trade more secure. It is built to serve real people, not just technology teams.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth)
  - [Merchant](#merchant)
  - [Payment](#payment)
  - [Transaction](#transaction)
  - [Webhooks](#webhooks)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Security](#security)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Features

- Merchant registration and JWT-based authentication using phone number
- OTP verification for the merchant phone number from the web dashboard
- Payment request creation with QR code and payment link generation
- Public payment lookup by payment ID
- Transaction history with date filtering and pagination
- CSV export for transaction reports
- Simulated payment completion and status tracking
- Merchant dashboard summaries and crypto preference management
- WhatsApp and USSD webhook integrations for payment creation
- Swagger/OpenAPI documentation
- Global validation, security middleware, CORS, and rate limiting

## Tech Stack

- NestJS
- TypeScript
- PostgreSQL via TypeORM
- Swagger/OpenAPI (`@nestjs/swagger`)
- JWT authentication
- bcrypt password hashing
- Jest + Supertest
- Helmet, CORS, Throttler
- Prettier and ESLint

## Getting Started

### Prerequisites

- Node.js 18+ or compatible
- npm
- PostgreSQL database

### Installation

```bash
git clone <repository-url>
cd crypto-payment-backend
npm install
```

### Configure Environment

Copy the environment file and update the values:

```bash
cp .env.example .env
```

Example `.env` values:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=crypto_payment_db
BASE_URL=http://localhost:3000
```

### Run the Application

```bash
npm run start:dev
```

The application listens on `http://localhost:3000` by default.

## Environment Variables

- `PORT` - HTTP port for the server
- `NODE_ENV` - `development` or `production`
- `JWT_SECRET` - secret used to sign JWT tokens
- `JWT_EXPIRES_IN` - token expiration duration (example: `24h`)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USERNAME` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `DB_NAME` - PostgreSQL database name
- `BASE_URL` - base URL used by webhook response links

## API Documentation

Once the app is running, open:

- `http://localhost:3000/api`

The Swagger UI exposes interactive docs for all endpoints, schemas, request bodies, and authentication.

## Authentication

- The application uses phone-number login and JWT authentication for protected merchant and transaction routes.
- Obtain a token via `POST /auth/login`.
- Use `Authorization: Bearer <token>` for requests to protected endpoints.

## API Endpoints

### Auth

- `POST /auth/register`
  - Register a new merchant account
  - Body: `phoneNumber`,otp
- `POST /auth/login`
  - Authenticate merchant
  - Body: `phoneNumber`,otp
  - Returns: JWT token and merchant profile
- `POST /auth/send-otp`
  - Send verification OTP to the authenticated merchant phone number
- `POST /auth/verify-otp`
  - Verify the merchant phone number using the OTP code

### Merchant

Protected by JWT.

- `GET /merchant/profile`
  - Get authenticated merchant profile
- `PUT /merchant/crypto-preferences`
  - Update accepted crypto preferences
  - Body example: `{ "cryptoPreferences": ["bitcoin", "lightning"] }`
- `GET /merchant/dashboard`
  - Get dashboard summary and analytics

### Payment

- `POST /payment/create`
  - Protected by JWT
  - Create a new payment request
  - Body example: `{ "amount": 50.00, "description": "Coffee and pastry" }`
- `GET /payment/:id`
  - Public payment details lookup by ID
- `GET /payment/:id/qr`
  - Public QR code generation for payment ID

### Transaction

Protected by JWT.

- `GET /transaction/history`
  - Retrieve transaction history
  - Optional query params: `startDate`, `endDate`, `page`, `limit`
- `GET /transaction/export`
  - Export transactions to CSV
  - Optional query params: `startDate`, `endDate`
- `POST /transaction/:paymentId/complete`
  - Simulate payment completion for a payment request
  - Body example: `{ "cryptoType": "bitcoin", "shouldFail": false }`
- `GET /transaction/payment/:paymentId/status`
  - Retrieve current payment status

### Webhooks

- `POST /webhooks/whatsapp`
  - Handle WhatsApp webhook commands from Twilio
  - Supports `create <amount> [description]` and `help`
- `POST /webhooks/ussd`
  - Handle USSD webhook requests for interactive payment creation

## Usage Examples

### Register a Merchant

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2348012345678",
    "password": "securePassword123",
    "firstName": "My Coffee Shop"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2348012345678",
    "password": "securePassword123"
  }'
```

### Send OTP for Verification

```bash
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Verify Phone Number

```bash
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "otp": "123456"
  }'
```

### Create a Payment Request

```bash
curl -X POST http://localhost:3000/payment/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 50.00,
    "description": "Coffee and pastry"
  }'
```

### Get Payment Details

```bash
curl -X GET http://localhost:3000/payment/PAYMENT_ID
```

### Get QR Code

```bash
curl -X GET http://localhost:3000/payment/PAYMENT_ID/qr
```

### Export Transactions as CSV

```bash
curl -X GET "http://localhost:3000/transaction/export?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output transactions.csv
```

### Simulate Payment Completion

```bash
curl -X POST http://localhost:3000/transaction/PAYMENT_ID/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cryptoType": "bitcoin",
    "shouldFail": false
  }'
```

## Testing

Run tests with:

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Security

- JWT authentication for protected routes
- Password hashing with bcrypt
- Global validation pipe to enforce DTO constraints
- Helmet for secure HTTP headers
- CORS configuration
- Rate limiting via NestJS Throttler
- Global exception filter for structured error responses

## Project Structure

```
src/
├── common/
│   ├── config/            # App and security configuration
│   ├── decorators/        # Throttling and auth decorators
│   ├── dto/               # Shared DTOs and response shapes
│   ├── enums/             # Common enums for status and crypto types
│   ├── filters/           # Global exception handling
│   ├── middleware/        # Security middleware
│   └── pipes/             # Validation and sanitization pipes
├── config/                 # Database and other config modules
├── entities/               # TypeORM entities
├── modules/
│   ├── auth/              # Authentication and JWT handling
│   ├── merchant/          # Merchant profile and dashboard logic
│   ├── payment/           # Payment request creation and QR generation
│   ├── transaction/       # Transaction history, export, and completion
│   └── webhook/           # WhatsApp and USSD webhook integrations
└── main.ts                # Application bootstrap and Swagger setup
```

## Contributing

- Open issues for bugs or feature requests
- Use `npm run lint` and `npm run format` before submitting
- Keep code consistent with existing NestJS architecture
- Add tests for new features or bug fixes

---

If you want to extend this backend, start by implementing additional payment channels, real blockchain settlement, or merchant invoicing workflows.
