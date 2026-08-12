import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { Property, SiteSettings, ContractingPackage, PropertyInquiry } from '../types';
import {
  initialProperties,
  initialSiteSettings,
  initialContractingPackages,
  initialInquiries,
} from '../data/initialData';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

export const storage = getStorage(app);

// Collection names
const COLLECTIONS = {
  PROPERTIES: 'properties',
  SETTINGS: 'site_settings',
  CONTRACTING: 'contracting_packages',
  INQUIRIES: 'property_inquiries',
};

// --- Firebase Storage Upload Helper ---
export async function uploadMediaToFirebaseStorage(
  fileData: string,
  customName?: string
): Promise<string> {
  if (!fileData || typeof fileData !== 'string' || !fileData.startsWith('data:')) {
    return fileData; // Already a URL or empty
  }

  try {
    const timeStamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);

    const mimeMatch = fileData.match(/^data:([A-Za-z-+\/]+);base64,/);
    let ext = 'jpg';
    if (mimeMatch) {
      const mime = mimeMatch[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('mp4')) ext = 'mp4';
      else if (mime.includes('webm')) ext = 'webm';
    }

    const fileName = customName || `property_${timeStamp}_${randomStr}.${ext}`;
    const storageRef = ref(storage, `uploads/${fileName}`);

    await uploadString(storageRef, fileData, 'data_url');
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Firebase Storage Upload Success:', downloadURL);
    return downloadURL;
  } catch (err) {
    console.warn('Firebase Storage upload warning, attempting backend server upload:', err);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch (e) {
      console.error('Server fallback upload error:', e);
    }
    return fileData;
  }
}

// Upload array of images
export async function processImagesUpload(images: string[]): Promise<string[]> {
  if (!Array.isArray(images)) return [];
  const uploadPromises = images.map((img) => uploadMediaToFirebaseStorage(img));
  return Promise.all(uploadPromises);
}

// Utility to recursively remove all undefined properties for Firestore compatibility
function sanitizeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// --- Properties Firestore Operations ---
export async function fetchPropertiesFromFirestore(): Promise<Property[]> {
  try {
    const colRef = collection(db, COLLECTIONS.PROPERTIES);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('Firestore properties empty, seeding initial data...');
      await seedInitialDataToFirestore();
      return initialProperties;
    }
    const properties: Property[] = [];
    snapshot.forEach((docSnap) => {
      properties.push({ id: docSnap.id, ...docSnap.data() } as Property);
    });
    // Sort newest first
    return properties.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching properties from Firestore:', error);
    throw error;
  }
}

export async function addPropertyToFirestore(
  propertyData: Omit<Property, 'id' | 'createdAt'> & { id?: string }
): Promise<Property> {
  try {
    const processedImages = await processImagesUpload(propertyData.images || []);
    const newId = propertyData.id || `prop-${Date.now()}`;
    const nowStr = new Date().toISOString().split('T')[0];

    const rawProperty: Property = {
      ...propertyData,
      id: newId,
      code: propertyData.code || `TA-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: nowStr,
      images: processedImages,
      status: propertyData.status || 'available',
    };

    const cleanedProperty = sanitizeFirestoreData(rawProperty);

    const docRef = doc(db, COLLECTIONS.PROPERTIES, newId);
    await setDoc(docRef, cleanedProperty);
    console.log('Property added to Firestore successfully:', newId);
    return cleanedProperty;
  } catch (error) {
    console.error('Error adding property to Firestore:', error);
    throw error;
  }
}

export async function updatePropertyInFirestore(
  id: string,
  propertyData: Partial<Property>
): Promise<Property> {
  try {
    let updatedImages = propertyData.images;
    if (updatedImages && Array.isArray(updatedImages)) {
      updatedImages = await processImagesUpload(updatedImages);
    }

    const docRef = doc(db, COLLECTIONS.PROPERTIES, id);
    const payload: Record<string, any> = { ...propertyData };
    if (updatedImages) payload.images = updatedImages;

    const cleanedPayload = sanitizeFirestoreData(payload);

    await updateDoc(docRef, cleanedPayload);
    const updatedSnap = await getDoc(docRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as Property;
  } catch (error) {
    console.error('Error updating property in Firestore:', error);
    throw error;
  }
}

export async function deletePropertyFromFirestore(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.PROPERTIES, id);
    await deleteDoc(docRef);
    console.log('Property deleted from Firestore:', id);
    return true;
  } catch (error) {
    console.error('Error deleting property from Firestore:', error);
    throw error;
  }
}

// --- Settings Operations ---
export async function fetchSettingsFromFirestore(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'main_settings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...initialSiteSettings, ...docSnap.data() } as SiteSettings;
    } else {
      await setDoc(docRef, initialSiteSettings);
      return initialSiteSettings;
    }
  } catch (error) {
    console.error('Error fetching settings from Firestore:', error);
    return initialSiteSettings;
  }
}

export async function updateSettingsInFirestore(
  settings: Partial<SiteSettings>
): Promise<SiteSettings> {
  try {
    const payload = { ...settings };

    // Process all image fields (heroImageUrl, logoUrl, splashLogoUrl)
    if (payload.heroImageUrl && payload.heroImageUrl.startsWith('data:')) {
      payload.heroImageUrl = await uploadMediaToFirebaseStorage(
        payload.heroImageUrl,
        `hero_${Date.now()}.jpg`
      );
    }

    if (payload.logoUrl && payload.logoUrl.startsWith('data:')) {
      payload.logoUrl = await uploadMediaToFirebaseStorage(
        payload.logoUrl,
        `logo_${Date.now()}.jpg`
      );
    }

    if (payload.splashLogoUrl && payload.splashLogoUrl.startsWith('data:')) {
      payload.splashLogoUrl = await uploadMediaToFirebaseStorage(
        payload.splashLogoUrl,
        `splash_${Date.now()}.jpg`
      );
    }

    const cleanedPayload = sanitizeFirestoreData(payload);

    const docRef = doc(db, COLLECTIONS.SETTINGS, 'main_settings');
    await setDoc(docRef, cleanedPayload, { merge: true });

    // Also sync to backend server database persistently
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanedPayload),
    }).catch((err) => console.warn('Server settings sync warning:', err));

    const updatedSnap = await getDoc(docRef);
    return { ...initialSiteSettings, ...updatedSnap.data() } as SiteSettings;
  } catch (error) {
    console.error('Error updating settings in Firestore, using server API fallback:', error);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.error('Server fallback failed:', e);
    }
    throw error;
  }
}

// --- Contracting Packages ---
export async function fetchContractingFromFirestore(): Promise<ContractingPackage[]> {
  try {
    const colRef = collection(db, COLLECTIONS.CONTRACTING);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      for (const pkg of initialContractingPackages) {
        await setDoc(doc(db, COLLECTIONS.CONTRACTING, pkg.id), sanitizeFirestoreData(pkg));
      }
      return initialContractingPackages;
    }
    const packages: ContractingPackage[] = [];
    snapshot.forEach((d) => packages.push({ id: d.id, ...d.data() } as ContractingPackage));
    return packages;
  } catch (error) {
    console.error('Error fetching contracting packages:', error);
    return initialContractingPackages;
  }
}

export async function updateContractingInFirestore(
  id: string,
  data: Partial<ContractingPackage>
): Promise<ContractingPackage> {
  try {
    const docRef = doc(db, COLLECTIONS.CONTRACTING, id);
    await updateDoc(docRef, sanitizeFirestoreData(data));
    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() } as ContractingPackage;
  } catch (error) {
    console.error('Error updating contracting package:', error);
    throw error;
  }
}

// --- Inquiries ---
export async function fetchInquiriesFromFirestore(): Promise<PropertyInquiry[]> {
  try {
    const colRef = collection(db, COLLECTIONS.INQUIRIES);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return initialInquiries;
    }
    const inquiries: PropertyInquiry[] = [];
    snapshot.forEach((d) => inquiries.push({ id: d.id, ...d.data() } as PropertyInquiry));
    return inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return initialInquiries;
  }
}

export async function createInquiryInFirestore(
  inquiry: Omit<PropertyInquiry, 'id' | 'createdAt' | 'status'>
): Promise<PropertyInquiry> {
  try {
    const id = `inq-${Date.now()}`;
    const newInquiry: PropertyInquiry = {
      ...inquiry,
      id,
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    await setDoc(doc(db, COLLECTIONS.INQUIRIES, id), sanitizeFirestoreData(newInquiry));
    return newInquiry;
  } catch (error) {
    console.error('Error creating inquiry in Firestore:', error);
    throw error;
  }
}

export async function updateInquiryStatusInFirestore(
  id: string,
  status: 'new' | 'in_progress' | 'completed'
): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.INQUIRIES, id);
    await updateDoc(docRef, { status });
    return true;
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
}

export async function deleteInquiryFromFirestore(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.INQUIRIES, id));
    return true;
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    throw error;
  }
}

// --- Initial Seed Helper ---
export async function seedInitialDataToFirestore() {
  try {
    console.log('Seeding initial properties to Firestore...');
    for (const prop of initialProperties) {
      await setDoc(doc(db, COLLECTIONS.PROPERTIES, prop.id), sanitizeFirestoreData(prop));
    }
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'main_settings'), sanitizeFirestoreData(initialSiteSettings));
    for (const pkg of initialContractingPackages) {
      await setDoc(doc(db, COLLECTIONS.CONTRACTING, pkg.id), sanitizeFirestoreData(pkg));
    }
    console.log('Initial data seeded successfully to Firestore!');
  } catch (error) {
    console.error('Error seeding initial data to Firestore:', error);
  }
}
