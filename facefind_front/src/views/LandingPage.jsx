import React from 'react';
import Header from '../components/common/Header';
import Hero from '../components/landing/Hero';
import About from '../components/landing/About';
import Statistics from '../components/landing/Statistics';
import ContactForm from '../components/landing/ContactForm';
import Footer from '../components/common/Footer';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <main>
        <Hero />
        <About />
        <Statistics />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;