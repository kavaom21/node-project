import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    address: { type: String, required: true },
    isPrimary: { type: Number, default: 0 }

  },

  { timestamps: true }
  
);

export default mongoose.model("Address", addressSchema);

