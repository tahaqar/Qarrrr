import React, { useState } from 'react';
import { Hammer, Calculator, Check, MessageCircle, Building2, Send } from 'lucide-react';
import { ContractingPackage, SiteSettings } from '../types';
import { api } from '../services/api';

interface ContractingSectionProps {
  packages: ContractingPackage[];
  settings: SiteSettings;
}

export const ContractingSection: React.FC<ContractingSectionProps> = ({ packages, settings }) => {
  const [landArea, setLandArea] = useState<number>(150);
  const [selectedType, setSelectedType] = useState<'structure' | 'turnkey' | 'renovation'>('turnkey');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const activePackage = packages.find((p) => p.type === selectedType) || packages[0];
  const pricePerMeter = activePackage?.pricePerMeterIqd || 400000;
  const totalEstimatedCost = landArea * pricePerMeter;
  const estimatedUsd = Math.round(totalEstimatedCost / (settings.usdToIqdRate || 1510));

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('ar-IQ').format(num);
  };

  const formatWhatsappLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const num = cleanPhone.startsWith('964') ? cleanPhone : `964${cleanPhone.replace(/^0/, '')}`;
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  const handleContractingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;

    const msg = `طلب استشارة مقاولات بناء: مساحة ${landArea} م² - نوع (${activePackage?.title}) - الكلفة التقريبية ${formatPrice(totalEstimatedCost)} د.ع`;

    await api.createInquiry({
      customerName: customerName || 'زبون مقاولات',
      customerPhone,
      type: 'contracting_request',
      message: msg,
    });

    setRequestSent(true);
    setTimeout(() => {
      window.open(formatWhatsappLink(settings.whatsappNumber, `مرحباً مكتب طه معاذ للمقاولات، أنا ${customerName || 'زبون'}: ${msg}`), '_blank');
    }, 600);
  };

  return (
    <section className="py-12 bg-slate-50 border-t border-slate-200/80 text-slate-900" id="contracting-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            المقاولات والبناء
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            خدمات المقاولات المتكاملة
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            بناء هيكل أسود، تسليم مفتاح راقي، هدم وترميم تحت إشراف مهندسين مختصين
          </p>
        </div>

        {/* Contracting Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white border border-slate-200/90 p-5 rounded-[14px] flex flex-col justify-between space-y-4 shadow-sm hover:border-emerald-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-[12px] bg-emerald-900 text-amber-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{pkg.title}</h3>
                <div className="bg-slate-50 p-2.5 rounded-[10px] border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">سعر المتر المربع:</span>
                  <span className="text-lg font-black text-emerald-900">
                    {formatPrice(pkg.pricePerMeterIqd)} د.ع
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{pkg.description}</p>
                <ul className="space-y-1 pt-2 border-t border-slate-100">
                  {pkg.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={formatWhatsappLink(settings.whatsappNumber, `مرحباً مكتب طه معاذ، استفسر عن (${pkg.title})`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-[10px] bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
                طلب استشارة
              </a>
            </div>
          ))}
        </div>

        {/* Cost Calculator */}
        <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-[14px] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-900" />
                <h3 className="text-lg font-bold text-slate-900">حاسبة كلفة البناء والمقاولات</h3>
              </div>
              <p className="text-xs text-slate-600">
                اختر نوع البناء وحدد مساحة أرضك لحساب التكلفة التقديرية بالدينار العراقي:
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedType('structure')}
                    className={`p-2.5 rounded-[10px] border text-xs font-bold transition-all ${
                      selectedType === 'structure'
                        ? 'bg-emerald-900 text-white border-emerald-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    هيكل (200 ألف/م²)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('turnkey')}
                    className={`p-2.5 rounded-[10px] border text-xs font-bold transition-all ${
                      selectedType === 'turnkey'
                        ? 'bg-emerald-900 text-white border-emerald-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    تسليم مفتاح (400 ألف/م²)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('renovation')}
                    className={`p-2.5 rounded-[10px] border text-xs font-bold transition-all ${
                      selectedType === 'renovation'
                        ? 'bg-emerald-900 text-white border-emerald-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ترميم (150 ألف/م²)
                  </button>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">المساحة الإجمالية:</label>
                    <span className="text-sm font-extrabold text-emerald-900">{landArea} م²</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    step="10"
                    value={landArea}
                    onChange={(e) => setLandArea(Number(e.target.value))}
                    className="w-full accent-emerald-900 bg-slate-200 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-[12px] border border-slate-200 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs text-slate-500 font-medium">الكلفة الكلية التقديرية:</span>
                <div className="text-2xl font-black text-emerald-900">
                  {formatPrice(totalEstimatedCost)} <span className="text-xs font-bold">د.ع</span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  (~ ${formatPrice(estimatedUsd)})
                </div>
              </div>

              {requestSent ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-[10px] font-bold text-center">
                  تم استلام طلب المقاولة بنجاح!
                </div>
              ) : (
                <form onSubmit={handleContractingSubmit} className="space-y-2">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اسمك الكريم"
                    className="w-full bg-white border border-slate-200 rounded-[10px] p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="رقم الهاتف"
                    className="w-full bg-white border border-slate-200 rounded-[10px] p-2.5 text-xs text-slate-900 focus:outline-none dir-ltr text-right"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-[10px] bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    احجز معاينة المقاولة
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
