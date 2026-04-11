const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Allow guests to create orders, but restrict viewing to admin
router.post('/', orderController.createOrder);

// Protect other routes
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
