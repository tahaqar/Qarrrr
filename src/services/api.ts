import { Property, SiteSettings, ContractingPackage, PropertyInquiry } from '../types';
import { initialProperties, initialSiteSettings, initialContractingPackages, initialInquiries } from '../data/initialData';
import {
  fetchPropertiesFromFirestore,
  addPropertyToFirestore,
  updatePropertyInFirestore,
  deletePropertyFromFirestore,
  fetchSettingsFromFirestore,
  updateSettingsInFirestore,
  fetchContractingFromFirestore,
  updateContractingInFirestore,
  fetchInquiriesFromFirestore,
  createInquiryInFirestore,
  updateInquiryStatusInFirestore,
  deleteInquiryFromFirestore,
  uploadMediaToFirebaseStorage,
} from '../lib/firebase';

export const api = {
  // Direct file upload to Firebase Storage (and server fallback)
  async uploadFile(fileData: string, fileName?: string): Promise<{ url: string }> {
    try {
      const url = await uploadMediaToFirebaseStorage(fileData, fileName);
      return { url };
    } catch (e) {
      console.error('File upload error:', e);
    }
    return { url: fileData };
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    try {
      return await fetchSettingsFromFirestore();
    } catch (e) {
      console.error('Failed to fetch settings from Firestore, attempting backend fallback:', e);
      try {
        const res = await fetch(`/api/settings?_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error('Backend fallback error:', err);
      }
    }
    return initialSiteSettings;
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    try {
      const updated = await updateSettingsInFirestore(settings);
      return updated;
    } catch (e) {
      console.error('Firestore settings update error, attempting backend fallback:', e);
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.error('Backend fallback error:', err);
      }
      throw new Error('فشل حفظ الإعدادات في قاعدة البيانات');
    }
  },

  // Properties
  async getProperties(): Promise<Property[]> {
    try {
      return await fetchPropertiesFromFirestore();
    } catch (e) {
      console.error('Failed to fetch properties from Firestore, attempting backend fallback:', e);
      try {
        const res = await fetch(`/api/properties?_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        }
      } catch (err) {
        console.error('Backend fallback error:', err);
      }
    }
    return initialProperties;
  },

  async addProperty(propertyData: Omit<Property, 'id' | 'createdAt'> & { id?: string }): Promise<Property> {
    try {
      const savedProperty = await addPropertyToFirestore(propertyData);
      // Dual-sync to central server
      fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedProperty),
      }).catch((err) => console.warn('Backend sync warning:', err));
      return savedProperty;
    } catch (e) {
      console.error('Error adding property to Firestore:', e);
      throw new Error('فشل إضافة العقار إلى قاعدة بيانات Firebase الحقيقية');
    }
  },

  async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
    try {
      const updated = await updatePropertyInFirestore(id, propertyData);
      // Dual-sync to central server
      fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((err) => console.warn('Backend sync warning:', err));
      return updated;
    } catch (e) {
      console.error('Error updating property in Firestore:', e);
      throw new Error('فشل تعديل العقار في قاعدة بيانات Firebase');
    }
  },

  async deleteProperty(id: string): Promise<boolean> {
    try {
      await deletePropertyFromFirestore(id);
      // Dual-sync to central server
      fetch(`/api/properties/${id}`, { method: 'DELETE' }).catch(() => {});
      return true;
    } catch (e) {
      console.error('Error deleting property in Firestore:', e);
      throw new Error('فشل حذف العقار من قاعدة بيانات Firebase');
    }
  },

  // Contracting Packages
  async getContractingPackages(): Promise<ContractingPackage[]> {
    try {
      return await fetchContractingFromFirestore();
    } catch (e) {
      console.error('Failed to fetch contracting packages from Firestore:', e);
    }
    return initialContractingPackages;
  },

  async updateContractingPackage(id: string, data: Partial<ContractingPackage>): Promise<ContractingPackage> {
    try {
      const updated = await updateContractingInFirestore(id, data);
      fetch(`/api/contracting/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
      return updated;
    } catch (e) {
      console.error('Error updating contracting package:', e);
      throw new Error('فشل تعديل باقة المقاولات');
    }
  },

  // Inquiries
  async getInquiries(): Promise<PropertyInquiry[]> {
    try {
      return await fetchInquiriesFromFirestore();
    } catch (e) {
      console.error('Failed to fetch inquiries from Firestore:', e);
    }
    return initialInquiries;
  },

  async createInquiry(inquiry: Omit<PropertyInquiry, 'id' | 'createdAt' | 'status'>): Promise<PropertyInquiry> {
    try {
      const created = await createInquiryInFirestore(inquiry);
      fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      }).catch(() => {});
      return created;
    } catch (e) {
      console.error('Error creating inquiry in Firestore:', e);
      throw new Error('فشل إرسال الطلب');
    }
  },

  async updateInquiryStatus(id: string, status: 'new' | 'in_progress' | 'completed'): Promise<boolean> {
    try {
      await updateInquiryStatusInFirestore(id, status);
      fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(() => {});
      return true;
    } catch (e) {
      console.error('Error updating inquiry status:', e);
      throw new Error('فشل تحديث حالة الطلب');
    }
  },

  async deleteInquiry(id: string): Promise<boolean> {
    try {
      await deleteInquiryFromFirestore(id);
      fetch(`/api/inquiries/${id}`, { method: 'DELETE' }).catch(() => {});
      return true;
    } catch (e) {
      console.error('Error deleting inquiry:', e);
      throw new Error('فشل حذف الطلب');
    }
  },

  // Reset to original data
  async resetToSeed(): Promise<void> {
    await fetch('/api/reset', { method: 'POST' });
    localStorage.clear();
  },
};


