# MenuQR - ScanDine

A Node.js RESTful API for managing cafes and their menus, with user authentication and authorization. Built with Express, MongoDB (Mongoose), JWT, and comprehensive error handling using AppError.

## Features

- User registration, login, profile, and deletion
- Cafe creation and management (one cafe per user)
- Menu item CRUD for each cafe
- JWT-based authentication with token blacklist for logout
- QR code generation for menus
- Public menu browsing by cafe
- Input validation using express-validator
- Comprehensive error handling with AppError
- CORS and cookie support

## Project Structure

```
ScanDine/
├── index.js
├── package.json
├── README.md
├── ERROR_HANDLING_SUMMARY.md
└── src/
    ├── app.js
    ├── config/
    │   ├── config.js
    │   └── db.js
    ├── controllers/
    │   ├── cafe.controller.js    (Cafe CRUD operations)
    │   ├── menu.controller.js    (Menu CRUD operations)
    │   └── user.controller.js    (User authentication & profile)
    ├── middlewares/
    │   ├── auth.js              (User authentication)
    │   └── cafeAuth.js          (Cafe owner authentication)
    ├── models/
    │   ├── blacklistToken.model.js
    │   ├── cafe.model.js
    │   ├── menu.model.js
    │   └── user.model.js
    ├── routes/
    │   ├── cafe.routes.js       (Cafe & Menu routes)
    │   ├── menu.routes.js       (Standalone menu routes - optional)
    │   └── user.routes.js
    ├── services/
    │   └── email.service.js     (Email sending service)
    ├── utils/
    │   ├── appError.js          (Custom error class)
    │   ├── categoryImages.js
    │   └── emailTemplates.js
    └── validators/
        ├── auth.validator.js
        ├── cafe.validator.js
        └── menu.validator.js
```

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd ScanDine
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```env
   MONGODB_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   PORT=3000
   NODE_ENV=development
   EMAIL_USER=<your-email>
   GOOGLE_CLIENT_ID=<google-client-id>
   GOOGLE_CLIENT_SECRET=<google-client-secret>
   REFRESH_TOKEN=<refresh-token>
   ```
4. Start the server:
   ```sh
   npm run dev
   ```

## API Endpoints

### User Routes (`/api/users`)

- `POST /register` — Register a new user
- `POST /login` — Login and receive JWT token (set as cookie)
- `POST /verify-otp` — Verify OTP sent to email
- `GET /dashboard/profile` — Get user profile (auth required)
- `GET /me` — Get current authenticated user
- `GET /logout` — Logout (blacklists token)
- `DELETE /delete` — Delete user account

### Cafe Routes (`/api/dashboard`)

- `POST /cafeinfo` — Create cafe (auth required)
- `GET /showCafe` — Get cafe info (auth required)
- `GET /generate-qr` — Generate QR code for menu (auth required)
- `GET /public-cafes` — Get all public cafes (no auth required)

### Menu Routes (`/api/dashboard`)

- `POST /menu` — Add menu item (cafe auth required)
- `GET /my-menu` — Get my cafe's menu items (cafe auth required)
- `GET /menu/:cafeId` — Get all menu items for a cafe
- `PUT /menu/:menuItemId` — Update menu item (cafe auth required)
- `DELETE /menu/:menuItemId` — Delete menu item (cafe auth required)
- `PUT /menu/:id/toggle-availability` — Toggle menu item availability (cafe auth required)
- `GET /public-menu/:cafeId` — Get public menu by cafe (no auth required)

## Authentication

### Two-Factor Authentication

- Uses JWT for primary authentication, stored in HTTP-only cookies
- Email-based OTP verification for account confirmation
- Token version tracking for session management
- Blacklist mechanism for secure logout

### Middleware

- **authenticateUser**: Verifies user is logged in
- **authenticateCafe**: Verifies user is logged in AND owns a cafe

## Models

- **User**: fullname, email, mobile, password (hashed), isVerified, otp, otpExpiry, jwtVersion
- **Cafe**: cafename, phoneNo, address, description, user (ref), qrCode
- **Menu**: dishName, category, description, halfPrice, fullPrice, price, image, isChefSpecial, isAvailable, cafe (ref)
- **BlackListToken**: token, createdAt (auto-expires after 24h)

## Error Handling

All errors are handled using the AppError class with proper HTTP status codes:

- **400** - Bad Request (validation or input errors)
- **401** - Unauthorized (authentication failures)
- **403** - Forbidden (not authorized for resource)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error (unexpected errors)

See `ERROR_HANDLING_SUMMARY.md` for detailed error handling documentation.

## Validation

- Uses `express-validator` for request validation
- Passwords are hashed with bcrypt
- Email validation for unique email addresses
- Mobile number validation for unique phone numbers

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `EMAIL_USER`: Gmail account for sending emails
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `REFRESH_TOKEN`: Google OAuth refresh token

## License

MIT
