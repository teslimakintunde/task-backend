require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const corsOptions = require("./config/corsOption");
const cookieParser = require("cookie-parser");
const connectToDB = require("./config/dbConnection");
const verifyJWT = require("./middleware/verifyJWT");
const app = express();

connectToDB();

const PORT = process.env.PORT || 4000;

// app.use(cors());
// app.use(
//   cors({
//     origin: ["http://localhost:5173"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/user", require("./routes/userRoute"));
app.use(verifyJWT);
app.use("/api/task", require("./routes/taskRoute"));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

mongoose.connection.once("open", () => {
  console.log("database connection successful");
  app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
});
// mongoose.connection.on("error", (err) => {
//   console.log(err);
// });
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1); // Exit on DB error
});
