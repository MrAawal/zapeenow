import mongoose from "mongoose";

// Base User Schema
const userSchema = new mongoose.Schema({
    name: { type: String },
    role: {
        type: String,
        enum: ["Customer", "Admin", "DeliveryPartner"],
        required: true,
    },
    isActivated: { type: Boolean, default: false }
}, { timestamps: true });

// Customer Schema
const customerSchema = new mongoose.Schema({
    ...userSchema.obj,
    phone: { type: Number, required: true, unique: true },
    role: { type: String, enum: ["Customer"], default: "Customer" },
    liveLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    address: { type: String },
    // Added branch support for customers
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    // Store branch details for quick access
    branchDetails: {
      name: { type: String },
      distance: { type: Number }, // in km
      isOnline: { type: Boolean },
    },
}, { timestamps: true });

// Delivery Partner Schema
const deliveryPartnerSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: Number, required: true },
    role: { type: String, enum: ["DeliveryPartner"], default: "DeliveryPartner" },
    liveLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    address: { type: String },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true, // Delivery partners must be assigned to a branch
    },
    // Delivery partner status
    isAvailable: { type: Boolean, default: true },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
}, { timestamps: true });

// Admin Schema
const adminSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin"], default: "Admin" },
}, { timestamps: true });

// Indexes for better query performance
customerSchema.index({ phone: 1 });
customerSchema.index({ branch: 1 });
customerSchema.index({ 'liveLocation.latitude': 1, 'liveLocation.longitude': 1 });

deliveryPartnerSchema.index({ email: 1 });
deliveryPartnerSchema.index({ branch: 1 });
deliveryPartnerSchema.index({ isAvailable: 1 });
deliveryPartnerSchema.index({ 'liveLocation.latitude': 1, 'liveLocation.longitude': 1 });

adminSchema.index({ email: 1 });

export const Customer = mongoose.model("Customer", customerSchema);
export const DeliveryPartner = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
export const Admin = mongoose.model("Admin", adminSchema);