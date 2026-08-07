require('dotenv').config();
const mongoose = require('mongoose')

const URI = process.env.MONGO_URL

async function connect() {
    try {
        await mongoose.connect(URI, {
            maxPoolSize: 10,          // maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000,  // fail fast if mongo unreachable
            socketTimeoutMS: 45000,   // close idle sockets after 45s
            connectTimeoutMS: 10000,  // give up initial connection after 10s
        });
        console.log("Connected Successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1); // crash fast on startup failure rather than silent bad state
    }
}

connect();
