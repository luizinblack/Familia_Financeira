import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseCategory, ExpenseStatus } from "../types";

const getAiClient = () => {
  // Use environment variable exclusively as per security guidelines
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert blob to base64 for Gemini
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:audio/webm;base64,") if present
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

interface ExtractedExpenseData {
  amount: number;
  description: string;
  location: string;
  category: ExpenseCategory;
  date: string;
  status: ExpenseStatus;
}

// --- AUDIO EXTRACTION ---
export const extractExpenseFromAudio = async (audioBlob: Blob): Promise<ExtractedExpenseData | null> => {
  try {
    const ai = getAiClient();
    const base64Audio = await blobToBase64(audioBlob);

    // Get current date in YYYY-MM-DD for the prompt context
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || "audio/webm",
              data: base64Audio,
            },
          },
          {
            text: `Analise este áudio e extraia os detalhes da despesa. 
            Identifique o valor, uma descrição curta, o local (estabelecimento), a categoria mais apropriada e a data.
            
            IMPORTANTE: A data de hoje é ${todayString}.
            - Se o usuário disser "hoje", use ${todayString}.
            - Se disser "ontem", calcule a data baseada em hoje.
            - Se não mencionar data, use ${todayString}.
            
            Além disso, identifique o status:
            - "paid" se o usuário disser "paguei", "comprei", "gastei".
            - "pending" se disser "chegou a conta", "boleto para pagar", "vence dia tal".
            - Na dúvida, use "paid".

            Categorias permitidas: Mercado, Lazer, Contas Fixas, Transporte, Saúde, Educação, Investimentos, Outros.
            
            Retorne APENAS um JSON válido.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            location: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              enum: Object.values(ExpenseCategory) 
            },
            date: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['paid', 'pending', 'cancelled'] }
          },
          required: ["amount", "description", "category"]
        }
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ExtractedExpenseData;
    }
    return null;

  } catch (error) {
    console.error("Error analyzing audio:", error);
    throw error;
  }
};

// --- IMAGE/PDF EXTRACTION (SCANNER) ---
export const extractExpenseFromImageOrPDF = async (file: File): Promise<ExtractedExpenseData | null> => {
  try {
    const ai = getAiClient();
    const base64Data = await blobToBase64(file);
    const mimeType = file.type;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Flash is excellent and fast for vision tasks
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `Analise este documento (Recibo, Nota Fiscal ou Fatura). Extraia os dados para registro financeiro.
            
            Instruções:
            1. Valor (amount): O valor TOTAL da nota.
            2. Local (location): O nome do estabelecimento ou empresa emissora.
            3. Data (date): A data de emissão no formato YYYY-MM-DD. Se não achar, use a data de hoje.
            4. Descrição (description): Um resumo curto do que foi comprado (ex: "Compras semanais", "Jantar", "Mensalidade escolar").
            5. Categoria: Escolha a melhor entre: Mercado, Lazer, Contas Fixas, Transporte, Saúde, Educação, Investimentos, Outros.
            6. Status: Se for nota fiscal de produto (mercado, restaurante), assuma "paid". Se for boleto ou fatura de serviço (luz, internet), assuma "pending".

            Retorne APENAS o JSON.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            location: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              enum: Object.values(ExpenseCategory) 
            },
            date: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['paid', 'pending', 'cancelled'] }
          },
          required: ["amount", "location", "category"]
        }
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ExtractedExpenseData;
    }
    return null;

  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
};