import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY
});

/* ---------------- helpers ---------------- */

const cleanJson = (text) =>
  text.replace(/```json|```/g, "").trim();

const withTimeout = (promise, ms = 20000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini request timeout")), ms)
    )
  ]);

const getBase64 = (img) =>
  img.includes(",") ? img.split(",")[1] : img;

/* =========================================
   WASTE CLASSIFIER
   ========================================= */
export const analyzeWaste = async (imageBase64) => {
  try {
    const prompt = `
Analyze the waste in this image and classify it.

Return ONLY valid JSON in this format:
{
  "category": "Plastic",
  "confidence": 95,
  "items": ["plastic bottle", "bottle cap"],
  "recyclable": true,
  "disposal_method": "Rinse the bottle thoroughly, remove the cap, and place both in the recycling bin. Check local guidelines for plastic type acceptance.",
  "environmental_impact": "Plastic bottles can take up to 450 years to decompose in landfills. When not recycled, they break down into microplastics that pollute waterways and harm marine life."
}

Rules:
- category must be one of: Plastic, Paper, Metal, Glass, Organic, Electronic, Hazardous, Other
- confidence is a number from 0-100
- items is an array of detected waste items
- recyclable is true or false
- disposal_method must give clear, actionable disposal instructions
- environmental_impact must explain what happens if disposed incorrectly

Return ONLY the JSON, nothing else.
`;

    const response = await withTimeout(
      client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: getBase64(imageBase64),
                  mimeType: "image/jpeg"
                }
              }
            ]
          }
        ]
      })
    );

    const text = response.text;
    const data = JSON.parse(cleanJson(text));

    return { 
      success: true, 
      data: {
        category: data.category || "Unknown",
        confidence: data.confidence || 0,
        items: data.items || [],
        recyclable: data.recyclable || false,
        disposal_method: data.disposal_method || "Please consult local waste management guidelines.",
        environmental_impact: data.environmental_impact || "Improper disposal can harm the environment."
      }
    };

  } catch (error) {
    console.error("Waste analysis error:", error);
    return {
      success: false,
      error: error.message,
      data: {
        category: "Unknown",
        confidence: 0,
        items: [],
        recyclable: false,
        disposal_method: "Unable to analyze. Please check local waste guidelines.",
        environmental_impact: "Unable to determine environmental impact."
      }
    };
  }
};

/* =========================================
   STREET CLEANLINESS
   ========================================= */
export const analyzeStreet = async (imageBase64) => {
  try {
    const prompt = `
Analyze the street cleanliness in this image.

Return ONLY valid JSON in this format:
{
  "cleanliness_score": 75,
  "status": "moderate",
  "litter_count": 3,
  "litter_types": ["plastic bottle", "paper wrapper"],
  "issues": ["Visible litter on sidewalk", "Trash near curb"],
  "recommendations": ["Increase street sweeping frequency", "Add more public bins"],
  "severity": "moderate"
}

Rules:
- cleanliness_score: number from 0-100 (0=very dirty, 100=very clean)
- status: "clean" or "moderate" or "dirty"
- litter_count: number of visible litter items
- litter_types: array of specific litter types found
- issues: array of cleanliness problems
- recommendations: array of actionable suggestions
- severity: same as status

Return ONLY the JSON, nothing else.
`;

    const response = await withTimeout(
      client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: getBase64(imageBase64),
                  mimeType: "image/jpeg"
                }
              }
            ]
          }
        ]
      })
    );

    const text = response.text;
    const data = JSON.parse(cleanJson(text));

    return { 
      success: true, 
      data: {
        cleanliness_score: data.cleanliness_score || data.cleanlinessScore || 0,
        status: data.status || "unknown",
        litter_count: data.litter_count || 0,
        litter_types: data.litter_types || [],
        issues: data.issues || [],
        recommendations: data.recommendations || [],
        severity: data.severity || data.status || "unknown"
      }
    };

  } catch (error) {
    console.error("Street analysis error:", error);
    return {
      success: false,
      error: error.message,
      data: {
        cleanliness_score: 0,
        status: "unknown",
        litter_count: 0,
        litter_types: [],
        issues: ["Unable to analyze image"],
        recommendations: [],
        severity: "unknown"
      }
    };
  }
};