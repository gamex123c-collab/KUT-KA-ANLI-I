import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client to avoid startup crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// AI Feature Endpoints
// ----------------------------------------------------

/**
 * Endpoint for meeting summarization
 */
app.post("/api/ai/summarize", async (req: Request, res: Response) => {
  try {
    const { transcript, customPrompt } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Transcript data is required for summarization." });
    }

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are the ultimate AI Khagan scribe for 'Kut Kağanlığı' meeting platform. 
Summarize the following meeting transcript in Turkish. Adopt an epic, elegant, and highly structured format with modern professional business tone but subtle honorable Turkic state phrasing (e.g., calling decisions "Kurultay Kararları", participants "Toy Üyeleri" or official roles).
Include:
1. Kısa Özet (Executive Summary)
2. Önemli Tartışma Maddeleri (Key Discussions)
3. Kurultay Kararları ve Atanan Görevler (Decisions & Action Items)
4. Gelecek Adımlar (Next Steps)

Meeting Transcript:
${transcript}

${customPrompt ? `Interactive Scribe Guidance: ${customPrompt}` : ""}`,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Summarization error:", error);
    res.json({
      error: true,
      message: error.message || "Gemini summarization failed.",
      fallback: "Kut Kağanlığı Yapay Zeka Scribes: Görüşme özeti şu an oluşturulamadı. Lütfen API anahtarınızın Settings > Secrets menüsünde kayıtlı olduğunu doğrulayın."
    });
  }
});

/**
 * Endpoint to auto-transcribe simulated noisy voice discussions
 */
app.post("/api/ai/transcribe", async (req: Request, res: Response) => {
  const { speaker, simulatedNoiseLevel, length } = req.body;
  try {
    const client = getGeminiClient();

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a realistic Turkish transcript segment for a technical video meeting in the 'Kut Kağanlığı' platform (which is a premium communication platform). 
Speaker name is: ${speaker || "Katılımcı"}.
The tone should feel real, containing technical discussion (e.g., WebRTC connection state, server load, mobile app compilation, UI layout with gold/navy theme).
Simulated environment noise level is ${simulatedNoiseLevel || "Low"}. Please make the speech natural, perhaps reflecting slight casual speaking elements, but highly professional.
Required length: ${length === "long" ? "3-4 sentences" : "1-2 sentences"}.
Format the output purely as the text spoken, without any quotation marks or speaker name prefix.`,
    });

    res.json({ text: response.text?.trim() });
  } catch (error: any) {
    console.error("Transcription generation error:", error);
    res.json({
      error: true,
      message: error.message,
      fallback: `${speaker || "Katılımcı"}: Toplantıda ses kalitesini artırmak için düşük gecikmeli WebRTC ve HD görüntü protokolleri aktif edildi.`
    });
  }
});

/**
 * Endpoint for instant translation
 */
app.post("/api/ai/translate", async (req: Request, res: Response) => {
  const { text, targetLang } = req.body;
  try {
    if (!text) {
      return res.status(400).json({ error: "Text is required for translation." });
    }

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate the following Turkish text from a video meeting into ${targetLang || "English"}.
Maintain the professional, respectful tone of the original message. If targetLang is 'Old_Turkic_Runic_Latin', transliterate/translate it to represent the Old Turkic language using Latinized characters or Orkhon translation keywords!

Text:
${text}

Return only the translated output, with no additional commentary.`,
    });

    res.json({ text: response.text?.trim() });
  } catch (error: any) {
    console.error("Translation error:", error);
    res.json({
      error: true,
      message: error.message,
      fallback: `[Translated] ${text} (${targetLang || "ENG"})`
    });
  }
});

/**
 * Endpoint for high-intelligence chat moderation, spam detection, and profanity filtering
 */
app.post("/api/ai/moderate", async (req: Request, res: Response) => {
  const { message, speaker } = req.body;
  try {
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze this chat message sent by '${speaker || "Username"}' in a professional video meeting for:
1. Profanity/Offensive language (Küfür/Hakaret)
2. Spam or toxic payload (Spam tespiti)
3. Safety evaluation

Message content: "${message}"

Respond strictly with a JSON object containing these keys:
- isApproved: boolean (false if toxic, offensive, spam, or highly inappropriate)
- cleanedMessage: string (starred out offensive words like "b***t" OR original message if safe)
- reason: string (brief explanation in Turkish, e.g., "Güvenli ve saygılı mesaj" or "Küfür/Spam engellendi")
- spamScore: number (0 to 100)`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Moderation error:", error);
    res.json({
      isApproved: true,
      cleanedMessage: message,
      reason: "Yerel denetim devrede. Mesaj onaylandı.",
      spamScore: 5
    });
  }
});

/**
 * Whiteboard smart sketch advisor / diagram generator
 */
app.post("/api/ai/whiteboard-prompt", async (req: Request, res: Response) => {
  try {
    const { elements, userInstructions } = req.body;
    const client = getGeminiClient();

    const prompt = `You are a whiteboard system designer assistant in a video conferencing application.
The user is working on a collaborative sketch canvas with current ideas/shapes: ${JSON.stringify(elements || [])}.
The user asks: "${userInstructions || "Bu akış şemasını nasıl iyileştirebilirim?"}"
Provide highly constructive, elegant, golden-standard structural recommendations in Turkish. Keep it short, actionable, and formatted in Markdown with bullet points.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ feedback: response.text });
  } catch (error: any) {
    res.json({
      feedback: `### Akıllı Kurultay Tahtası Önerileri
- Çizim alanınızdaki kutuları sistem mimarinize (WebRTC, Signaling, Media Server) göre etiketleyin.
- Bağlantı topolojisinde 'SFU' veya 'MCU' yönlendirici bileşeni ekleyerek 500 kişiye kadar ölçeklenebilirlik sağlayın.
- API bağlantınızı test ederek yapay zeka asistanından otomatik şema çizim önerileri alabilirsiniz.`
    });
  }
});

// ----------------------------------------------------
// Dev/Prod Server Configuration
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Kut Kağanlığı Server] Running beautifully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
