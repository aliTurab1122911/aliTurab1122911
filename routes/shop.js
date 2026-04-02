const express = require('express');
const shopController = require('../controllers/shopController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', shopController.home);
router.get('/about', shopController.about);
router.get('/contact', shopController.contact);
router.get('/products', shopController.products);
router.get('/products/:slug', shopController.productDetail);

router.get('/cart', cartController.showCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/update', cartController.updateCart);
router.post('/cart/remove/:variantId', cartController.removeFromCart);

router.get('/checkout', orderController.showCheckout);
router.post('/checkout', orderController.placeOrder);
router.get('/orders/:id/success', orderController.successPage);
router.get('/account/orders', requireAuth, orderController.orderHistory);

module.exports = router;
