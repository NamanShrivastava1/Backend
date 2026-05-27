# ScanDine — Backend API

> REST API for a QR-based digital menu platform. Cafe owners register, build their menu, and share it with customers via a generated QR code.

Built with **Express 5 · MongoDB · JWT · ImageKit · NodeMailer**

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **User accounts** — register, email OTP verification, login, forgot/reset password
- **Cafe management** — create and update a cafe profile, upload cafe image
- **Menu builder** — full CRUD for menu items with multi-image upload, availability toggle, and chef's special flag
- **QR code generation** — generate a scannable QR code that links to the public menu
- **Public browsing** — customers view cafe menus without logging in
- **Security** — JWT (HTTP-only cookies), token blacklist on logout, bcrypt password hashing, Helmet, CORS, rate limiting

---

## Tech Stack

| Layer         | Technology                       |
| ------------- | -------------------------------- |
| Runtime       | Node.js ≥ 20                     |
| Framework     | Express 5                        |
| Database      | MongoDB (Mongoose ODM)           |
| Auth          | JWT, bcrypt                      |
| File Storage  | ImageKit                         |
| Email         | Nodemailer + Google OAuth2       |
| QR Generation | qrcode                           |
| Logging       | Winston + Morgan                 |
| Security      | Helmet, CORS, express-rate-limit |
| Validation    | express-validator                |
| Dev Tools     | Nodemon, ESLint, Prettier        |

---

## Project Structure

```
├── index.js                  # Server entry point
├── package.json
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions → EC2 deploy
└── src/
    ├── app.js                # Express app setup (middleware, routes, error handler)
    ├── config/
    │   ├── config.js         # Environment variable loader
    │   └── db.js             # MongoDB connection
    ├── controllers/
    │   ├── user.controller.js
    │   ├── cafe.controller.js
    │   └── menu.controller.js
    ├── middlewares/
    │   ├── auth.js           # Authenticate logged-in user
    │   └── cafeAuth.js       # Authenticate user + verify cafe ownership
    ├── models/
    │   ├── user.model.js
    │   ├── cafe.model.js
    │   ├── menu.model.js
    │   └── blacklistToken.model.js
    ├── routes/
    │   ├── user.routes.js
    │   ├── cafe.routes.js
    │   └── menu.routes.js
    ├── services/
    │   ├── email.service.js  # Send emails via Google OAuth2
    │   └── storage.service.js# ImageKit upload/delete helpers
    ├── utils/
    │   ├── appError.js       # Custom error class
    │   ├── categoryImages.js # Default category image map
    │   ├── emailTemplates.js # HTML email templates
    │   └── multer.js         # File upload config (memory storage)
    ├── validators/
    │   ├── auth.validator.js
    │   ├── cafe.validator.js
    │   └── menu.validator.js
    └── loggers/
        ├── winston.logger.js # App logger (file + console)
        └── morgan.logger.js  # HTTP request logger
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **MongoDB** instance (local or Atlas)
- **ImageKit** account (for image uploads)
- **Google Cloud** project with OAuth2 credentials (for sending emails)

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/NamanShrivastava1/ScanDine.git
cd Backend

# 2. Install dependencies
npm install

# 3. Create a .env file (see section below)
cp .env.example .env

# 4. Start in development mode
npm run dev
```

The server starts at `http://localhost:3000` (or the port set in `.env`).

### Available Scripts

| Script             | Description                      |
| ------------------ | -------------------------------- |
| `npm run dev`      | Start with Nodemon (development) |
| `npm start`        | Start in production mode         |
| `npm run lint`     | Run ESLint                       |
| `npm run lint:fix` | Auto-fix lint issues             |
| `npm run format`   | Format code with Prettier        |

---

## Environment Variables

Create a `.env` file in the project root:

```env
# ── Required ─────────────────────────────────────────
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<db>
JWT_SECRET=<random-secret-string>

# ── Email (Google OAuth2) ────────────────────────────
EMAIL_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
REFRESH_TOKEN=<google-oauth-refresh-token>

# ── Image Uploads ────────────────────────────────────
IMAGEKIT_PRIVATE_KEY=<imagekit-private-key>
```

> **Note:** `MONGO_URI` and `JWT_SECRET` are **required**. The server will not start without them. All other variables are optional in development but will log warnings in production if missing.

---

## API Reference

Base URL: `/api/v1`

### Health Check

| Method | Endpoint  | Description                |
| ------ | --------- | -------------------------- |
| GET    | `/health` | Returns `{ status: "OK" }` |

---

### Users — `/api/v1/users`

| Method | Endpoint             | Auth    | Description                            |
| ------ | -------------------- | ------- | -------------------------------------- |
| POST   | `/register`          | Public  | Register a new user                    |
| POST   | `/login`             | Public  | Login and receive JWT cookie           |
| POST   | `/verify-otp`        | Public  | Verify email OTP                       |
| POST   | `/resend-otp`        | Public  | Resend verification OTP                |
| POST   | `/forget-password`   | Public  | Request password reset OTP             |
| POST   | `/reset-password`    | Private | Reset password with OTP                |
| GET    | `/me`                | Private | Get current user                       |
| GET    | `/dashboard/profile` | Private | Get profile for dashboard              |
| POST   | `/logout`            | Private | Logout (blacklists token)              |
| DELETE | `/delete`            | Private | Delete account + all owned cafes/menus |

---

### Cafes — `/api/v1/cafe`

| Method | Endpoint        | Auth       | Description                      |
| ------ | --------------- | ---------- | -------------------------------- |
| POST   | `/createCafe`   | Private    | Create a cafe                    |
| GET    | `/showCafe`     | Private    | Get your cafe details            |
| PUT    | `/updateCafe`   | Cafe Owner | Update cafe details + image      |
| POST   | `/upload-image` | Cafe Owner | Upload cafe logo/image           |
| GET    | `/generate-qr`  | Cafe Owner | Generate QR code for public menu |
| GET    | `/public-cafes` | Public     | List all cafes                   |

---

### Menu — `/api/v1/menu`

| Method | Endpoint                     | Auth       | Description                           |
| ------ | ---------------------------- | ---------- | ------------------------------------- |
| POST   | `/`                          | Cafe Owner | Add a menu item                       |
| GET    | `/my-menu`                   | Cafe Owner | Get all items for your cafe           |
| PUT    | `/:menuItemId`               | Cafe Owner | Update a menu item                    |
| DELETE | `/:menuItemId`               | Cafe Owner | Delete a menu item                    |
| POST   | `/upload-images/:menuItemId` | Cafe Owner | Upload images for a menu item (max 5) |
| PUT    | `/availability/:id`          | Cafe Owner | Toggle item availability              |
| GET    | `/:cafeId`                   | Public     | Get menu items by cafe                |
| GET    | `/public/:cafeId`            | Public     | Get public menu for a cafe            |

---

## Authentication

The API uses **JWT tokens** stored in HTTP-only cookies.

### Flow

1. **Register** → an OTP is sent to the user's email.
2. **Verify OTP** → account is activated.
3. **Login** → a signed JWT is set as an `httpOnly` cookie (valid for 7 days).
4. **Authenticated requests** → the cookie (or `Authorization: Bearer <token>` header) is verified on every private route.
5. **Logout** → the token is added to a blacklist collection (auto-expires after 24 hours).

### Middleware

| Middleware         | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| `authenticateUser` | Verifies JWT, checks blacklist, validates `jwtVersion` match  |
| `authenticateCafe` | Runs `authenticateUser` logic + verifies the user owns a cafe |

### Password Reset

1. `POST /forget-password` with email → sends a reset OTP.
2. `POST /reset-password` with email, OTP, and new password → updates the password and increments `jwtVersion` (invalidates all existing sessions).

---

## Error Handling

All errors follow a consistent JSON format:

```json
{
  "status": "fail",
  "message": "Human-readable error message"
}
```

In **development**, responses also include a `stack` trace.

### Status Codes

| Code | Meaning                                      |
| ---- | -------------------------------------------- |
| 400  | Validation error, duplicate field, bad input |
| 401  | Missing/invalid/expired token                |
| 403  | Forbidden (e.g., CORS, no cafe ownership)    |
| 404  | Route or resource not found                  |
| 429  | Rate limit exceeded                          |
| 500  | Internal server error                        |

### Rate Limiting

| Scope                | Window | Max Requests |
| -------------------- | ------ | ------------ |
| All `/api/v1` routes | 15 min | 100          |
| Login endpoint       | 5 min  | 5            |

---

## Logging

- **Winston** — app-level logger with levels `error`, `warn`, `info`, `http`, `debug`.
  - Development: colorized console output.
  - Production: JSON logs written to `logs/error.log` and `logs/combined.log`.
- **Morgan** — HTTP request logging piped through Winston's `http` level.

---

## Deployment

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that deploys to an **EC2 instance** on every push to `master`.

### What the workflow does

1. Checks out the latest code.
2. SSHs into the EC2 instance.
3. Pulls the latest changes, installs production dependencies, and restarts the process via **PM2**.

### Required GitHub Secrets

| Secret        | Description                    |
| ------------- | ------------------------------ |
| `EC2_HOST`    | Public IP or hostname of EC2   |
| `EC2_USER`    | SSH username (e.g., `ubuntu`)  |
| `EC2_SSH_KEY` | Private SSH key for the server |

### Process Management

The app runs under **PM2** in production with graceful shutdown support (handles `SIGTERM`).

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "feat: add your feature"`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

Please run `npm run lint` and `npm run format` before submitting.

---

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
