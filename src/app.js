const express = require("express")
const app = express()

const cookieParser = require("cookie-parser")
const cors = require("cors")
const path = require("path")
const userRoutes = require("./routes/user.routes")
const cafeRoutes = require("./routes/cafe.routes")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
const allowedOrigins = ["http://localhost:8080", "https://scan-dine.vercel.app"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.options("*", cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));


app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.use("/api/users", userRoutes)
app.use("/api/dashboard", cafeRoutes)

app.get("/", (req, res) => {
  res.send("Welcome to the ScanDine")
})

module.exports = app