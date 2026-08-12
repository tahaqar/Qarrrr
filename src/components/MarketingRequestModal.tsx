import React, { useState } from 'react';
import { X, Send, Share2, Building, MapPin, Phone, MessageCircle, Check, Camera, Trash2 } from 'lucide-react';
import { SiteSettings } from '../types';
import { api } from '../services/api';

interface MarketingRequestModalProps {
  settings: SiteSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const MarketingRequestModal: React.FC<MarketingRequestModalProps> = ({
  settings,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [propertyType, setPropertyType] = useState('بيت');
  const [transaction, setTransaction] = useState('بيع');
  const [location, setLocation] = useState('الطوبجي');
  const [details, setDetails] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handlePhoneFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const formatWhatsappLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const num = cleanPhone.startsWith('964') ? cleanPhone : `964${cleanPhone.replace(/^0/, '')}`;
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerPhone.trim()) return;

    const photoCountText = uploadedPhotos.length > 0 ? ` (مرفق ${uploadedPhotos.length} صور من الهاتف)` : '';
    const messageText = `طلب تسويق عقار: ${propertyType} للـ${transaction} - المنطقة: (${location}) - التفاصيل: ${details || 'بدون تفاصيل'}${photoCountText}`;

    await api.createInquiry({
      customerName: ownerName || 'صاحب عقار',
      customerPhone: ownerPhone,
      type: 'marketing_request',
      message: messageText,
    });

    setSubmitted(true);
    setTimeout(() => {
      const msg = `مرحباً مكتب طه معاذ للعقار، أنا ${ownerName || 'صاحب عقار'} هاتف (${ownerPhone}): ${messageText}`;
      window.open(formatWhatsappLink(settings.whatsappNumber, msg), '_blank');
      onClose();
      setSubmitted(false);
      setUploadedPhotos([]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-slate-900 border border-amber-500/30 w-full max-w-lg rounded-3xl shadow-2xl p-6 text-white my-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white">انشر عقارك معنا</h3>
          <p className="text-xs text-slate-300">
            نقوم بتسويق وتثمين عقارك بأعلى كفاءة في بغداد، سنصلك بأفضل المشتريين أو المستأجرين.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
            <Check className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-extrabold text-emerald-300">تم تسجيل طلب التسويق بنجاح!</h4>
            <p className="text-xs text-slate-300">جاري توجيهك للمكتب لمتابعة التفاصيل والصور...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="أدخل اسمك"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="077XXXXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs focus:outline-none dir-ltr text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">نوع المعاملة</label>
                <select
                  value={transaction}
                  onChange={(e) => setTransaction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs focus:outline-none"
                >
                  <option value="بيع">عقار للبيع</option>
                  <option value="إيجار">عقار للإيجار</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">نوع العقار</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs focus:outline-none"
                >
                  <option value="بيت / دار">بيت / دار سكنية</option>
                  <option value="شقة">شقة سكنية</option>
                  <option value="مجمع">مجمع سكني</option>
                  <option value="أرض">أرض سكنية / استثمارية</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">المنطقة / العنوان في بغداد</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: الطوبجي, المنصور, شارع الربيع..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">تفاصيل العقار والمساحة والسعر المطلوب</label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="اكتب المساحة, عدد الغرف, السعر المطلوب, ونوع الطابو..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs focus:outline-none"
              ></textarea>
            </div>

            {/* Photo Upload From Mobile Device */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-extrabold text-amber-400">إرفاق صور العقار من الهاتف (اختياري)</label>
                <span className="text-[10px] text-slate-400 font-bold">{uploadedPhotos.length} صور</span>
              </div>

              <label
                htmlFor="user-marketing-photos"
                className="w-full py-2.5 px-3 bg-emerald-800/90 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-500/30 text-xs shadow-md"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>اختيار صور من المعرض أو الكاميرا 📱</span>
                <input
                  id="user-marketing-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhoneFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedPhotos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-1">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative w-16 h-14 rounded-lg bg-slate-900 overflow-hidden border border-slate-700 shrink-0 group">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute inset-0 bg-red-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
              إرسال طلب التسويق لكادر المكتب
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
