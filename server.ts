import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import agoraTokenPkg from "agora-token";
import dotenv from "dotenv";
import * as jose from "jose";

const { RtcTokenBuilder, RtcRole } = (agoraTokenPkg as any) || {};

dotenv.config();

const app = express();
const PORT = 3000;

const AGORA_APP_ID = process.env.AGORA_APP_ID || process.env.VITE_AGORA_APP_ID || '2bea0d6dbd304f6c9517215542b9aec1';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'salem-adae3';
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const FIREBASE_DATABASE_URL = (process.env.FIREBASE_DATABASE_URL || `https://${FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`).replace(/\/$/, '');
const FIREBASE_JWKS = jose.createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);
const requestWindows = new Map<string, { count: number; resetAt: number }>();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost,https://localhost,capacitor://localhost')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  const origin = req.header('origin');
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

interface AuthenticatedRequest extends Request {
  firebaseUid?: string;
}

function getAgoraUid(userId: string): number {
  let hash = 2166136261;
  for (let index = 0; index < userId.length; index += 1) {
    hash ^= userId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 2_000_000_000 + 1;
}

async function canPublishToRoom(req: AuthenticatedRequest, channelName: string): Promise<boolean> {
  const token = req.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token || !req.firebaseUid) return false;

  const readNode = async (pathName: string) => {
    const response = await fetch(`${FIREBASE_DATABASE_URL}/${pathName}.json`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    return response.json();
  };

  try {
    // Voice-room publisher authorization.
    const room = await readNode(`rooms/${encodeURIComponent(channelName)}`);
    if (room && typeof room === 'object') {
      if (room.ownerId === req.firebaseUid || room.hostId === req.firebaseUid) return true;
      const seats = room.seats && typeof room.seats === 'object' ? Object.values(room.seats) : [];
      if (seats.some((seat: any) => {
        const speaker = seat?.speakerUser;
        return speaker && (speaker.id === req.firebaseUid || speaker.userId === req.firebaseUid);
      })) return true;
    }

    // Live-stream publisher authorization. The previous implementation only
    // checked /rooms, causing valid live broadcasters to be denied publisher
    // tokens because their channel lives under /live_streams.
    const liveStream = await readNode(`live_streams/${encodeURIComponent(channelName)}`);
    if (liveStream && typeof liveStream === 'object') {
      if (liveStream.ownerId === req.firebaseUid) return true;
      if (liveStream.guestId === req.firebaseUid && liveStream.hasGuest === true) return true;
    }

    return false;
  } catch {
    return false;
  }
}


async function requireFirebaseAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  const token = header?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ error: 'Missing Firebase ID token' });

  try {
    const { payload } = await jose.jwtVerify(token, FIREBASE_JWKS, {
      algorithms: ['RS256'],
      issuer: FIREBASE_ISSUER,
      audience: FIREBASE_PROJECT_ID,
    });
    const uid = typeof payload.user_id === 'string' ? payload.user_id : payload.sub;
    if (!uid || typeof uid !== 'string') return res.status(401).json({ error: 'Invalid Firebase subject' });
    req.firebaseUid = uid;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired Firebase ID token' });
  }
}

function rateLimit(limit: number, windowMs: number) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = req.firebaseUid || req.ip || 'unknown';
    const now = Date.now();
    const current = requestWindows.get(key);
    const state = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    state.count += 1;
    requestWindows.set(key, state);
    if (state.count > limit) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    next();
  };
}

// Initialize Google GenAI on the server side
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Gemini Chat Endpoint
app.post("/api/gemini/chat", requireFirebaseAuth, rateLimit(30, 60_000), async (req, res) => {
  try {
    const { prompt, audioBase64, mimeType, personality, roomTitle, previousMessages, language } = req.body;
    if (typeof prompt !== 'string' && typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'A text or audio prompt is required' });
    }
    if ((typeof prompt === 'string' && prompt.length > 4_000) || (typeof audioBase64 === 'string' && audioBase64.length > 700_000)) {
      return res.status(413).json({ error: 'Prompt is too large' });
    }

    const langInstruction = language === 'en' ? 'Reply in clear English.' : 'اجعل الرد باللغة العربية الواضحة والسلسة.';
    
    let personalityStyle = 'مساعد ذكي ومرح ويقدم إجابات سريعة وتفاعلية بأسلوب ودود وممتع';
    if (personality === 'game_master') {
      personalityStyle = 'حكم ومسؤول ألعاب ومسابقات حماسي ينظم المسابقات والتحديات للغرفة بنشاط وروح منافسة عالية';
    } else if (personality === 'translator') {
      personalityStyle = 'مترجم خبير ومحترف يترجم النصوص والكلمات بدقة وسرعة ويعيد صياغتها بأناقة';
    } else if (personality === 'teacher') {
      personalityStyle = 'معلم ومدرب معلومات عامة وباحث أذكياء يوضح المفاهيم بأسلوب مبسط وشائق';
    } else if (personality === 'fun') {
      personalityStyle = 'شخصية كوميدية وفكاهية محبة للمزاح والقفشات اللطيفة وإطفاء جو من البهجة للغرفة';
    }

    const systemInstruction = `أنت المساعد الذكي الرسمي "🤖 Gemini AI" الحاضر كعضو مميز داخل غرفة الدردشة الصوتية "${roomTitle || 'غرفة SALEEM'}".
أسلوبك وشخصيتك: ${personalityStyle}.
${langInstruction}
القواعد الهامة:
1. اجعل إجابتك متناسبة تماماً مع سياق الدردشة الصوتية (قصيرة، تفاعلية، ملهمة، ولا تتعدى 2-3 جمل إلا لو طلب منك شرح مفصل).
2. استخدم إيموجيات معبرة وجذابة.
3. تفاعل مع أعضاء الغرفة بلطف ومودة ودعم إيجابي.`;

    let historyText = "";
    if (Array.isArray(previousMessages) && previousMessages.length > 0) {
      historyText = previousMessages
        .slice(-6)
        .map((m: any) => `${m.senderName}: ${m.text}`)
        .join("\n");
    }

    let contentsPayload: any;

    if (audioBase64) {
      const audioPromptText = prompt
        ? `[صوت مسجل من المستخدم مع ملاحظة]: ${prompt}`
        : "استمع بدقة إلى هذا التسجيل الصوتي المباشر من المستخدم وافهم كل ما قاله بالكامل ورُدّ عليه بدقة ولطف بأسلوبك.";

      const fullPromptWithHistory = historyText
        ? `[سياق الرسائل الأخيرة في الغرفة]:\n${historyText}\n\n[الرسالة الصوتية الموجهة لك الآن]:\n${audioPromptText}`
        : audioPromptText;

      contentsPayload = [
        {
          inlineData: {
            mimeType: mimeType || "audio/webm",
            data: audioBase64,
          },
        },
        { text: fullPromptWithHistory },
      ];
    } else {
      const fullPrompt = historyText
        ? `[سياق الرسائل الأخيرة في الغرفة]:\n${historyText}\n\n[الرسالة/السؤال الموجه لك الآن]:\n${prompt}`
        : prompt;
      contentsPayload = fullPrompt;
    }

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: contentsPayload,
        config: {
          systemInstruction,
          temperature: 0.8,
        },
      });
    } catch (primaryErr: any) {
      // Fallback model if primary gemini-3.6-flash rate-limits
      try {
        response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: contentsPayload,
          config: {
            systemInstruction,
            temperature: 0.8,
          },
        });
      } catch (fallbackErr: any) {
        throw primaryErr; // rethrow to be caught in main catch block
      }
    }

    const replyText = response.text || "أهلاً بك! أنا جاهز لمساعدتك وإجابة جميع تساؤلاتك في الغرفة ⚡";
    res.json({ text: replyText });
  } catch (err: any) {
    const errString = String(err?.message || err);
    if (err?.status === 429 || errString.includes("RESOURCE_EXHAUSTED") || errString.includes("quota")) {
      console.warn("Gemini Chat quota limit reached, sending fallback response.");
      return res.json({ 
        text: "أهلاً بك! يبدو أن هناك ضغطاً مؤقتاً على الخدمة الصوتية الذكية لـ Gemini. يرجى المحاولة بعد 20 ثانية ⚡"
      });
    }
    console.warn("Gemini Chat request handled with default message.");
    res.json({ 
      text: "أعتذر، حدث تعثر بسيط في التواصل مع الخادم. يرجى المحاولة بعد لحظات 🤖"
    });
  }
});

// Gemini Text-to-Speech Endpoint
app.post("/api/gemini/tts", requireFirebaseAuth, rateLimit(10, 60_000), async (req, res) => {
  try {
    const { text } = req.body;
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }
    if (text.length > 1_000) return res.status(413).json({ error: 'Text is too large' });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ parts: [{ text: `Say cheerfully in clear expressive voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    res.json({ audio: base64Audio || null });
  } catch (err: any) {
    // Gracefully handle rate-limits (429) or missing TTS quota without crashing
    console.warn("Gemini TTS quota limit reached or unavailable, falling back to browser WebSpeech.");
    res.json({ audio: null, notice: "TTS quota reached, fallback to browser WebSpeech" });
  }
});

// Agora RTC Token Generator Endpoint
app.post("/api/agora/token", requireFirebaseAuth, rateLimit(60, 60_000), async (req: AuthenticatedRequest, res) => {
  try {
    const { channelName, uid, role } = req.body;

    if (typeof channelName !== "string" || channelName.length < 3 || channelName.length > 64) {
      return res.status(400).json({ error: "Invalid channelName" });
    }

    const numericUid = getAgoraUid(req.firebaseUid!);
    if (uid !== undefined && Number(uid) !== numericUid) {
      return res.status(403).json({ error: 'Requested UID does not belong to the authenticated user' });
    }

    if (!AGORA_APP_CERTIFICATE) return res.status(503).json({ error: 'Agora token service is not configured' });

    const requestedRole = role === "publisher" ? "publisher" : "subscriber";
    if (requestedRole === "publisher" && !(await canPublishToRoom(req, channelName))) {
      return res.status(403).json({ error: 'Publisher role requires room ownership or an active seat' });
    }

    const rtcRole = requestedRole === "publisher" ? (RtcRole?.PUBLISHER ?? 1) : (RtcRole?.SUBSCRIBER ?? 2);
    const expireTimeInSeconds = 3600; // short-lived token

    const privilegeExpireTime = Math.floor(Date.now() / 1000) + expireTimeInSeconds;

    if (RtcTokenBuilder?.buildTokenWithUid) {
      const token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        numericUid,
        rtcRole,
        privilegeExpireTime,
        privilegeExpireTime
      );
      return res.json({ token, appId: AGORA_APP_ID, uid: numericUid });
    }
    return res.status(503).json({ error: 'Agora token builder is unavailable' });
  } catch (err: any) {
    console.error("Failed to build Agora token:", err);
    res.status(500).json({ error: "Token generation failed" });
  }
});

// Serve frontend / Vite Middleware
async function startServer() {
  process.on('uncaughtException', (err) => {
    console.error('⚠️ [Server UncaughtException]:', err);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('⚠️ [Server UnhandledRejection]:', reason);
  });

  if (process.env.NODE_ENV === "production" || !process.env.VITE_DEV) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 SALEEM Server running permanently on http://0.0.0.0:${PORT}`);
  });

  // Keep process alive indefinitely
  setInterval(() => {}, 1000 * 60 * 60);
}

startServer();
