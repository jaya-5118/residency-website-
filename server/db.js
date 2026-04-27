const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create bookings table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      aadhar TEXT NOT NULL,
      room_no TEXT NOT NULL,
      room_type TEXT NOT NULL,
      address TEXT NOT NULL,
      checkin TEXT NOT NULL,
      checkout TEXT NOT NULL,
      car_number TEXT,
      payment_method TEXT NOT NULL,
      amount REAL NOT NULL,
      gst REAL NOT NULL,
      total_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating bookings table', err.message);
      }
    });

    // Create gallery_images table
    db.run(`CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      type TEXT DEFAULT 'room',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating gallery_images table', err.message);
      }
    });

    // Create settings table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Error creating settings table', err.message);
      }
    });
  }
});

module.exports = db;
