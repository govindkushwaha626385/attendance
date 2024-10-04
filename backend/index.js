const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
  })
);

// Middleware for file upload and JSON parsing
app.use(fileUpload());
app.use(express.json());
app.use("/api", studentRoutes);

// Serve static files
app.use("/public", express.static(path.join(__dirname, "public")));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
