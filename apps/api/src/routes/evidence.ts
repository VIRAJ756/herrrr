import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => {
    const ext = file.fieldname === 'photo' ? '.jpg' : '.webm';
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// POST /api/evidence — receive photo + audio blobs, return token URL
router.post(
  '/',
  upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
  async (req, res) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]>;
      const { lat, lng, timestamp } = req.body;
      const token = crypto.randomUUID();

      await prisma.evidenceRecord.create({
        data: {
          token,
          photoFile: files.photo?.[0]?.filename ?? null,
          audioFile: files.audio?.[0]?.filename ?? null,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          timestamp: timestamp ?? new Date().toISOString(),
        },
      });

      const apiBase = process.env.API_URL ?? 'http://localhost:4000';
      const webBase = process.env.WEB_URL ?? 'http://localhost:3000';

      res.json({
        token,
        evidencePageUrl: `${webBase}/evidence/${token}`,
        photoUrl: files.photo?.[0]
          ? `${apiBase}/uploads/${files.photo[0].filename}` : null,
        audioUrl: files.audio?.[0]
          ? `${apiBase}/uploads/${files.audio[0].filename}` : null,
      });
    } catch (err) {
      console.error('Evidence upload error:', err);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

// GET /api/evidence/:token — fetch evidence metadata + file URLs
router.get('/:token', async (req, res) => {
  try {
    const record = await prisma.evidenceRecord.findUnique({
      where: { token: req.params.token },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });

    const apiBase = process.env.API_URL ?? 'http://localhost:4000';
    res.json({
      photoUrl: record.photoFile
        ? `${apiBase}/uploads/${record.photoFile}` : null,
      audioUrl: record.audioFile
        ? `${apiBase}/uploads/${record.audioFile}` : null,
      lat: record.lat,
      lng: record.lng,
      timestamp: record.timestamp,
    });
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

export default router;
