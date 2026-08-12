export type TransactionType = 'sale' | 'rent';

export type PropertyCategory = string; // Supports standard and custom categories e.g. 'house' | 'apartment' | 'complex' | 'land' | etc.

export type PropertyStatus = 'available' | 'sold' | 'rented' | 'draft' | 'pending' | 'published' | 'archived';

export interface CustomCategory {
  id: string;
  name: string;
  label: string;
  applicableType?: 'sale' | 'rent' | 'both';
}

export interface Property {
  id: string;
  code: string; // e.g. TA-101
  title: string;
  transactionType: TransactionType; // 'sale' | 'rent'
  category: PropertyCategory; // Category ID or string
  priceIqd: number; // in Iraqi Dinars e.g. 250000000
  priceUsd?: number; // optional USD price e.g. 165000
  location: string; // e.g. بغداد - الطوبجي
  areaName: string; // e.g. الطوبجي, المنصور, الكرادة
  spaceSqM: number; // المساحة بالمتر المربع
  bedrooms: number;
  bathrooms: number;
  floors?: number;
  floorNumber?: number; // for apartments
  deedType: string; // نوع الطابو (طابو زراعي, طابو صرف, ملك صرف, عقد)
  description: string;
  features: string[]; // e.g. ["كراج للسيارة", "مولدة خاصة", "مصعد", "حديقة", "واجهة عريضة"]
  images: string[];
  videoUrl?: string; // Video file data URL or video URL uploaded from mobile/device
  isFeatured?: boolean; // عقار مميز VIP
  status: PropertyStatus;
  createdAt: string;
  contactPhone?: string;
}

export interface ContractingPackage {
  id: string;
  title: string;
  type: 'structure' | 'turnkey' | 'renovation' | 'demolition';
  pricePerMeterIqd: number;
  description: string;
  features: string[];
  image: string;
}

export interface PropertyInquiry {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyCode?: string;
  customerName: string;
  customerPhone: string;
  type: 'inquiry' | 'marketing_request' | 'contracting_request';
  message: string;
  status: 'new' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteSubtitle: string;
  slogan: string;
  logoUrl?: string; // Custom logo image data URL or image link
  splashLogoUrl?: string; // Custom splash screen loading logo image data URL or image link
  heroImageUrl?: string; // Custom main hero interface image data URL or image link
  heroTitle?: string; // Custom title for hero section
  heroSubtitle?: string; // Custom subtitle for hero section
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  officeAddress: string;
  workingHours: string;
  instagramHandle: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  usdToIqdRate: number; // e.g. 1500
  
  // Admin credentials & security configuration
  adminName?: string;
  adminUsername?: string;
  adminEmail?: string;
  adminPhone?: string;
  adminPasscode?: string;
  adminRequireAuthDetails?: boolean; // toggle to require username/phone in addition to passcode

  // Custom categories management
  customCategories?: CustomCategory[];
}

