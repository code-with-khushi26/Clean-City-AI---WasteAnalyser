// Street Analyzer Component
import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { analyzeStreet } from '../services/geminiService';
import { saveReport, uploadImage } from '../services/superbaseConfig';
import { getCurrentLocation } from '../services/locationService';
import { validateImageFile, getScoreColor } from '../utils/helpers';

const StreetAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setImageFile(file);

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get current location
      const location = await getCurrentLocation();

      // Analyze street using Gemini
      const analysis = await analyzeStreet(selectedImage);

      if (!analysis.success) {
        throw new Error(analysis.error || 'Failed to analyze street');
      }

      // Upload image to superbase Storage
      const imageUrl = await uploadImage(imageFile, 'street');
const reportData = {
  type: 'street',
  cleanliness_score: analysis.data.cleanlinessScore || analysis.data.cleanliness_score, 
  issues: analysis.data.issues,
  recommendations: analysis.data.recommendations,
  severity: analysis.data.severity,
  image_url: imageUrl,
  location: location,
  
};


      // Save to Firestore
      await saveReport(reportData);

      setResult(analysis.data);
      setLoading(false);
    } catch (err) {
      console.error('Error analyzing street:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const scoreColor = result ? getScoreColor(result.cleanliness_score) : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Camera size={32} />
          <h1 className="text-2xl font-bold">Street Analyzer</h1>
        </div>
        <p className="text-green-100">Analyze street cleanliness with AI vision</p>
      </div>

      {/* Upload Section */}
      {!selectedImage && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="street-image-input"
          />
          
          <label
            htmlFor="street-image-input"
            className="block cursor-pointer"
          >
            <div className="border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-green-500 hover:bg-green-50 transition-all">
              <Upload className="mx-auto mb-4 text-gray-400" size={64} />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Click to upload street image
              </p>
              <p className="text-sm text-gray-500">
                or drag and drop (JPEG, PNG, WebP • Max 10MB)
              </p>
            </div>
          </label>

          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <h4 className="font-bold text-green-900 mb-2">📸 Tips for best results:</h4>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• Take clear photos of streets, sidewalks, or public areas</li>
              <li>• Ensure good lighting and focus</li>
              <li>• Capture wider views for better analysis</li>
              <li>• Include visible litter or cleanliness indicators</li>
            </ul>
          </div>
        </div>
      )}

      {/* Preview and Analysis */}
      {selectedImage && (
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-4">Selected Image</h3>
            <img
              src={selectedImage}
              alt="Selected street"
              className="w-full rounded-xl object-cover max-h-96"
            />
            
            <div className="flex gap-3 mt-4">
              {!result && (
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      Analyze Street
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
                <MapPin className="text-green-600" size={32} />
                <h3 className="text-xl font-bold text-gray-800">Analysis Results</h3>
              </div>

              {/* Cleanliness Score */}
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-3">
                  Cleanliness Score
                </label>
                <div className={`${scoreColor.bg} ${scoreColor.border} border-2 rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className={`text-5xl font-bold ${scoreColor.text}`}>
                        {result.cleanliness_score}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">out of 100</div>
                    </div>
                    <div className={`${scoreColor.bg} px-4 py-2 rounded-full`}>
                      <span className={`text-lg font-bold ${scoreColor.text}`}>
                        {result.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000`}
                      style={{
                        width: `${result.cleanliness_score}%`,
                        backgroundColor: scoreColor.hex
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Litter Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                  <div className="text-sm font-semibold text-orange-600 mb-1">
                    Litter Count
                  </div>
                  <div className="text-3xl font-bold text-orange-700">
                    {result.litter_count}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">items detected</div>
                </div>
                
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <div className="text-sm font-semibold text-purple-600 mb-1">
                    Litter Types
                  </div>
                  <div className="text-3xl font-bold text-purple-700">
                    {result.litter_types ? result.litter_types.length : 0}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">categories</div>
                </div>
              </div>

              {/* Litter Types */}
              {result.litter_types && result.litter_types.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-2">
                    Detected Litter Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {result.litter_types.map((type, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium border border-orange-300"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {result.issues && result.issues.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-2">
                    Identified Issues
                  </label>
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 space-y-2">
                    {result.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-red-900 text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-2">
                    Recommendations
                  </label>
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-green-900 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-800 font-medium">
                  ✅ Report saved successfully and added to map!
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreetAnalyzer;