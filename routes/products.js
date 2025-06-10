const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, sort, search } = req.query;
        let query = {};

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Search by name
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Sort products
        let sortOption = {};
        if (sort) {
            switch (sort) {
                case 'price-low':
                    sortOption.price = 1;
                    break;
                case 'price-high':
                    sortOption.price = -1;
                    break;
                case 'name':
                    sortOption.name = 1;
                    break;
                case 'rating':
                    sortOption.averageRating = -1;
                    break;
            }
        }

        const products = await Product.find(query).sort(sortOption);

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// Create product (admin only)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
});

// Update product (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
});

// Delete product (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
});

// Add product review
router.post('/:id/reviews', auth, async (req, res) => {
    try {
        const { rating, review } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user already reviewed
        const alreadyReviewed = product.ratings.find(
            r => r.user.toString() === req.user.id
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: 'Product already reviewed'
            });
        }

        product.ratings.push({
            user: req.user.id,
            rating,
            review
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Review added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding review',
            error: error.message
        });
    }
});

module.exports = router; 