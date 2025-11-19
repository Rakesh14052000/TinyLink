import React, { useEffect, useState } from 'react';
import LinkRow from '../components/LinkRow';
import { Plus, X, LinkIcon } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/links`);
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchLinks();
    const interval = setInterval(fetchLinks, 1000);
    return () => clearInterval(interval);
  }, []);

  const createLink = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), code: code.trim() || undefined }),
      });

      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || 'Failed to create link');
      }

      setUrl('');
      setCode('');
      fetchLinks();
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (c) => {
    if (!confirm('Delete this link permanently?')) return;
    try {
      await fetch(`${API_BASE}/api/links/${c}`, { method: 'DELETE' });
      fetchLinks();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-12">
          TinyLink <span className="text-pink-600">Dashboard</span>
        </h1>

        {/* Create Link Card */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 mb-12 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Plus className="w-7 h-7 text-purple-600" />
            Create New Short Link
          </h2>

          <form onSubmit={createLink} className="space-y-5">
            <div className="grid md:grid-cols-3 gap-5">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-long-url.com/very/long/path"
                className="md:col-span-2 p-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow shadow-sm"
              />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Custom code (optional)"
                className="p-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-shadow shadow-sm"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-5 py-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl shadow-lg transform hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Plus className="w-6 h-6" />
                {loading ? 'Creating...' : 'Create Link'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  setCode('');
                  setError('');
                }}
                className="flex items-center gap-3 px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg rounded-2xl transition transform hover:scale-105"
              >
                <X className="w-6 h-6" />
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Links Table */}
        <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/30">
          <div className="p-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <LinkIcon className="w-8 h-8 text-purple-600" />
              Your Links ({links.length})
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full ">
              <thead className="bg-black/5">
                <tr className="text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-5">Short Link</th>
                  <th className="p-5">Target URL</th>
                  <th className="p-5 text-center">Clicks</th>
                  <th className="p-5 text-center">Last Clicked</th>
                  <th className="p-5 text-center">Created</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {links.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-500 text-lg">
                      No links yet. Create your first one above!
                    </td>
                  </tr>
                ) : (
                  links.map((link) => (
                    <LinkRow key={link.code} link={link} onDelete={() => handleDelete(link.code)} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}