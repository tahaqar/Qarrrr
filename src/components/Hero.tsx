import React from 'react';
import { Search, Home, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PropertyCategory, TransactionType, SiteSettings } from '../types';
import heroLogo from '../assets/images/taha_muadh_exact_logo_1786478243743.jpg';

interface HeroProps {
  settings?: SiteSettings;
  activeSection: string;
  setActiveSection: (section: string) => void;
  selectedCategory: PropertyCategory | 'all';
  setSelectedCategory: (category: PropertyCategory | 'all') => void;
  selectedType: TransactionType | 'all';
  setSelectedType: (type: TransactionType | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  activeSection,
  setActiveSection,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  searchQuery,
  setSearchQuery,
  selectedArea,
  setSelectedArea,
}) => {
  const currentMode = activeSection === 'rent' || selectedType === 'rent' ? 'rent' : 'sale';

  const handleSelectMode = (mode: 'sale' | 'rent') => {
    setActiveSection(mode);
    setSelectedType(mode);
    setSelectedCategory('all');
  };

  const areas = ['جميع المناطق', 'الطوبجي', 'المنصور', 'الكرادة', 'زيونة', 'بوابة بغداد'];

  // Categories fallback or custom categories from settings
  const availableCategories = settings?.customCategories || [
    { id: 'house', name: 'house', label: 'بيوت (دور سكنية)', applicableType: 'sale' },
    { id: 'apartment', name: 'apartment', label: 'شقق سكنية', applicableType: 'sale' },
    { id: 'furnished_apartment', name: 'furnished_apartment', label: 'شقق مؤثثة', applicableType: 'rent' },
    { id: 'unfurnished_apartment', name: 'unfurnished_apartment', label: 'شقق غير مؤثثة', applicableType: 'rent' },
    { id: 'furnished_house', name: 'furnished_house', label: 'بيوت مؤثثة', applicableType: 'rent' },
    { id: 'unfurnished_house', name: 'unfurnished_house', label: 'بيوت غير مؤثثة', applicableType: 'rent' },
    { id: 'complex', name: 'complex', label: 'مجمعات سكنية', applicableType: 'sale' },
  ];

  const filteredCategoriesForMode = availableCategories.filter((cat) => {
    if (!cat.applicableType || cat.applicableType === 'both') return true;
    return cat.applicableType === currentMode;
  });

  const currentHeroImage = (settings?.heroImageUrl && settings.heroImageUrl !== '/logo.svg') ? settings.heroImageUrl : heroLogo;

  return (
    <div className="bg-white border-b border-slate-200/80 pt-4 pb-10 lg:pt-6 lg:pb-14 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center space-y-5">
        {/* Office Logo Banner Image */}
        {currentHeroImage ? (
          <div className="flex justify-center px-1">
            <img
              src={currentHeroImage}
              alt={settings?.siteName || 'مكتب طه معاذ للعقارات والمقاولات'}
              className="w-32 sm:w-40 md:w-48 h-auto object-contain mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : null}

        {/* Main Headline & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {settings?.heroTitle || 'مكتب طه معاذ للعقارات والمقاولات العامة'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-normal">
            {settings?.heroSubtitle || 'تصفح وحدتك السكنية أو اعرض عقارك للبيع والإيجار بكل سهولة وتوثيق قانوني كامل'}
          </p>
        </div>

        {/* Minimal Corporate Dual Selector Card */}
        <div className="bg-white border border-slate-200/90 rounded-[14px] p-4 sm:p-6 shadow-sm space-y-5 max-w-2xl mx-auto">
          {/* Main 2 Buttons: [ بيع ] and [ إيجار ] */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-[12px] border border-slate-200/80">
            <button
              onClick={() => handleSelectMode('sale')}
              className={`py-3 px-4 rounded-[10px] text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                currentMode === 'sale'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Home className="w-4 h-4" />
              بيع (عقارات للبيع)
            </button>
            <button
              onClick={() => handleSelectMode('rent')}
              className={`py-3 px-4 rounded-[10px] text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                currentMode === 'rent'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Key className="w-4 h-4" />
              إيجار (عقارات للإيجار)
            </button>
          </div>

          {/* Sub-categories dynamically rendered from Settings */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-2 pt-1"
            >
              <span className="text-xs font-bold text-slate-500 ml-2">الفئات:</span>

              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                الكل
              </button>

              {filteredCategoriesForMode.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Quick Filter Search input & area filter */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو المنطقة أو الكود (مثال: TA-101)"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-700 rounded-[10px] py-2 pr-9 pl-3 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {areas.map((area) => {
                const isSelected = selectedArea === area || (area === 'جميع المناطق' && selectedArea === '');
                return (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area === 'جميع المناطق' ? '' : area)}
                    className={`px-2.5 py-2 rounded-[10px] text-[11px] font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-emerald-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
