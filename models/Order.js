const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        size: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        serviceFee: {
            type: Number,
            default: 1000
        },
        waist: {
            type: String
        },
        customNote: String,
        image: String
    }],
    shippingDetails: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        deliveryMethod: {
            type: String,
            enum: ['delivery', 'pickup'],
            default: 'delivery'
        },
        address: String,
        city: String,
        zipCode: String,
        country: String,
        state: String
    },
    subtotal: {
        type: Number,
        required: true
    },
    totalServiceFees: {
        type: Number,
        default: 0
    },
    shipping: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    orderNumber: {
        type: String,
        unique: true
    },
    paymentReference: {
        type: String
    },
    guestEmail: {
        type: String
    },
    estimatedDelivery: {
        type: String,
        default: '1-2 weeks'
    },
    paymentNote: {
        type: String
    },
    isFulfilled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Generate a random order number before saving
orderSchema.pre('save', function () {
    if (!this.orderNumber) {
        this.orderNumber = 'ALT-' + Math.floor(100000 + Math.random() * 900000);
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
