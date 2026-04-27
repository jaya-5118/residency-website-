const express = require('express');
const cors = require('cors');
const db = require('./db');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Helper function to update Excel sheet
const updateExcelSheet = () => {
  db.all('SELECT * FROM bookings', [], (err, rows) => {
    if (err) {
      console.error('Error fetching data for Excel', err);
      return;
    }
    
    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    
    const excelPath = path.resolve(__dirname, 'bookings.xlsx');
    xlsx.writeFile(workbook, excelPath);
    console.log('Excel file updated.');
  });
};

// API: Create a new booking
app.post('/api/bookings', (req, res) => {
  const {
    name, phone, aadhar, room_no, room_type, address,
    checkin, checkout, car_number, payment_method, amount
  } = req.body;

  // Calculate GST (assuming 18% GST for example)
  const gst = amount * 0.18;
  const total_amount = amount + gst;

  const sql = `INSERT INTO bookings (
    name, phone, aadhar, room_no, room_type, address,
    checkin, checkout, car_number, payment_method, amount, gst, total_amount
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    name, phone, aadhar, room_no, room_type, address,
    checkin, checkout, car_number, payment_method, amount, gst, total_amount
  ];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Update Excel sheet asynchronously after successful insertion
    updateExcelSheet();
    
    res.status(201).json({
      id: this.lastID,
      message: 'Booking created successfully',
      booking: { ...req.body, gst, total_amount }
    });
  });
});

// API: Search bookings by customer name or phone
app.get('/api/bookings/search', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const sql = `SELECT * FROM bookings WHERE name LIKE ? OR phone LIKE ? ORDER BY created_at DESC`;
  const params = [`%${query}%`, `%${query}%`];

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API: Get all bookings
app.get('/api/bookings', (req, res) => {
  db.all('SELECT * FROM bookings ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API: Delete a booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM bookings WHERE id = ?', id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    updateExcelSheet();
    res.json({ message: 'Booking deleted' });
  });
});

// API: Download Excel Sheet
app.get('/api/download-excel', (req, res) => {
  const excelPath = path.resolve(__dirname, 'bookings.xlsx');
  if (fs.existsSync(excelPath)) {
    res.download(excelPath, 'Hotel_Bookings.xlsx');
  } else {
    res.status(404).json({ error: 'Excel file not found yet. Please make a booking first.' });
  }
});

// API: Get all gallery images
app.get('/api/gallery', (req, res) => {
  db.all('SELECT * FROM gallery_images ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API: Upload a new gallery image
app.post('/api/gallery', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const { title } = req.body;
  if (!title) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Title is required' });
  }

  const filename = req.file.filename;
  const sql = `INSERT INTO gallery_images (title, filename) VALUES (?, ?)`;
  
  db.run(sql, [title, filename], function (err) {
    if (err) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: err.message });
    }
    
    res.status(201).json({
      id: this.lastID,
      title,
      filename,
      message: 'Image uploaded successfully'
    });
  });
});

// API: Delete a gallery image
app.delete('/api/gallery/:id', (req, res) => {
  const { id } = req.params;
  
  // First get the filename to delete it from disk
  db.get('SELECT filename FROM gallery_images WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from DB
    db.run('DELETE FROM gallery_images WHERE id = ?', id, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Delete file from disk
      const filePath = path.join(__dirname, 'uploads', row.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      res.json({ message: 'Image deleted successfully' });
    });
  });
});

// API: Get GPay QR Code
app.get('/api/settings/gpay-qr', (req, res) => {
  db.get('SELECT value FROM settings WHERE key = ?', ['gpay_qr'], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row || { value: null });
  });
});

// API: Upload/Update GPay QR Code
app.post('/api/settings/gpay-qr', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const filename = req.file.filename;
  
  // First, see if we need to delete an old one
  db.get('SELECT value FROM settings WHERE key = ?', ['gpay_qr'], (err, row) => {
    if (row) {
      const oldPath = path.join(__dirname, 'uploads', row.value);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    // Update or Insert
    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['gpay_qr', filename], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ filename, message: 'QR Code updated successfully' });
    });
  });
});

// All other GET requests not handled will return the React app
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../client/dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('API is running. Frontend not built yet.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
