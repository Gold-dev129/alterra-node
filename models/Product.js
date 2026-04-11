const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product must have a name'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Product must have a description'],
    },
    price: {
        type: Number,
        required: [true, 'Product must have a price'],
    },
    category: {
        type: String,
    },
    images: [String],
    stock: {
        type: Number,
        default: 0,
    },
    brand: {
        type: String,
        default: 'Alterra',
    },
    isNewIn: {
        type: Boolean,
        default: false,
    },
    colors: [String],
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
