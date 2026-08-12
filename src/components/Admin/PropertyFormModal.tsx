import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Image, Check, Upload, Camera, Video, Film } from 'lucide-react';
import { Property, PropertyCategory, PropertyStatus, TransactionType, CustomCategory } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

interface PropertyFormModalProps {
  propertyToEdit?: Property | null;
  customCategories?: CustomCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Property, 'createdAt'> & { id?: string }) => void;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  propertyToEdit,
  customCategories,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(propertyToEdit?.title || '');
  const [code, setCode] = useState(propertyToEdit?.code || `TA-${Math.floor(100 + Math.random() * 900)}`);
  const [transactionType, setTransactionType] = useState<TransactionType>(propertyToEdit?.transactionType || 'sale');
  const [category, setCategory] = useState<PropertyCategory>(propertyToEdit?.category || 'house');
  const [priceIqd, setPriceIqd] = useState<number>(propertyToEdit?.priceIqd || 250000000);
  const [priceUsd, setPriceUsd] = useState<number>(propertyToEdit?.priceUsd || 165000);
  const [location, setLocation] = useState(propertyToEdit?.location || 'بغداد - الطوبجي');
  const [areaName, setAreaName] = useState(propertyToEdit?.areaName || 'الطوبجي');
  const [spaceSqM, setSpaceSqM] = useState<number>(propertyToEdit?.spaceSqM || 150);
  const [bedrooms, setBedrooms] = useState<number>(propertyToEdit?.bedrooms || 3);
  const [bathrooms, setBathrooms] = useState<number>(propertyToEdit?.bathrooms || 2);
  const [deedType, setDeedType] = useState(propertyToEdit?.deedType || 'طابو صرف 100%');
  const [description, setDescription] = useState(propertyToEdit?.description || '');
  const [status, setStatus] = useState<PropertyStatus>(propertyToEdit?.status || 'available');
  const [isFeatured, setIsFeatured] = useState<boolean>(propertyToEdit?.isFeatured || false);
  const [images, setImages] = useState<string[]>(
    propertyToEdit?.images || ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80']
  );
  const [videoUrl, setVideoUrl] = useState<string>(propertyToEdit?.videoUrl || '');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>(propertyToEdit?.features || ['طابو ملك صرف', 'كراج سيارة', 'بناء حديث']);

  const availableCatList = customCategories || [
    { id: 'house', label: 'بيوت ودور' },
    { id: 'apartment', label: 'شقق سكنية' },
    { id: 'complex', label: 'مجمعات سكنية' },
    { id: 'land', label: 'أراضي وعرصات' },
    { id: 'commercial', label: 'محلات ومكاتب تجارية' },
  ];

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setVideoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressed = await compressImageFile(file, 1600, 1600, 0.85);
        setImages((prev) => [...prev, compressed]);
      } catch (err) {
        console.error('Property image compression error:', err);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: propertyToEdit?.id,
      code,
      title,
      transactionType,
      category,
      priceIqd: Number(priceIqd),
      priceUsd: Number(priceUsd) || undefined,
      location,
      areaName,
      spaceSqM: Number(spaceSqM),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      deedType,
      description,
      features,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
      videoUrl: videoUrl.trim() || undefined,
      isFeatured,
      status,
      contactPhone: '07702599665',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-slate-900 border border-amber-500/30 w-full max-w-3xl rounded-3xl shadow-2xl p-6 text-white my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-white mb-6 pb-2 border-b border-slate-800">
          {propertyToEdit ? 'تعديل بيانات العقار' : 'إضافة عقار جديد لوحة التحكم'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">كود العقار</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">حالة توفر العقار *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                className="w-full bg-slate-950 border border-emerald-500/50 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs font-bold"
              >
                <option value="available" className="bg-slate-900 text-emerald-400 font-bold">✅ متوفر (نشط وجاهز)</option>
                <option value="published" className="bg-slate-900 text-emerald-400 font-bold">🌐 منشور للعامة</option>
                <option value="rented" className="bg-slate-900 text-blue-400 font-bold">🔑 مؤجر (تم إيجاره)</option>
                <option value="sold" className="bg-slate-900 text-rose-400 font-bold">🏷️ تم البيع (مباع)</option>
                <option value="draft" className="bg-slate-900 text-amber-400 font-bold">📝 مسودة (خاص بلوحة التحكم)</option>
                <option value="archived" className="bg-slate-900 text-slate-400 font-bold">📁 مؤرشف</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">قسم العقار المعروض</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs"
              >
                <option value="sale">بيع (عقار للبيع)</option>
                <option value="rent">إيجار (عقار للإيجار)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">نوع/فئة العقار</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs"
              >
                {availableCatList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">عنوان العقار الرئيسي *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: بيت طابقين بناء 2024 في الطوبجي قرب معهد المكفوفين"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">السعر بالدينار العراقي (د.ع) *</label>
              <input
                type="number"
                required
                value={priceIqd}
                onChange={(e) => setPriceIqd(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs font-sans font-bold text-amber-400"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">السعر التقديري بالدولار ($)</label>
              <input
                type="number"
                value={priceUsd}
                onChange={(e) => setPriceUsd(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">الموقع التفصيلي</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="بغداد - الطوبجي - شارع الربيع"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">اسم المنطقة لفلترة المحرك</label>
              <input
                type="text"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="الطوبجي"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">نوع سند الملكية (الطابو)</label>
              <input
                type="text"
                value={deedType}
                onChange={(e) => setDeedType(e.target.value)}
                placeholder="طابو صرف 100%"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">المساحة (م²)</label>
              <input
                type="number"
                value={spaceSqM}
                onChange={(e) => setSpaceSqM(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">عدد الغرف</label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">عدد الحمامات</label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">وصف شامل للعقار</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2.5 text-xs"
            ></textarea>
          </div>

          {/* Features Manager */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">مميزات العقار (مثال: كراج, مولدة, مصعد)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="أضف ميزة جديدة..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-2 text-xs"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-2 bg-slate-800 text-amber-400 rounded-xl font-bold hover:bg-slate-700"
              >
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((feat, i) => (
                <span key={i} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5">
                  {feat}
                  <X className="w-3 h-3 text-red-400 cursor-pointer" onClick={() => handleRemoveFeature(i)} />
                </span>
              ))}
            </div>
          </div>

          {/* Images Manager */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-emerald-900/40">
            <div className="flex items-center justify-between">
              <label className="block font-extrabold text-amber-400 text-xs">صور العقار (رفع من الجهاز)</label>
              <span className="text-[10px] text-slate-400 font-bold">{images.length} صور مرفقة</span>
            </div>

            {/* Direct File Upload Button */}
            <div>
              <label
                htmlFor="admin-phone-photo-input"
                className="w-full py-3 px-4 bg-emerald-800/90 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-500/30 shadow-md text-xs"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>رفع صور العقار من المعرض أو الاستوديو</span>
                <input
                  id="admin-phone-photo-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Thumbnails Gallery */}
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pt-2 pb-1">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-16 rounded-xl bg-slate-900 overflow-hidden border border-slate-700 shrink-0 group">
                    <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute inset-0 bg-red-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Manager */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-emerald-900/40">
            <div className="flex items-center justify-between">
              <label className="block font-extrabold text-amber-400 flex items-center gap-1.5 text-xs">
                <Video className="w-4 h-4 text-emerald-400" />
                <span>فيديو للعقار (رفع فيديو مباشر من الجهاز)</span>
              </label>
              {videoUrl && <span className="text-[10px] text-emerald-400 font-bold">تم إرفاق فيديو ✅</span>}
            </div>

            <div>
              <label
                htmlFor="admin-phone-video-input"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-700 shadow-md text-xs"
              >
                <Film className="w-4 h-4 text-amber-400" />
                <span>رفع مقطع فيديو للعقار من الهاتف أو المعرض</span>
                <input
                  id="admin-phone-video-input"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {videoUrl && (
              <div className="pt-2 flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="max-w-xs text-[10px] text-amber-300 font-mono truncate dir-ltr">
                  فيديو مرفق جاهز للعرض
                </div>
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="text-xs text-red-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  إزالة الفيديو
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              حفظ وتطبيق التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
