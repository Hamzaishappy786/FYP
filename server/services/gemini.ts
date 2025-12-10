const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface GeminiResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export async function callGemini(prompt: string, maxTokens: number = 1024): Promise<GeminiResponse> {
  if (!GEMINI_API_KEY) {
    return { success: false, error: "Gemini API key not configured" };
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: `API error: ${response.status} - ${errorData}` };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return { success: false, error: "No response generated" };
    }

    return { success: true, text };
  } catch (error) {
    return { success: false, error: `Request failed: ${error}` };
  }
}

export async function extractMedicalEntities(text: string): Promise<{
  success: boolean;
  entities?: {
    conditions: string[];
    medications: string[];
    procedures: string[];
    biomarkers: string[];
    symptoms: string[];
    measurements: { name: string; value: string; unit: string }[];
  };
  error?: string;
}> {
  const prompt = `You are a medical entity extraction system. Analyze the following medical text and extract entities.

Return a JSON object with exactly this structure (no markdown, just JSON):
{
  "conditions": ["list of medical conditions/diagnoses"],
  "medications": ["list of medications mentioned"],
  "procedures": ["list of medical procedures"],
  "biomarkers": ["list of biomarkers like AFP, CEA, CA 15-3"],
  "symptoms": ["list of symptoms"],
  "measurements": [{"name": "measurement name", "value": "numeric value", "unit": "unit"}]
}

Medical Text:
${text}

JSON Response:`;

  const result = await callGemini(prompt, 2048);
  
  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    const cleanedText = result.text!.replace(/```json\n?|\n?```/g, '').trim();
    const entities = JSON.parse(cleanedText);
    return { success: true, entities };
  } catch {
    return { success: false, error: "Failed to parse entity extraction response" };
  }
}

export async function generateKnowledgeGraph(
  patientData: {
    cancerType: string;
    stage?: string;
    biomarkers?: Record<string, unknown>;
    extractedText?: string;
  }
): Promise<{
  success: boolean;
  graph?: {
    nodes: { id: string; type: string; label: string; properties?: Record<string, unknown> }[];
    edges: { source: string; target: string; relationship: string }[];
  };
  error?: string;
}> {
  const prompt = `You are a medical knowledge graph generator for oncology. Create a knowledge graph based on patient data.

Patient Data:
- Cancer Type: ${patientData.cancerType}
- Stage: ${patientData.stage || "Unknown"}
- Biomarkers: ${JSON.stringify(patientData.biomarkers || {})}
${patientData.extractedText ? `- Clinical Notes: ${patientData.extractedText.substring(0, 2000)}` : ""}

Generate a knowledge graph with nodes and edges. Return a JSON object with exactly this structure (no markdown):
{
  "nodes": [
    {"id": "unique_id", "type": "Disease|Symptom|Treatment|Biomarker|Finding", "label": "display name", "properties": {}}
  ],
  "edges": [
    {"source": "node_id_1", "target": "node_id_2", "relationship": "causes|treats|indicates|associated_with"}
  ]
}

Include nodes for:
1. The primary cancer diagnosis
2. Relevant biomarkers and their significance
3. Standard treatment options for this cancer type/stage
4. Key decision points

JSON Response:`;

  const result = await callGemini(prompt, 4096);
  
  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    const cleanedText = result.text!.replace(/```json\n?|\n?```/g, '').trim();
    const graph = JSON.parse(cleanedText);
    return { success: true, graph };
  } catch {
    return { success: false, error: "Failed to parse knowledge graph response" };
  }
}

export async function generateTreatmentPlan(
  patientData: {
    cancerType: string;
    stage?: string;
    tumorSize?: string;
    biomarkers?: Record<string, unknown>;
    medicalHistory?: string;
    knowledgeGraph?: unknown;
  }
): Promise<{
  success: boolean;
  treatmentPlan?: {
    summary: string;
    primaryRecommendation: string;
    alternativeOptions: string[];
    considerations: string[];
    followUp: string[];
    references: string[];
  };
  error?: string;
}> {
  const prompt = `You are an oncology clinical decision support system. Generate a comprehensive treatment plan based on the patient data.

IMPORTANT: This is for decision support only. All recommendations must be reviewed by a qualified oncologist.

Patient Data:
- Cancer Type: ${patientData.cancerType}
- Stage: ${patientData.stage || "To be determined"}
- Tumor Size: ${patientData.tumorSize || "Unknown"}
- Biomarkers: ${JSON.stringify(patientData.biomarkers || {})}
${patientData.medicalHistory ? `- Medical History: ${patientData.medicalHistory}` : ""}

Generate a treatment plan. Return a JSON object with exactly this structure (no markdown):
{
  "summary": "Brief overview of the case and treatment approach",
  "primaryRecommendation": "The recommended first-line treatment",
  "alternativeOptions": ["Alternative treatment option 1", "Alternative treatment option 2"],
  "considerations": ["Important consideration 1", "Important consideration 2"],
  "followUp": ["Follow-up recommendation 1", "Follow-up recommendation 2"],
  "references": ["NCCN Guidelines reference", "Other clinical guideline"]
}

JSON Response:`;

  const result = await callGemini(prompt, 4096);
  
  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    const cleanedText = result.text!.replace(/```json\n?|\n?```/g, '').trim();
    const treatmentPlan = JSON.parse(cleanedText);
    return { success: true, treatmentPlan };
  } catch {
    return { success: false, error: "Failed to parse treatment plan response" };
  }
}
