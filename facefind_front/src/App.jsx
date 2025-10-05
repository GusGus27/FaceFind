import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Statistics from './components/Statistics';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import UserCasesView from './views/UserCasesView';
import AdminPanel from './views/AdminPanel';
import './App.css';

import LandingPage from './views/LandingPage';
import Login from './views/Login/Login.jsx';
import Register from './views/Register/Register.jsx';

function AppContent() {
  const location = useLocation();
  const hideHeaderFooter = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="app">
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            <main>
              <Hero />
              <About />
              <Statistics />
              <ContactForm />
            </main>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cases" element={<UserCasesView />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;