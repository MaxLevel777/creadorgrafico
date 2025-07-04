import { GoogleGenAI } from "@google/genai";
import { ChartOptions, DataItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Parses a string that might be a JSON object or a markdown-fenced JSON string.
 * @param jsonStr The string to parse.
 * @returns The parsed JSON object.
 */
function parseJsonResponse<T>(jsonStr: string): T {
  let parsableStr = jsonStr.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = parsableStr.match(fenceRegex);
  if (match && match[2]) {
    parsableStr = match[2].trim();
  }
  
  try {
    return JSON.parse(parsableStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    throw new Error("La respuesta de la IA no tenía el formato JSON esperado. Por favor, intente de nuevo.");
  }
}


export async function generateChartDataFromPrompt(prompt: string): Promise<DataItem[]> {
  const modelPrompt = `
    You are an expert data generation assistant. Based on the user's prompt, create a JSON array of objects to be used in a chart.
    Each object in the array MUST have two properties:
    1. "name": a string representing the label for a data point (e.g., a month, a category).
    2. "value": a number representing the value for that data point.

    The user wants data for: "${prompt}"

    Generate a reasonable number of data points (between 5 and 12) unless the user specifies otherwise.
    Return ONLY the raw JSON array, without any explanations, comments, or markdown fences.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: modelPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const data = parseJsonResponse<any[]>(response.text);

    // Validate the structure of the returned data
    if (!Array.isArray(data) || data.some(item => typeof item.name !== 'string' || typeof item.value !== 'number')) {
        throw new Error("La IA devolvió datos en un formato incorrecto.");
    }

    return data.map(item => ({
        ...item,
        id: self.crypto.randomUUID()
    }));

  } catch (error) {
    console.error("Error generating chart data:", error);
    throw new Error("No se pudieron generar los datos del gráfico desde la IA. Verifique su clave de API y la consulta.");
  }
}


export async function generateChartInsights(data: DataItem[], options: ChartOptions): Promise<string> {
    const modelPrompt = `
      You are an expert data analyst. Your task is to provide a brief, insightful summary of the provided chart data.
      Analyze the data considering the chart's title and type.
      The summary should be concise, easy to understand, and limited to one or two key observations.
      
      Chart Information:
      - Title: "${options.title}"
      - Type: "${options.type}"
      - Data: ${JSON.stringify(data.map(({name, value}) => ({name, value})))}

      Provide the analysis in Spanish.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: modelPrompt,
            config: {
                temperature: 0.7,
            }
        });

        return response.text;

    } catch (error) {
        console.error("Error generating chart insights:", error);
        throw new Error("No se pudieron generar las ideas desde la IA.");
    }
}