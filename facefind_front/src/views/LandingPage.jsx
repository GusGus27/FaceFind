import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Statistics from './components/Statistics';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import UserCasesView from './views/UserCasesView';
import './App.css';

function App() {
  return (
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
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;