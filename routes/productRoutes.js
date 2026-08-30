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

const uploadFields = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'modelImages', maxCount: 10 },
    { name: 'sizeGuideImage', maxCount: 1 }
]);

router.post('/upload', upload.single('image'), productController.uploadImage);
router.post('/', uploadFields, productController.createProduct);
router.patch('/:id', uploadFields, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
