// pages/index.js
import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('video');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setData(result.result);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mengunduh.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>RISO TUBE // DOWN</title>
        <meta name="description" content="Brutalist YouTube Downloader" />
      </Head>

      <div className="header-box">
        <h1>Riso Tube<br/>Downloader</h1>
        <p>RAW . FAST . NO ADS</p>
      </div>

      <form className="input-group" onSubmit={handleDownload}>
        <label>PASTE LINK HERE:</label>
        <input 
          type="text" 
          placeholder="https://youtube.com/watch?v=..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        
        <label>FORMAT:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="video">VIDEO (MP4)</option>
          <option value="audio">AUDIO (MP3)</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? <span className="loader"></span> : 'PROCESS DATA'}
        </button>
      </form>

      {error && (
        <div className="error-msg">
          ERROR: {error}
        </div>
      )}

      {data && (
        <div className="result-card">
          <div className="result-header">
            <div className="thumb-frame">
              {/* Gunakan proxy gambar jika terjadi isu CORS, tapi biasanya langsung bisa */}
              <img src={data.info.thumbnail} alt="Thumbnail" />
            </div>
            <div className="info">
              <h2>{data.info.title}</h2>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>By {data.info.uploader}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <span className="tag">{data.info.quality}</span>
                <span className="tag">{data.info.extension}</span>
                <span className="tag">{data.info.size}</span>
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                Views: {parseInt(data.info.views).toLocaleString()}
              </p>
            </div>
          </div>
          
          <a href={data.download} className="download-btn" target="_blank" rel="noopener noreferrer">
            DOWNLOAD FILE NOW
          </a>
        </div>
      )}
    </div>
  );
            }
