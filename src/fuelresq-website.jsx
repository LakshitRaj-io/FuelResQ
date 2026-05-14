import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────
const SERVICES = [
  { id: "fuel", icon: "⛽", name: "Emergency Fuel", desc: "Petrol or diesel delivered to your exact location", basePrice: 200, unit: "+ fuel cost", eta: "15-25 min", tag: "MOST REQUESTED" },
  { id: "tyre", icon: "🛞", name: "Tyre Puncture", desc: "On-spot puncture repair or spare wheel fitting", basePrice: 350, unit: "flat rate", eta: "20-30 min", tag: null },
  { id: "battery", icon: "🔋", name: "Battery Jumpstart", desc: "Dead battery revival with professional equipment", basePrice: 450, unit: "flat rate", eta: "15-25 min", tag: null },
  { id: "tow", icon: "🚛", name: "Towing Service", desc: "Vehicle towed to your preferred garage safely", basePrice: 800, unit: "+ ₹30/km", eta: "25-40 min", tag: null },
  { id: "mechanic", icon: "🔧", name: "Mechanic Dispatch", desc: "Certified mechanic dispatched to diagnose & fix", basePrice: 500, unit: "diagnosis fee", eta: "20-35 min", tag: null },
  { id: "ev", icon: "⚡", name: "EV Charging", desc: "Portable emergency charging for electric vehicles", basePrice: 600, unit: "+ energy cost", eta: "25-40 min", tag: "NEW" },
  { id: "bike", icon: "🏍️", name: "Bike Assistance", desc: "Two-wheeler specific breakdown support", basePrice: 250, unit: "flat rate", eta: "10-20 min", tag: null },
  { id: "keys", icon: "🔑", name: "Locked Keys", desc: "Professional locksmith dispatched to your vehicle", basePrice: 700, unit: "flat rate", eta: "20-35 min", tag: null },
  { id: "repair", icon: "🛠️", name: "Minor Repairs", desc: "Quick roadside fixes — belts, hoses, fuses & more", basePrice: 400, unit: "+ parts cost", eta: "25-40 min", tag: null },
];

const STATS = [
  { value: "< 18", suffix: "min", label: "Avg. response time" },
  { value: "4,200", suffix: "+", label: "Verified providers" },
  { value: "98.7", suffix: "%", label: "Resolution rate" },
  { value: "50K", suffix: "+", label: "Rescues completed" },
];

const STEPS = [
  { num: "01", title: "Tap Get Help", desc: "Open FuelResQ and hit the emergency button. We capture your GPS instantly." },
  { num: "02", title: "Select Issue", desc: "Choose from 9 service categories — fuel, tyre, battery, tow, mechanic, and more." },
  { num: "03", title: "Track Live", desc: "Watch your assigned provider approach in real-time with live ETA updates." },
  { num: "04", title: "Get Rescued", desc: "Service delivered on-spot. Pay the provider directly. Rate your experience." },
];

const TESTIMONIALS = [
  { name: "Arjun M.", loc: "Chennai, NH-48", text: "Ran out of diesel at 11 PM on the highway. FuelResQ had someone there in 19 minutes. Lifesaver.", rating: 5 },
  { name: "Priya S.", loc: "Bengaluru, ORR", text: "Flat tyre with no spare. The provider fixed it roadside in under 15 minutes. Incredible service.", rating: 5 },
  { name: "Rajesh K.", loc: "Delhi NCR, Noida", text: "Dead battery in a parking basement. Jumpstart arrived faster than my cab would have. Using Shield now.", rating: 5 },
];

const SHIELD_PLANS = [
  { name: "Basic", price: 999, period: "/year", features: ["5 free dispatches/year", "Priority queue", "24/7 support", "Service history dashboard"], accent: false },
  { name: "Shield Pro", price: 2499, period: "/year", features: ["Unlimited dispatches", "Zero wait priority", "Free towing up to 25km", "Family coverage (2 vehicles)", "Dedicated helpline", "Insurance partner discounts"], accent: true },
  { name: "Fleet", price: "Custom", period: "", features: ["Unlimited vehicles", "Fleet dashboard & analytics", "Dedicated account manager", "API integration", "Custom SLAs", "Volume pricing"], accent: false },
];

// ─── CUSTOM HOOKS ────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useParallax() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const h = () => setOffset(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return offset;
}

// ─── CURSOR ──────────────────────────────────────────────────────────────
function CustomCursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    const move = (e) => { mx = e.clientX; my = e.clientY; };
    const tick = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      if (dot.current) { dot.current.style.transform = `translate(${mx}px, ${my}px)`; }
      if (ring.current) { ring.current.style.transform = `translate(${rx}px, ${ry}px)`; }
      requestAnimationFrame(tick);
    };
    const overIn = (e) => { if (e.target.closest("button, a, [data-hover]")) setHovering(true); };
    const overOut = (e) => { if (e.target.closest("button, a, [data-hover]")) setHovering(false); };
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", overIn);
    document.addEventListener("mouseout", overOut);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);
    requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", overIn);
      document.removeEventListener("mouseout", overOut);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup", up);
    };
  }, []);

  return (
    <>
      <div ref={dot} className={`cursor-dot ${clicking ? "click" : ""}`} />
      <div ref={ring} className={`cursor-ring ${hovering ? "hover" : ""} ${clicking ? "click" : ""}`} />
    </>
  );
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────

function Navbar({ onBook, activeSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { label: "Services", href: "#services" },
    { label: "How It Works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
    { label: "Shield", href: "#shield" },
  ];
  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a href="#" className="nav-logo" data-hover>
          <span className="logo-icon">◉</span>
          <span className="logo-text">Fuel<span className="logo-accent">ResQ</span></span>
        </a>
        <div className={`nav-links ${mobileOpen ? "open" : ""}`}>
          {links.map(l => (
            <a key={l.href} href={l.href} className="nav-link" data-hover onClick={() => setMobileOpen(false)}>{l.label}</a>
          ))}
        </div>
        <div className="nav-actions">
          <button className="btn-sos-small" data-hover onClick={() => document.getElementById("sos")?.scrollIntoView({ behavior: "smooth" })}>SOS</button>
          <button className="btn-primary-sm" data-hover onClick={onBook}>Get Help</button>
        </div>
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} data-hover>
          <span className={`hamburger ${mobileOpen ? "open" : ""}`} />
        </button>
      </div>
    </nav>
  );
}

function Hero({ onBook }) {
  const scrollY = useParallax();
  const [ref, vis] = useScrollReveal();
  return (
    <section className="hero" ref={ref}>
      <div className="hero-bg-grid" style={{ transform: `translateY(${scrollY * 0.15}px)` }} />
      <div className="hero-glow" />
      <div className="hero-radial" />
      <div className={`hero-content ${vis ? "in" : ""}`}>
           <h1 className="hero-title">
          Stranded?<br />
          <span className="hero-gradient">Help arrives</span> in minutes.
        </h1>
        <p className="hero-sub">
          FuelResQ connects you with verified fuel stations, mechanics, towing & emergency providers — dispatched to your exact GPS location, tracked live.
        </p>
        <div className="hero-cta-row">
          <button className="btn-emergency" data-hover onClick={onBook}>
            <span className="btn-emergency-ring" />
            Get Help Now
          </button>
          <a href="#how" className="btn-ghost" data-hover>
            See how it works →
          </a>
        </div>
        <div className="hero-stats">
          {STATS.map((s, i) => (
            <div key={i} className="hero-stat" style={{ animationDelay: `${0.6 + i * 0.12}s` }}>
              <span className="stat-value">{s.value}<span className="stat-suffix">{s.suffix}</span></span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-scroll-hint">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}

function Services({ onSelectService }) {
  const [ref, vis] = useScrollReveal();
  return (
    <section id="services" className="section" ref={ref}>
      <div className={`section-header ${vis ? "in" : ""}`}>
        <span className="section-tag">SERVICES</span>
        <h2 className="section-title">Every roadside emergency.<br /><span className="text-gradient">One platform.</span></h2>
        <p className="section-sub">9 specialized service categories. Verified providers. Real-time dispatch.</p>
      </div>
      <div className={`services-grid ${vis ? "in" : ""}`}>
        {SERVICES.map((s, i) => (
          <div key={s.id} className="service-card" style={{ animationDelay: `${i * 0.07}s` }} data-hover onClick={() => onSelectService(s)}>
            <div className="service-card-inner">
              {s.tag && <span className={`service-tag ${s.tag === "NEW" ? "tag-new" : ""}`}>{s.tag}</span>}
              <span className="service-icon">{s.icon}</span>
              <h3 className="service-name">{s.name}</h3>
              <p className="service-desc">{s.desc}</p>
              <div className="service-meta">
                <span className="service-price">₹{s.basePrice} <span className="price-unit">{s.unit}</span></span>
                <span className="service-eta">⏱ {s.eta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const [ref, vis] = useScrollReveal();
  return (
    <section id="how" className="section section-dark" ref={ref}>
      <div className={`section-header ${vis ? "in" : ""}`}>
        <span className="section-tag">HOW IT WORKS</span>
        <h2 className="section-title">From stranded to saved<br /><span className="text-gradient">in 4 steps.</span></h2>
      </div>
      <div className={`steps-track ${vis ? "in" : ""}`}>
        <div className="steps-line" />
        {STEPS.map((s, i) => (
          <div key={i} className="step-card" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
            <div className="step-num-wrap">
              <span className="step-num">{s.num}</span>
              <span className="step-dot" />
            </div>
            <div className="step-body">
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const [ref, vis] = useScrollReveal();
  return (
    <section id="pricing" className="section" ref={ref}>
      <div className={`section-header ${vis ? "in" : ""}`}>
        <span className="section-tag">PRICING</span>
        <h2 className="section-title">Transparent. No surge.<br /><span className="text-gradient">No surprises.</span></h2>
        <p className="section-sub">Pay the provider directly on service completion. Here's what each service costs.</p>
      </div>
      <div className={`pricing-table ${vis ? "in" : ""}`}>
        <div className="pricing-header-row">
          <span>Service</span><span>Base Price</span><span>Additional</span><span>Avg. ETA</span>
        </div>
        {SERVICES.map((s, i) => (
          <div key={s.id} className="pricing-row" style={{ animationDelay: `${i * 0.06}s` }}>
            <span className="pricing-service"><span className="pricing-icon">{s.icon}</span>{s.name}</span>
            <span className="pricing-base">₹{s.basePrice}</span>
            <span className="pricing-add">{s.unit}</span>
            <span className="pricing-eta">{s.eta}</span>
          </div>
        ))}
        <div className="pricing-note">
          <span className="note-icon">ℹ️</span>
          Fuel delivery = current fuel market price + ₹200 service fee. All other prices are base rates — parts & extra distance charged at actuals. Payment collected by provider on-spot.
        </div>
      </div>
    </section>
  );
}

function Shield() {
  const [ref, vis] = useScrollReveal();
  return (
    <section id="shield" className="section section-dark" ref={ref}>
      <div className={`section-header ${vis ? "in" : ""}`}>
        <span className="section-tag">FUELRESQ SHIELD</span>
        <h2 className="section-title">Annual roadside cover.<br /><span className="text-gradient">Total peace of mind.</span></h2>
        <p className="section-sub">Subscribe once. Stay covered year-round. Priority dispatch, free services, family plans.</p>
      </div>
      <div className={`shield-grid ${vis ? "in" : ""}`}>
        {SHIELD_PLANS.map((p, i) => (
          <div key={i} className={`shield-card ${p.accent ? "shield-accent" : ""}`} style={{ animationDelay: `${i * 0.12}s` }} data-hover>
            {p.accent && <div className="shield-popular">MOST POPULAR</div>}
            <h3 className="shield-name">{p.name}</h3>
            <div className="shield-price">
              {typeof p.price === "number" ? <>₹{p.price.toLocaleString()}<span className="shield-period">{p.period}</span></> : <>{p.price}</>}
            </div>
            <ul className="shield-features">
              {p.features.map((f, j) => <li key={j}><span className="check-icon">✓</span>{f}</li>)}
            </ul>
            <button className={`btn-shield ${p.accent ? "btn-shield-accent" : ""}`} data-hover>
              {p.price === "Custom" ? "Contact Sales" : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const [ref, vis] = useScrollReveal();
  return (
    <section className="section" ref={ref}>
      <div className={`section-header ${vis ? "in" : ""}`}>
        <span className="section-tag">TESTIMONIALS</span>
        <h2 className="section-title">Real rescues.<br /><span className="text-gradient">Real stories.</span></h2>
      </div>
      <div className={`testimonials-row ${vis ? "in" : ""}`}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="testimonial-card" style={{ animationDelay: `${i * 0.12}s` }}>
            <div className="testimonial-stars">{"★".repeat(t.rating)}</div>
            <p className="testimonial-text">"{t.text}"</p>
            <div className="testimonial-author">
              <div className="author-avatar">{t.name[0]}</div>
              <div>
                <span className="author-name">{t.name}</span>
                <span className="author-loc">{t.loc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SOSSection() {
  const [ref, vis] = useScrollReveal();
  return (
    <section id="sos" className="sos-section" ref={ref}>
      <div className={`sos-inner ${vis ? "in" : ""}`}>
        <div className="sos-pulse-ring" />
        <div className="sos-pulse-ring sos-ring-2" />
        <div className="sos-content">
          <h2 className="sos-title">Emergency SOS</h2>
          <p className="sos-sub">One tap sends your live location to emergency contacts, nearest police & hospitals. No menus, no delay.</p>
          <button className="btn-sos-big" data-hover>
            <span className="sos-btn-pulse" />
            ACTIVATE SOS
          </button>
          <span className="sos-disclaimer">Demo mode — no actual alerts sent</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo-icon">◉</span>
          <span className="logo-text">Fuel<span className="logo-accent">ResQ</span></span>
          <p className="footer-tagline">Help is on the way.</p>
        </div>
        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#services" data-hover>Services</a>
            <a href="#pricing" data-hover>Pricing</a>
            <a href="#shield" data-hover>FuelResQ Shield</a>
            <a href="#sos" data-hover>Emergency SOS</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#" data-hover>About</a>
            <a href="#" data-hover>Careers</a>
            <a href="#" data-hover>Blog</a>
            <a href="#" data-hover>Press</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#" data-hover>Privacy</a>
            <a href="#" data-hover>Terms</a>
            <a href="#" data-hover>Refunds</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 FuelResQ. All rights reserved.</span>
        <span className="footer-built">Built in India 🇮🇳</span>
      </div>
    </footer>
  );
}

// ─── BOOKING MODAL ───────────────────────────────────────────────────────

function BookingModal({ isOpen, onClose, preselected }) {
  const [step, setStep] = useState(0); // 0=service, 1=details, 2=confirm, 3=dispatched
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", vehicle: "", vehicleType: "car", fuelType: "petrol", fuelQty: 5, notes: "" });
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [providerName] = useState(() => {
    const names = ["Ravi K.", "Suresh M.", "Deepak S.", "Vijay R.", "Karthik N.", "Arun P."];
    return names[Math.floor(Math.random() * names.length)];
  });

  useEffect(() => {
    if (preselected && isOpen) {
      setSelected(preselected);
      setStep(1);
    }
  }, [preselected, isOpen]);

  useEffect(() => {
    if (!isOpen) { setStep(0); setSelected(null); setLocation(null); setForm({ name: "", phone: "", vehicle: "", vehicleType: "car", fuelType: "petrol", fuelQty: 5, notes: "" }); }
  }, [isOpen]);

  const getLocation = useCallback(() => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocation({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }); setLocating(false); },
        () => { setLocation({ lat: "13.0827", lng: "80.2707" }); setLocating(false); }
      );
    } else {
      setLocation({ lat: "13.0827", lng: "80.2707" });
      setLocating(false);
    }
  }, []);

  const calcTotal = () => {
    if (!selected) return 0;
    let t = selected.basePrice;
    if (selected.id === "fuel") t += form.fuelQty * (form.fuelType === "petrol" ? 102 : 89);
    return t;
  };

  const handleDispatch = () => {
    setStep(3);
    const base = parseInt(selected.eta.split("-")[0]);
    setEta(base + Math.floor(Math.random() * 8));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} data-hover>✕</button>

        {/* Progress */}
        <div className="modal-progress">
          {["Service", "Details", "Confirm", "Dispatched"].map((l, i) => (
            <div key={i} className={`progress-step ${i <= step ? "active" : ""} ${i === step ? "current" : ""}`}>
              <span className="progress-dot" />
              <span className="progress-label">{l}</span>
            </div>
          ))}
        </div>

        {/* Step 0 — Select Service */}
        {step === 0 && (
          <div className="modal-step">
            <h3 className="modal-title">What happened?</h3>
            <p className="modal-sub">Select your issue — we'll dispatch the right provider.</p>
            <div className="service-select-grid">
              {SERVICES.map(s => (
                <button key={s.id} className={`service-select-btn ${selected?.id === s.id ? "selected" : ""}`} onClick={() => setSelected(s)} data-hover>
                  <span className="ss-icon">{s.icon}</span>
                  <span className="ss-name">{s.name}</span>
                  <span className="ss-price">₹{s.basePrice}</span>
                </button>
              ))}
            </div>
            <button className="btn-next" disabled={!selected} onClick={() => { getLocation(); setStep(1); }} data-hover>
              Continue →
            </button>
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <div className="modal-step">
            <h3 className="modal-title">{selected?.icon} {selected?.name}</h3>
            <p className="modal-sub">Fill in your details so we can dispatch help.</p>

            <div className="form-grid">
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" placeholder="Enter your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Vehicle</label>
                <input type="text" placeholder="e.g. Honda City, KA-01-XX-1234" value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Vehicle Type</label>
                <div className="radio-row">
                  {["car", "bike", "suv", "ev"].map(v => (
                    <button key={v} className={`radio-btn ${form.vehicleType === v ? "active" : ""}`} onClick={() => setForm({ ...form, vehicleType: v })} data-hover>{v.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              {selected?.id === "fuel" && (
                <>
                  <div className="form-group">
                    <label>Fuel Type</label>
                    <div className="radio-row">
                      {["petrol", "diesel"].map(f => (
                        <button key={f} className={`radio-btn ${form.fuelType === f ? "active" : ""}`} onClick={() => setForm({ ...form, fuelType: f })} data-hover>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Quantity (Litres): {form.fuelQty}L</label>
                    <input type="range" min={2} max={20} value={form.fuelQty} onChange={e => setForm({ ...form, fuelQty: parseInt(e.target.value) })} className="range-input" />
                    <div className="range-labels"><span>2L</span><span>20L</span></div>
                  </div>
                </>
              )}
              <div className="form-group full-width">
                <label>Location</label>
                <div className="location-row">
                  {location ? (
                    <span className="loc-coords">📍 {location.lat}, {location.lng}</span>
                  ) : (
                    <button className="btn-locate" onClick={getLocation} data-hover disabled={locating}>
                      {locating ? "Locating..." : "📍 Share Live Location"}
                    </button>
                  )}
                </div>
              </div>
              <div className="form-group full-width">
                <label>Notes (optional)</label>
                <textarea placeholder="Landmark, exact situation, special instructions..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            <div className="modal-nav">
              <button className="btn-back" onClick={() => setStep(0)} data-hover>← Back</button>
              <button className="btn-next" disabled={!form.name || !form.phone || !form.vehicle} onClick={() => setStep(2)} data-hover>Review →</button>
            </div>
          </div>
        )}

        {/* Step 2 — Confirm */}
        {step === 2 && (
          <div className="modal-step">
            <h3 className="modal-title">Confirm Request</h3>
            <p className="modal-sub">Review everything before we dispatch.</p>

            <div className="confirm-card">
              <div className="confirm-row"><span className="confirm-label">Service</span><span className="confirm-value">{selected?.icon} {selected?.name}</span></div>
              <div className="confirm-row"><span className="confirm-label">Name</span><span className="confirm-value">{form.name}</span></div>
              <div className="confirm-row"><span className="confirm-label">Phone</span><span className="confirm-value">{form.phone}</span></div>
              <div className="confirm-row"><span className="confirm-label">Vehicle</span><span className="confirm-value">{form.vehicle} ({form.vehicleType.toUpperCase()})</span></div>
              {selected?.id === "fuel" && (
                <>
                  <div className="confirm-row"><span className="confirm-label">Fuel</span><span className="confirm-value">{form.fuelType} — {form.fuelQty}L</span></div>
                  <div className="confirm-row"><span className="confirm-label">Fuel Cost</span><span className="confirm-value">₹{form.fuelQty * (form.fuelType === "petrol" ? 102 : 89)}</span></div>
                </>
              )}
              <div className="confirm-row"><span className="confirm-label">Service Fee</span><span className="confirm-value">₹{selected?.basePrice}</span></div>
              <div className="confirm-row"><span className="confirm-label">Location</span><span className="confirm-value">{location ? `${location.lat}, ${location.lng}` : "Not shared"}</span></div>
              {form.notes && <div className="confirm-row"><span className="confirm-label">Notes</span><span className="confirm-value">{form.notes}</span></div>}
              <div className="confirm-total">
                <span>Estimated Total</span>
                <span className="total-amount">₹{calcTotal().toLocaleString()}</span>
              </div>
              <div className="confirm-payment-note">💵 Payment will be collected by the provider on-spot</div>
            </div>

            <div className="modal-nav">
              <button className="btn-back" onClick={() => setStep(1)} data-hover>← Edit</button>
              <button className="btn-dispatch" onClick={handleDispatch} data-hover>
                <span className="dispatch-pulse" />
                Dispatch Now
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Dispatched */}
        {step === 3 && (
          <div className="modal-step dispatched-step">
            <div className="dispatched-animation">
              <div className="dispatched-ring r1" />
              <div className="dispatched-ring r2" />
              <div className="dispatched-ring r3" />
              <div className="dispatched-check">✓</div>
            </div>
            <h3 className="modal-title dispatched-title">Help Is On The Way</h3>
            <p className="modal-sub">A verified provider has been dispatched to your location.</p>

            <div className="dispatched-info">
              <div className="dispatched-row"><span>Provider</span><span className="dispatched-val">{providerName}</span></div>
              <div className="dispatched-row"><span>Service</span><span className="dispatched-val">{selected?.icon} {selected?.name}</span></div>
              <div className="dispatched-row"><span>ETA</span><span className="dispatched-val eta-highlight">{eta} minutes</span></div>
              <div className="dispatched-row"><span>Status</span><span className="dispatched-val status-live"><span className="live-dot" /> En route</span></div>
            </div>

            <div className="tracking-mock">
              <div className="track-map">
                <div className="track-grid-lines" />
                <div className="track-user">📍</div>
                <div className="track-provider">🚗</div>
                <div className="track-route" />
              </div>
              <span className="track-label">Live tracking simulation</span>
            </div>

            <button className="btn-done" onClick={onClose} data-hover>Done — Close</button>
            <span className="demo-note">🔬 This is a demo — no real dispatch was made</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────

export default function FuelResQApp() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselected, setPreselected] = useState(null);

  const openBooking = (service = null) => {
    setPreselected(service);
    setBookingOpen(true);
  };

  return (
    <>
      <style>{`
/* ═══════════════════════════════════════════════════════════════════════
   FUELRESQ — GLOBAL STYLES
   ═══════════════════════════════════════════════════════════════════════ */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --bg: #0A0A0F;
  --bg2: #12121A;
  --bg3: #1A1A25;
  --glass: rgba(255,255,255,0.035);
  --glass-border: rgba(255,255,255,0.07);
  --glass-hover: rgba(255,255,255,0.07);
  --text: #FFFFFF;
  --text2: #9A9AB0;
  --text3: #555566;
  --red: #FF3B30;
  --orange: #FF6B2D;
  --green: #30D158;
  --yellow: #FFD60A;
  --blue: #0A84FF;
  --grad: linear-gradient(135deg, #FF3B30, #FF6B2D);
  --glow: 0 0 30px rgba(255,59,48,0.25);
  --font-d: 'Outfit', sans-serif;
  --font-b: 'Plus Jakarta Sans', sans-serif;
  --font-m: 'JetBrains Mono', monospace;
}

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: var(--font-b); overflow-x: hidden; cursor: none; }

::selection { background: rgba(255,59,48,0.3); color: #fff; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

a { color: inherit; text-decoration: none; }

/* ─── CURSOR ──────────────────────────────────────────────────────────── */
.cursor-dot {
  position: fixed; top: -4px; left: -4px; width: 8px; height: 8px;
  background: var(--red); border-radius: 50%; pointer-events: none; z-index: 99999;
  transition: width 0.2s, height 0.2s, background 0.2s;
  mix-blend-mode: difference;
}
.cursor-dot.click { width: 6px; height: 6px; }
.cursor-ring {
  position: fixed; top: -20px; left: -20px; width: 40px; height: 40px;
  border: 1.5px solid rgba(255,59,48,0.5); border-radius: 50%;
  pointer-events: none; z-index: 99998;
  transition: width 0.35s cubic-bezier(.22,1,.36,1), height 0.35s cubic-bezier(.22,1,.36,1), border-color 0.3s, background 0.3s;
}
.cursor-ring.hover {
  width: 60px; height: 60px; top: -30px; left: -30px;
  border-color: rgba(255,107,45,0.6);
  background: rgba(255,59,48,0.06);
}
.cursor-ring.click { width: 32px; height: 32px; top: -16px; left: -16px; }

@media (pointer: coarse) {
  .cursor-dot, .cursor-ring { display: none; }
  body { cursor: auto; }
}

/* ─── NAVBAR ──────────────────────────────────────────────────────────── */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 16px 0;
  transition: background 0.4s, backdrop-filter 0.4s, padding 0.3s;
}
.navbar.scrolled {
  background: rgba(10,10,15,0.85); backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--glass-border); padding: 10px 0;
}
.nav-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
}
.nav-logo { display: flex; align-items: center; gap: 8px; font-family: var(--font-d); font-weight: 700; font-size: 22px; }
.logo-icon { color: var(--red); font-size: 18px; animation: logoPulse 3s ease-in-out infinite; }
@keyframes logoPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
.logo-accent { color: var(--red); }
.nav-links { display: flex; gap: 32px; }
.nav-link {
  font-size: 14px; color: var(--text2); font-weight: 500;
  transition: color 0.25s; position: relative;
}
.nav-link::after {
  content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px;
  background: var(--grad); border-radius: 1px; transition: width 0.3s;
}
.nav-link:hover { color: #fff; }
.nav-link:hover::after { width: 100%; }
.nav-actions { display: flex; gap: 10px; align-items: center; }
.btn-sos-small {
  padding: 6px 14px; border-radius: 6px; border: 1px solid var(--red);
  background: rgba(255,59,48,0.1); color: var(--red); font-family: var(--font-m);
  font-size: 12px; font-weight: 600; letter-spacing: 1px; cursor: none;
  transition: background 0.25s;
}
.btn-sos-small:hover { background: rgba(255,59,48,0.2); }
.btn-primary-sm {
  padding: 8px 20px; border-radius: 8px; border: none; background: var(--grad);
  color: #fff; font-family: var(--font-d); font-weight: 600; font-size: 14px; cursor: none;
  transition: transform 0.2s, box-shadow 0.3s;
}
.btn-primary-sm:hover { transform: translateY(-1px); box-shadow: var(--glow); }
.mobile-toggle { display: none; background: none; border: none; width: 32px; height: 32px; cursor: none; position: relative; }
.hamburger, .hamburger::before, .hamburger::after {
  display: block; width: 20px; height: 2px; background: #fff; border-radius: 1px;
  transition: all 0.3s;
}
.hamburger { position: absolute; top: 15px; left: 6px; }
.hamburger::before { content: ''; position: absolute; top: -6px; }
.hamburger::after { content: ''; position: absolute; top: 6px; }
.hamburger.open { background: transparent; }
.hamburger.open::before { transform: rotate(45deg); top: 0; }
.hamburger.open::after { transform: rotate(-45deg); top: 0; }

@media (max-width: 768px) {
  .nav-links { display: none; position: fixed; top: 60px; left: 0; right: 0; background: rgba(10,10,15,0.97); backdrop-filter: blur(24px); flex-direction: column; padding: 24px; gap: 20px; border-bottom: 1px solid var(--glass-border); }
  .nav-links.open { display: flex; }
  .nav-actions { display: none; }
  .mobile-toggle { display: block; }
}

/* ─── HERO ────────────────────────────────────────────────────────────── */
.hero {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  position: relative; overflow: hidden; padding: 120px 24px 60px;
}
.hero-bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 100%);
}
.hero-glow {
  position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
  width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(255,59,48,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.hero-radial {
  position: absolute; bottom: -300px; right: -200px;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(255,107,45,0.06) 0%, transparent 70%);
  pointer-events: none;
}
.hero-content { text-align: center; max-width: 800px; position: relative; z-index: 2; }
.hero-content > * {
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);
}
.hero-content.in > * { opacity: 1; transform: translateY(0); }
.hero-content.in > *:nth-child(1) { transition-delay: 0.1s; }
.hero-content.in > *:nth-child(2) { transition-delay: 0.2s; }
.hero-content.in > *:nth-child(3) { transition-delay: 0.35s; }
.hero-content.in > *:nth-child(4) { transition-delay: 0.5s; }
.hero-content.in > *:nth-child(5) { transition-delay: 0.65s; }

.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 16px; border-radius: 100px;
  background: var(--glass); border: 1px solid var(--glass-border);
  font-size: 13px; color: var(--text2); font-weight: 500; margin-bottom: 28px;
}
.badge-dot {
  width: 6px; height: 6px; background: var(--green); border-radius: 50%;
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
.hero-title { font-family: var(--font-d); font-size: clamp(42px,7vw,80px); font-weight: 800; line-height: 1.05; letter-spacing: -2px; margin-bottom: 20px; }
.hero-gradient { background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-sub { font-size: 17px; color: var(--text2); line-height: 1.7; max-width: 560px; margin: 0 auto 36px; }
.hero-cta-row { display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: 56px; }
.btn-emergency {
  position: relative; padding: 16px 40px; border-radius: 12px; border: none;
  background: var(--grad); color: #fff; font-family: var(--font-d);
  font-size: 17px; font-weight: 700; cursor: none;
  transition: transform 0.2s, box-shadow 0.3s; overflow: hidden;
}
.btn-emergency:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(255,59,48,0.35); }
.btn-emergency-ring {
  position: absolute; inset: -2px; border-radius: 14px;
  border: 2px solid rgba(255,59,48,0.4);
  animation: ringPulse 2s ease-in-out infinite;
}
@keyframes ringPulse { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:0; transform:scale(1.08); } }
.btn-ghost {
  padding: 16px 24px; border-radius: 12px; border: 1px solid var(--glass-border);
  background: transparent; color: var(--text2); font-family: var(--font-d);
  font-size: 15px; font-weight: 500; cursor: none; transition: color 0.25s, border-color 0.25s;
}
.btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.2); }

.hero-stats { display: flex; gap: 40px; justify-content: center; flex-wrap: wrap; }
.hero-stat { text-align: center; }
.stat-value { font-family: var(--font-m); font-size: 28px; font-weight: 600; color: #fff; display: block; }
.stat-suffix { color: var(--red); }
.stat-label { font-size: 12px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; display: block; }

.hero-scroll-hint {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: var(--text3); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
}
.scroll-line { width: 1px; height: 40px; background: linear-gradient(to bottom, var(--red), transparent); animation: scrollDown 2s ease-in-out infinite; }
@keyframes scrollDown { 0% { transform: scaleY(0); transform-origin: top; } 50% { transform: scaleY(1); transform-origin: top; } 51% { transform-origin: bottom; } 100% { transform: scaleY(0); transform-origin: bottom; } }

/* ─── SECTIONS ────────────────────────────────────────────────────────── */
.section { padding: 100px 24px; max-width: 1200px; margin: 0 auto; }
.section-dark { background: var(--bg2); max-width: 100%; padding-left: 24px; padding-right: 24px; }
.section-dark > * { max-width: 1200px; margin-left: auto; margin-right: auto; }

.section-header { text-align: center; margin-bottom: 56px; }
.section-header > * {
  opacity: 0; transform: translateY(25px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.section-header.in > * { opacity: 1; transform: translateY(0); }
.section-header.in > *:nth-child(2) { transition-delay: 0.1s; }
.section-header.in > *:nth-child(3) { transition-delay: 0.2s; }

.section-tag {
  font-family: var(--font-m); font-size: 12px; color: var(--red);
  letter-spacing: 3px; font-weight: 600; display: block; margin-bottom: 12px;
}
.section-title { font-family: var(--font-d); font-size: clamp(30px,5vw,48px); font-weight: 800; line-height: 1.15; letter-spacing: -1px; }
.text-gradient { background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.section-sub { color: var(--text2); font-size: 16px; margin-top: 12px; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto; }

/* ─── SERVICES GRID ───────────────────────────────────────────────────── */
.services-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
}
.services-grid > * {
  opacity: 0; transform: translateY(30px) scale(0.97);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(.22,1,.36,1);
}
.services-grid.in > * { opacity: 1; transform: translateY(0) scale(1); }

.service-card {
  position: relative; border-radius: 18px; overflow: hidden; cursor: none;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  transition: transform 0.35s cubic-bezier(.22,1,.36,1), border-color 0.3s, box-shadow 0.3s;
}
.service-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: rgba(255,59,48,0.25);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 20px rgba(255,59,48,0.08);
}
.service-card::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255,59,48,0.04) 0%, transparent 60%);
  opacity: 0; transition: opacity 0.4s;
}
.service-card:hover::before { opacity: 1; }
.service-card-inner { padding: 28px 24px; position: relative; z-index: 1; backdrop-filter: blur(10px); }
.service-tag {
  position: absolute; top: 16px; right: 16px;
  padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: 700;
  font-family: var(--font-m); letter-spacing: 1px;
  background: rgba(255,59,48,0.15); color: var(--red); border: 1px solid rgba(255,59,48,0.2);
}
.tag-new { background: rgba(48,209,88,0.15); color: var(--green); border-color: rgba(48,209,88,0.2); }
.service-icon { font-size: 36px; display: block; margin-bottom: 16px; filter: drop-shadow(0 0 8px rgba(255,59,48,0.15)); }
.service-name { font-family: var(--font-d); font-size: 19px; font-weight: 700; margin-bottom: 8px; }
.service-desc { font-size: 13px; color: var(--text2); line-height: 1.5; margin-bottom: 20px; min-height: 40px; }
.service-meta { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--glass-border); }
.service-price { font-family: var(--font-m); font-size: 16px; font-weight: 600; color: #fff; }
.price-unit { font-size: 11px; color: var(--text3); font-weight: 400; }
.service-eta { font-size: 12px; color: var(--text2); }

@media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 550px) { .services-grid { grid-template-columns: 1fr; } }

/* ─── STEPS ───────────────────────────────────────────────────────────── */
.steps-track {
  display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; position: relative;
}
.steps-track > * {
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(.22,1,.36,1);
}
.steps-track.in > * { opacity: 1; transform: translateY(0); }

.steps-line {
  position: absolute; top: 32px; left: 10%; right: 10%; height: 2px;
  background: linear-gradient(90deg, var(--red), var(--orange), var(--green));
  opacity: 0.2; border-radius: 1px;
}
.step-card { text-align: center; position: relative; z-index: 1; }
.step-num-wrap { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
.step-num {
  font-family: var(--font-m); font-size: 32px; font-weight: 700;
  background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.step-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--red); margin-top: 8px; box-shadow: 0 0 12px rgba(255,59,48,0.4); }
.step-title { font-family: var(--font-d); font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.step-desc { font-size: 13px; color: var(--text2); line-height: 1.6; }

@media (max-width: 768px) {
  .steps-track { grid-template-columns: 1fr 1fr; }
  .steps-line { display: none; }
}
@media (max-width: 500px) { .steps-track { grid-template-columns: 1fr; } }

/* ─── PRICING TABLE ───────────────────────────────────────────────────── */
.pricing-table {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 20px; overflow: hidden; backdrop-filter: blur(10px);
}
.pricing-table > * {
  opacity: 0; transform: translateX(-20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.pricing-table.in > * { opacity: 1; transform: translateX(0); }

.pricing-header-row {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 16px 28px;
  font-family: var(--font-m); font-size: 11px; color: var(--text3);
  text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid var(--glass-border);
}
.pricing-row {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 18px 28px;
  align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: background 0.2s;
}
.pricing-row:hover { background: rgba(255,255,255,0.02); }
.pricing-service { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 14px; }
.pricing-icon { font-size: 20px; }
.pricing-base { font-family: var(--font-m); font-size: 15px; font-weight: 600; color: #fff; }
.pricing-add { font-size: 12px; color: var(--text2); }
.pricing-eta { font-size: 12px; color: var(--text3); }
.pricing-note {
  display: flex; align-items: flex-start; gap: 10px; padding: 20px 28px;
  font-size: 13px; color: var(--text2); line-height: 1.6;
  background: rgba(255,107,45,0.04); border-top: 1px solid rgba(255,107,45,0.1);
}
.note-icon { flex-shrink: 0; }

@media (max-width: 600px) {
  .pricing-header-row, .pricing-row { grid-template-columns: 1.5fr 1fr 1fr; }
  .pricing-header-row span:last-child, .pricing-row span:last-child { display: none; }
}

/* ─── SHIELD PLANS ────────────────────────────────────────────────────── */
.shield-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start; }
.shield-grid > * {
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(.22,1,.36,1);
}
.shield-grid.in > * { opacity: 1; transform: translateY(0); }

.shield-card {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 20px; padding: 36px 28px; position: relative;
  backdrop-filter: blur(10px);
  transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
}
.shield-card:hover { transform: translateY(-4px); }
.shield-accent {
  border-color: rgba(255,59,48,0.3);
  background: linear-gradient(180deg, rgba(255,59,48,0.06), var(--glass));
  box-shadow: 0 0 40px rgba(255,59,48,0.08);
}
.shield-accent:hover { box-shadow: 0 0 50px rgba(255,59,48,0.15); }
.shield-popular {
  position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  padding: 4px 16px; border-radius: 0 0 8px 8px;
  background: var(--grad); font-size: 10px; font-weight: 700;
  font-family: var(--font-m); letter-spacing: 2px;
}
.shield-name { font-family: var(--font-d); font-size: 22px; font-weight: 700; margin-bottom: 8px; margin-top: 8px; }
.shield-price { font-family: var(--font-m); font-size: 36px; font-weight: 700; margin-bottom: 28px; }
.shield-period { font-size: 16px; color: var(--text3); font-weight: 400; }
.shield-features { list-style: none; margin-bottom: 32px; }
.shield-features li { padding: 8px 0; font-size: 14px; color: var(--text2); display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.03); }
.check-icon { color: var(--green); font-size: 14px; flex-shrink: 0; }
.btn-shield {
  width: 100%; padding: 14px; border-radius: 10px; border: 1px solid var(--glass-border);
  background: transparent; color: var(--text2); font-family: var(--font-d);
  font-size: 15px; font-weight: 600; cursor: none; transition: all 0.25s;
}
.btn-shield:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: rgba(255,255,255,0.15); }
.btn-shield-accent { background: var(--grad); color: #fff; border: none; }
.btn-shield-accent:hover { box-shadow: var(--glow); transform: translateY(-1px); background: var(--grad); }

@media (max-width: 900px) { .shield-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; } }

/* ─── TESTIMONIALS ────────────────────────────────────────────────────── */
.testimonials-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.testimonials-row > * {
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(.22,1,.36,1);
}
.testimonials-row.in > * { opacity: 1; transform: translateY(0); }

.testimonial-card {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 18px; padding: 28px; backdrop-filter: blur(10px);
  transition: transform 0.3s, border-color 0.3s;
}
.testimonial-card:hover { transform: translateY(-4px); border-color: rgba(255,59,48,0.15); }
.testimonial-stars { color: var(--yellow); font-size: 14px; letter-spacing: 2px; margin-bottom: 16px; }
.testimonial-text { font-size: 14px; color: var(--text2); line-height: 1.7; margin-bottom: 20px; font-style: italic; }
.testimonial-author { display: flex; align-items: center; gap: 12px; }
.author-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: var(--grad);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-d); font-weight: 700; font-size: 14px;
}
.author-name { display: block; font-size: 14px; font-weight: 600; }
.author-loc { display: block; font-size: 11px; color: var(--text3); }

@media (max-width: 768px) { .testimonials-row { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; } }

/* ─── SOS ─────────────────────────────────────────────────────────────── */
.sos-section { padding: 100px 24px; }
.sos-inner {
  max-width: 700px; margin: 0 auto; text-align: center;
  position: relative; padding: 80px 40px; border-radius: 28px;
  background: radial-gradient(circle at 50% 50%, rgba(255,59,48,0.06) 0%, var(--bg2) 70%);
  border: 1px solid rgba(255,59,48,0.15);
  overflow: hidden;
}
.sos-inner > * {
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.6s, transform 0.6s;
}
.sos-inner.in > * { opacity: 1; transform: translateY(0); }
.sos-inner.in > *:nth-child(3) { transition-delay: 0.2s; }

.sos-pulse-ring {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 300px; height: 300px; border-radius: 50%;
  border: 1px solid rgba(255,59,48,0.1);
  animation: sosPulse 3s ease-in-out infinite;
}
.sos-ring-2 { width: 450px; height: 450px; animation-delay: 1s; }
@keyframes sosPulse { 0%,100% { opacity:0.3; transform:translate(-50%,-50%) scale(1); } 50% { opacity:0; transform:translate(-50%,-50%) scale(1.15); } }

.sos-content { position: relative; z-index: 1; }
.sos-title { font-family: var(--font-d); font-size: 36px; font-weight: 800; color: var(--red); margin-bottom: 12px; }
.sos-sub { color: var(--text2); font-size: 15px; margin-bottom: 32px; line-height: 1.6; }
.btn-sos-big {
  position: relative; padding: 18px 48px; border-radius: 14px; border: 2px solid var(--red);
  background: rgba(255,59,48,0.1); color: var(--red);
  font-family: var(--font-d); font-size: 18px; font-weight: 800;
  letter-spacing: 3px; cursor: none; transition: background 0.3s, box-shadow 0.3s;
}
.btn-sos-big:hover { background: rgba(255,59,48,0.2); box-shadow: 0 0 40px rgba(255,59,48,0.2); }
.sos-btn-pulse {
  position: absolute; inset: -4px; border-radius: 18px;
  border: 2px solid rgba(255,59,48,0.3);
  animation: ringPulse 2s ease-in-out infinite;
}
.sos-disclaimer { display: block; margin-top: 16px; font-size: 11px; color: var(--text3); }

/* ─── FOOTER ──────────────────────────────────────────────────────────── */
.footer { border-top: 1px solid var(--glass-border); padding: 60px 24px 24px; }
.footer-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; gap: 48px; flex-wrap: wrap; }
.footer-brand { max-width: 260px; }
.footer-tagline { color: var(--text3); font-size: 14px; margin-top: 12px; }
.footer-links-group { display: flex; gap: 56px; flex-wrap: wrap; }
.footer-col { display: flex; flex-direction: column; gap: 10px; }
.footer-col h4 { font-family: var(--font-d); font-size: 13px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
.footer-col a { font-size: 14px; color: var(--text2); transition: color 0.2s; }
.footer-col a:hover { color: #fff; }
.footer-bottom {
  max-width: 1200px; margin: 40px auto 0; padding-top: 20px;
  border-top: 1px solid var(--glass-border);
  display: flex; justify-content: space-between; font-size: 12px; color: var(--text3);
}
.footer-built { color: var(--text3); }

@media (max-width: 600px) {
  .footer-inner { flex-direction: column; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
}

/* ─── MODAL ───────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  backdrop-filter: blur(12px); z-index: 5000;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-container {
  background: var(--bg2); border: 1px solid var(--glass-border);
  border-radius: 24px; width: 100%; max-width: 580px;
  max-height: 90vh; overflow-y: auto; position: relative;
  padding: 36px 32px;
  animation: slideUp 0.4s cubic-bezier(.22,1,.36,1);
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
}
@keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
.modal-close {
  position: absolute; top: 16px; right: 16px;
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--glass); border: 1px solid var(--glass-border);
  color: var(--text2); font-size: 16px; cursor: none;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.modal-close:hover { background: rgba(255,59,48,0.1); color: var(--red); }

/* Progress bar */
.modal-progress { display: flex; gap: 4px; margin-bottom: 28px; }
.progress-step { flex: 1; text-align: center; }
.progress-dot {
  width: 100%; height: 3px; border-radius: 2px;
  background: rgba(255,255,255,0.06); display: block; margin-bottom: 8px;
  transition: background 0.4s;
}
.progress-step.active .progress-dot { background: var(--grad); }
.progress-label { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; font-family: var(--font-m); }
.progress-step.current .progress-label { color: var(--text2); }

.modal-step { animation: fadeIn 0.3s ease; }
.modal-title { font-family: var(--font-d); font-size: 24px; font-weight: 700; margin-bottom: 6px; }
.modal-sub { font-size: 14px; color: var(--text2); margin-bottom: 24px; }

/* Service select */
.service-select-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
.service-select-btn {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 8px; border-radius: 14px;
  background: var(--glass); border: 1.5px solid var(--glass-border);
  color: var(--text2); cursor: none; transition: all 0.25s;
}
.service-select-btn:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); }
.service-select-btn.selected { border-color: var(--red); background: rgba(255,59,48,0.08); color: #fff; box-shadow: 0 0 20px rgba(255,59,48,0.1); }
.ss-icon { font-size: 24px; }
.ss-name { font-size: 11px; font-weight: 600; text-align: center; }
.ss-price { font-size: 10px; font-family: var(--font-m); color: var(--text3); }

@media (max-width: 500px) { .service-select-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; } }

/* Form */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 12px; color: var(--text3); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-family: var(--font-m); }
.form-group input[type="text"], .form-group input[type="tel"], .form-group textarea {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 10px; padding: 12px 14px; color: #fff;
  font-family: var(--font-b); font-size: 14px; outline: none;
  transition: border-color 0.25s;
}
.form-group input:focus, .form-group textarea:focus { border-color: rgba(255,59,48,0.4); }
.form-group textarea { min-height: 70px; resize: vertical; }
.radio-row { display: flex; gap: 8px; }
.radio-btn {
  flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--glass-border);
  background: transparent; color: var(--text2); font-size: 12px; font-weight: 600;
  font-family: var(--font-m); cursor: none; transition: all 0.2s;
}
.radio-btn.active { border-color: var(--red); color: #fff; background: rgba(255,59,48,0.08); }
.range-input { width: 100%; accent-color: var(--red); }
.range-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--text3); font-family: var(--font-m); }
.location-row { display: flex; align-items: center; }
.loc-coords { font-family: var(--font-m); font-size: 13px; color: var(--green); }
.btn-locate {
  padding: 10px 20px; border-radius: 10px; border: 1px solid var(--glass-border);
  background: var(--glass); color: var(--text2); font-size: 13px; cursor: none;
  transition: all 0.2s;
}
.btn-locate:hover { border-color: var(--blue); color: var(--blue); }

@media (max-width: 500px) { .form-grid { grid-template-columns: 1fr; } }

/* Navigation */
.modal-nav { display: flex; justify-content: space-between; gap: 12px; }
.btn-back {
  padding: 12px 20px; border-radius: 10px; border: 1px solid var(--glass-border);
  background: transparent; color: var(--text2); font-size: 14px; cursor: none;
  transition: color 0.2s; font-family: var(--font-d); font-weight: 600;
}
.btn-back:hover { color: #fff; }
.btn-next {
  padding: 12px 28px; border-radius: 10px; border: none;
  background: var(--grad); color: #fff; font-size: 14px;
  font-family: var(--font-d); font-weight: 600; cursor: none;
  transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
}
.btn-next:disabled { opacity: 0.4; }
.btn-next:not(:disabled):hover { transform: translateY(-1px); box-shadow: var(--glow); }

/* Confirm */
.confirm-card {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 24px; margin-bottom: 24px;
}
.confirm-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
.confirm-label { font-size: 13px; color: var(--text3); }
.confirm-value { font-size: 13px; font-weight: 600; }
.confirm-total {
  display: flex; justify-content: space-between; padding: 16px 0 0; margin-top: 8px;
  border-top: 1px solid var(--glass-border); font-family: var(--font-d); font-weight: 700; font-size: 18px;
}
.total-amount { color: var(--red); font-family: var(--font-m); }
.confirm-payment-note { text-align: center; font-size: 12px; color: var(--text3); margin-top: 12px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 8px; }

.btn-dispatch {
  position: relative; flex: 1; padding: 14px; border-radius: 10px; border: none;
  background: var(--grad); color: #fff; font-family: var(--font-d);
  font-size: 16px; font-weight: 700; cursor: none;
  transition: transform 0.2s, box-shadow 0.3s; overflow: hidden;
}
.btn-dispatch:hover { transform: translateY(-1px); box-shadow: 0 0 30px rgba(255,59,48,0.3); }
.dispatch-pulse {
  position: absolute; inset: -2px; border-radius: 12px;
  border: 2px solid rgba(255,59,48,0.3);
  animation: ringPulse 1.5s ease-in-out infinite;
}

/* Dispatched */
.dispatched-step { text-align: center; }
.dispatched-animation { position: relative; width: 120px; height: 120px; margin: 0 auto 24px; }
.dispatched-ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 2px solid rgba(48,209,88,0.2);
  animation: dispatchRing 2s ease-in-out infinite;
}
.r2 { inset: -15px; animation-delay: 0.5s; }
.r3 { inset: -30px; animation-delay: 1s; }
@keyframes dispatchRing { 0%,100% { opacity:0.5; transform:scale(1); } 50% { opacity:0; transform:scale(1.1); } }
.dispatched-check {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 60px; height: 60px; border-radius: 50%;
  background: linear-gradient(135deg, var(--green), #28a745);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 700;
  animation: checkPop 0.5s cubic-bezier(.22,1,.36,1);
  box-shadow: 0 0 30px rgba(48,209,88,0.3);
}
@keyframes checkPop { from { transform:translate(-50%,-50%) scale(0); } to { transform:translate(-50%,-50%) scale(1); } }
.dispatched-title { color: var(--green); }

.dispatched-info {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 14px; padding: 20px; margin: 20px auto; max-width: 350px; text-align: left;
}
.dispatched-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: var(--text2); border-bottom: 1px solid rgba(255,255,255,0.03); }
.dispatched-val { font-weight: 600; color: #fff; }
.eta-highlight { color: var(--orange); font-family: var(--font-m); }
.status-live { display: flex; align-items: center; gap: 6px; color: var(--green); }
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: blink 1.5s infinite; }

/* Tracking mock */
.tracking-mock { margin: 24px auto; max-width: 350px; }
.track-map {
  position: relative; height: 140px; border-radius: 14px; overflow: hidden;
  background: linear-gradient(135deg, #0d0d18, #141422);
  border: 1px solid var(--glass-border);
}
.track-grid-lines {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}
.track-user { position: absolute; bottom: 25px; left: 30%; font-size: 20px; animation: bounce 2s infinite; }
@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.track-provider { position: absolute; top: 30px; right: 25%; font-size: 20px; animation: driveIn 3s ease-in-out infinite alternate; }
@keyframes driveIn { from { right: 25%; } to { right: 40%; } }
.track-route {
  position: absolute; top: 45px; left: 33%; width: 100px; height: 60px;
  border-right: 2px dashed rgba(255,59,48,0.3); border-bottom: 2px dashed rgba(255,59,48,0.3);
  border-radius: 0 0 20px 0;
}
.track-label { font-size: 11px; color: var(--text3); margin-top: 8px; text-align: center; display: block; }

.btn-done {
  margin-top: 20px; padding: 14px 40px; border-radius: 10px; border: 1px solid var(--glass-border);
  background: transparent; color: var(--text2); font-size: 15px;
  font-family: var(--font-d); font-weight: 600; cursor: none;
  transition: all 0.2s;
}
.btn-done:hover { background: rgba(255,255,255,0.05); color: #fff; }
.demo-note { display: block; margin-top: 12px; font-size: 11px; color: var(--text3); }
      `}</style>

      <CustomCursor />
      <Navbar onBook={() => openBooking()} activeSection="" />
      <Hero onBook={() => openBooking()} />
      <Services onSelectService={(s) => openBooking(s)} />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Shield />
      <SOSSection />
      <Footer />
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} preselected={preselected} />
    </>
  );
}
