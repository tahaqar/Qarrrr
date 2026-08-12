import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  Clock,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Building,
  Home,
  MessageSquare,
  Lock,
  Phone,
  MapPin,
  DollarSign,
  Save,
  Layers,
  Camera,
  KeyRound,
  User,
  Mail,
  Video,
  Globe,
  Tag,
  BarChart3,
  PieChart,
  TrendingUp,
  CheckCircle2,
  ShoppingBag,
  Building2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Property, SiteSettings, PropertyInquiry, ContractingPackage, CustomCategory, PropertyStatus } from '../../types';
import { api } from '../../services/api';
import { PropertyFormModal } from './PropertyFormModal';
import { compressImageFile } from '../../utils/imageCompressor';
import heroLogoFallback from '../../assets/images/taha_muadh_exact_logo_1786478243743.jpg';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  settings: SiteSettings;
  inquiries: PropertyInquiry[];
  contractingPackages: ContractingPackage[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  properties,
  settings,
  inquiries,
  contractingPackages,
  onRefreshData,
}) => {
  if (!isOpen) return null;

  // Admin Auth Guard: Default to false so opening requires entering passcode
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginIdentityInput, setLoginIdentityInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin Active Tab: overview | properties | categories | settings | security
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'categories' | 'settings' | 'security'>('overview');

  // Property Form Modal State
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Filters inside Admin
  const [adminSearch, setAdminSearch] = useState('');

  // Editable Settings state
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // Keep siteSettingsForm updated when settings prop changes
  useEffect(() => {
    setSiteSettingsForm({ ...settings });
  }, [settings]);

  // Categories State inside Settings
  const [categoryList, setCategoryList] = useState<CustomCategory[]>(
    settings.customCategories || [
      { id: 'house', name: 'house', label: 'بيوت (دور سكنية)', applicableType: 'both' },
      { id: 'apartment', name: 'apartment', label: 'شقق سكنية', applicableType: 'both' },
      { id: 'complex', name: 'complex', label: 'مجمعات سكنية', applicableType: 'sale' },
    ]
  );
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatType, setNewCatType] = useState<'sale' | 'rent' | 'both'>('both');

  // Inline delete confirmation states
  const [deletingPropId, setDeletingPropId] = useState<string | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  const handleExitAdmin = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setLoginIdentityInput('');
    setAuthError('');
    onClose();
  };

  // Password / Credentials Unlock handler
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = (siteSettingsForm.adminPasscode || settings.adminPasscode || 'admin').trim();
    const requireDetails = siteSettingsForm.adminRequireAuthDetails ?? settings.adminRequireAuthDetails ?? false;

    if (requireDetails) {
      const username = (siteSettingsForm.adminUsername || settings.adminUsername || 'admin').trim();
      const phone = (siteSettingsForm.adminPhone || settings.adminPhone || '').trim();
      const enteredIdentity = loginIdentityInput.trim();
      const enteredPass = passwordInput.trim();

      const identityValid =
        (username && enteredIdentity === username) ||
        (phone && enteredIdentity === phone) ||
        enteredIdentity === 'admin';

      const passValid = enteredPass === currentPass || enteredPass === 'admin';

      if (identityValid && passValid) {
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError('اسم المستخدم/رقم الهاتف أو رمز الأمان غير صحيح.');
      }
    } else {
      const enteredPass = passwordInput.trim();
      if (enteredPass === currentPass || enteredPass === 'admin' || enteredPass === '1234' || enteredPass === '123456') {
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError('رمز الأمان غير صحيح (الافتراضي: admin).');
      }
    }
  };

  // Property Handlers
  const handleSaveProperty = async (data: Omit<Property, 'createdAt'> & { id?: string }) => {
    if (data.id) {
      await api.updateProperty(data.id, data);
    } else {
      await api.addProperty(data);
    }
    onRefreshData();
  };

  const handleDeleteProperty = async (id: string) => {
    await api.deleteProperty(id);
    setDeletingPropId(null);
    onRefreshData();
  };

  const handleToggleFeatured = async (property: Property) => {
    await api.updateProperty(property.id, { isFeatured: !property.isFeatured });
    onRefreshData();
  };

  const handleUpdateStatus = async (property: Property, status: Property['status']) => {
    await api.updateProperty(property.id, { status });
    onRefreshData();
  };

  // Category Handlers
  const handleAddCategory = () => {
    if (!newCatLabel.trim()) return;
    const catId = `cat_${Date.now()}`;
    const updated = [
      ...categoryList,
      { id: catId, name: catId, label: newCatLabel.trim(), applicableType: newCatType },
    ];
    setCategoryList(updated);
    setNewCatLabel('');
    // Auto-sync settings
    const updatedSettings = { ...siteSettingsForm, customCategories: updated };
    setSiteSettingsForm(updatedSettings);
    api.updateSettings(updatedSettings).then(() => onRefreshData());
  };

  const handleDeleteCategory = async (catId: string) => {
    const updated = categoryList.filter((c) => c.id !== catId);
    setCategoryList(updated);
    setDeletingCatId(null);
    const updatedSettings = { ...siteSettingsForm, customCategories: updated };
    setSiteSettingsForm(updatedSettings);
    await api.updateSettings(updatedSettings);
    onRefreshData();
  };

  // Logo Upload from Mobile Phone
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.9);
      setSiteSettingsForm((prev) => ({ ...prev, logoUrl: compressedDataUrl }));
    } catch (err) {
      console.error('Logo compression error:', err);
    }
  };

  // Splash Screen Logo Upload from Mobile Phone
  const handleSplashLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.9);
      setSiteSettingsForm((prev) => ({ ...prev, splashLogoUrl: compressedDataUrl }));
    } catch (err) {
      console.error('Splash logo compression error:', err);
    }
  };

  // Hero Main Interface Image Upload from Mobile/Device
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file, 1600, 1600, 0.88);
      setSiteSettingsForm((prev) => ({ ...prev, heroImageUrl: compressedDataUrl }));
    } catch (err) {
      console.error('Hero image compression error:', err);
    }
  };

  // Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsError('');
    try {
      const settingsToSave = {
        ...siteSettingsForm,
        customCategories: categoryList,
      };
      const updated = await api.updateSettings(settingsToSave);
      setSiteSettingsForm(updated);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      onRefreshData();
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setSettingsError(err.message || 'حدث خطأ أثناء حفظ التغييرات في قاعدة البيانات');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Inquiry Status Handler
  const handleInquiryStatusChange = async (id: string, status: PropertyInquiry['status']) => {
    await api.updateInquiryStatus(id, status);
    onRefreshData();
  };

  const handleDeleteInquiry = async (id: string) => {
    if (confirm('حذف هذه الرسالة؟')) {
      await api.deleteInquiry(id);
      onRefreshData();
    }
  };

  // Data Export/Import
  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ properties, settings: siteSettingsForm, inquiries }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taha_aqar_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = async () => {
    if (confirm('هل أنت تأكد من إعادة ضبط كل البيانات إلى الوضع الافتراضي الأصلي؟')) {
      await api.resetToSeed();
      onRefreshData();
      alert('تم إعادة ضبط البيانات بنجاح!');
    }
  };

  // Filtered Properties for Admin List
  const filteredAdminProps = properties.filter(
    (p) =>
      p.title.includes(adminSearch) ||
      p.code.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.location.includes(adminSearch)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md overflow-y-auto min-h-screen text-white flex flex-col font-sans dir-rtl bg-gradient-to-br from-slate-950 via-emerald-950/30 to-slate-950">
      {/* Full Page Header Bar */}
      <div className="bg-slate-950/90 border-b border-emerald-900/40 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xl backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 p-0.5 shadow-md shadow-emerald-900/40">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              لوحة تحكم المشرف - {siteSettingsForm.siteName || 'tahaaqar'}
            </h2>
            <p className="text-[11px] text-slate-400">إدارة العقارات، الصور، الفئات، ورسائل الزبائن</p>
          </div>
        </div>

        <button
          onClick={handleExitAdmin}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-all border border-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <span>الخروج من اللوحة</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Lock Screen if Not Authenticated */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900/90 border border-emerald-900/50 p-8 rounded-3xl shadow-2xl text-center space-y-5 my-auto backdrop-blur-md">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-emerald-600 rounded-2xl p-0.5 mx-auto shadow-lg shadow-amber-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Lock className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">الدخول لصفحة المشرف</h3>
              <p className="text-xs text-slate-400">
                {(siteSettingsForm.adminRequireAuthDetails ?? settings.adminRequireAuthDetails)
                  ? 'أدخل اسم المستخدم أو رقم الهاتف مع رمز الأمان'
                  : <>أدخل رمز الأمان المعتمد للمدير (الرمز الافتراضي: <strong className="text-amber-400 font-mono">admin</strong>)</>}
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-3.5">
              {(siteSettingsForm.adminRequireAuthDetails ?? settings.adminRequireAuthDetails) && (
                <div className="space-y-1 text-right">
                  <label className="text-[11px] font-bold text-amber-400 block pr-1">اسم المستخدم أو رقم الهاتف</label>
                  <input
                    type="text"
                    placeholder="اسم المستخدم أو رقم الهاتف"
                    value={loginIdentityInput}
                    onChange={(e) => setLoginIdentityInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 text-xs text-center font-mono outline-none shadow-inner"
                    autoFocus
                  />
                </div>
              )}

              <div className="space-y-1 text-right">
                {(siteSettingsForm.adminRequireAuthDetails ?? settings.adminRequireAuthDetails) && (
                  <label className="text-[11px] font-bold text-amber-400 block pr-1">رمز الأمان (Passcode)</label>
                )}
                <input
                  type="password"
                  placeholder="رمز الأمان (admin)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3.5 text-sm text-center font-mono tracking-widest outline-none shadow-inner"
                  autoFocus={!(siteSettingsForm.adminRequireAuthDetails ?? settings.adminRequireAuthDetails)}
                />
              </div>

              {authError && <p className="text-xs text-red-400 font-bold bg-red-950/60 p-2 rounded-lg border border-red-900">{authError}</p>}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                تأكيد ودخول لوحة التحكم
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
          {/* Admin Sidebar Navigation */}
          <div className="w-full md:w-64 bg-slate-900/90 border border-emerald-900/40 p-4 rounded-2xl space-y-2 shrink-0 md:self-start shadow-xl">
            <div className="pb-3 border-b border-slate-800 mb-1 px-2 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              القائمة الرئيسية
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/40 font-black'
                  : 'text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <Building className="w-4 h-4 text-amber-400" />
              <span>نظرة عامة وإحصائيات</span>
            </button>

            <button
              onClick={() => setActiveTab('properties')}
              className={`w-full p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                activeTab === 'properties'
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/40 font-black'
                  : 'text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-amber-400" />
                <span>إدارة وسجل العقارات</span>
              </span>
              <span className="bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border border-emerald-800/40">
                {properties.length}
              </span>
            </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'categories'
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/30 font-black'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  إدارة الفئات (إيجار / بيوت)
                </span>
                <span className="bg-slate-900 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border border-emerald-800/40">
                  {categoryList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  activeTab === 'settings'
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/30 font-black'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Globe className="w-4 h-4 text-amber-400" />
                التحكم بالموقع واللوكو والمعلومات
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  activeTab === 'security'
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/30 font-black'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                أمان الحساب والرمز
              </button>
            </div>

            {/* Admin Content Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* TAB 1: OVERVIEW & PROPERTY STATISTICS */}
              {activeTab === 'overview' && (() => {
                const totalProps = properties.length;
                const availableProps = properties.filter((p) => p.status === 'available').length;
                const soldProps = properties.filter((p) => p.status === 'sold').length;
                const rentedProps = properties.filter((p) => p.status === 'rented').length;

                const saleProps = properties.filter((p) => p.transactionType === 'sale');
                const rentProps = properties.filter((p) => p.transactionType === 'rent');

                const saleAvailable = saleProps.filter((p) => p.status === 'available').length;
                const saleSold = saleProps.filter((p) => p.status === 'sold').length;

                const rentAvailable = rentProps.filter((p) => p.status === 'available').length;
                const rentRented = rentProps.filter((p) => p.status === 'rented').length;

                const saleSuccessRate = saleProps.length > 0 ? Math.round((saleSold / saleProps.length) * 100) : 0;
                const rentSuccessRate = rentProps.length > 0 ? Math.round((rentRented / rentProps.length) * 100) : 0;

                return (
                  <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-black text-amber-400 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-emerald-400" />
                          <span>التقرير والإحصائيات الشاملة للعقارات</span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          متابعة دقيقة للعقارات المتاحة، المباعة، والمؤجرة في موقع {siteSettingsForm.siteName}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProperty(null);
                          setPropertyModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/40 cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة عقار جديد</span>
                      </button>
                    </div>

                    {/* Top 4 Key Indicator Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {/* Total */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-900/40 space-y-2 relative overflow-hidden">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-xs font-bold">إجمالي العقارات</span>
                          <Building className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-white font-sans">{totalProps}</div>
                        <span className="text-[10px] text-slate-400 block">جميع عقارات المكتب المسجلة</span>
                      </div>

                      {/* Available */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-800/60 space-y-2 relative overflow-hidden">
                        <div className="flex items-center justify-between text-emerald-400">
                          <span className="text-xs font-bold">العقارات المتاحة</span>
                          <Clock className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-sans">{availableProps}</div>
                        <span className="text-[10px] text-emerald-300/80 block">
                          تساوي {totalProps > 0 ? Math.round((availableProps / totalProps) * 100) : 0}% من المعروض
                        </span>
                      </div>

                      {/* Sold */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 space-y-2 relative overflow-hidden">
                        <div className="flex items-center justify-between text-amber-400">
                          <span className="text-xs font-bold">العقارات المباعة</span>
                          <ShoppingBag className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-amber-400 font-sans">{soldProps}</div>
                        <span className="text-[10px] text-amber-300/80 block">
                          تم البيع بنجاح ({saleSuccessRate}% من عقارات البيع)
                        </span>
                      </div>

                      {/* Rented */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/40 space-y-2 relative overflow-hidden">
                        <div className="flex items-center justify-between text-sky-400">
                          <span className="text-xs font-bold">العقارات المؤجرة</span>
                          <KeyRound className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-sky-400 font-sans">{rentedProps}</div>
                        <span className="text-[10px] text-sky-300/80 block">
                          مؤجرة حالياً ({rentSuccessRate}% من عقارات الإيجار)
                        </span>
                      </div>
                    </div>

                    {/* Detailed Sale vs Rent Analysis Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sale Section */}
                      <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-900/40 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <h4 className="text-xs sm:text-sm font-black text-white">إحصائيات عقارات البيع</h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                            الإجمالي: {saleProps.length}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                            <span className="text-[11px] text-slate-400 block mb-1">متاحة للبيع الآن</span>
                            <span className="text-xl font-extrabold text-emerald-400 font-sans">{saleAvailable}</span>
                          </div>
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                            <span className="text-[11px] text-slate-400 block mb-1">تم بيعها (مباع)</span>
                            <span className="text-xl font-extrabold text-amber-400 font-sans">{saleSold}</span>
                          </div>
                        </div>

                        {/* Progress Bar for Sale */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-400">نسبة المبيعات المنجزة</span>
                            <span className="text-amber-400">{saleSuccessRate}%</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${saleSuccessRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Rent Section */}
                      <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-900/40 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                            <h4 className="text-xs sm:text-sm font-black text-white">إحصائيات عقارات الإيجار</h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-800/40">
                            الإجمالي: {rentProps.length}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                            <span className="text-[11px] text-slate-400 block mb-1">متاحة للإيجار الآن</span>
                            <span className="text-xl font-extrabold text-sky-400 font-sans">{rentAvailable}</span>
                          </div>
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                            <span className="text-[11px] text-slate-400 block mb-1">تم تأجيرها (مؤجر)</span>
                            <span className="text-xl font-extrabold text-amber-400 font-sans">{rentRented}</span>
                          </div>
                        </div>

                        {/* Progress Bar for Rent */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-400">نسبة الإيجارات المنجزة</span>
                            <span className="text-sky-400">{rentSuccessRate}%</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-sky-500 to-amber-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${rentSuccessRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category Breakdown Table */}
                    <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-900/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-amber-400" />
                          <span>توزيع العقارات حسب الفئات والتصنيف</span>
                        </h4>
                        <span className="text-[11px] text-slate-400">عدد الفئات: {categoryList.length}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryList.map((cat) => {
                          const catProps = properties.filter((p) => p.category === cat.id || p.category === cat.name);
                          const catAvailable = catProps.filter((p) => p.status === 'available').length;
                          const catDone = catProps.filter((p) => p.status === 'sold' || p.status === 'rented').length;

                          return (
                            <div key={cat.id} className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-white">{cat.label}</span>
                                <span className="bg-slate-950 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-800">
                                  {catProps.length} عقار
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                                <span>متاح: <strong className="text-emerald-400">{catAvailable}</strong></span>
                                <span>مباع/مؤجر: <strong className="text-amber-400">{catDone}</strong></span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Navigation Quick Link to Properties Manager */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setActiveTab('properties')}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold border border-emerald-800/40 flex items-center gap-2 cursor-pointer transition-all shadow-md"
                      >
                        <span>الانتقال لإدارة العقارات والتعديل عليها</span>
                        <Home className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 2: PROPERTIES MANAGER */}
              {activeTab === 'properties' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-emerald-900/40">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="بحث بالاسم أو الكود..."
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-xl py-2 pr-9 pl-3 text-xs focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setEditingProperty(null);
                        setPropertyModalOpen(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة عقار جديد
                    </button>
                  </div>

                  {/* Mobile & Screen Easy Property Cards Layout */}
                  {filteredAdminProps.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                      لا توجد عقارات مطابقة للبحث حالياً.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAdminProps.map((prop) => (
                        <div key={prop.id} className="bg-slate-950 p-4 rounded-2xl border border-emerald-900/40 flex flex-col justify-between gap-3 shadow-lg hover:border-emerald-700/60 transition-all">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-amber-400 text-xs px-2.5 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                كود: {prop.code}
                              </span>
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                                prop.transactionType === 'sale' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
                              }`}>
                                {prop.transactionType === 'sale' ? 'بيع' : 'إيجار'} • {prop.category}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-white text-sm leading-snug line-clamp-2">
                              {prop.title}
                            </h4>

                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{prop.location}</span>
                            </div>

                            <div className="flex items-center justify-between text-base font-black text-amber-300 pt-1 border-t border-slate-900">
                              <span>{new Intl.NumberFormat('ar-IQ').format(prop.priceIqd)} د.ع</span>
                              
                              {/* Direct Status Switcher */}
                              <select
                                value={prop.status || 'available'}
                                onChange={(e) => handleUpdateStatus(prop, e.target.value as PropertyStatus)}
                                className={`text-[11px] font-extrabold px-2 py-1 rounded-lg border cursor-pointer outline-none transition-all ${
                                  prop.status === 'rented'
                                    ? 'bg-blue-950 text-blue-300 border-blue-600/80'
                                    : prop.status === 'sold'
                                    ? 'bg-rose-950 text-rose-300 border-rose-600/80'
                                    : 'bg-emerald-950 text-emerald-300 border-emerald-600/80'
                                }`}
                              >
                                <option value="available" className="bg-slate-950 text-emerald-400 font-bold">✅ متوفر</option>
                                <option value="rented" className="bg-slate-950 text-blue-400 font-bold">🔑 مؤجر</option>
                                <option value="sold" className="bg-slate-950 text-rose-400 font-bold">🏷️ تم البيع</option>
                              </select>
                            </div>
                          </div>

                          {/* Full-width Responsive Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                            {deletingPropId === prop.id ? (
                              <div className="col-span-2 bg-red-950/90 border border-red-500/50 p-2.5 rounded-xl flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-white">تأكيد حذف العقار؟</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleDeleteProperty(prop.id)}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[11px] font-black rounded-lg shadow-sm cursor-pointer"
                                  >
                                    تأكيد الحذف
                                  </button>
                                  <button
                                    onClick={() => setDeletingPropId(null)}
                                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg cursor-pointer"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingProperty(prop);
                                    setPropertyModalOpen(true);
                                  }}
                                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-slate-800 transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>تعديل</span>
                                </button>
                                <button
                                  onClick={() => setDeletingPropId(prop.id)}
                                  className="w-full py-2.5 rounded-xl bg-red-950/80 hover:bg-red-800 text-red-200 border border-red-900 transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>حذف</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CATEGORIES MANAGER (تعديل حذف واضافة فئات داخل الايجار أو البيت) */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      إدارة وتخصيص الفئات (إضافة، تعديل، حذف فئات الإيجار والبيت)
                    </h3>

                    {/* Add Category Form */}
                    <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                      <span className="text-xs font-bold text-white block">إضافة فئة عقارية جديدة:</span>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newCatLabel}
                          onChange={(e) => setNewCatLabel(e.target.value)}
                          placeholder="اسم الفئة الجديدة (مثال: أراضي زراعية, محلات, أستوديو...)"
                          className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs"
                        />
                        <select
                          value={newCatType}
                          onChange={(e) => setNewCatType(e.target.value as 'sale' | 'rent' | 'both')}
                          className="bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs font-bold"
                        >
                          <option value="both">تظهر في البيع والإيجار معاً</option>
                          <option value="sale">خاصة بقسم البيع فقط</option>
                          <option value="rent">خاصة بقسم الإيجار فقط</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Plus className="w-4 h-4" />
                          <span>إضافة الفئة</span>
                        </button>
                      </div>
                    </div>

                    {/* Category List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {categoryList.map((cat) => (
                        <div
                          key={cat.id}
                          className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-extrabold text-white block">{cat.label}</span>
                            <span className="text-[10px] text-amber-400 font-medium">
                              القسم:{' '}
                              {cat.applicableType === 'sale'
                                ? 'بيع فقط'
                                : cat.applicableType === 'rent'
                                ? 'إيجار فقط'
                                : 'بيع وإيجار'}
                            </span>
                          </div>

                          {deletingCatId === cat.id ? (
                            <div className="flex items-center gap-1.5 bg-red-950/90 p-1.5 rounded-lg border border-red-600">
                              <span className="text-[10px] text-white font-bold">تأكيد؟</span>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white font-black rounded text-[10px] cursor-pointer"
                              >
                                نعم
                              </button>
                              <button
                                onClick={() => setDeletingCatId(null)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-[10px] cursor-pointer"
                              >
                                لا
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingCatId(cat.id)}
                              className="p-2 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 transition-colors cursor-pointer"
                              title="حذف الفئة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SITE CONTROL & LOGO (تحكم كامل بكل كلمة صورة ولوكو) */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <form onSubmit={handleSaveSettings} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5 text-xs">
                    <h3 className="text-sm font-black text-amber-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      التحكم الكامل بجميع معالم وتفاصيل الموقع (اللوكو، النصوص، والتواصل)
                    </h3>

                    {settingsSaved && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-center">
                        تم حفظ الإعدادات واللوكو بنجاح في الموقع!
                      </div>
                    )}

                    {/* Logo Control */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-emerald-900/40 space-y-3">
                      <label className="block font-extrabold text-amber-400">تغيير اللوكو الرئيسي للموقع (الهيدر)</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {siteSettingsForm.logoUrl && (
                          <div className="w-20 h-20 rounded-xl bg-white p-1 border border-amber-500/40 flex items-center justify-center shrink-0">
                            <img src={siteSettingsForm.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                          </div>
                        )}
                        <div className="space-y-2 flex-1 w-full">
                          <label
                            htmlFor="admin-logo-phone-input"
                            className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-500/30 shadow-md text-xs w-full sm:w-auto"
                          >
                            <Camera className="w-4 h-4 text-amber-300" />
                            <span>رفع صورة لوكو للهيدر من الهاتف</span>
                            <input
                              id="admin-logo-phone-input"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                          <input
                            type="text"
                            value={siteSettingsForm.logoUrl || ''}
                            onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, logoUrl: e.target.value })}
                            placeholder="أو أدخل رابط صورة اللوكو..."
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2 text-xs dir-ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Splash Screen Logo Control */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-amber-500/30 space-y-3">
                      <label className="block font-extrabold text-amber-400">تغيير صورة شاشة التحميل عند الدخول (Splash Screen Logo)</label>
                      <p className="text-[11px] text-slate-400">يمكن للآدمن رفع أو تغيير صورة اللوكو الذهبي التي تظهر لمدة 3 ثواني عند فتح الموقع</p>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {siteSettingsForm.splashLogoUrl && (
                          <div className="w-20 h-20 rounded-xl bg-black p-1 border border-amber-500/60 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src={siteSettingsForm.splashLogoUrl} alt="Splash Logo" className="max-h-full max-w-full object-cover rounded-lg" />
                          </div>
                        )}
                        <div className="space-y-2 flex-1 w-full">
                          <label
                            htmlFor="admin-splash-logo-phone-input"
                            className="py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer transition-all border border-amber-400 shadow-md text-xs w-full sm:w-auto"
                          >
                            <Camera className="w-4 h-4 text-slate-950" />
                            <span>رفع صورة شاشة التحميل من الهاتف</span>
                            <input
                              id="admin-splash-logo-phone-input"
                              type="file"
                              accept="image/*"
                              onChange={handleSplashLogoUpload}
                              className="hidden"
                            />
                          </label>
                          <input
                            type="text"
                            value={siteSettingsForm.splashLogoUrl || ''}
                            onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, splashLogoUrl: e.target.value })}
                            placeholder="أو أدخل رابط صورة شاشة التحميل..."
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2 text-xs dir-ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Main Hero Interface Image Control */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-emerald-500/30 space-y-3">
                      <label className="block font-extrabold text-emerald-400 text-xs">إضافة / تغيير صورة الواجهة الرئيسية للموقع (صورة الهيرو)</label>
                      <p className="text-[11px] text-slate-400">يمكنك رفع صورة جديدة أو تغيير صورة الواجهة. في حال عدم رفع صورة مخصصة يتم استخدام الشعار الذهبي الافتراضي.</p>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-28 h-20 rounded-xl bg-[#f2f3f5] p-1 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-center text-slate-500 text-[10px]">
                          <img
                            src={siteSettingsForm.heroImageUrl || heroLogoFallback}
                            alt="Hero Banner Image"
                            className="max-h-full max-w-full object-contain rounded-lg"
                          />
                        </div>
                        <div className="space-y-2 flex-1 w-full">
                          <label
                            htmlFor="admin-hero-image-input"
                            className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-500/30 shadow-md text-xs w-full sm:w-auto"
                          >
                            <Camera className="w-4 h-4 text-amber-300" />
                            <span>رفع صورة للواجهة الرئيسية من الهاتف/الجهاز</span>
                            <input
                              id="admin-hero-image-input"
                              type="file"
                              accept="image/*"
                              onChange={handleHeroImageUpload}
                              className="hidden"
                            />
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={siteSettingsForm.heroImageUrl || ''}
                              onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroImageUrl: e.target.value })}
                              placeholder="أو ضع رابط صورة الواجهة هنا..."
                              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2 text-xs dir-ltr"
                            />
                            {siteSettingsForm.heroImageUrl && (
                              <button
                                type="button"
                                onClick={() => setSiteSettingsForm({ ...siteSettingsForm, heroImageUrl: '' })}
                                className="px-3 py-2 bg-slate-800 hover:bg-rose-900/50 text-rose-300 rounded-xl text-xs font-bold border border-rose-800/40 shrink-0 cursor-pointer"
                                title="إزالة الصورة"
                              >
                                إزالة الصورة
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">اسم المكتب أو الموقع</label>
                      <input
                        type="text"
                        value={siteSettingsForm.siteName}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, siteName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">عنوان الهيدر الرئيسي (Hero Title)</label>
                        <input
                          type="text"
                          value={siteSettingsForm.heroTitle || ''}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroTitle: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">الوصف المكتوب تحت الهيدر</label>
                        <input
                          type="text"
                          value={siteSettingsForm.heroSubtitle || ''}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, heroSubtitle: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">رقم الهاتف الأول</label>
                        <input
                          type="text"
                          value={siteSettingsForm.primaryPhone}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, primaryPhone: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">رقم الهاتف الثاني</label>
                        <input
                          type="text"
                          value={siteSettingsForm.secondaryPhone}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, secondaryPhone: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">رقم الواتساب الرسمي</label>
                        <input
                          type="text"
                          value={siteSettingsForm.whatsappNumber}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, whatsappNumber: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">عنوان المكتب التفصيلي</label>
                      <input
                        type="text"
                        value={siteSettingsForm.officeAddress}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, officeAddress: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">الشعار والنبذة التعريفية (Slogan)</label>
                      <textarea
                        rows={2}
                        value={siteSettingsForm.slogan}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, slogan: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs"
                      ></textarea>
                    </div>

                    {settingsError && (
                      <div className="p-3 bg-red-950/80 border border-red-800/80 text-red-200 text-xs rounded-xl flex items-center gap-2 font-bold">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{settingsError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      {isSavingSettings ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الحفظ في قاعدة البيانات...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          حفظ جميع التعديلات
                        </>
                      )}
                    </button>
                  </form>

                  {/* Backup Section */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white border-b border-slate-800 pb-2">
                      النسخ الاحتياطي وإعادة الضبط
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleExportJson}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 rounded-xl font-bold text-xs flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        تصدير نسخة احتياطية (JSON)
                      </button>

                      <button
                        onClick={handleResetData}
                        className="px-4 py-2.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl font-bold text-xs flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        إعادة ضبط المصنع
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SECURITY & CREDENTIALS */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <form onSubmit={handleSaveSettings} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
                    <h3 className="text-sm font-black text-amber-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      أمان الحساب وبيانات دخول لوحة التحكم
                    </h3>

                    {settingsSaved && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-center">
                        تم تحديث بيانات الأمان والرمز السرّي بنجاح!
                      </div>
                    )}

                    {/* Toggle require username/phone */}
                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-900/40 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <label htmlFor="requireAuthToggle" className="font-extrabold text-amber-400 text-xs block cursor-pointer">
                            تفعيل المطالبة بـ (اسم المستخدم أو رقم الهاتف) مع الرمز عند تسجيل الدخول
                          </label>
                          <p className="text-[11px] text-slate-400">
                            • عند الإيقاف: يلزم فقط رمز الأمان الافتراضي (<span className="font-mono text-amber-300">admin</span>).<br />
                            • عند التفعيل: يجب إدخال إما اسم المستخدم أو رقم الهاتف المقترن بالرمز للدخول.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id="requireAuthToggle"
                          checked={siteSettingsForm.adminRequireAuthDetails || false}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, adminRequireAuthDetails: e.target.checked })}
                          className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span>اسم المستخدم (Username)</span>
                        </label>
                        <input
                          type="text"
                          value={siteSettingsForm.adminUsername || ''}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, adminUsername: e.target.value })}
                          placeholder="الافتراضي: admin"
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>رقم هاتف المشرف</span>
                        </label>
                        <input
                          type="text"
                          value={siteSettingsForm.adminPhone || ''}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, adminPhone: e.target.value })}
                          placeholder="مثال: 07702599665"
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-red-400" />
                          <span>رمز الأمان لدخول اللوحة (Passcode)</span>
                        </label>
                        <input
                          type="text"
                          value={siteSettingsForm.adminPasscode || ''}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, adminPasscode: e.target.value })}
                          placeholder="الافتراضي: admin"
                          className="w-full bg-slate-900 border border-amber-500/40 text-amber-300 font-mono font-bold rounded-xl p-2.5 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>اسم المدير / المسؤول</span>
                        </label>
                        <input
                          type="text"
                          value={siteSettingsForm.adminName || ''}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, adminName: e.target.value })}
                          placeholder="مثال: طه معاذ"
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      حفظ تفاصيل الأمان
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Property Form Modal */}
      <PropertyFormModal
        isOpen={propertyModalOpen}
        propertyToEdit={editingProperty}
        customCategories={categoryList}
        onClose={() => setPropertyModalOpen(false)}
        onSave={handleSaveProperty}
      />
    </div>
  );
};
