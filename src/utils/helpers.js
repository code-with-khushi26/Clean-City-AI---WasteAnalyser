// Helper utility functions

/**
 * Format timestamp to readable date
 * @param {string} timestamp - ISO timestamp
 * @returns {string} - Formatted date string
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

/**
 * Format time from timestamp
 * @param {string} timestamp - ISO timestamp
 * @returns {string} - Formatted time string
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get color based on cleanliness score
 * @param {number} score - Cleanliness score (0-100)
 * @returns {Object} - Color object with text and bg classes
 */
export const getScoreColor = (score) => {
  if (score >= 80) {
    return {
      text: 'text-green-600',
      bg: 'bg-green-100',
      border: 'border-green-500',
      hex: '#10b981'
    };
  } else if (score >= 60) {
    return {
      text: 'text-blue-600',
      bg: 'bg-blue-100',
      border: 'border-blue-500',
      hex: '#3b82f6'
    };
  } else if (score >= 40) {
    return {
      text: 'text-yellow-600',
      bg: 'bg-yellow-100',
      border: 'border-yellow-500',
      hex: '#f59e0b'
    };
  } else if (score >= 20) {
    return {
      text: 'text-orange-600',
      bg: 'bg-orange-100',
      border: 'border-orange-500',
      hex: '#f97316'
    };
  } else {
    return {
      text: 'text-red-600',
      bg: 'bg-red-100',
      border: 'border-red-500',
      hex: '#ef4444'
    };
  }
};

/**
 * Get waste category color
 * @param {string} category - Waste category
 * @returns {Object} - Color object
 */
export const getWasteCategoryColor = (category) => {
  const colors = {
    'Plastic': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' },
    'Paper': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-500' },
    'Organic': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500' },
    'Metal': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500' },
    'Glass': { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-500' },
    'E-Waste': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500' },
    'Hazardous': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500' },
    'Mixed': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-500' }
  };
  
  return colors[category] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500' };
};

/**
 * Get waste category icon emoji
 * @param {string} category - Waste category
 * @returns {string} - Emoji icon
 */
export const getWasteIcon = (category) => {
  const icons = {
    'Plastic': '🥤',
    'Paper': '📄',
    'Organic': '🍎',
    'Metal': '🔧',
    'Glass': '🍾',
    'E-Waste': '💻',
    'Hazardous': '☢️',
    'Mixed': '🗑️'
  };
  
  return icons[category] || '🗑️';
};

/**
 * Compress image before upload
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * Download data as JSON file
 * @param {Object} data - Data to download
 * @param {string} filename - File name
 */
export const downloadJSON = (data, filename = 'reports.json') => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  return { valid: true, error: null };
};