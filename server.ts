import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialProperties, initialSiteSettings, initialContractingPackages, initialInquiries } from './src/data/initialData.js';
import { Property, SiteSettings, ContractingPackage, PropertyInquiry } from './src/types.js';

const PORT = 3000;

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface DatabaseSchema {
  properties: Property[];
  settings: SiteSettings;
  contracting: ContractingPackage[];
  inquiries: PropertyInquiry[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        properties: Array.isArray(parsed.properties) ? parsed.properties : [...initialProperties],
        settings: parsed.settings ? { ...initialSiteSettings, ...parsed.settings } : { ...initialSiteSettings },
        contracting: Array.isArray(parsed.contracting) ? parsed.contracting : [...initialContractingPackages],
        inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [...initialInquiries],
      };
    }
  } catch (err) {
    console.error('Error reading database file, resetting to initial seed:', err);
  }
  const initialData: DatabaseSchema = {
    properties: [...initialProperties],
    settings: { ...initialSiteSettings },
    contracting: [...initialContractingPackages],
    inquiries: [...initialInquiries],
  };
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Convert base64 data URL to permanent disk file
function saveBase64File(dataUrl: string): string {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return dataUrl;
  }
  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return dataUrl;

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'jpg';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('mp4')) ext = 'mp4';
    else if (mimeType.includes('webm')) ext = 'webm';

    const fileName = `media_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (err) {
    console.error('Error saving base64 file:', err);
    return dataUrl;
  }
}

// Sanitize images/videos inside objects
function processMediaUploads<T>(obj: T): T {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return saveBase64File(obj) as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => processMediaUploads(item)) as any;
  }
  if (typeof obj === 'object') {
    const copy = { ...obj } as any;
    for (const key in copy) {
      if (typeof copy[key] === 'string' && copy[key].startsWith('data:')) {
        copy[key] = saveBase64File(copy[key]);
      } else if (Array.isArray(copy[key])) {
        copy[key] = copy[key].map((item: any) =>
          typeof item === 'string' && item.startsWith('data:') ? saveBase64File(item) : item
        );
      }
    }
    return copy;
  }
  return obj;
}

let db = loadDatabase();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Serve persistent uploads directory
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Disable caching for API responses
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Upload endpoint
  app.post('/api/upload', (req, res) => {
    try {
      const { fileData } = req.body;
      if (!fileData) {
        return res.status(400).json({ error: 'No file data provided' });
      }
      const fileUrl = saveBase64File(fileData);
      res.json({ url: fileUrl, success: true });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // Get settings
  app.get('/api/settings', (req, res) => {
    res.json(db.settings);
  });

  // Update settings
  app.put('/api/settings', (req, res) => {
    const sanitized = processMediaUploads(req.body);
    db.settings = { ...db.settings, ...sanitized };
    saveDatabase(db);
    res.json(db.settings);
  });

  // Get properties
  app.get('/api/properties', (req, res) => {
    res.json(db.properties);
  });

  // Add property
  app.post('/api/properties', (req, res) => {
    const sanitized = processMediaUploads(req.body);
    const newProp: Property = {
      ...sanitized,
      id: sanitized.id || `prop-${Date.now()}`,
      code: sanitized.code || `TA-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: sanitized.status || 'available',
    };
    db.properties.unshift(newProp);
    saveDatabase(db);
    res.status(201).json(newProp);
  });

  // Update property
  app.put('/api/properties/:id', (req, res) => {
    const { id } = req.params;
    const index = db.properties.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Property not found' });
    }
    const sanitized = processMediaUploads(req.body);
    db.properties[index] = { ...db.properties[index], ...sanitized };
    saveDatabase(db);
    res.json(db.properties[index]);
  });

  // Delete property
  app.delete('/api/properties/:id', (req, res) => {
    const { id } = req.params;
    db.properties = db.properties.filter((p) => p.id !== id);
    saveDatabase(db);
    res.json({ success: true, id });
  });

  // Get contracting packages
  app.get('/api/contracting', (req, res) => {
    res.json(db.contracting);
  });

  // Update contracting package
  app.put('/api/contracting/:id', (req, res) => {
    const { id } = req.params;
    const index = db.contracting.findIndex((c) => c.id === id);
    if (index !== -1) {
      const sanitized = processMediaUploads(req.body);
      db.contracting[index] = { ...db.contracting[index], ...sanitized };
      saveDatabase(db);
      return res.json(db.contracting[index]);
    }
    res.status(404).json({ error: 'Package not found' });
  });

  // Get inquiries
  app.get('/api/inquiries', (req, res) => {
    res.json(db.inquiries);
  });

  // Add new inquiry
  app.post('/api/inquiries', (req, res) => {
    const sanitized = processMediaUploads(req.body);
    const newInquiry: PropertyInquiry = {
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
      ...sanitized,
    };
    db.inquiries.unshift(newInquiry);
    saveDatabase(db);
    res.status(201).json(newInquiry);
  });

  // Update inquiry status
  app.patch('/api/inquiries/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const inq = db.inquiries.find((i) => i.id === id);
    if (inq) {
      inq.status = status;
      saveDatabase(db);
      return res.json(inq);
    }
    res.status(404).json({ error: 'Inquiry not found' });
  });

  // Delete inquiry
  app.delete('/api/inquiries/:id', (req, res) => {
    const { id } = req.params;
    db.inquiries = db.inquiries.filter((i) => i.id !== id);
    saveDatabase(db);
    res.json({ success: true, id });
  });

  // Reset to original seed data
  app.post('/api/reset', (req, res) => {
    db = {
      properties: [...initialProperties],
      settings: { ...initialSiteSettings },
      contracting: [...initialContractingPackages],
      inquiries: [...initialInquiries],
    };
    saveDatabase(db);
    res.json({ message: 'Data reset to initial state successfully' });
  });

  // Export full JSON backup
  app.get('/api/export', (req, res) => {
    res.json({
      settings: db.settings,
      properties: db.properties,
      contracting: db.contracting,
      inquiries: db.inquiries,
      exportedAt: new Date().toISOString(),
    });
  });

  // Import JSON backup
  app.post('/api/import', (req, res) => {
    const { settings, properties, contracting, inquiries } = req.body;
    if (settings) db.settings = settings;
    if (Array.isArray(properties)) db.properties = properties;
    if (Array.isArray(contracting)) db.contracting = contracting;
    if (Array.isArray(inquiries)) db.inquiries = inquiries;
    saveDatabase(db);
    res.json({ success: true, message: 'Data imported successfully' });
  });

  // Vite middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

