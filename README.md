# MenuQR

A Node.js RESTful API for managing cafes and their menus, with user authentication and authorization. Built with Express, MongoDB (Mongoose), and JWT.

## Features
- User registration, login, profile, and deletion
- Cafe creation and management (one cafe per user)
- Menu item CRUD for each cafe
- JWT-based authentication with token blacklist for logout
- Input validation using express-validator
- CORS and cookie support

## Project Structure
```
MenuQR/
├── index.js
├── package.json
└── src/
    ├── app.js
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── cafe.controller.js
    │   └── user.controller.js
    ├── middlewares/
    │   └── auth.js
    ├── models/
    │   ├── blacklistToken.model.js
    │   ├── cafe.model.js
    │   ├── menu.model.js
    │   └── user.model.js
    └── routes/
        ├── cafe.routes.js
        └── user.routes.js
```

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB instance (local or cloud)

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd MenuQR
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
   ```
4. Start the server:
   ```sh
   npm start
   ```

## API Endpoints

### User Routes (`/api/users`)
- `POST /register` — Register a new user
- `POST /login` — Login and receive JWT token (set as cookie)
- `GET /dashboard/profile` — Get user profile (auth required)
- `GET /logout` — Logout (blacklists token)
- `DELETE /delete` — Delete user account

### Cafe & Menu Routes (`/api/dashboard`)
- `POST /cafeinfo` — Create cafe (auth required)
- `POST /menu` — Add menu item (auth required)
- `GET /menu/:cafeId` — Get all menu items for a cafe (auth required)
- `PUT /menu/:menuItemId` — Update menu item (auth required)
- `DELETE /menu/:menuItemId` — Delete menu item (auth required)

## Authentication
- Uses JWT for authentication, stored in HTTP-only cookies.
- Token is blacklisted on logout for security.
- All protected routes require a valid token.

## Models
- **User**: fullname, email, mobile, password (hashed)
- **Cafe**: cafename, phoneNo, address, description, user (ref)
- **Menu**: dishName, category, description, price, cafe (ref)
- **BlackListToken**: token, createdAt (auto-expires after 24h)

## Validation
- Uses `express-validator` for request validation.
- Passwords are hashed with bcrypt.

## Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `PORT`: Server port (default: 3000)

## License
MIT
