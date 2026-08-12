import React from 'react';
import { ShieldCheck, CircleDollarSign, HardHat } from 'lucide-react';
import { motion } from 'motion/react';

export const WhyUs: React.FC = () => {
  const points = [
    {
      icon: ShieldCheck,
      title: 'توثيق قانوني وطابو صرف',
      description: 'نضمن لك سلامة التعاملات العقارية مع التدقيق القانوني الكامل لملكية العقارات والسندات.',
    },
    {
      icon: CircleDollarSign,
      title: 'أسعار حقيقية بدون مبالغة',
      description: 'تقييم عادل لأسعار البيع والإيجار وفق حركة السوق العقاري الفعلية في بغداد.',
    },
    {
      icon: HardHat,
      title: 'إشراف هندسي ومقاولات موثوقة',
      description: 'كوادر هندسية مختصة لإدارة مشاريع البناء والتطوير وتسليم المفتاح بأعلى جودة.',
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-slate-200/80 my-12" id="why-us">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            لماذا يفضلنا العملاء
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            لماذا مكتب طه معاذ؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            خبرة وشفافية في تقديم خدمات عقارية ومقاولات متكاملة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-slate-50 border border-slate-200/90 rounded-[14px] p-6 text-center space-y-3 hover:border-emerald-300 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-[14px] bg-emerald-900 text-white flex items-center justify-center mx-auto shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{pt.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{pt.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
