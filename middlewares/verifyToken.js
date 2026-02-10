const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  const token = req.headers.token; // ✅ MATCH FRONTEND

  if (!token) {
    return res.status(401).json({ message: "Please login again" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    const vendor = await Vendor.findById(decoded.vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    req.vendorId = vendor._id;
    next();
  } catch (error) {
    console.error("JWT error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
