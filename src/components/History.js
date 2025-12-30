// History Component - Updated with Google Sheets Export
import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Loader2, Camera, Trash2, FileSpreadsheet, Filter } from 'lucide-react';
import { getReports, deleteReport } from '../services/superbaseConfig';
import { exportToGoogleSheetsWithRedirect } from '../services/googleSheetsService';

import { formatDate, formatTime, getScoreColor, getWasteCategoryColor, getWasteIcon } from '../utils/helpers';

const History = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(r => r.type === filter));
    }
  }, [filter, reports]);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReports(50);
      setReports(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load reports. Please try again.');
      setLoading(false);
    }
  };

  const handleExportToSheets = async () => {
    if (reports.length === 0) {
      alert('No reports to export');
      return;
    }

    setExporting(true);
    setExportSuccess(false);
    setError(null);

    try {
     exportToGoogleSheetsWithRedirect(reports);

      
      setExporting(false);
      setExportSuccess(true);
      
      // Show success message
      alert('✅ Google Sheet created successfully!\n\nCheck your Google Drive for the new spreadsheet.');
      
      // Open Google Drive in new tab
      window.open('https://drive.google.com/drive/recent', '_blank');
      
      // Hide success message after 5 seconds
      setTimeout(() => setExportSuccess(false), 5000);

    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export to Google Sheets. Please try again.');
      setExporting(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    setLoading(true);
    try {
      await deleteReport(reportId);
      const updatedReports = reports.filter(r => r.id !== reportId);
      setReports(updatedReports);
      setFilteredReports(filteredReports.filter(r => r.id !== reportId));
      setLoading(false);
    } catch (err) {
      console.error('Error deleting report:', err);
      setError('Failed to delete report');
      setLoading(false);
    }
  };

  const getStats = () => {
    const wasteCount = reports.filter(r => r.type === 'waste').length;
    const streetCount = reports.filter(r => r.type === 'street').length;
    const avgScore = streetCount > 0 
      ? Math.round(reports.filter(r => r.type === 'street').reduce((sum, r) => sum + (r.cleanliness_score || 0), 0) / streetCount)
      : 0;

    return { wasteCount, streetCount, avgScore };
  };

  const stats = getStats();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl shadow-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <HistoryIcon size={32} />
              <h1 className="text-2xl font-bold">Report History</h1>
            </div>
            <p className="text-orange-100">View and export your past reports</p>
          </div>
          <button
            onClick={handleExportToSheets}
            disabled={reports.length === 0 || exporting}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet size={16} />
                Export to Sheets
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {exportSuccess && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <FileSpreadsheet className="text-green-600" size={24} />
          <div>
            <p className="text-green-800 font-semibold">✅ Exported Successfully!</p>
            <p className="text-green-700 text-sm">Check your Google Drive for the spreadsheet</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{reports.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Reports</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.wasteCount}</div>
          <div className="text-sm text-gray-600 mt-1">Waste Items</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.streetCount}</div>
          <div className="text-sm text-gray-600 mt-1">Streets</div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-gray-600" />
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setFilter('waste')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'waste'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Waste ({stats.wasteCount})
            </button>
            <button
              onClick={() => setFilter('street')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'street'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Street ({stats.streetCount})
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-orange-600" size={48} />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredReports.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <HistoryIcon className="mx-auto mb-4 text-gray-400" size={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No reports yet</h3>
          <p className="text-gray-600">Start by analyzing waste or streets!</p>
        </div>
      )}

      {/* Reports List */}
      {!loading && !error && filteredReports.length > 0 && (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`${
                  report.type === 'waste' 
                    ? 'bg-green-100' 
                    : 'bg-blue-100'
                } p-3 rounded-xl`}>
                  {report.type === 'waste' ? (
                    <Trash2 className={report.type === 'waste' ? 'text-green-600' : 'text-blue-600'} size={24} />
                  ) : (
                    <Camera className="text-blue-600" size={24} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {report.type === 'waste' ? 'Waste Classification' : 'Street Analysis'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(report.created_at)} at {formatTime(report.created_at)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Badge */}
                      {report.type === 'waste' && report.category && (
                        <span className={`${getWasteCategoryColor(report.category).bg} ${getWasteCategoryColor(report.category).text} px-3 py-1 rounded-full text-sm font-medium`}>
                          {getWasteIcon(report.category)} {report.category}
                        </span>
                      )}
                      
                      {report.type === 'street' && report.cleanliness_score !== undefined && (
                        <span className={`${getScoreColor(report.cleanliness_score).bg} ${getScoreColor(report.cleanliness_score).text} px-3 py-1 rounded-full text-sm font-bold`}>
                          {report.cleanliness_score}/100
                        </span>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(report.id);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all flex items-center gap-1"
                        title="Delete report"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {report.type === 'waste' && (
                      <>
                        {report.confidence && (
                          <span>Confidence: {report.confidence}%</span>
                        )}
                        {report.recyclable !== undefined && (
                          <span>{report.recyclable ? '♻️ Recyclable' : '❌ Not Recyclable'}</span>
                        )}
                      </>
                    )}
                    {report.type === 'street' && (
                      <>
                        <span>Status: {report.severity}</span>
                        <span>Score: {report.cleanliness_score}/100</span>
                      </>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {selectedReport?.id === report.id && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 space-y-3">
                      {report.image_url && (
                        <img
                          src={report.image_url}
                          alt="Report"
                          className="w-full rounded-xl max-h-64 object-cover"
                        />
                      )}
                      
                      {report.type === 'waste' && (
                        <>
                          {report.items && report.items.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">Items:</p>
                              <div className="flex flex-wrap gap-2">
                                {report.items.map((item, idx) => (
                                  <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {report.disposal_method && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm font-semibold text-blue-900 mb-1">Disposal:</p>
                              <p className="text-sm text-blue-800">{report.disposal_method}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {report.type === 'street' && (
                        <>
                          {report.issues && report.issues.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-sm font-semibold text-red-900 mb-1">Issues:</p>
                              <ul className="text-sm text-red-800 space-y-1">
                                {report.issues.map((issue, idx) => (
                                  <li key={idx}>• {issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;