import React from 'react';
import { Home, Key, Share2, Hammer, Flame } from 'lucide-react';

interface InstagramHighlightsProps {
  onSelectCategory: (section: string, subCategory?: string) => void;
  activeSection: string;
}

export const InstagramHighlights: React.FC<InstagramHighlightsProps> = ({
  onSelectCategory,
  activeSection,
}) => {
  const highlights = [
    {
      id: 'sale',
      title: 'عقارات للبيع',
      subtitle: 'بيوت • شقق • مجمعات',
      icon: Home,
      section: 'sale',
      color: 'from-amber-400 to-amber-600',
    },
    {
      id: 'rent',
      title: 'عقارات للإيجار',
      subtitle: 'شقق ودور تسليم فور',
      icon: Key,
      section: 'rent',
      color: 'from-amber-500 to-yellow-600',
    },
    {
      id: 'marketing',
      title: 'تسويقنا',
      subtitle: 'تسويق وإدارة عقاراتكم',
      icon: Share2,
      section: 'all',
      color: 'from-emerald-400 to-teal-600',
    },
    {
      id: 'contracting',
      title: 'مقاولات',
      subtitle: 'بناء وهدم وتسليم مفتاح',
      icon: Hammer,
      section: 'contracting',
      color: 'from-amber-600 to-orange-700',
    },
  ];

  return (
    <div className="bg-slate-900/60 border-y border-slate-800/80 py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-200">الأقسام السريعة والهايلايت</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">اختر القسم للتصفح الفوري</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {highlights.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.section;

            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.section)}
                className="flex flex-col items-center gap-2 min-w-[76px] group transition-all transform hover:scale-105 focus:outline-none"
              >
                {/* Gradient Outer Ring */}
                <div
                  className={`p-0.5 rounded-full bg-gradient-to-tr ${
                    isActive ? 'from-amber-400 via-amber-300 to-yellow-500 ring-2 ring-amber-400/50' : item.color
                  } shadow-md group-hover:shadow-amber-500/20 transition-all`}
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-slate-950 p-1 flex items-center justify-center relative overflow-hidden">
                    <div className="w-full h-full rounded-full bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-1 group-hover:bg-slate-850 transition-colors">
                      <Icon className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Highlight Label */}
                <div className="text-center">
                  <span className="block text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors truncate max-w-[85px]">
                    {item.title}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-normal truncate max-w-[85px]">
                    {item.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
