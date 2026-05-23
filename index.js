const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./models/Product");
const multer = require("multer");

require("dotenv").config();

const port = process.env.PORT || 5000;


// ✅ ROOT CHECK
app.get("/", (req, res) => {
    res.send("Backend is running");
});


// ✅ CORS FIX
app.use(cors({
    origin: "*"
}));

app.use(express.json());


// 🔥 IMPORTANT: VERCEL SAFE MULTER (memoryStorage)
const storage = multer.memoryStorage();
const upload = multer({ storage });


// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));


// 🚀 API ROUTE
app.post('/api/product', upload.single('image'), async (req, res) => {
    try {

        const { name, description, price } = req.body;

        // validation
        if (!name || !description || !price) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Image required"
            });
        }

        const product = new Product({
            name,
            description,
            price: Number(price),

            // ✅ VERCEL SAFE STORAGE
            image: req.file.buffer.toString("base64")
        });

        await product.save();

        res.status(201).json({
            message: "Product uploaded successfully",
            product
        });

    } catch (err) {
        console.log("ERROR:", err);

        res.status(500).json({
            message: "Server Error"
        });
    }
});


module.exports = app;