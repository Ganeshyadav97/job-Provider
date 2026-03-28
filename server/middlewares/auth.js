const Company = require("../models/Company");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const authMiddleWare = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'MY_SECRET_KEY');

    // Find user in DB
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid or expired" });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'MY_SECRET_KEY');

    // Only allow the hardcoded admin
    if (decoded.email !== "admin@example.com") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    req.admin = decoded; // attach admin info if needed
    next(); 
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid or expired" });
  }
};

const CompanyAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'MY_SECRET_KEY');
    
    const company = await Company.findById(decoded.companyId);
    if (!company) {
      return res.status(401).json({ message: "Company not found" });
    }
    
    req.company = company;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid or expired" });
  }
};

module.exports = { authMiddleWare, adminAuth, CompanyAuth };