import React, { useState } from 'react';
import { X, MapPin, BedDouble, Bath, Maximize2, FileCheck, Phone, MessageCircle, Share2, Check, Send, Video, Image as ImageIcon } from 'lucide-react';
import { Property, SiteSettings } from '../types';
import { api } from '../services/api';

interface PropertyDetailModalProps {
  property: Property | null;
  settings: SiteSettings;
  onClose: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  settings,
  onClose,
}) => {
  if (!property) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeMediaMode, setActiveMediaMode] = useState<'photo' | 'video'>(property.videoUrl ? 'video' : 'photo');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [inquiryText, setInquiryText] = useState(`أود الاستفسار عن تفاصيل العقار كود (${property.code}) - ${property.title}`);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('ar-IQ').format(num);
  };

  const formatWhatsappLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const num = cleanPhone.startsWith('964') ? cleanPhone : `964${cleanPhone.replace(/^0/, '')}`;
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;

    await api.createInquiry({
      propertyId: property.id,
      propertyCode: property.code,
      propertyTitle: property.title,
      customerName: customerName || 'زبون من الموقع',
      customerPhone,
      type: 'inquiry',
      message: inquiryText,
    });

    setSubmitted(true);
    setTimeout(() => {
      const msg = `مرحباً مكتب طه معاذ، أنا ${customerName || 'زبون'} هاتف (${customerPhone}): ${inquiryText}`;
      window.open(formatWhatsappLink(settings.whatsappNumber, msg), '_blank');
    }, 600);
  };

  const handleCopyShare = () => {
    const shareText = `${property.title}\nكود العقار: ${property.code}\nالسعر: ${formatPrice(property.priceIqd)} د.ع\nتواصل مع مكتب طه معاذ للعقار: ${settings.primaryPhone}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative bg-white border border-slate-200/90 w-full max-w-4xl rounded-[14px] shadow-xl overflow-hidden my-auto text-slate-900 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-black px-3 py-1 rounded-full border shadow-xs ${
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
            <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              كود العقار: {property.code}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {property.transactionType === 'sale' ? 'بيع' : 'إيجار'} • {property.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg bg-white border border-slate-200 text-xs font-medium flex items-center gap-1"
            >
              <Share2 className="w-4 h-4" />
              {copied ? 'تم النسخ' : 'مشاركة'}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery & Video Section */}
            <div className="lg:col-span-7 space-y-3">
              {property.videoUrl && (
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setActiveMediaMode('photo')}
                    className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeMediaMode === 'photo'
                        ? 'bg-white text-emerald-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>الصور ({property.images.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveMediaMode('video')}
                    className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeMediaMode === 'video'
                        ? 'bg-emerald-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>فيديو العقار 🎥</span>
                  </button>
                </div>
              )}

              <div className="relative aspect-[16/10] rounded-[12px] overflow-hidden bg-slate-950 border border-slate-200">
                {activeMediaMode === 'video' && property.videoUrl ? (
                  <video
                    src={property.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={property.images[activeImageIndex] || property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {activeMediaMode === 'photo' && property.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-12 rounded-[8px] overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-emerald-800' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Primary Details */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{property.location}</span>
                </div>

                <h2 className="text-xl font-extrabold text-slate-900 leading-snug">{property.title}</h2>

                <div className="bg-slate-50 p-4 rounded-[12px] border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-emerald-900">{formatPrice(property.priceIqd)}</span>
                    <span className="text-xs font-bold text-slate-500 mr-1.5">
                      {property.transactionType === 'sale' ? 'د.ع' : 'د.ع / شهرياً'}
                    </span>
                  </div>
                  {property.priceUsd && (
                    <span className="text-xs text-slate-500 font-mono">
                      (~ ${formatPrice(property.priceUsd)})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-[10px] border border-slate-200">
                    <Maximize2 className="w-4 h-4 text-emerald-800 mx-auto mb-1" />
                    <span className="text-slate-500 text-[10px] block">المساحة</span>
                    <span className="font-bold text-slate-900">{property.spaceSqM} م²</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-[10px] border border-slate-200">
                    <BedDouble className="w-4 h-4 text-emerald-800 mx-auto mb-1" />
                    <span className="text-slate-500 text-[10px] block">الغرف</span>
                    <span className="font-bold text-slate-900">{property.bedrooms}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-[10px] border border-slate-200">
                    <Bath className="w-4 h-4 text-emerald-800 mx-auto mb-1" />
                    <span className="text-slate-500 text-[10px] block">الحمامات</span>
                    <span className="font-bold text-slate-900">{property.bathrooms}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: WhatsApp and Phone Call */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={formatWhatsappLink(settings.whatsappNumber, `مرحباً مكتب طه معاذ، أود الاستفسار عن العقار (${property.code})`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-[12px] bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  واتساب مباشر
                </a>

                <a
                  href={`tel:${property.contactPhone || settings.primaryPhone}`}
                  className="py-3 px-3 rounded-[12px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  اتصال تلفوني
                </a>
              </div>
            </div>
          </div>

          {/* Description & Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-500 mb-2">الوصف التفصيلي للعقار:</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-[12px] border border-slate-200">
                {property.description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 mb-2">نوع السند والملكية:</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-emerald-50 text-emerald-900 border border-emerald-200 p-2.5 rounded-[10px]">
                  <FileCheck className="w-4 h-4 text-emerald-800" />
                  <span>{property.deedType}</span>
                </div>
              </div>

              {property.features.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-2">المميزات والخدمات:</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {property.features.map((feat, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-[8px] text-xs font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Contact Form */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-[14px] border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">أو اترك طلب معاينة وسنتواصل معك:</h4>
            {submitted ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-[10px] font-bold text-center">
                تم استلام طلبك! يتم الآن توجيهك للمكتب عبر الواتساب...
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="اسمك الكريم"
                  className="bg-white border border-slate-200 focus:border-emerald-800 rounded-[10px] p-2.5 text-xs text-slate-900 focus:outline-none"
                />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="رقم الهاتف (ضروري)"
                  className="bg-white border border-slate-200 focus:border-emerald-800 rounded-[10px] p-2.5 text-xs text-slate-900 focus:outline-none text-right dir-ltr"
                />
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-[10px] bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  إرسال الطلب
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
