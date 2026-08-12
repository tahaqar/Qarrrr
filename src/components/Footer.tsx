import React from 'react';
import { MapPin, Phone, MessageCircle, Instagram, Key } from 'lucide-react';
import { SiteSettings } from '../types';
import logoImg from '../assets/images/taha_muadh_exact_logo_1786478243743.jpg';

interface FooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  onSelectCategory: (sec: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin, onSelectCategory }) => {
  const formatWhatsappLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const num = cleanPhone.startsWith('964') ? cleanPhone : `964${cleanPhone.replace(/^0/, '')}`;
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  const currentLogo = (settings.logoUrl && settings.logoUrl !== '/logo.svg') ? settings.logoUrl : logoImg;

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-10 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={currentLogo}
                alt={settings.siteName || 'مكتب طه معاذ'}
                className="h-11 w-auto object-contain rounded-lg shadow-sm p-0.5 bg-white border border-emerald-900/30"
              />
              <h3 className="text-base font-bold text-white">{settings.siteName || 'مكتب طه معاذ العقاري'}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {settings.slogan}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {settings.instagramHandle && (
                <a
                  href={`https://instagram.com/${settings.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-[8px] bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
                >
                  <Instagram className="w-4 h-4 text-amber-400" />
                  <span>@{settings.instagramHandle}</span>
                </a>
              )}
              <a
                href={formatWhatsappLink(settings.whatsappNumber, `مرحباً ${settings.siteName || 'مكتب طه معاذ'}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-[8px] bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>واتساب</span>
              </a>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-xs">
            <h4 className="text-xs font-bold text-white mb-2">معلومات التواصل والمكتب</h4>
            <div className="flex items-start gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{settings.officeAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <a href={`tel:${settings.primaryPhone}`} className="hover:text-white font-bold dir-ltr">
                {settings.primaryPhone}
              </a>
              <span className="text-slate-600">/</span>
              <a href={`tel:${settings.secondaryPhone}`} className="hover:text-white font-bold dir-ltr">
                {settings.secondaryPhone}
              </a>
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              ساعات العمل: {settings.workingHours}
            </div>
          </div>
        </div>

        {/* Copyright & Subtle Admin Key Button */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.siteName || 'مكتب طه معاذ العقاري'} - جميع الحقوق محفوظة.</p>
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-slate-800 transition-all cursor-pointer"
            title="رمز دخول لوحة التحكم"
            aria-label="Admin Key"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
