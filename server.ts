import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        });
        const msg = "(Simulated AI) I've analyzed your request based on context. My recommendation is to focus on scaling your core algorithm.";
        for(let i=0; i<msg.length; i++){
          res.write(msg[i]);
          await new Promise(r => setTimeout(r, 20));
        }
        res.end();
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      });

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const contents = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const responseStream = await ai.models.generateContentStream({
          model: 'gemini-3.5-flash',
          contents: contents,
          config: {
              systemInstruction: `You are Jagruti AI Co-Pilot, an elite AI advisor for Silicon Valley startup founders. You are terse, highly strategic, brilliant, and speak directly. Be helpful but never overly chatty.`,
          }
      });
      
      for await (const chunk of responseStream) {
         if(chunk.text) {
           res.write(chunk.text);
         }
      }
      res.end();
      
    } catch (e: any) {
      console.error(e);
      if(!res.headersSent) {
         res.status(500).json({ error: e.message || "Failed to generate AI response" });
      } else {
         res.end(`\n\n[Error: ${e.message}]`);
      }
    }
  });

  // Supabase mock / proxy could be added here if needed, 
  // but we can just use the supabase client on the frontend for real DB mode.

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
