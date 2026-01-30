import User from "../model/userModel.js";
import Address from "../model/userAddress.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendSuccess, sendError, deleteFile } from "../../utils/commonUtils.js";
import config from "../../../../config/index.js";

export const register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(req, res, "Email already registered", 400);
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const profileImage = req.file ? req.file.filename : "";
    
    const user = await User.create({
      name: userName,
      email: email.toLowerCase(),
      password: hashedPassword,
      image: profileImage
    });
    
    const accessToken = jwt.sign(
      { userId: user._id },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id },
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    
    return sendSuccess(req, res, {
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    }, 201);
    
  } catch (error) {
    console.error("Register error:", error.message);
    
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    return sendError(req, res, "Something went wrong during registration", 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(req, res, "Invalid email or password", 401);
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(req, res, "Invalid email or password", 401);
    }
    
    const accessToken = jwt.sign(
      { userId: user._id },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id },
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    
    return sendSuccess(req, res, {
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
    
  } catch (error) {
    console.error("Login error:", error.message);
    return sendError(req, res, "Something went wrong during login", 500);
  }
};


export const getProfile = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.headers.userid);

    const result = await User.aggregate([
     
      {
        $match: { _id: userId }
      },

   
      {
        $lookup: {
          from: "addresses",
          pipeline: [
            {
              $match: {
                userId: userId,
                isPrimary: 1
              }
            }
          ],
          as: "primaryAddress"
        }
      },


      {
        $unwind: {
          path: "$primaryAddress",  preserveNullAndEmptyArrays: true
        }
      },
    ]);

    if (!result.length) {
      return sendError(req, res, "User not found", 404);
    }

    sendSuccess(req, res, {
      user: result[0]
    });

  } catch (error) {
    console.error("Get profile error:", error.message);
    sendError(req, res, "Server error", 500);
  }
};

export const logout = async (req, res) => {
  try {
    return sendSuccess(req, res, {
      message: "Logout successful"
    });
    
  } catch (error) {
    console.error("Logout error:", error.message);
    return sendError(req, res, "Something went wrong during logout", 500);
  }
};


export const addAddress = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.headers.userid);
    const { address } = req.body;

    
    const primaryExists = await Address.findOne({
      userId,
      isPrimary: 1
    });

    const newAddress = await Address.create({
      userId,
      address,
      isPrimary: primaryExists ? 0 : 1
    });

    sendSuccess(req, res, {
      message: "Address added successfully",
      address: newAddress
    }, 201);

  } catch (error) {
    console.error("Add address error:", error.message);
    sendError(req, res, "Failed to add address", 500);
  }
};


export const getAddresses = async (req, res) => {
  try {
    const userId = req.headers.userid;
    
    const addresses = await Address.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ isPrimary: -1, createdAt: -1 });
    
    return sendSuccess(req, res, {
      data: addresses
    });
    
  } catch (error) {
    console.error("getAddresses error:", error.message);
    return sendError(req, res, "Something went wrong while fetching addresses", 500);
  }
};

export const setPrimaryAddress = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.headers.userid);
    const { addressId } = req.body;


    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      return sendError(req, res, "Address not found", 404);
    }


    if (address.isPrimary === 1) {
      return sendError(req, res, "Address already primary", 400);
    }


    const currentPrimary = await Address.findOne({
      userId,
      isPrimary: 1
    });


    if (currentPrimary) {
      currentPrimary.isPrimary = 0;
      await currentPrimary.save();
    }


    address.isPrimary = 1;
    await address.save();

    sendSuccess(req, res, { message: "Primary address updated" });

  } catch (error) {
    sendError(req, res, "Failed to update primary address", 500);
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.headers.userid;
    
    if (!req.file) {
      return sendError(req, res, "No image file provided", 400);
    }
    
    const oldUser = await User.findById(new mongoose.Types.ObjectId(userId));
    if (oldUser && oldUser.image) {
      deleteFile(`uploads/profile/${oldUser.image}`);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      { image: req.file.filename },
      { new: true }
    ).select("-password");
    
    if (!updatedUser) {
      return sendError(req, res, "User not found", 404);
    }
    
    return sendSuccess(req, res, {
      message: "Profile image uploaded successfully",
      data: updatedUser
    });
    
  } catch (error) {
    console.error("uploadProfileImage error:", error.message);
    
    if (req.file) {
      deleteFile(req.file.path);
     }
  
    return sendError(req, res, "Something went wrong while uploading profile image", 500);
  }
};

