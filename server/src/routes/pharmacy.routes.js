import express from 'express';
import { query, pool } from '../config/db.js';
import { authenticatePatientToken } from '../middleware/patientAuth.js';

const router = express.Router();

// @route   GET /api/pharmacy/products
// @desc    Get catalog of pharmacy products
router.get('/products', async (req, res) => {
  try {
    const result = await query('SELECT * FROM pharmacy_products ORDER BY category, name ASC');
    res.status(200).json({
      success: true,
      count: result.rows.length,
      products: result.rows
    });
  } catch (err) {
    console.error('Fetch Products Error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching pharmacy products' });
  }
});

// @route   GET /api/pharmacy/orders
// @desc    Get pharmacy order history for the logged-in patient
router.get('/orders', authenticatePatientToken, async (req, res) => {
  try {
    const ordersResult = await query(
      `SELECT * FROM pharmacy_orders WHERE patient_id = $1 ORDER BY created_at DESC`,
      [req.patient.id]
    );

    const orders = ordersResult.rows;

    for (const order of orders) {
      const itemsResult = await query(
        `SELECT poi.*, pp.name, pp.image_url
         FROM pharmacy_order_items poi
         JOIN pharmacy_products pp ON poi.product_id = pp.id
         WHERE poi.order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    console.error('Fetch Orders Error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching pharmacy orders' });
  }
});

// @route   POST /api/pharmacy/orders
// @desc    Place a new pharmacy order with single DB transaction
router.post('/orders', authenticatePatientToken, async (req, res) => {
  const { items, deliveryAddress, prescriptionUrl } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Order items array cannot be empty'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let totalAmount = 0;
    let rxRequired = false;
    const validatedItems = [];

    for (const item of items) {
      const { productId, quantity } = item;
      const qty = parseInt(quantity, 10) || 1;

      const productRes = await client.query('SELECT * FROM pharmacy_products WHERE id = $1 FOR UPDATE', [productId]);
      if (productRes.rows.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }

      const product = productRes.rows[0];

      if (product.stock < qty) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      if (product.requires_rx) {
        rxRequired = true;
      }

      const itemPrice = parseFloat(product.price);
      totalAmount += itemPrice * qty;

      validatedItems.push({
        product,
        quantity: qty,
        price: itemPrice
      });
    }

    if (rxRequired && (!prescriptionUrl || !prescriptionUrl.trim())) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({
        success: false,
        message: 'Prescription URL is required for one or more prescription items in your order'
      });
    }

    // Insert order
    const orderRes = await client.query(
      `INSERT INTO pharmacy_orders (patient_id, total_amount, status, prescription_url, delivery_address)
       VALUES ($1, $2, 'Processing', $3, $4)
       RETURNING *`,
      [req.patient.id, totalAmount, prescriptionUrl || null, deliveryAddress || 'Default Address']
    );

    const order = orderRes.rows[0];

    // Insert items & update stock
    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO pharmacy_order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product.id, item.quantity, item.price]
      );

      await client.query(
        `UPDATE pharmacy_products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product.id]
      );
    }

    await client.query('COMMIT');
    client.release();

    order.items = validatedItems;

    res.status(201).json({
      success: true,
      message: 'Pharmacy order placed successfully',
      order
    });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Place Order Error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to place pharmacy order'
    });
  }
});

export default router;
