import React from 'react';
import { Home, Building, Building2, Key, Hammer, Layers, Tag } from 'lucide-react';
import { PropertyCategory, TransactionType, SiteSettings } from '../types';

interface CategoryTabsProps {
  settings?: SiteSettings;
  activeSection: string; // 'all' | 'sale' | 'rent' | 'contracting'
  setActiveSection: (sec: string) => void;
  selectedCategory: PropertyCategory | 'all';
  setSelectedCategory: (cat: PropertyCategory | 'all') => void;
  selectedType: TransactionType | 'all';
  setSelectedType: (type: TransactionType | 'all') => void;
  totalCount: number;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  settings,
  activeSection,
  setActiveSection,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  totalCount,
}) => {
  const customCats = settings?.customCategories || [
    { id: 'house', name: 'house', label: 'بيوت ومنازل', applicableType: 'sale' },
    { id: 'apartment', name: 'apartment', label: 'شقق سكنية', applicableType: 'sale' },
    { id: 'furnished_apartment', name: 'furnished_apartment', label: 'شقق مؤثثة', applicableType: 'rent' },
    { id: 'unfurnished_apartment', name: 'unfurnished_apartment', label: 'شقق غير مؤثثة', applicableType: 'rent' },
    { id: 'furnished_house', name: 'furnished_house', label: 'بيوت مؤثثة', applicableType: 'rent' },
    { id: 'unfurnished_house', name: 'unfurnished_house', label: 'بيوت غير مؤثثة', applicableType: 'rent' },
    { id: 'complex', name: 'complex', label: 'مجمعات سكنية', applicableType: 'sale' },
  ];

  const currentMode = selectedType !== 'all' ? selectedType : (activeSection === 'rent' ? 'rent' : 'sale');

  const filteredCategories = customCats.filter((cat) => {
    if (selectedType === 'all' && activeSection === 'all') return true;
    if (!cat.applicableType || cat.applicableType === 'both') return true;
    return cat.applicableType === currentMode;
  });
  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-[65px] z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Main Section Selector */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {/* All */}
            <button
              onClick={() => {
                setActiveSection('all');
                setSelectedType('all');
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
                activeSection === 'all' && selectedType === 'all' && selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              الكل ({totalCount})
            </button>

            {/* Sales (بيع) */}
            <button
              onClick={() => {
                setActiveSection('sale');
                setSelectedType('sale');
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
                activeSection === 'sale' || selectedType === 'sale'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4 text-amber-400" />
              عقارات للبيع
            </button>

            {/* Rent (إيجار) */}
            <button
              onClick={() => {
                setActiveSection('rent');
                setSelectedType('rent');
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
                activeSection === 'rent' || selectedType === 'rent'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Key className="w-4 h-4 text-amber-400" />
              عقارات للإيجار
            </button>

            {/* Contracting (مقاولات) */}
            <button
              onClick={() => {
                setActiveSection('contracting');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
                activeSection === 'contracting'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Hammer className="w-4 h-4 text-amber-400" />
              قسم المقاولات والبناء
            </button>
          </div>
        </div>

        {/* Subcategories dynamically rendered */}
        {activeSection !== 'contracting' && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-bold text-amber-400 ml-2 whitespace-nowrap">النوع المطلوب:</span>

            {/* All Subcategories */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 border border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              جميع الأنواع
            </button>

            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-950/60 text-slate-300 border border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
