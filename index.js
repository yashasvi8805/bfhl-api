require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
console.log("KEY:", process.env.GEMINI_API_KEY ? "LOADED" : "NOT LOADED");

// ✅ GET route
app.get("/health", (req, res) => {
    res.json({
        is_success: true,
        official_email: process.env.EMAIL
    });
});

// ✅ POST route
app.post("/bfhl", async (req, res) => {
    try {
        const keys = Object.keys(req.body);

        // Only 1 key allowed
        if (keys.length !== 1) {
            return res.status(400).json({
                is_success: false,
                error: "Invalid request format"
            });
        }

        const key = keys[0];
        const value = req.body[key];
        let result;

        switch (key) {
            case "fibonacci":
                if (!Number.isInteger(value) || value < 0) {
                    throw "Invalid Fibonacci input";
                }
                result = fibonacci(value);
                break;

            case "prime":
                if (!Array.isArray(value)) {
                    throw "Invalid Prime input";
                }
                result = value.filter(isPrime);
                break;

            case "lcm":
                if (!Array.isArray(value) || value.length === 0) {
                    throw "Invalid LCM input";
                }
                result = value.reduce((a, b) => lcm(a, b));
                break;

            case "hcf":
                if (!Array.isArray(value) || value.length === 0) {
                    throw "Invalid HCF input";
                }
                result = value.reduce((a, b) => gcd(a, b));
                break;

            // ✅ FIXED AI CASE
           case "AI":
    if (typeof value !== "string") {
        throw new Error("Invalid AI input");
    }

    const aiResponse = await axios({
    method: "post",
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`,
    params: {
        key: process.env.GEMINI_API_KEY
    },
    headers: {
        "Content-Type": "application/json"
    },
    data: {
        contents: [
            {
                parts: [{ text: value }]
            }
        ]
    }
});


    result =
        aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "No response";

    break;




            default:
                throw "Unknown key";
        }

        res.json({
            is_success: true,
            official_email: process.env.EMAIL,
            data: result
        });

    } catch (err) {
    console.error("ERROR:", err.response?.data || err.message || err);

    res.status(400).json({
        is_success: false,
        error: err.response?.data || err.message || "Bad Request"
    });
}

});

// ❗ listen hamesha last
app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port", process.env.PORT || 3000);
});

// -------- Helper Functions --------

function fibonacci(n) {
    let a = 0, b = 1;
    let arr = [];

    for (let i = 0; i < n; i++) {
        arr.push(a);
        [a, b] = [b, a + b];
    }
    return arr;
}

function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i * i <= num; i++) {
        if (num % i === 0) return false;
    }
    return true;
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
    return (a * b) / gcd(a, b);
}