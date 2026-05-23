const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./models/Product");
const fs = require("fs");
const multer = require("multer");

require("dotenv").config();

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Backend is running");
});


// ✅ FIX 1: CORS SAFE (deploy friendly)
app.use(cors({
    origin: "*"
}));

app.use(express.json());


// ✅ FIX 2: uploads folder auto create (IMPORTANT for deploy)
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads", { recursive: true });
}

app.use('/uploads', express.static("uploads"));


// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log(err);
    });


// multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });


// API ROUTE
app.post(
    '/api/product',
    upload.single('image'),

    async (req, res) => {
        try {

            const { name, description, price } = req.body;

            // ✅ FIX 3: safer validation
            if (!req.file) {
                return res.status(400).json({
                    message: "Image required"
                });
            }

            if (!name || !description || !price) {
                return res.status(400).json({
                    message: "All fields required"
                });
            }

            const product = new Product({
                name,
                description,
                price: Number(price),
                image: req.file.path
            });

            await product.save();

            res.status(201).json({
                message: "Product has been successfully added",
                product
            });

        } catch (err) {
            console.log("SERVER ERROR:", err);

            res.status(500).json({
                message: "Server Error"
            });
        }
    }
);


// ⚠️ IMPORTANT: export for Vercel (optional but safe)
module.exports = app;