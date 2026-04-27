import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Download, Database, Users, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import './AdminView.css';
import { useLanguage } from '../LanguageContext';

const AdminView = () => {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  
  const [bookings, setBookings] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [imageTitle, setImageTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [qrFile, setQrFile] = useState(null);
  const [currentQr, setCurrentQr] = useState(null);
  const [qrUploading, setQrUploading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '1234') {
      setIsAdmin(true);
    } else {
      alert("Incorrect password!");
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      fetchQr();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, galleryRes] = await Promise.all([
        axios.get('http://localhost:5000/api/bookings'),
        axios.get('http://localhost:5000/api/gallery')
      ]);
      setBookings(bookingsRes.data);
      setGalleryImages(galleryRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQr = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/settings/gpay-qr');
      setCurrentQr(res.data.value);
    } catch (error) {
      console.error("Error fetching QR:", error);
    }
  };

  const handleDownloadExcel = () => {
    window.open('http://localhost:5000/api/download-excel', '_blank');
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile || !imageTitle) return alert("Please provide both title and image file");
    
    const formData = new FormData();
    formData.append('title', imageTitle);
    formData.append('image', imageFile);

    try {
      setUploading(true);
      await axios.post('http://localhost:5000/api/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Image uploaded successfully!');
      setImageTitle('');
      setImageFile(null);
      e.target.reset();
      fetchData(); // Refresh the gallery list
    } catch (error) {
      console.error("Error uploading image:", error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleQrUpload = async (e) => {
    e.preventDefault();
    if (!qrFile) return alert("Please select a QR code image");
    
    const formData = new FormData();
    formData.append('image', qrFile);

    try {
      setQrUploading(true);
      await axios.post('http://localhost:5000/api/settings/gpay-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('GPay QR Code updated successfully!');
      setQrFile(null);
      e.target.reset();
      fetchQr();
    } catch (error) {
      console.error("Error uploading QR:", error);
      alert('Failed to upload QR code');
    } finally {
      setQrUploading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/gallery/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting image:", error);
      alert('Failed to delete image');
    }
  };

  if (!isAdmin) {
    return (
      <motion.div 
        className="admin-login-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="login-box glass">
          <Database size={48} className="admin-icon" />
          <h2>{t('adm_login_title')}</h2>
          <p>{t('adm_login_p')}</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder={t('adm_password')} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">{t('adm_login_btn')}</button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="admin-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="admin-header glass">
        <div className="admin-title">
          <Database size={32} className="admin-icon" />
          <h1>{t('adm_title')}</h1>
        </div>
        <button className="btn-primary" onClick={handleDownloadExcel}>
          <Download size={18} />
          <span>{t('adm_download')}</span>
        </button>
      </div>

      <div className="stats-container glass">
        <div className="stat-card">
          <Users size={24} />
          <div className="stat-info">
            <h3>{t('adm_total_bookings')}</h3>
            <p>{bookings.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <ImageIcon size={24} />
          <div className="stat-info">
            <h3>{t('adm_gallery_imgs')}</h3>
            <p>{galleryImages.length}</p>
          </div>
        </div>
      </div>

      <div className="admin-settings-grid">
        <div className="gallery-admin-container glass">
          <h2>{t('adm_gal_mgmt')}</h2>
          
          <form className="upload-form" onSubmit={handleImageUpload}>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Image Title (e.g. Luxury Suite)" 
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                required 
              />
            </div>
            <button type="submit" disabled={uploading} className="btn-primary">
              <Upload size={18} />
              <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
            </button>
          </form>

          <div className="admin-gallery-grid">
            {galleryImages.map((img) => (
              <div key={img.id} className="admin-gallery-item">
                <img src={`http://localhost:5000/uploads/${img.filename}`} alt={img.title} />
                <div className="admin-gallery-item-info">
                  <span>{img.title}</span>
                  <button type="button" onClick={() => handleDeleteImage(img.id)} className="btn-delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="payment-admin-container glass">
          <h2>{t('adm_pay_qr')}</h2>
          <p className="subtitle">{t('adm_pay_qr_sub')}</p>
          
          <form className="qr-upload-form" onSubmit={handleQrUpload}>
            <div className="form-group">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setQrFile(e.target.files[0])}
                required 
              />
            </div>
            <button type="submit" disabled={qrUploading} className="btn-primary">
              <Upload size={18} />
              <span>{qrUploading ? 'Updating...' : 'Update GPay QR'}</span>
            </button>
          </form>

          {currentQr && (
            <div className="current-qr-preview">
              <p>Current Active QR Code:</p>
              <img src={`http://localhost:5000/uploads/${currentQr}`} alt="GPay QR" />
            </div>
          )}
        </div>
      </div>

      <div className="table-container glass">
        <h2>{t('adm_recent')}</h2>
        {loading ? (
          <p>Loading data...</p>
        ) : bookings.length > 0 ? (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Room Type</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.name}</td>
                    <td>{booking.phone}</td>
                    <td>{booking.room_type}</td>
                    <td>{booking.checkin}</td>
                    <td>{booking.checkout}</td>
                    <td>{booking.total_amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No bookings found in the database.</p>
        )}
      </div>
    </motion.div>
  );
};

export default AdminView;
