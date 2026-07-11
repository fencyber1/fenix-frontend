import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const FEATURES = [
  {
    title: 'Student Management',
    desc: 'Track every student\'s profile, enrollment, and documents in one place.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
      </svg>
    ),
  },
  {
    title: 'Attendance Tracking',
    desc: 'Mark and monitor attendance in real time with per-class dashboards.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: 'Grades & Reports',
    desc: 'Manage grades per subject and generate report cards with one click.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: 'Fee Management',
    desc: 'Create invoices, track payments, and download PDF receipts effortlessly.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
  },
  {
    title: 'Class Schedules',
    desc: 'Organize classes, assign teachers, and view rosters at a glance.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    title: 'Audit Logs',
    desc: 'Keep a full audit trail of every action for compliance and transparency.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
];

function HeroWords({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className="hero-word inline-block"
          style={{ animationDelay: `${i * 300}ms` }}
        >
          {word}
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </>
  );
}

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: footerRef, isVisible: footerVisible } = useScrollReveal({ threshold: 0.3 });

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const parallaxShift = scrollY * 0.04;

  return (
    <div className="flex min-h-screen flex-col bg-surface-2">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-content/10 bg-surface-2/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-800 text-white">
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl will-change-transform"
          style={{ transform: `translate3d(${parallaxShift}px, 0, 0)` }}
        />
        <div
          className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl will-change-transform"
          style={{ transform: `translate3d(${-parallaxShift * 0.7}px, 0, 0)` }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center lg:py-32">
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <HeroWords text="Run your school with clarity." />
          </h1>
          <p className="hero-subtitle mx-auto mt-6 max-w-2xl text-lg text-navy-100">
            Students, attendance, grades, and fees — unified in one secure, real-time
            platform built for modern schools.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="hero-cta group">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2
          className={`text-center font-heading text-3xl font-bold text-content transition-all ${featuresVisible ? 'section-title-visible' : 'section-title-hidden'}`}
        >
          Everything you need
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-content-muted">
          A complete school management system — no spreadsheets, no guesswork.
        </p>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`feature-card group rounded-2xl border border-content/10 bg-surface p-6 shadow-sm ${featuresVisible ? 'feature-card-visible' : 'feature-card-hidden'}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="feature-icon flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                {f.icon}
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-content">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="border-t border-content/10 bg-surface py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2
            className={`font-heading text-3xl font-bold text-content transition-all ${ctaVisible ? 'cta-visible' : 'cta-hidden'}`}
            style={{ transitionDelay: '0ms' }}
          >
            Ready to modernize your school?
          </h2>
          <p
            className={`mt-4 text-content-muted transition-all ${ctaVisible ? 'cta-visible' : 'cta-hidden'}`}
            style={{ transitionDelay: '150ms' }}
          >
            Sign in to access your dashboard and start managing your institution today.
          </p>
          <Link to="/login" className="mt-8 inline-block">
            <Button size="lg" className="cta-float-btn hero-cta">
              Sign in to Fenix
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        ref={footerRef}
        className={`border-t border-content/10 bg-surface-2 py-8 text-center text-sm text-content-muted transition-all ${footerVisible ? 'footer-visible' : 'footer-hidden'}`}
      >
        © {new Date().getFullYear()} Fenix SMS. All rights reserved.
      </footer>
    </div>
  );
}
