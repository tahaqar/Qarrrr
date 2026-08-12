import React from 'react';
import { MapPin, BedDouble, Bath, MessageCircle, Eye, Video } from 'lucide-react';
import { Property, SiteSettings } from '../types';

interface PropertyCardProps {
  property: Property;
  settings: SiteSettings;
  onSelectProperty: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, settings, onSelectProperty }) => {
  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('ar-IQ').format(num);
  };

  const getCategoryLabel = (catId: string) => {
    if (settings.customCategories) {
      const found = settings.customCategories.find((c) => c.id === catId || c.name === catId);
      if (found) return found.label;
    }
    switch (catId) {
      case 'house':
        return 'بيوت (دور سكنية)';
      case 'apartment':
        return 'شقق سكنية';
      case 'complex':
        return 'مجمعات سكنية';
      default:
        return catId;
    }
  };

  const formatWhatsappLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const num = cleanPhone.startsWith('964') ? cleanPhone : `964${cleanPhone.replace(/^0/, '')}`;
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  const whatsappMessage = `مرحباً مكتب طه معاذ للعقار، أود الاستفسار عن العقار (${property.code}) - ${property.title}`;

  return (
    <div className="group bg-white border border-slate-200/90 rounded-[14px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
      {/* Property Image & Tags */}
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={property.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap max-w-[85%]">
            {/* Status Badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1 border ${
                property.status === 'rented'
                  ? 'bg-blue-600 text-white border-blue-400'
                  : property.status === 'sold'
                  ? 'bg-rose-700 text-white border-rose-500'
                  : 'bg-emerald-600 text-white border-emerald-400'
              }`}
            >
              {property.status === 'rented'
                ? 'مؤجر 🔑'
                : property.status === 'sold'
                ? 'تم البيع 🏷️'
                : 'متوفر ✅'}
            </span>

            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                property.transactionType === 'sale'
                  ? 'bg-emerald-950 text-emerald-200 border border-emerald-800'
                  : 'bg-amber-950 text-amber-200 border border-amber-800'
              }`}
            >
              {property.transactionType === 'sale' ? 'بيع' : 'إيجار'}
            </span>

            <span className="bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs">
              {getCategoryLabel(property.category)}
            </span>
          </div>

          {property.videoUrl && (
            <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1 shadow-sm">
              <Video className="w-3 h-3 animate-pulse" />
              <span>فيديو متوفر</span>
            </div>
          )}

          <div className="absolute bottom-2 left-3 bg-slate-900/80 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
            كود: {property.code}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          {/* Location */}
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectProperty(property)}
            className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {property.title}
          </h3>

          {/* Price */}
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <span className="text-lg font-extrabold text-emerald-900">
                {formatPrice(property.priceIqd)}
              </span>
              <span className="text-xs font-bold text-slate-500 mr-1">
                {property.transactionType === 'sale' ? 'د.ع' : 'د.ع / شهرياً'}
              </span>
            </div>
            {property.spaceSqM > 0 && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {property.spaceSqM} م²
              </span>
            )}
          </div>

          {/* Features summary */}
          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 font-medium border-t border-slate-100">
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-slate-400" />
              {property.bedrooms} غرف
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              {property.bathrooms} حمام
            </span>
            <span>•</span>
            <span className="truncate text-[11px]">{property.deedType}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <button
          onClick={() => onSelectProperty(property)}
          className="w-full py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-slate-600" />
          التفاصيل
        </button>

        <a
          href={formatWhatsappLink(settings.whatsappNumber, whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 rounded-[10px] bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-sm"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
          واتساب
        </a>
      </div>
    </div>
  );
};
