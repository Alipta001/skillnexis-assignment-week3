const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/api/health", (_req, res) =>
  res.json({ success: true, message: "Task Manager API is running" }),
);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));
app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  }),
);
app.use((error, _req, res, _next) => {
  console.error(error.message);
  res
    .status(400)
    .json({ success: false, message: error.message || "Request failed" });
});
module.exports = app;
