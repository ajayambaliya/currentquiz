'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!fromDate || !toDate) {
      alert('Please select both dates');
      return;
    }

    setLoading(true);
    try {
      // First, preview the print page
      const printUrl = `/generate/${fromDate}/${toDate}`;
      window.open(printUrl, '_blank');

      // Optional: Auto-generate PDF
      // Uncomment below to auto-download PDF
      // const response = await fetch(`/api/generate-pdf?from=${fromDate}&to=${toDate}`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `CurrentAdda_Quiz_${fromDate}_${toDate}.pdf`;
      // a.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-orange-600 mb-4">
              📄 CurrentAdda PDF Generator
            </h1>
            <p className="text-gray-600 text-lg">
              Generate beautiful PDFs of quiz questions with promotional content
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-100">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Select Date Range
              </h2>
              <p className="text-gray-500">
                Choose the date range for quiz questions
              </p>
            </div>

            {/* Date Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !fromDate || !toDate}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  '🚀 Generate PDF Preview'
                )}
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-800">
                <strong>📌 Note:</strong> The PDF will include:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                <li>• Cover page with branding</li>
                <li>• All questions from selected date range</li>
                <li>• Questions organized by category</li>
                <li>• Promotional content for CurrentAdda</li>
                <li>• Call-to-action pages</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500">
            <p>Created for <strong className="text-orange-600">CurrentAdda</strong></p>
            <p className="text-sm mt-2">currentadda.vercel.app | t.me/currentadda</p>
          </div>
        </div>
      </div>
    </div>
  );
}
