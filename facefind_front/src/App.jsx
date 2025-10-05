import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={
              <main>
                <Hero />
                <About />
                <Statistics />
                <ContactForm />
              </main>
            } />
            <Route path="/cases" element={<UserCasesView />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;