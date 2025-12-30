// Waste Classifier Component
import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { analyzeWaste } from '../services/geminiService';
import { saveReport, uploadImage } from '../services/superbaseConfig';
import { getCurrentLocation } from '../services/locationService';
import { validateImageFile, getWasteCategoryColor, getWasteIcon } from '../utils/helpers';

const WasteClassifier = () => {
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
      const location = await Promise.race([
  getCurrentLocation(),
  new Promise(resolve =>
    setTimeout(() => resolve(null), 5000) // ⏱ 5 sec fallback
  )
]);


     const classification = await analyzeWaste(selectedImage);

      if (!classification.success) {
        throw new Error(classification.error || 'Failed to classify waste');
      }

      
      const imageUrl = await uploadImage(imageFile, 'waste');

      // Prepare report data
      const reportData = {
        type: 'waste',
        category: classification.data.category,
       confidence: Math.round(classification.data.confidence * 100),
        items: classification.data.items,
        recyclable: classification.data.recyclable,
       disposal_method: classification.data.disposal_method || "Follow local waste guidelines",
environmental_impact: classification.data.environmental_impact || "Impact varies by disposal method",

        image_url: imageUrl,
        location: location,
        
      };

      // Save to Firestore
      await saveReport(reportData);

      setResult(classification.data);
      setLoading(false);
    } catch (err) {
      console.error('Error analyzing waste:', err);
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

  const categoryColor = result ? getWasteCategoryColor(result.category) : null;
  const categoryIcon = result ? getWasteIcon(result.category) : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Trash2 size={32} />
          <h1 className="text-2xl font-bold">Waste Classifier</h1>
        </div>
        <p className="text-green-100">Upload a photo to identify and classify waste</p>
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
            id="waste-image-input"
          />
          
          <label
            htmlFor="waste-image-input"
            className="block cursor-pointer"
          >
            <div className="border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-green-500 hover:bg-green-50 transition-all">
              <Upload className="mx-auto mb-4 text-gray-400" size={64} />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Click to upload waste image
              </p>
              <p className="text-sm text-gray-500">
                or drag and drop (JPEG, PNG, WebP • Max 10MB)
              </p>
            </div>
          </label>

          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
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
              alt="Selected waste"
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
                      Analyze Image
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
                <CheckCircle className="text-green-600" size={32} />
                <h3 className="text-xl font-bold text-gray-800">Classification Result</h3>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">
                  Waste Category
                </label>
                <div className={`${categoryColor.bg} ${categoryColor.border} border-2 rounded-xl p-4 flex items-center gap-3`}>
                  <span className="text-4xl">{categoryIcon}</span>
                  <div>
                    <div className={`text-2xl font-bold ${categoryColor.text}`}>
                      {result.category}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Confidence: {result.confidence}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Detected */}
              {result.items && result.items.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-2">
                    Items Detected
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {result.items.map((item, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recyclable */}
              <div className={`${result.recyclable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border-2 rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.recyclable ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <XCircle className="text-gray-600" size={20} />
                  )}
                  <span className={`font-bold ${result.recyclable ? 'text-green-700' : 'text-gray-700'}`}>
                    {result.recyclable ? 'Recyclable ♻️' : 'Not Recyclable'}
                  </span>
                </div>
              </div>

              {/* Disposal Method */}
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">
                  Disposal Instructions
                </label>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-blue-900">{result.disposal_method}</p>
                </div>
              </div>

              {/* Environmental Impact */}
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">
                  Environmental Impact
                </label>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <p className="text-purple-900">{result.environmental_impact}</p>
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-800 font-medium">
                  ✅ Report saved successfully!
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WasteClassifier;