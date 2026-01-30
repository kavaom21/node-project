import Admin from "../model/adminModel.js";
import User from "../../user/model/userModel.js";
import Address from "../../user/model/userAddress.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import config from "../../../config/index.js";
import { sendSuccess, sendError } from "../../utils/commonUtils.js";

export const registerAdmin = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return sendError(req, res, "Admin already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      userName,
      email,
      password: hashedPassword
    });

    return sendSuccess(req, res, {
      message: "Admin registered successfully"
    }, 201);

  } catch (error) {
    return sendError(req, res, "Admin registration failed", 500);
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return sendError(req, res, "Invalid credentials", 401);
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return sendError(req, res, "Invalid credentials", 401);
    }

    const token = jwt.sign(
      { adminId: admin._id, role: "admin" },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    return sendSuccess(req, res, {
      token
    });

  } catch (error) {
    return sendError(req, res, "Login failed", 500);
  }
};

export const getUsersList = async (req, res) => {
  try {
    const search = req.query.search || "";

    const pipeline = [
      {
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        }
      },
      {
        $lookup: {
          from: "addresses",
          localField: "_id",
          foreignField: "userId",
          as: "addresses"
        }
      },
      {
        $project: {
          userName: "$name",
          email: 1,
          addresses: 1
        }
      }
    ];

    const users = await User.aggregate(pipeline);

    return sendSuccess(req, res, {
      data: users
    });

  } catch (error) {
    return sendError(req, res, "Failed to fetch users", 500);
  }
};
