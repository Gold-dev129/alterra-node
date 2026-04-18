const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            status: 'success',
            results: products.length,
            data: { products },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found',
            });
        }
        res.status(200).json({
            status: 'success',
            data: { product },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.createProduct = async (req, res) => {
    try {
        if (req.files) {
            req.body.images = req.files.map(file => file.path);
        }
        if (req.body.colors && typeof req.body.colors === 'string') {
            req.body.colors = req.body.colors.split(',').map(c => c.trim()).filter(c => c !== '');
        }
        const newProduct = await Product.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { product: newProduct },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => file.path);
        }
        if (req.body.colors && typeof req.body.colors === 'string') {
            req.body.colors = req.body.colors.split(',').map(c => c.trim()).filter(c => c !== '');
        }
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found',
            });
        }
        res.status(200).json({
            status: 'success',
            data: { product },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found',
            });
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'No file uploaded'
            });
        }
        res.status(200).json({
            status: 'success',
            url: req.file.path
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
