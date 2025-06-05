const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI 

const initDb = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

module.exports = initDb;