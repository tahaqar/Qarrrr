import React, { useEffect, useState } from 'react';
import logoImg from '../assets/images/taha_muadh_exact_logo_1786478243743.jpg';
import { Building2, Sparkles, ArrowLeft } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  siteName?: string;
  slogan?: string;
  customLogoUrl?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  siteName = 'مكتب طه معاذ للعقار والمقاولات',
  slogan = 'وساطة عقارية احترافية • بيع • شراء • إيجار',
  customLogoUrl,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const displayLogo = (customLogoUrl && customLogoUrl !== '/logo.svg') ? customLogoUrl : logoImg;

  useEffect(() => {
    // 3000ms = 3 seconds total duration (100 steps * 30ms = 3000ms)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(onFinish, 400); // Smooth fade transition
          }, 100);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onFinish, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#f2f3f5] text-slate-900 flex flex-col items-center justify-between p-6 sm:p-10 transition-opacity duration-700 ease-in-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top bar with quick skip button */}
      <div className="w-full flex justify-between items-center max-w-md mx-auto pt-2">
        <div className="flex items-center gap-2 text-amber-600 text-xs font-extrabold tracking-wide">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>طه معاذ للعقار</span>
        </div>
        <button
          onClick={handleSkip}
          className="text-xs text-slate-600 hover:text-amber-700 font-bold bg-white hover:bg-slate-100 border border-slate-300 px-3.5 py-1.5 rounded-full flex items-center gap-1 transition-all cursor-pointer shadow-sm"
        >
          <span>تخطي</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Center */}
      <div className="flex flex-col items-center justify-center my-auto text-center space-y-6 max-w-sm w-full">
        {/* Glow backdrop behind logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-3xl transform scale-125 animate-pulse"></div>
          
          {/* Main Logo Container */}
          <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-xl shadow-amber-500/10 bg-white p-2 transform hover:scale-105 transition-transform duration-500">
            <img
              src={displayLogo}
              alt="لوجو مكتب طه معاذ للعقار والمقاولات"
              className="w-full h-full object-contain rounded-2xl mix-blend-multiply"
            />
          </div>
        </div>

        {/* Office Branding Title */}
        <div className="space-y-2 px-4">
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-amber-600 drop-shadow-sm">
            مكتب طه معاذ
          </h1>
          <p className="text-sm sm:text-base font-bold text-amber-700 tracking-wider">
            للعقار والمقاولات العامة
          </p>
          <p className="text-xs text-slate-600 font-medium pt-1 max-w-xs mx-auto leading-relaxed">
            {slogan}
          </p>
        </div>

        {/* Loading Progress Section */}
        <div className="w-full max-w-xs space-y-2 pt-2">
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300 p-0.5 shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 h-full rounded-full transition-all duration-150 ease-out shadow-sm shadow-amber-500/30"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 font-bold px-1">
            <span>جاري تحميل العقارات...</span>
            <span className="text-amber-700 font-extrabold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="text-[11px] text-slate-500 font-medium tracking-wide">
        بغداد • الطوبجي • كود المباشرة والتصفح الفوري
      </div>
    </div>
  );
};
