const express = require('express');
const controller = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAdmin);

router.get('/', controller.dashboard);
router.get('/products', controller.products);
router.post('/products', controller.createProduct);
router.post('/products/:id/toggle', controller.toggleProduct);

router.get('/orders', controller.orders);
router.post('/orders/:id/status', controller.updateOrderStatus);

module.exports = router;
