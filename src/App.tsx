import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { MarketingRequestModal } from './components/MarketingRequestModal';
import { WhyUs } from './components/WhyUs';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { SplashScreen } from './components/SplashScreen';
import { Property, SiteSettings, PropertyInquiry, ContractingPackage, PropertyCategory, TransactionType } from './types';
import { api } from './services/api';
import { initialProperties, initialSiteSettings, initialContractingPackages, initialInquiries } from './data/initialData';
import { Search, Building2, MessageCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(initialSiteSettings);
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [contractingPackages, setContractingPackages] = useState<ContractingPackage[]>(initialContractingPackages);
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>(initialInquiries);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeSection, setActiveSection] = useState<string>('all'); // 'all' | 'sale' | 'rent' | 'contracting'
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory | 'all'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [marketingModalOpen, setMarketingModalOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [stg, props, pkgs, inqs] = await Promise.all([
        api.getSettings(),
        api.getProperties(),
        api.getContractingPackages(),
        api.getInquiries(),
      ]);
      setSettings(stg);
      setProperties(props);
      setContractingPackages(pkgs);
      setInquiries(inqs);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      // Hide draft and archived properties from public visitors
      if (item.status === 'draft' || item.status === 'archived') return false;

      // Filter by Active Section
      if (activeSection === 'sale' && item.transactionType !== 'sale') return false;
      if (activeSection === 'rent' && item.transactionType !== 'rent') return false;

      // Filter by selected type tab
      if (selectedType !== 'all' && item.transactionType !== selectedType) return false;

      // Filter by category (house, apartment, complex)
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Filter by Area Name
      if (selectedArea && !item.location.includes(selectedArea) && !item.areaName.includes(selectedArea)) {
        return false;
      }

      // Filter by Search Query (code, title, location, deedType)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchDeed = item.deedType.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchLoc && !matchDeed) return false;
      }

      return true;
    });
  }, [properties, activeSection, selectedType, selectedCategory, selectedArea, searchQuery]);

  const formatWhatsappLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const num = cleanPhone.startsWith('964') ? cleanPhone : `964${cleanPhone.replace(/^0/, '')}`;
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-900 selection:text-white dir-rtl">
      {/* Header */}
      <Header
        settings={settings}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Hero with direct Sale / Rent selection & categories */}
      <Hero
        settings={settings}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
      />

      {/* Main Catalog Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10" id="properties-catalog">
        {/* Catalog Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-900" />
              {activeSection === 'sale'
                ? 'عقارات للبيع'
                : activeSection === 'rent'
                ? 'عقارات للإيجار'
                : activeSection === 'contracting'
                ? 'قسم المقاولات'
                : 'دليل العقارات المتاحة'}
              <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {filteredProperties.length} عقار
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              وحدات سكنية وتجارية موثوقة في بغداد طابو صرف وتسليم فورياً
            </p>
          </div>

          {(searchQuery || selectedArea || selectedCategory !== 'all' || selectedType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedArea('');
                setSelectedCategory('all');
                setSelectedType('all');
                setActiveSection('all');
              }}
              className="text-xs text-slate-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-[10px] shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              إعادة الفلترة
            </button>
          )}
        </div>

        {/* Property Grid */}
        {activeSection !== 'contracting' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white border border-slate-200 rounded-[14px] h-72 animate-pulse"></div>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[14px] border border-slate-200 space-y-3 max-w-md mx-auto shadow-sm">
                <Search className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">لا توجد عقارات بمواصفات البحث الحالية</h3>
                <p className="text-xs text-slate-500">
                  يرجى تعديل خيارات الفلترة أو التواصل مع مكتبنا مباشرة لمساعدتك.
                </p>
                <button
                  onClick={() => setMarketingModalOpen(true)}
                  className="px-4 py-2 bg-emerald-900 text-white font-bold rounded-[10px] text-xs inline-block"
                >
                  انشر عقارك
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    settings={settings}
                    onSelectProperty={(p) => setSelectedProperty(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Why Us Section */}
        <WhyUs />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => setAdminOpen(true)}
        onSelectCategory={(sec) => {
          setActiveSection(sec);
          const el = document.getElementById('properties-catalog');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Floating WhatsApp Quick Action */}
      <div className="fixed bottom-5 right-5 z-40">
        <a
          href={formatWhatsappLink(settings.whatsappNumber, 'مرحباً مكتب طه معاذ للعقار والمقاولات')}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-emerald-900 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          title="واتساب"
        >
          <MessageCircle className="w-6 h-6 text-amber-400" />
        </a>
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        settings={settings}
        onClose={() => setSelectedProperty(null)}
      />

      {/* Marketing Submission Modal */}
      <MarketingRequestModal
        settings={settings}
        isOpen={marketingModalOpen}
        onClose={() => setMarketingModalOpen(false)}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        properties={properties}
        settings={settings}
        inquiries={inquiries}
        contractingPackages={contractingPackages}
        onRefreshData={loadData}
      />
    </div>
  );
}
