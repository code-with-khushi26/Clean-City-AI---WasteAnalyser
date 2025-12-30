// Home Page Component
import React from 'react';
import { Trash2, Camera, Map, History, Sparkles } from 'lucide-react';

const HomePage = ({ onNavigate, stats }) => {
  const features = [
    {
      id: 'classifier',
      title: 'Waste Classifier',
      description: 'Identify and classify waste items using AI',
      icon: Trash2,
      gradient: 'from-green-500 to-emerald-600',
      iconColor: 'text-white'
    },
    {
      id: 'street',
      title: 'Street Analyzer',
      description: 'Analyze street cleanliness with AI vision',
      icon: Camera,
      gradient: 'from-green-500 to-emerald-600',
      iconColor: 'text-white'
    },
    {
      id: 'heatmap',
      title: 'Cleanliness Map',
      description: 'View interactive heatmap of reports',
      icon: Map,
      gradient: 'from-green-500 to-emerald-600',
      iconColor: 'text-white'
    },
    {
      id: 'history',
      title: 'Report History',
      description: 'View all past reports and insights',
      icon: History,
      gradient:'from-teal-600 to-green-700',
      iconColor: 'text-white'
    }
  ];

  return (
   <div className="min-h-screen pb-24 bg-gray">
      {/* Header Section */}
      <div className="ai-scan-line"></div>
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-xl p-8 mb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-2xl">
            <Sparkles size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Clean City AI</h1>
            <p className="text-green-100 text-sm">Detect, classify & report waste using AI vision</p>
          </div>
        </div>
        <p className="text-green-50 leading-relaxed">
          Help keep your city clean by reporting waste and monitoring street cleanliness 
          using advanced AI vision technology.
        </p>
      </div>

      {/* Stats Section */}
      {stats && stats.totalReports > 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Cleanliness Impact</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">{stats.totalReports}</div>
              <div className="text-sm text-gray-600 mt-1">Reports Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">{stats.wasteReports}</div>
              <div className="text-sm text-gray-600 mt-1">Waste Items Detected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">{stats.streetReports}</div>
              <div className="text-sm text-gray-600 mt-1">Dirty Streets Flagged</div>
            </div>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Core Features</h2>
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => onNavigate(feature.id)}
              className="w-full bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-2xl shadow-md`}>
                  <Icon className={feature.iconColor} size={32} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 How it works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>📸 Take a photo of waste or street</li>
          <li>🤖 AI analyzes and classifies automatically</li>
          <li>📍 Location is recorded with GPS</li>
          <li>🗺️ View reports on interactive map</li>
          <li>📊 Track cleanliness trends over time</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;