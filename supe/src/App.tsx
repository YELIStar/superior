import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import './assets/App.css';

function App() {
    return (
        <div className="app">
            <Header />
            <main>
                <Hero />
                <Features />
                <ContactForm />
            </main>
            <Footer />
        </div>
    );
}

export default App;