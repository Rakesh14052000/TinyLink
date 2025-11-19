import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Copy,
  Check,
  ExternalLink,
  MousePointer,
  MousePointerClick,
  Calendar,
  Link as LinkIcon,
  FileText,
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';


const StatCard = ({ label, value, icon, color, bgColor }) => (
  <div
    className={`flex items-center p-6 rounded-3xl shadow-xl backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${bgColor}`}
  >
    <div className={`text-4xl mr-5 ${color} drop-shadow-lg`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  </div>
);

export default function Stats() {
  const { code } = useParams();
  const [link, setLink] = useState(null);
  const [err, setErr] = useState('');
  const [copiedShort, setCopiedShort] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);

  const shortUrl = `${BASE_URL}/${code}`;

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'short') {
        setCopiedShort(true);
        setTimeout(() => setCopiedShort(false), 2000);
      } else {
        setCopiedTarget(true);
        setTimeout(() => setCopiedTarget(false), 2000);
      }
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const fetchLink = async () => {
    try {
      const res = await fetch(`/api/links/${code}`);
      if (!res.ok) {
        setErr('Link not found');
        return;
      }
      const data = await res.json();
      setLink(data);
    } catch {
      setErr('Failed to fetch link');
    }
  };

useEffect(() => {
    fetchLink();
    const interval = setInterval(fetchLink, 1000);
    return () => clearInterval(interval);
  }, [code]);
  if (err)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600 mb-4">Oops!</p>
          <p className="text-lg text-gray-700">{err}</p>
        </div>
      </div>
    );

  if (!link)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-3xl font-light text-purple-700">Loading stats...</div>
      </div>
    );

  console.log(link);


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 py-12 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-12">
          Link Statistics
        </h1>

        {/* Short URL Card */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-400 p-8 mb-8 text-white transform transition-transform duration-300 hover:scale-[1.03]">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-md"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-lg opacity-90 mb-2 flex items-center gap-2">
                <LinkIcon className="w-6 h-6" />
                Short URL
              </p>
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="text-2xl font-bold hover:underline flex items-center gap-2 break-all"
              >
                {shortUrl}
                <ExternalLink className="w-6 h-6" />
              </a>
            </div>
            <button
              onClick={() => handleCopy(shortUrl, 'short')}
              className="flex items-center gap-3 px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {copiedShort ? (
                <>
                  <Check className="w-6 h-6" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-6 h-6" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 text-[12rem] opacity-10">🔗</div>
        </div>

        {/* Target URL Card */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-r from-green-400 to-emerald-500 p-8 mb-10 text-white transform transition-transform duration-300 hover:scale-[1.03]">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-md"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-lg opacity-90 mb-2 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Target URL
              </p>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-2xl font-bold hover:underline flex items-center gap-2 break-all"
              >
                {link.url}
                <ExternalLink className="w-6 h-6" />
              </a>
            </div>
            <button
              onClick={() => handleCopy(link.url, 'target')}
              className="flex items-center gap-3 px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {copiedTarget ? (
                <>
                  <Check className="w-6 h-6" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-6 h-6" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 text-[12rem] opacity-10">📄</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            label="Total Clicks"
            value={link.clicks.toLocaleString()}
            icon={<MousePointerClick className="w-10 h-10" />}
            color="text-purple-600"
            bgColor="bg-purple-50/80"
          />

          <StatCard
            label="Last Clicked"
            value={
              link.lastclicked
                ? new Date(link.lastclicked).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                : 'Never'
            }
            icon={<MousePointer className="w-10 h-10 text-green-600" />}
            color="text-green-600"
            bgColor="bg-green-50/80"
          />

          <StatCard
            label="Created On"
            value={new Date(link.createdat).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            icon={<Calendar className="w-10 h-10 text-blue-600" />}
            color="text-blue-600"
            bgColor="bg-blue-50/80"
          />

          <StatCard
            label="Status"
            value="Active"
            icon={<Check className="w-10 h-10 text-emerald-600" />}
            color="text-emerald-600"
            bgColor="bg-emerald-50/80"
          />
        </div>

        {/* Back Button */}
        <div className="text-center mt-16">
          <Link
            to="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 text-white font-bold text-lg rounded-3xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
