import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, FileSpreadsheet, Calculator, Eye, Activity, Smartphone, Sprout, CheckCircle2, ChevronDown, Globe } from 'lucide-react';
import tractorImg from './assets/tractor.png';
import laptopImg from './assets/laptop.png';
import { translations } from './locales';

function App() {
  const [lang, setLang] = useState('pt');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const t = translations[lang];

  const handleLangChange = (newLang) => {
    setLang(newLang);
    setShowLangMenu(false);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <>
      <header>
        <div className="container">
          <div className="logo brand-font">
            <Leaf className="logo-icon" size={24} />
            <span>AgroGemini</span>
          </div>
          
          <nav className="main-nav">
            <a href="#plataforma">{t.nav.platform}</a>
            <a href="#lab">{t.nav.labPortal}</a>
            <a href="#produtor">{t.nav.farmerPortal}</a>
          </nav>
          
          <div className="header-actions">
            <div className="lang-selector">
              <button 
                className="lang-btn" 
                onClick={() => setShowLangMenu(!showLangMenu)}
              >
                <Globe size={16} />
                {lang.toUpperCase()}
                <ChevronDown size={14} />
              </button>
              {showLangMenu && (
                <div className="lang-menu">
                  <button className={`lang-option ${lang === 'pt' ? 'active' : ''}`} onClick={() => handleLangChange('pt')}>Português</button>
                  <button className={`lang-option ${lang === 'en' ? 'active' : ''}`} onClick={() => handleLangChange('en')}>English</button>
                  <button className={`lang-option ${lang === 'es' ? 'active' : ''}`} onClick={() => handleLangChange('es')}>Español</button>
                </div>
              )}
            </div>
            
            <button className="sign-in">{t.actions.signIn}</button>
            <button className="btn-primary">
              <span className="hide-mobile">{t.actions.signUp}</span>
              <span className="show-mobile-only" style={{display: 'none'}}>{t.actions.signUpShort}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="plataforma">
          <div className="container">
            <motion.div 
              className="hero-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.span className="badge" variants={fadeInUp}>
                <span style={{ fontSize: '10px' }}>●</span> {t.hero.badge}
              </motion.span>
              <motion.h1 variants={fadeInUp}>
                {t.hero.titleLine1}<br />
                <span>{t.hero.titleLine2}</span>
              </motion.h1>
              <motion.p variants={fadeInUp}>
                {t.hero.description}
              </motion.p>
              <motion.button className="btn-primary" variants={fadeInUp}>
                {t.actions.exploreBtn}
              </motion.button>
            </motion.div>
            
            <motion.div 
              className="hero-image"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img src={tractorImg} alt="Agro machine" />
            </motion.div>
          </div>
        </section>

        <section id="lab" className="lab-section">
          <div className="container">
            <motion.div 
              className="section-header"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <span className="badge">{t.lab.badge}</span>
              <h2>{t.lab.title}</h2>
              <p>{t.lab.description}</p>
            </motion.div>
            
            <div className="lab-content">
              <motion.div 
                className="lab-image"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <img src={laptopImg} alt="Dashboard system" />
              </motion.div>
              
              <motion.div 
                className="feature-list"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {t.lab.features.map((feat, idx) => (
                  <motion.div key={idx} className="feature-item" variants={fadeInUp}>
                    <div className="feature-icon">
                      {idx === 0 && <FileSpreadsheet size={20} />}
                      {idx === 1 && <Calculator size={20} />}
                      {idx === 2 && <Eye size={20} />}
                      {idx === 3 && <Activity size={20} />}
                    </div>
                    <div className="feature-text">
                      <h3>{feat.title}</h3>
                      <p>{feat.text}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section id="produtor" className="farmer-section">
          <div className="container">
            <motion.div 
              className="section-header"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <span className="badge">{t.farmer.badge}</span>
              <h2>{t.farmer.title}</h2>
              <p>{t.farmer.description}</p>
            </motion.div>
            
            <motion.div 
              className="farmer-cards"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div className="farmer-card" variants={fadeInUp}>
                <div className="feature-icon">
                  <Smartphone size={24} />
                </div>
                <div className="feature-text">
                  <h3>{t.farmer.features[0].title}</h3>
                  <p>{t.farmer.features[0].text}</p>
                </div>
              </motion.div>
              
              <motion.div className="farmer-card" variants={fadeInUp}>
                <div className="feature-icon">
                  <Sprout size={24} />
                </div>
                <div className="feature-text">
                  <h3>{t.farmer.features[1].title}</h3>
                  <p>{t.farmer.features[1].text}</p>
                </div>
              </motion.div>
              
              <motion.div className="farmer-card" variants={fadeInUp}>
                <div className="feature-icon">
                  <CheckCircle2 size={24} />
                </div>
                <div className="feature-text">
                  <h3>{t.farmer.features[2].title}</h3>
                  <p>{t.farmer.features[2].text}</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="cta-section">
          <motion.div 
            className="container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2>{t.cta.title}</h2>
            <p>{t.cta.description}</p>
            <button className="btn-primary">{t.actions.signUp}</button>
          </motion.div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="footer-top">
            <div>
              <div className="footer-logo">
                <Leaf className="logo-icon" size={20} />
                <span>AgroGemini</span>
              </div>
              <p className="footer-desc">
                {t.footer.desc}
              </p>
            </div>
            
            <div className="footer-links">
              <h4>{t.footer.platformTitle}</h4>
              <ul>
                {t.footer.platformLinks.map((link, idx) => (
                  <li key={idx}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div className="footer-links">
              <h4>{t.footer.companyTitle}</h4>
              <ul>
                {t.footer.companyLinks.map((link, idx) => (
                  <li key={idx}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
