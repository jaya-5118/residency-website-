import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Registration from './pages/Registration';
import SearchCustomer from './pages/SearchCustomer';
import Gallery from './pages/Gallery';
import AdminView from './pages/AdminView';

import { LanguageProvider } from './LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Navbar />
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Registration />} />
            <Route path="/search" element={<SearchCustomer />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin" element={<AdminView />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
