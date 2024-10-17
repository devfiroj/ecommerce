const mongoose = require("mongoose");

// Sub-schema for ordered products
const orderedProductSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product", // Referencing the product model
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtPurchase: {
        type: Number, // Storing the price of the product at the time of purchase
        required: true
    }
}, { _id: false });

// Main Order schema
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Linking to the user who made the order
        required: true
    },
    products: [orderedProductSchema], // Array of ordered products
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'], // Possible payment statuses
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit card', 'debit card', 'paypal', 'net banking', 'cash on delivery'], // Payment methods
        required: true
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true }
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'shipped', 'delivered', 'canceled'], // Possible order statuses
        default: 'processing'
    },
    placedAt: {
        type: Date,
        default: Date.now // Automatically set to the current date
    },
    deliveredAt: {
        type: Date // The date when the order was delivered (optional, updated later)
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    trackingNumber: {
        type: String, // Optional tracking number for the shipping
    }
});

// Exporting the Order model
module.exports = mongoose.model("order", orderSchema);
