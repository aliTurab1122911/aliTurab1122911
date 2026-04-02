const path = require('path');
const multer = require('multer');
const express = require('express');
const controller = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg');
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({ storage });

router.use(requireAdmin);

router.get('/', controller.dashboard);
router.get('/products', controller.products);
router.post('/products', upload.single('imageFile'), controller.createProduct);
router.get('/products/:id/edit', controller.showEditProduct);
router.post('/products/:id/edit', upload.single('imageFile'), controller.updateProduct);
router.post('/products/:id/toggle', controller.toggleProduct);

router.get('/orders', controller.orders);
router.post('/orders/:id/status', controller.updateOrderStatus);

module.exports = router;
