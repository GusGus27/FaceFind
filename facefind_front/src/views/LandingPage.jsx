import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Statistics from '../components/Statistics';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';

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
