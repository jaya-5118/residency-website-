import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { motion } from 'framer-motion';
import { Hotel } from 'lucide-react';
import './Gallery.css';
import { useLanguage } from '../LanguageContext';

const Gallery = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/gallery`);
        setImages(response.data);
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <motion.div 
      className="gallery-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="hero-banner glass card-3d">
        <Hotel size={64} className="hero-logo" />
        <h1>{t('gal_title')}</h1>
        <p>{t('gal_subtitle')}</p>
      </div>

      <div className="gallery-grid">
        {loading ? (
          <p style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>Loading gallery...</p>
        ) : images.length > 0 ? (
          images.map((img, index) => (
            <motion.div 
              key={img.id}
              className="gallery-item card-3d"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
            >
              <img 
                src={`${API_BASE_URL}/uploads/${img.filename}`} 
                alt={img.title} 
                loading="lazy" 
                onError={(e) => { 
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                }} 
              />
              <div className="img-overlay">
                <h3>{img.title}</h3>
              </div>
            </motion.div>
          ))
        ) : (
          <div style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1', padding: '3rem' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Gallery is currently empty.</h3>
            <p>Admin can upload images from the Admin Data tab.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Gallery;
