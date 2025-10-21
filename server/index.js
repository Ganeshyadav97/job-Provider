const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const auth=require('./routes/auth')
const admin=require('./routes/admin')
const CompanyJob=require('./routes/Company')
const UserApply=require('./routes/User')
const app = express();

// Middleware
app.use(express.json()); // to parse JSON bodies
app.use(cors());         // enable CORS

// Routess
app.use("/auth",auth);
app.use("/admin",admin);
app.use("/company",CompanyJob)
app.use("/user",UserApply);
// Connect to MongoDB
mongoose
  .connect("mongodb+srv://kanneboina:nani@cluster0.wl6wuhf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(5000, () => console.log("Server running on port 5000..."));