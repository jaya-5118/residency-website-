import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, FileSpreadsheet, CheckCircle, Smartphone, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './Registration.css';

import { useLanguage } from '../LanguageContext';

const Registration = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '', phone: '', aadhar: '', room_no: '', room_type: 'AC',
    address: '', checkin: '', checkout: '', car_number: '',
    payment_method: 'Cash', amount: ''
  });

  const [status, setStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const fetchQr = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/settings/gpay-qr`);
        if (res.data && res.data.value) {
          setQrCode(res.data.value);
        }
      } catch (err) {
        console.error("Error fetching QR:", err);
      }
    };
    fetchQr();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'payment_method' && value === 'GPay') {
      setShowQrModal(true);
    }
  };

  const calculateGST = () => {
    const amt = parseFloat(formData.amount) || 0;
    return (amt * 0.18).toFixed(2);
  };

  const calculateTotal = () => {
    const amt = parseFloat(formData.amount) || 0;
    const gst = amt * 0.18;
    return (amt + gst).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/bookings`, formData);
      setStatus({ type: 'success', message: t('reg_success') });
      setFormData({
        name: '', phone: '', aadhar: '', room_no: '', room_type: 'AC',
        address: '', checkin: '', checkout: '', car_number: '',
        payment_method: 'Cash', amount: ''
      });
      setTimeout(() => setStatus(null), 5000);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: t('reg_error') });
    }
  };

  return (
    <motion.div 
      className="registration-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass form-container card-3d">
        <div className="form-header">
          <h2>{t('reg_title')}</h2>
          <p>{t('reg_subtitle')}</p>
        </div>

        {status && (
          <motion.div 
            className={`status-message ${status.type}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
          >
            <CheckCircle size={20} />
            {status.message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-grid">
            <div className="input-group">
              <label>{t('reg_name')}</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
            </div>
            <div className="input-group">
              <label>{t('reg_phone')}</label>
              <input type="text" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 00000 00000" />
            </div>
            <div className="input-group">
              <label>{t('reg_aadhar')}</label>
              <input type="text" name="aadhar" required value={formData.aadhar} onChange={handleChange} placeholder="0000 0000 0000" />
            </div>
            <div className="input-group">
              <label>{t('reg_room_no')}</label>
              <input type="text" name="room_no" required value={formData.room_no} onChange={handleChange} placeholder="101" />
            </div>
            <div className="input-group">
              <label>{t('reg_room_type')}</label>
              <select name="room_type" value={formData.room_type} onChange={handleChange}>
                <option value="AC">Premium AC</option>
                <option value="Non-AC">Deluxe Non-AC</option>
              </select>
            </div>
            <div className="input-group">
              <label>{t('reg_vehicle')}</label>
              <input type="text" name="car_number" value={formData.car_number} onChange={handleChange} placeholder="KA 01 XX 0000" />
            </div>
            <div className="input-group full-width">
              <label>{t('reg_address')}</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange} placeholder="Enter your full address" />
            </div>
            <div className="input-group">
              <label>{t('reg_checkin')}</label>
              <input type="datetime-local" name="checkin" required value={formData.checkin} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>{t('reg_checkout')}</label>
              <input type="datetime-local" name="checkout" required value={formData.checkout} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>{t('reg_payment')}</label>
              <select name="payment_method" value={formData.payment_method} onChange={handleChange}>
                <option value="Cash">Pay at Hotel (Cash)</option>
                <option value="GPay">Google Pay (UPI)</option>
              </select>
            </div>
            <div className="input-group">
              <label>{t('reg_amount')}</label>
              <input type="number" name="amount" required value={formData.amount} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>

          <div className="calculation-box glass">
            <div className="calc-row">
              <span>{t('reg_base')}:</span>
              <span>₹{parseFloat(formData.amount || 0).toLocaleString()}</span>
            </div>
            <div className="calc-row">
              <span>{t('reg_gst')}:</span>
              <span>₹{parseFloat(calculateGST()).toLocaleString()}</span>
            </div>
            <div className="calc-row total">
              <span>{t('reg_total')}:</span>
              <span className="total-amount">₹{parseFloat(calculateTotal()).toLocaleString()}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              <Save size={18} />
              {t('reg_btn')}
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {showQrModal && (
          <motion.div 
            className="qr-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQrModal(false)}
          >
            <motion.div 
              className="qr-modal glass"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setShowQrModal(false)}>
                <X size={24} />
              </button>
              <Smartphone size={48} className="qr-icon" />
              <h3>{t('pay_scan')}</h3>
              {qrCode ? (
                <>
                  <p>{t('pay_instr')} <strong>₹{calculateTotal()}</strong></p>
                  <div className="qr-image-container">
                    <img src={`${API_BASE_URL}/uploads/${qrCode}`} alt="Payment QR" />
                  </div>
                </>
              ) : (
                <div className="no-qr-message">
                  <p>{t('pay_no_qr')}</p>
                </div>
              )}
              <button className="btn-primary" onClick={() => setShowQrModal(false)}>
                {qrCode ? t('pay_done') : t('pay_close')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Registration;
