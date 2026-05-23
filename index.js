const express = require("express");
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');

require('dotenv').config();

const port = process.env.PORT || 5000;


// ✅ HOME ROUTE
app.get('/', (req, res) => {
    res.send("Backend is running");
});


// ✅ CORS FIX
app.use(cors({
    origin: "*"
}));

app.use(express.json());


// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log(err);
    });


// 🚀 UPDATED API (NO MULTER, NO CRASH)
app.post('/api/product', async (req, res) => {

    try {

        const { name, description, price, image } = req.body;

        // validation
        if (!name || !description || !price || !image) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        const product = new Product({
            name,
            description,
            price: Number(price),
            image // 👉 now image is URL (not file)
        });

        await product.save();

        res.status(201).json({
            message: "Product has been successfully added",
            product
        });

    } catch (err) {
        console.log("ERROR:", err);

        res.status(500).json({
            message: "Server Error"
        });
    }
});


// ⚠️ VERCEL REQUIRED EXPORT
module.exports = app;