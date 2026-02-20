const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotEnv = require("dotenv");
const mongoose = require("mongoose");

dotEnv.config();

const secretKey = process.env.JWT_SECRET;

const vendorRegister = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const vendorEmail = await Vendor.findOne({ email });
    if (vendorEmail) {
      return res.status(400).json({ message: "Email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newVendor = new Vendor({
      username,
      email,
      password: hashedPassword,
    });

    await newVendor.save();

    res.status(201).json({ message: "Vendor registered successfully" });
  } catch (error) {
    console.error("REGISTER ERROR 👉", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const vendorLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("LOGIN BODY 👉", req.body);

  try {
    const vendor = await Vendor.findOne({ email });

    if (!vendor || !(await bcrypt.compare(password, vendor.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ vendorId: vendor._id }, secretKey, {
      expiresIn: "1h",
    });

    res
      .status(200)
      .json({ success: "Login Successful", token, vendorId: vendor._id });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate("firm");
    res.json({ vendors });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendorId = req.params.id;

    if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        message: "Invalid or missing vendorId",
      });
    }

    const vendor = await Vendor.findById(vendorId).populate("firm");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (!vendor.firm || vendor.firm.length === 0) {
      return res.status(200).json({
        vendorId,
        vendorFirmId: null,
        vendor,
      });
    }

    const vendorFirmId = vendor.firm[0]._id;

    return res.status(200).json({
      vendorId,
      vendorFirmId,
      vendor,
    });
  } catch (error) {
    console.error("getVendorById error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { vendorRegister, vendorLogin, getAllVendors, getVendorById };
