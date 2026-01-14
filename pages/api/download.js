// pages/api/download.js
import axios from 'axios';

// Fungsi delay pengganti baileys (agar tidak perlu install library berat)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ytdown(url, type = 'video') {
  try {
    const { data } = await axios.post(
      'https://ytdown.to/proxy.php',
      new URLSearchParams({ url }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const api = data.api;
    if (!api) throw new Error('Gagal mengambil data dari server.');

    const media = api.mediaItems.find(
      (m) => m.type.toLowerCase() === type.toLowerCase()
    );

    if (!media) throw new Error('Tipe media tidak ditemukan.');

    let attempts = 0;
    // Batasi loop agar tidak timeout di Vercel (max 10-50 detik tergantung plan)
    while (attempts < 20) {
      const { data: res } = await axios.get(media.mediaUrl);

      if (res.error === 'METADATA_NOT_FOUND') throw new Error('Metadata not found');

      if (res.percent === 'Completed' && res.fileUrl !== 'In Processing...') {
        return {
          info: {
            title: api.title,
            desc: api.description,
            thumbnail: api.imagePreviewUrl,
            views: api.mediaStats?.viewsCount,
            uploader: api.userInfo?.name,
            quality: media.mediaQuality,
            duration: media.mediaDuration,
            extension: media.mediaExtension,
            size: media.mediaFileSize,
          },
          download: res.fileUrl,
        };
      }

      // Tunggu 2 detik sebelum cek lagi
      await delay(2000);
      attempts++;
    }
    throw new Error('Timeout: Proses konversi terlalu lama.');
    
  } catch (error) {
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, type } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const result = await ytdown(url, type || 'video');
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    });
  }
}
