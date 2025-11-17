// backend/models/Branch.js
import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    location: {
      latitude: { 
        type: Number,
        required: true 
      },
      longitude: { 
        type: Number,
        required: true 
      },
    },
    address: { 
      type: String,
      required: true 
    },
    deliveryPartners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryPartner",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
    },
    workingHours: {
      open: {
        type: String,
        default: '09:00',
      },
      close: {
        type: String,
        default: '21:00',
      },
    },
    deliveryRadius: {
      type: Number,
      default: 10, // 10km default delivery radius
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for location queries
branchSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Create index for active and online branches
branchSchema.index({ isActive: 1, isOnline: 1 });

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;