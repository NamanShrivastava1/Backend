const express = require("express");
const app = express();

const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/user.routes");
const cafeRoutes = require("./routes/cafe.routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:8080",
  "https://scan-dine.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile app or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log("Blocked by CORS:", origin); // helpful log
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
})

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { error: "Too many requests, please try again later." },
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // max 5 login attempts
  message: { error: "Too many login attempts, please try again later." },
});

app.use("/api/", apiLimiter);
app.use("/api/users/login", loginLimiter);

app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.use("/api/users", userRoutes);
app.use("/api/dashboard", cafeRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the ScanDine");
});

module.exports = app;
