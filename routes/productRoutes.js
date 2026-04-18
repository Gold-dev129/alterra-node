const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected routes (Admin only)
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.post('/upload', upload.single('image'), productController.uploadImage);
router.post('/', upload.array('images', 5), productController.createProduct);
router.patch('/:id', upload.array('images', 5), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
