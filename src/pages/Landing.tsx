import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import './Landing.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const rvRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 滚动淡入
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    rvRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const goLogin = () => navigate('/login');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const setRvRef = (index: number) => (el: HTMLDivElement | null) => {
    rvRefs.current[index] = el;
  };

  const faqs = [
    { q: t('landing.faq.q1'), a: t('landing.faq.a1') },
    { q: t('landing.faq.q2'), a: t('landing.faq.a2') },
    { q: t('landing.faq.q3'), a: t('landing.faq.a3') },
    { q: t('landing.faq.q4'), a: t('landing.faq.a4') },
  ];

  return (
    <div className="landing-page">
      {/* 顶部导航 */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-brand-logo">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 12l6-6" />
                <circle cx="12" cy="12" r="2.6" />
              </svg>
            </div>
            <div className="landing-brand-name">SourceSignal</div>
          </div>
          <div className="landing-nav-links">
            <a href="#features">{t('landing.nav.features')}</a>
            <a href="#how">{t('landing.nav.how')}</a>
            <a href="#pricing">{t('landing.nav.pricing')}</a>
            <a href="#faq">{t('landing.nav.faq')}</a>
          </div>
          <div className="landing-nav-right">
            <LanguageSwitcher />
            <button className="landing-btn landing-btn-outline" onClick={goLogin}>{t('landing.nav.login')}</button>
            <button className="landing-btn landing-btn-primary" onClick={goLogin}>{t('landing.nav.freeTrial')}</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-hero-glow"></div>
        <div className="landing-hero-radar"></div>
        <div className="landing-hero-inner">
          <div>
            <span className="landing-eyebrow">
              <span className="dot"></span>
              {t('landing.hero.eyebrow')}
            </span>
            <h1>
              {t('landing.hero.title1')}<br />
              {t('landing.hero.title2')} <em>{t('landing.hero.titleHighlight')}</em> {t('landing.hero.title3')}
            </h1>
            <p className="sub">
              {t('landing.hero.desc')}
            </p>
            <div className="landing-hero-ctas">
              <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={goLogin}>
                {t('landing.hero.ctaPrimary')}
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
              <button className="landing-btn landing-btn-outline landing-btn-lg" onClick={goLogin}>
                {t('landing.hero.ctaSecondary')}
              </button>
            </div>
            <div className="landing-hero-note">{t('landing.hero.note')}</div>
          </div>
          <div className="landing-signal-col">
            <div className="landing-sig-card">
              <div className="landing-sig-top">
                <span className="landing-badge s">{t('landing.signalCards.sBadge')}</span>
                <span className="landing-sig-src">r/ChinaSourcing</span>
                <span className="landing-sig-time">{t('landing.signalCards.time2h')}</span>
              </div>
              <div className="landing-sig-title">
                {t('landing.signalCards.title1')}
              </div>
              <div className="landing-sig-tags">
                <span className="landing-tag">{t('landing.signalCards.tagPet')}</span>
                <span className="landing-tag">{t('landing.signalCards.tagNa')}</span>
                <span className="landing-tag">{t('landing.signalCards.tagAgent')}</span>
              </div>
            </div>
            <div className="landing-sig-card off">
              <div className="landing-sig-top">
                <span className="landing-badge a">{t('landing.signalCards.aBadge')}</span>
                <span className="landing-sig-src">r/Business_China</span>
                <span className="landing-sig-time">{t('landing.signalCards.time5h')}</span>
              </div>
              <div className="landing-sig-title">
                {t('landing.signalCards.title2')}
              </div>
              <div className="landing-sig-tags">
                <span className="landing-tag">{t('landing.signalCards.tagCamping')}</span>
                <span className="landing-tag">{t('landing.signalCards.tagEu')}</span>
                <span className="landing-tag">{t('landing.signalCards.tagFactory')}</span>
              </div>
            </div>
            <div className="landing-sig-card off">
              <div className="landing-sig-top">
                <span className="landing-badge b">{t('landing.signalCards.bBadge')}</span>
                <span className="landing-sig-src">r/ecommerce</span>
                <span className="landing-sig-time">{t('landing.signalCards.timeYesterday')}</span>
              </div>
              <div className="landing-sig-title">
                {t('landing.signalCards.title3')}
              </div>
              <div className="landing-sig-tags">
                <span className="landing-tag">{t('landing.signalCards.tagNewbie')}</span>
                <span className="landing-tag">{t('landing.signalCards.tagUs')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 指标条 */}
      <div className="landing-stats">
        <div className="landing-stats-inner landing-rv" ref={setRvRef(0)}>
          <div className="landing-stat">
            <div className="v num">{t('landing.stats.v1')}<small>{t('landing.stats.v1Unit')}</small></div>
            <div className="k">{t('landing.stats.v1Label')}</div>
          </div>
          <div className="landing-stat">
            <div className="v num">{t('landing.stats.v2')}<small>{t('landing.stats.v2Unit')}</small></div>
            <div className="k">{t('landing.stats.v2Label')}</div>
          </div>
          <div className="landing-stat">
            <div className="v num">{t('landing.stats.v3')}<small>{t('landing.stats.v3Unit')}</small></div>
            <div className="k">{t('landing.stats.v3Label')}</div>
          </div>
          <div className="landing-stat">
            <div className="v num">{t('landing.stats.v4')}<small>{t('landing.stats.v4Unit')}</small></div>
            <div className="k">{t('landing.stats.v4Label')}</div>
          </div>
        </div>
      </div>

      {/* 痛点 */}
      <section className="landing-section">
        <div className="landing-wrap">
          <div className="landing-sec-head landing-rv" ref={setRvRef(1)}>
            <span className="landing-eyebrow">{t('landing.pain.eyebrow')}</span>
            <h2>{t('landing.pain.title')}</h2>
            <p>{t('landing.pain.desc')}</p>
          </div>
          <div className="landing-pain-grid landing-rv" ref={setRvRef(2)}>
            <div className="landing-pain">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v6M12 16.5v.5" />
                </svg>
              </div>
              <h3>{t('landing.pain.p1Title')}</h3>
              <p>{t('landing.pain.p1Desc')}</p>
            </div>
            <div className="landing-pain">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M4 7h16v13H4z" />
                  <path d="M4 7l3-4h10l3 4" />
                </svg>
              </div>
              <h3>{t('landing.pain.p2Title')}</h3>
              <p>{t('landing.pain.p2Desc')}</p>
            </div>
            <div className="landing-pain">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12l3 3 5-6" />
                </svg>
              </div>
              <h3>{t('landing.pain.p3Title')}</h3>
              <p>{t('landing.pain.p3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 功能 */}
      <section className="landing-section" id="features">
        <div className="landing-wrap" style={{ paddingTop: 0 }}>
          <div className="landing-sec-head landing-rv" ref={setRvRef(3)}>
            <span className="landing-eyebrow">{t('landing.features.eyebrow')}</span>
            <h2>{t('landing.features.title')}</h2>
            <p>{t('landing.features.desc')}</p>
          </div>
          <div className="landing-feat-grid landing-rv" ref={setRvRef(4)}>
            <div className="landing-feat">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                  <path d="M11 8v3l2 2" />
                </svg>
              </div>
              <h3>{t('landing.features.f1Title')}</h3>
              <p>{t('landing.features.f1Desc')}</p>
            </div>
            <div className="landing-feat">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3l2.2 4.8L19 9l-4 3.5 1 5.5-4-2.6L8 18l1-5.5L5 9l4.8-1.2z" />
                </svg>
              </div>
              <h3>{t('landing.features.f2Title')}</h3>
              <p>{t('landing.features.f2Desc')}</p>
            </div>
            <div className="landing-feat">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4z" />
                </svg>
              </div>
              <h3>{t('landing.features.f3Title')}</h3>
              <p>{t('landing.features.f3Desc')}</p>
            </div>
            <div className="landing-feat">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M4 5h16v14H4z" />
                  <path d="M4 9h16M9 5v14" />
                </svg>
              </div>
              <h3>{t('landing.features.f4Title')}</h3>
              <p>{t('landing.features.f4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 流程 */}
      <section className="landing-section" id="how">
        <div className="landing-wrap" style={{ paddingTop: 0 }}>
          <div className="landing-sec-head landing-rv" ref={setRvRef(5)}>
            <span className="landing-eyebrow">{t('landing.how.eyebrow')}</span>
            <h2>{t('landing.how.title')}</h2>
          </div>
          <div className="landing-how-grid landing-rv" ref={setRvRef(6)}>
            <div className="landing-step">
              <div className="n">1</div>
              <h3>{t('landing.how.s1Title')}</h3>
              <p>{t('landing.how.s1Desc')}</p>
            </div>
            <div className="landing-step">
              <div className="n">2</div>
              <h3>{t('landing.how.s2Title')}</h3>
              <p>{t('landing.how.s2Desc')}</p>
            </div>
            <div className="landing-step">
              <div className="n">3</div>
              <h3>{t('landing.how.s3Title')}</h3>
              <p>{t('landing.how.s3Desc')}</p>
            </div>
            <div className="landing-step">
              <div className="n">4</div>
              <h3>{t('landing.how.s4Title')}</h3>
              <p>{t('landing.how.s4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 套餐 */}
      <section className="landing-section" id="pricing">
        <div className="landing-wrap" style={{ paddingTop: 0 }}>
          <div className="landing-sec-head landing-rv" ref={setRvRef(7)}>
            <span className="landing-eyebrow">{t('landing.pricing.eyebrow')}</span>
            <h2>{t('landing.pricing.title')}</h2>
            <p>{t('landing.pricing.desc')}</p>
          </div>
          <div className="landing-plan-grid landing-rv" ref={setRvRef(8)}>
            <div className="landing-plan">
              <div className="pn">{t('landing.pricing.trialName')}</div>
              <div className="pu">{t('landing.pricing.trialPrice')}<small>{t('landing.pricing.trialUnit')}</small></div>
              <div className="pd">{t('landing.pricing.trialDesc')}</div>
              <ul>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  {t('landing.pricing.trialF1')}
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  {t('landing.pricing.trialF2')}
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  {t('landing.pricing.trialF3')}
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  {t('landing.pricing.trialF4')}
                </li>
                <li className="off">
                  <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  {t('landing.pricing.trialF5')}
                </li>
              </ul>
              <button className="landing-btn landing-btn-outline landing-btn-block" onClick={goLogin}>
                {t('landing.pricing.trialCta')}
              </button>
            </div>
            <div className="landing-plan hot">
              <div className="flag">{t('landing.pricing.hotFlag')}</div>
              <div className="pn">{t('landing.pricing.paidName')}</div>
              <div className="pu">{t('landing.pricing.paidPrice')}<small>{t('landing.pricing.paidUnit')}</small></div>
              <div className="pd">{t('landing.pricing.paidDesc')}</div>
              <ul>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  {t('landing.pricing.paidF1')}
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  {t('landing.pricing.paidF2')}
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  {t('landing.pricing.paidF3')}
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  {t('landing.pricing.paidF4')}
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  {t('landing.pricing.paidF5')}
                </li>
              </ul>
              <button className="landing-btn landing-btn-primary landing-btn-block" onClick={goLogin}>
                {t('landing.pricing.paidCta')}
              </button>
            </div>
          </div>
          <div className="landing-year-note">
            {t('landing.pricing.yearNote')} <b>{t('landing.pricing.yearDiscount')}</b>{t('landing.pricing.yearNoteSuffix')}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-section" id="faq">
        <div className="landing-wrap" style={{ paddingTop: 0 }}>
          <div className="landing-sec-head landing-rv" ref={setRvRef(9)}>
            <span className="landing-eyebrow">{t('landing.faq.eyebrow')}</span>
            <h2>{t('landing.faq.title')}</h2>
          </div>
          <div className="landing-faq landing-rv" ref={setRvRef(10)}>
            {faqs.map((faq, index) => (
              <div key={index} className={`landing-faq-item ${openFaq === index ? 'open' : ''}`}>
                <button className="landing-faq-q" onClick={() => toggleFaq(index)}>
                  {faq.q}
                  <span className="arr">+</span>
                </button>
                <div
                  className="landing-faq-a"
                  style={{ maxHeight: openFaq === index ? '200px' : '0' }}
                >
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="landing-section">
        <div className="landing-wrap" style={{ paddingTop: 0 }}>
          <div className="landing-cta-band landing-rv" ref={setRvRef(11)}>
            <h2>{t('landing.cta.title')}</h2>
            <p>{t('landing.cta.desc')}</p>
            <button className="landing-btn landing-btn-lg" onClick={goLogin}>
              {t('landing.cta.button')}
              <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-foot">
          <div>{t('landing.footer.copyright')}</div>
          <div className="fl">
            <a href="#features">{t('landing.nav.features')}</a>
            <a href="#pricing">{t('landing.nav.pricing')}</a>
            <a href="#" onClick={(e) => e.preventDefault()}>{t('landing.footer.helpCenter')}</a>
            <a href="#" onClick={(e) => e.preventDefault()}>{t('landing.footer.contactUs')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
