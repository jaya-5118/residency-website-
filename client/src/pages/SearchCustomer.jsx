import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, MapPin, Calendar, CreditCard, Download, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../LanguageContext';
import './SearchCustomer.css';

const SearchCustomer = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings');
      if (Array.isArray(res.data)) {
        setResults(res.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(error);
      setResults([]);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return fetchAllBookings();
    
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/bookings/search?query=${query}`);
      if (Array.isArray(res.data)) {
        setResults(res.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(error);
      setResults([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${id}`);
        // Refresh the list
        if (query) handleSearch({ preventDefault: () => {} });
        else fetchAllBookings();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDownloadExcel = () => {
    window.open('http://localhost:5000/api/download-excel', '_blank');
  };

  return (
    <motion.div 
      className="search-page"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="search-header glass card-3d">
        <div className="header-top">
          <h2>{t('search_title')}</h2>
          <button onClick={handleDownloadExcel} className="download-btn">
            <Download size={18} /> {t('adm_download')}
          </button>
        </div>
        <form onSubmit={handleSearch} className="search-bar">
          <input 
            type="text" 
            placeholder={t('search_placeholder')} 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">
            <Search size={18} /> {t('search_btn')}
          </button>
        </form>
      </div>

      <div className="results-grid">
        {results.map((booking, index) => (
          <motion.div 
            key={booking.id} 
            className="result-card glass card-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="card-header">
              <div className="header-titles">
                <h3>{booking.name}</h3>
                <span className="room-badge">Room {booking.room_no} ({booking.room_type})</span>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(booking.id)} title="Delete Booking">
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="card-body">
              <div className="info-row">
                <User size={16} /> <span>{booking.phone} | Aadhar: {booking.aadhar}</span>
              </div>
              <div className="info-row">
                <MapPin size={16} /> <span>{booking.address}</span>
              </div>
              <div className="info-row">
                <Calendar size={16} /> 
                <div className="dates">
                  <span>In: {new Date(booking.checkin).toLocaleString()}</span>
                  <span>Out: {new Date(booking.checkout).toLocaleString()}</span>
                </div>
              </div>
              <div className="info-row">
                <CreditCard size={16} /> 
                <span>{booking.payment_method} - ₹{booking.total_amount} (inc. GST)</span>
              </div>
            </div>
          </motion.div>
        ))}

        {results.length === 0 && !loading && (
          <div className="no-results">{t('search_no_results')}</div>
        )}
      </div>
    </motion.div>
  );
};

export default SearchCustomer;
