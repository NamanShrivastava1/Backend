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
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
}));


app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.use("/api/users", userRoutes)
app.use("/api/dashboard", cafeRoutes)

module.exports = app