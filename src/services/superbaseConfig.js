// Supabase Configuration and Initialization
import { createClient } from '@supabase/supabase-js';
import { auth } from './firebaseAuth';
// Supabase configuration from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Save a report to Supabase
 * @param {Object} reportData - The report data to save
 * @returns {Promise<string>} - The document ID
 */
export const saveReport = async (reportData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          ...reportData,
          user_id: user.uid,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;

    console.log("Report saved with ID:", data.id);
    return data.id;
  } catch (error) {
    console.error("Error saving report:", error);
    throw error;
  }
};


/**
 * Upload image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder name (waste or street)
 * @returns {Promise<string>} - The public URL
 */
export const uploadImage = async (file, folder = 'images') => {
  try {
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}_${file.name}`;

    // Upload file
    const { error } = await supabase.storage
      .from('waste-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('waste-images')
      .getPublicUrl(fileName);

    console.log('Image uploaded:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Get all reports from Supabase
 * @param {number} limitCount - Maximum number of reports to fetch
 * @returns {Promise<Array>} - Array of reports
 */
export const getReports = async (limitCount = 50) => {
  try {
     const user = auth.currentUser;

  if (!user) {
    throw new Error('Not authenticated');
  }
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.uid) 
    .order('created_at', { ascending: false })
    .limit(limitCount);

    if (error) throw error;

    console.log('Fetched reports:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

/**
 * Get reports for heatmap (with location data)
 * @returns {Promise<Array>} - Array of reports with location
 */
export const getHeatmapData = async () => {
  try {
    const reports = await getReports(100);

    // Filter reports that have location data
    const heatmapData = reports
      .filter(report => report.location && report.location.lat && report.location.lng)
      .map(report => ({
        id: report.id,
        lat: report.location.lat,
        lng: report.location.lng,
        score: report.cleanliness_score || 50,
        type: report.type,
        timestamp: report.created_at
      }));

    return heatmapData;
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    throw error;
  }
};

/**
 * Delete a report (optional - for admin features)
 * @param {string} id - Report ID
 * @returns {Promise<void>}
 */
export const deleteReport = async (id) => {
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('Report deleted:', id);
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

/**
 * Get reports by type
 * @param {string} type - 'waste' or 'street'
 * @param {number} limitCount - Maximum number of reports
 * @returns {Promise<Array>} - Filtered reports
 */
export const getReportsByType = async (type, limitCount = 50) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(limitCount);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching reports by type:', error);
    throw error;
  }
};

/**
 * Get statistics
 * @returns {Promise<Object>} - Stats object
 */
export const getStats = async () => {
  try {
    const reports = await getReports(1000);

    const wasteReports = reports.filter(r => r.type === 'waste').length;
    const streetReports = reports.filter(r => r.type === 'street').length;
    
    const streetScores = reports
      .filter(r => r.type === 'street' && r.cleanliness_score)
      .map(r => r.cleanliness_score);
    
    const avgScore = streetScores.length > 0
      ? Math.round(streetScores.reduce((a, b) => a + b, 0) / streetScores.length)
      : 0;

    return {
      totalReports: reports.length,
      wasteReports,
      streetReports,
      avgScore
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export default supabase;