import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageCircle } from 'lucide-react';
import FaqSection from '../components/sections/FaqSection';

const FaqPage: React.FC = () => {
  return (
    <>
      <section className="relative overflow-hidden bg-slate-900 text-white dark:bg-slate-950">
        <div className="relative max-w-6xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div className="flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-teal-200">
              <MessageCircle className="w-4 h-4 text-teal-200" />
              <span>Help Center</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-white">
                Frequently Asked Questions
              </h1>
              <p className="mt-3 text-base md:text-lg text-slate-200 max-w-2xl">
                Everything you need to know about our global renting system—trust, AI automations, payouts, and cross-border logistics.
              </p>
            </div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-300">
              <Link to="/" className="inline-flex items-center gap-1 text-teal-200 hover:text-white transition">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">Support</span>
              <span className="text-slate-500">/</span>
              <span className="text-white font-medium">FAQ</span>
            </nav>
          </div>
        </div>
      </section>

      <FaqSection />
    </>
  );
};

export default FaqPage;
