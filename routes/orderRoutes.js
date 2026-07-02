const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Allow guests to create orders, but track them if logged in
router.post('/', authMiddleware.optionalProtect, orderController.createOrder);
router.patch('/:id/pay', orderController.payOrder);
router.post('/paystack-webhook', orderController.paystackWebhook);

// Protect other routes
router.use(authMiddleware.protect);

// User routes
router.get('/mine', orderController.getMyOrders);

// Admin routes
router.use(authMiddleware.restrictTo('admin'));

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrder);
router.delete('/all', orderController.deleteAllOrders);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
