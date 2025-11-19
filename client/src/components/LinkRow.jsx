import { useState } from 'react';
import { Copy, Check, Trash2, BarChart3 } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const FRONTEND_BASE = import.meta.env.VITE_FRONTEND_BASE || 'https://tinylink-u0zg.onrender.com';

export default function LinkRow({ link, onDelete }) {
  const [copied, setCopied] = useState(false);

  const shortUrl = `${FRONTEND_BASE}/${link.code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <tr className="hover:bg-purple-50/50 transition-colors">
      <td className="p-5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-2"
          >
            {link.code}
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </td>

      <td className="p-5 text-gray-700 max-w-md">
        <p className="truncate" title={link.url}>
          {link.url}
        </p>
      </td>

      <td className="p-5 text-center font-bold text-gray-800">{link.clicks || 0}</td>

      <td className="p-5 text-center text-gray-600 text-sm">{formatDate(link.lastClicked)}</td>

      <td className="p-5 text-center text-gray-500 text-sm">{formatDate(link.createdAt)}</td>

      <td className="p-5">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition transform hover:scale-110"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <RouterLink
            to={`/code/${link.code}`}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-md transition transform hover:scale-105 flex items-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Stats
          </RouterLink>
        </div>
      </td>
    </tr>
  );
}