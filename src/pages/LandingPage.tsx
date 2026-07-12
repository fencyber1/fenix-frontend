import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

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

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const { ref: featRef, visible: featVisible } = useScrollReveal(0.1);
  const { ref: ctaRef, visible: ctaVisible } = useScrollReveal(0.2);
  const { ref: footRef, visible: footVisible } = useScrollReveal(0.3);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { setScrollY(window.scrollY); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const px = scrollY * 0.04;
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Hero words animation ──
  const heroWords = 'Run your tenant with clarity.'.split(' ');

  return (
    <div className="flex min-h-screen flex-col bg-surface-2">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-content/10 bg-surface-2/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-800 text-white">
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"
          style={{
            willChange: 'transform',
            transform: `translate3d(${px}px, 0, 0)`,
          }}
        />
        <div
          className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
          style={{
            willChange: 'transform',
            transform: `translate3d(${-px * 0.7}px, 0, 0)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center lg:py-32">
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {heroWords.map((word, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  opacity: 0,
                  transform: 'translateY(14px)',
                  animation: prefersReduced
                    ? 'none'
                    : `fadeInUp 350ms ${EASE_OUT} ${i * 300}ms forwards`,
                }}
              >
                {word}{i < heroWords.length - 1 && '\u00A0'}
              </span>
            ))}
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg text-navy-100"
            style={{
              opacity: 0,
              transform: 'translateY(10px)',
              animation: prefersReduced
                ? 'none'
                : `fadeInUp 500ms ${EASE_OUT} 700ms forwards`,
            }}
          >
            Students, attendance, grades, and fees — unified in one secure, real-time
            platform built for modern schools.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/register">
              <span
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-500 hover:shadow-[0_8px_30px_rgba(0,217,217,0.35)] hover:scale-105 active:scale-[0.97] active:transition-duration-[80ms]"
                style={{
                  animation: prefersReduced ? 'none' : `fadeInUp 500ms ${EASE_OUT} 900ms forwards, ctaFloat 3s ease-in-out 2s infinite`,
                  opacity: 0,
                }}
              >
                Get started
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featRef} className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2
          className="text-center font-heading text-3xl font-bold text-content"
          style={{
            opacity: featVisible ? 1 : 0,
            letterSpacing: featVisible ? '0.04em' : '-0.02em',
            transform: featVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: prefersReduced ? 'none' : `opacity 500ms ${EASE}, letter-spacing 600ms ${EASE}, transform 500ms ${EASE}`,
          }}
        >
          Everything you need
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-content-muted">
          A complete tenant management system — no spreadsheets, no guesswork.
        </p>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.title}
              feature={f}
              index={i}
              visible={featVisible}
              reduced={prefersReduced}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="border-t border-content/10 bg-surface py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2
            className="font-heading text-3xl font-bold text-content"
            style={{
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: prefersReduced ? 'none' : `opacity 400ms ${EASE} 0ms, transform 400ms ${EASE} 0ms`,
            }}
          >
            Ready to modernize your tenant?
          </h2>
          <p
            className="mt-4 text-content-muted"
            style={{
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: prefersReduced ? 'none' : `opacity 400ms ${EASE} 150ms, transform 400ms ${EASE} 150ms`,
            }}
          >
            Sign in to access your dashboard and start managing your institution today.
          </p>
          <Link to="/register" className="mt-8 inline-block">
            <span
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-500 hover:shadow-[0_8px_30px_rgba(0,217,217,0.35)] hover:scale-105 active:scale-[0.97]"
              style={{
                animation: prefersReduced ? 'none' : 'ctaFloat 3s ease-in-out infinite',
              }}
            >
              Sign in to Fenix
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        ref={footRef}
        className="border-t border-content/10 bg-surface-2 py-8 text-center text-sm text-content-muted"
        style={{
          opacity: footVisible ? 1 : 0,
          transition: prefersReduced ? 'none' : `opacity 500ms ${EASE} 400ms`,
        }}
      >
        © {new Date().getFullYear()} Fenix SMS. All rights reserved.
      </footer>

      {/* Global keyframes — injected once via <style> */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ctaFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

/* ── Feature card with hover ── */
function FeatureCard({
  feature,
  index,
  visible,
  reduced,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  visible: boolean;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative rounded-2xl border bg-surface p-6 shadow-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderColor: hovered ? 'rgba(0, 217, 217, 0.35)' : 'rgb(var(--border))',
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? 'translateY(-8px)' : 'translateY(0)'
          : 'translateY(20px)',
        boxShadow: hovered
          ? '0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,217,217,0.25)'
          : '0 1px 2px 0 rgb(15 28 63 / 0.06), 0 4px 16px -4px rgb(15 28 63 / 0.10)',
        transition: reduced
          ? 'none'
          : `opacity 300ms ${EASE} ${index * 90}ms, transform 300ms ${EASE} ${index * 90}ms, box-shadow 300ms ${EASE}, border-color 300ms ${EASE}`,
      }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400"
        style={{
          transition: reduced ? 'none' : `transform 300ms ${EASE}`,
          transform: hovered ? 'rotate(5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
        }}
      >
        {feature.icon}
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold text-content">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-content-muted">{feature.desc}</p>
    </div>
  );
}
