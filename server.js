const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Import routes
const appointmentsRoutes = require("./routes/appointments");

// LOG ALL INCOMING REQUESTS
app.use((req, res, next) => {
  console.log("REQUEST RECEIVED:", req.method, req.url);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Register API routes
console.log("REGISTERING APPOINTMENTS ROUTER");

app.use("/api/appointments", appointmentsRoutes);
app.get("/api/appointments/test", (req, res) => {
  res.json({ message: "Appointments route is working!" });
});

// Test route
app.get("/api/doctors-check", (req, res) => {
  res.json({ message: "Doctors test route is working!" });
});
app.get("/api/test", (req, res) => {
  res.send("MEDICARE NEW SERVER IS WORKING!");
});

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`MEDICARE server running at http://localhost:${PORT}`);
});
