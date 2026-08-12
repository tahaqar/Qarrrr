import React, { useState } from 'react';
import { Phone, MessageCircle, Menu, X } from 'lucide-react';
import { SiteSettings } from '../types';
import logoImg from '../assets/images/taha_muadh_exact_logo_1786478243743.jpg';

interface HeaderProps {
  settings: SiteSettings;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeSection,
  setActiveSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatWhatsappLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const num = cleanPhone.startsWith('964') ? cleanPhone : `964${cleanPhone.replace(/^0/, '')}`;
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentLogo = (settings.logoUrl && settings.logoUrl !== '/logo.svg') ? settings.logoUrl : logoImg;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-900 shadow-sm">
      {/* Top Contact Bar */}
      <div className="bg-emerald-800 text-slate-100 px-4 py-1.5 text-xs font-medium">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{settings.siteName || 'مكتب طه معاذ للعقارات'} - {settings.officeAddress.split('-')[0] || 'بغداد'}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-200 text-[11px] dir-ltr">
            <a
              href={`tel:${settings.primaryPhone}`}
              className="flex items-center gap-1 hover:text-amber-300 font-medium transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              {settings.primaryPhone}
            </a>
            <span className="text-slate-600">|</span>
            <a
              href={formatWhatsappLink(settings.whatsappNumber, 'مرحباً مكتب طه معاذ للعقارات')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-300 transition-colors"
            >
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              واتساب
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Right Side: Brand Logo + Site Name Grouped */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
          onClick={() => {
            setActiveSection('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img
            src={currentLogo}
            alt={settings.siteName || 'مكتب طه معاذ'}
            className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
          />
          <div className="text-base sm:text-lg font-black text-emerald-950 tracking-tight leading-none">
            {settings.siteName || 'مكتب طه معاذ للعقارات'}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-[14px] border border-slate-200/80">
          <button
            onClick={() => {
              setActiveSection('all');
              scrollToSection('properties-catalog');
            }}
            className={`px-4 py-1.5 rounded-[12px] text-xs font-bold transition-all ${
              activeSection === 'all'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => {
              setActiveSection('sale');
              scrollToSection('properties-catalog');
            }}
            className={`px-4 py-1.5 rounded-[12px] text-xs font-bold transition-all ${
              activeSection === 'sale'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          >
            بيع
          </button>
          <button
            onClick={() => {
              setActiveSection('rent');
              scrollToSection('properties-catalog');
            }}
            className={`px-4 py-1.5 rounded-[12px] text-xs font-bold transition-all ${
              activeSection === 'rent'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          >
            إيجار
          </button>
          <button
            onClick={() => scrollToSection('why-us')}
            className="px-4 py-1.5 rounded-[12px] text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white transition-all"
          >
            لماذا نحن
          </button>
        </nav>

        {/* Mobile Menu Button on Left */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[12px] bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-lg">
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            <button
              onClick={() => {
                setActiveSection('all');
                setMobileMenuOpen(false);
                scrollToSection('properties-catalog');
              }}
              className={`p-2.5 rounded-[12px] text-center border ${
                activeSection === 'all'
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => {
                setActiveSection('sale');
                setMobileMenuOpen(false);
                scrollToSection('properties-catalog');
              }}
              className={`p-2.5 rounded-[12px] text-center border ${
                activeSection === 'sale'
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              بيع
            </button>
            <button
              onClick={() => {
                setActiveSection('rent');
                setMobileMenuOpen(false);
                scrollToSection('properties-catalog');
              }}
              className={`p-2.5 rounded-[12px] text-center border ${
                activeSection === 'rent'
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              إيجار
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                scrollToSection('why-us');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-[12px]"
            >
              لماذا نحن
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
