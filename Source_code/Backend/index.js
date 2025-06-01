const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authRoute = require("./Routes/auth");
const postRoute = require("./Routes/post");
const userRoute = require("./Routes/user");
const newsRoute = require("./Routes/news");
const messageRoute = require("./Routes/message");
const conversationRoute = require("./Routes/conversation");
//const geminiRoutes = require("./Routes/geminiRoutes"); // Import route chatbot

dotenv.config();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: true,
  parameterLimit: 50000,
}));

// Security
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan("common"));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Routes
app.get("/v1/", (req, res) => {
  res.send("Hello world");
});

app.use("/v1/auth", authRoute);
app.use("/v1/post", postRoute);
app.use("/v1/users", userRoute);
app.use("/v1/message", messageRoute);
app.use("/v1/news", newsRoute);
app.use("/v1/conversation", conversationRoute);

const PORT = process.env.PORT || 8000;

// Listen on all interfaces on port 8000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
