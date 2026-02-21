const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('MongoDB connection failed. Please ensure MongoDB is running.');
    console.error('You can:');
    console.error('1. Start local MongoDB: mongod');
    console.error('2. Or use MongoDB Atlas connection string in .env');
    // Don't exit process - let server run without DB for now
    console.error('Server will continue running but database operations will fail.');
  }
};

module.exports = connectDB;
