
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Env, NewsArticle } from "../../types";

const MODEL_FAST = 'gemini-3-flash-preview'; 
const MODEL_QUALITY = 'gemini-3-pro-preview';

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string;
  private isSimulationMode: boolean = false;

  constructor(env: Env) {
    this.apiKey = env.API_KEY || process.env.API_KEY || '';
    
    // FAIL-SAFE INITIALIZATION
    try {
        // Force simulation if key is obviously fake, missing, or short
        const isInvalidKey = !this.apiKey || 
                             this.apiKey === 'dummy_key' || 
                             this.apiKey.startsWith('sk_sc_') ||
                             this.apiKey.length < 10; // Basic length check

        if (isInvalidKey) {
            this.isSimulationMode = true;
            console.log("GeminiService: Starting in Simulation Mode (Invalid/Missing Key)");
        } else {
            this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        }
    } catch (e) {
        console.error("GeminiService Constructor Error:", e);
        this.isSimulationMode = true; // Fallback to simulation on crash
    }
  }

  private safeJsonParse(text: string | undefined): any {
    if (!text) return {};
    let cleanText = text.replace(/```json\s*|```/g, '').trim();
    try {
      const parsed = JSON.parse(cleanText);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {
        try {
            const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (match) {
                const extracted = JSON.parse(match[0]);
                if (extracted && typeof extracted === 'object') return extracted;
            }
        } catch (e2) {}
    }
    return {};
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
      let timeoutId: any;
      const timeoutPromise = new Promise<T>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error(errorMessage)), ms);
      });
      try {
          const result = await Promise.race([promise, timeoutPromise]);
          clearTimeout(timeoutId);
          return result;
      } catch (error) {
          clearTimeout(timeoutId);
          throw error;
      }
  }

  // --- METHODS ---

  async searchNews(query: string): Promise<Partial<NewsArticle>[]> {
    if (this.isSimulationMode || !this.ai) {
        await new Promise(r => setTimeout(r, 1000));
        return [
            { title: "AI Revolutionizes Content Marketing in 2024", url: "https://example.com/ai-news", source: "TechDaily", content: "Simulation content...", published_at: new Date().toISOString(), status: 'new' },
            { title: "Google Announces New Gemini Features", url: "https://google.com/news", source: "Google Blog", content: "Simulation content...", published_at: new Date().toISOString(), status: 'new' },
            { title: "Why SEO is Changing Fast", url: "https://seo-world.com", source: "SEO World", content: "Simulation content...", published_at: new Date().toISOString(), status: 'new' }
        ];
    }

    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Find the latest news about: "${query}". Return 5 articles.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webChunks = groundingChunks.filter((c: any) => c.web);
      let articles: Partial<NewsArticle>[] = webChunks.map((chunk: any) => ({
        title: chunk.web.title,
        url: chunk.web.uri,
        source: new URL(chunk.web.uri).hostname.replace('www.', ''),
        content: "Summary available",
        published_at: new Date().toISOString(),
        status: 'new'
      }));
      const uniqueArticles = Array.from(new Map(articles.map(item => [item.url, item])).values());
      return uniqueArticles.slice(0, 5);
    } catch (error) {
      console.error("Gemini Search Error:", error);
      return [];
    }
  }

  async generateBlog(prompt: string, systemInstruction: string): Promise<string> {
    if (this.isSimulationMode || !this.ai) {
        await new Promise(r => setTimeout(r, 2000));
        return `## The Future of AI Content (Simulation Mode)\n\nThis is a high-quality simulated blog post generated because the API key is missing. In a real scenario, Gemini 1.5 Pro would write this.\n\n### Key Takeaways\n\n1. AI is fast.\n2. Content is king.\n3. Automation saves time.\n\n**Conclusion:**\nAlways check your API keys in production environments.`;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_QUALITY,
        contents: prompt,
        config: { systemInstruction: systemInstruction, temperature: 0.7 }
      });
      return response.text || "";
    } catch (error) { throw error; }
  }

  async extractMetadata(content: string): Promise<any> {
    if (this.isSimulationMode || !this.ai) {
        return { title: "Simulated Article Title", excerpt: "This is a simulated excerpt for the dashboard.", tags: ["AI", "Simulation", "Tech"] };
    }
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Extract metadata JSON: title, excerpt, tags from: ${content.substring(0, 3000)}...`,
        config: { responseMimeType: "application/json" }
      });
      return this.safeJsonParse(response.text);
    } catch (error) { return { title: "Untitled", excerpt: "", tags: [] }; }
  }

  async researchTopic(query: string): Promise<string[]> {
    if (this.isSimulationMode || !this.ai) return ["Insight 1: AI adoption is growing (Simulated)", "Insight 2: Costs are dropping (Simulated)", "Insight 3: Quality is improving (Simulated)"];
    
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Research: "${query}". Provide 3 key insights.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      return [response.text || ""];
    } catch (error) { return ["Research failed."]; }
  }

  async analyzeSEO(content: string, keyword: string = "general"): Promise<any> {
    if (this.isSimulationMode || !this.ai) {
        await new Promise(r => setTimeout(r, 800));
        return { score: 85, suggestions: ["Add more headers (Simulated)", "Use active voice", "Increase keyword density"] };
    }
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Analyze SEO for keyword "${keyword}". Return JSON with keys: 'score' (number 0-100) and 'suggestions' (array of strings). Content: ${content.substring(0, 4000)}...`,
        config: { responseMimeType: "application/json" }
      });
      return this.safeJsonParse(response.text);
    } catch (error) { 
        console.error("SEO Tool Error", error);
        return { score: 0, suggestions: ["Analysis failed due to API error"] }; 
    }
  }

  async generateSocialPosts(content: string): Promise<any> {
    if (this.isSimulationMode || !this.ai) {
        await new Promise(r => setTimeout(r, 800));
        return { twitter: "Check out our new post! 🚀 #AI (Simulated)", linkedin: "We just published a deep dive into AI. Read more here. (Simulated)", instagram: "New blog drop! 📸 (Simulated)" };
    }
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Generate JSON social posts with keys 'twitter', 'linkedin', 'instagram' for: ${content.substring(0, 3000)}...`,
        config: { responseMimeType: "application/json" }
      });
      return this.safeJsonParse(response.text);
    } catch (error) { 
        console.error("Social Tool Error", error);
        return { twitter: "Error generating post", linkedin: "", instagram: "" }; 
    }
  }

  async checkQuality(content: string, brandVoice: string): Promise<any> {
    if (this.isSimulationMode || !this.ai) {
        await new Promise(r => setTimeout(r, 800));
        return { naturalness_score: 92, brand_score: 88 };
    }
    try {
        const response = await this.ai.models.generateContent({
            model: MODEL_FAST,
            contents: `Evaluate content quality. Voice: ${brandVoice}. Return JSON with keys 'naturalness_score' (0-100) and 'brand_score' (0-100). Content: ${content.substring(0, 3000)}...`,
            config: { responseMimeType: "application/json" }
        });
        return this.safeJsonParse(response.text);
    } catch (error) { 
        console.error("Quality Tool Error", error);
        return { naturalness_score: 50, brand_score: 50 }; 
    }
  }

  async chatSupport(message: string, history: any[]): Promise<string> {
    // 1. SIMULATION MODE CHECK
    if (this.isSimulationMode || !this.ai) {
        await new Promise(resolve => setTimeout(resolve, 600)); // Faster response for better UX
        
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) return "Hello! 👋 I'm running in **Simulation Mode** because no API Key was detected. I can still demonstrate how the app works! Try asking me about 'pricing' or 'features'.";
        if (lowerMsg.includes('pricing')) return "Our pricing plans are flexible! In this demo, everything is free. In the real app, we have Starter ($0), Pro ($19), and Enterprise plans.";
        if (lowerMsg.includes('features')) return "I can help you generate blogs, research topics, and analyze news. Go to the Dashboard to try the agents!";
        if (lowerMsg.includes('help')) return "I'm here to help! Since we are in simulation mode, I'm using pre-written responses to guide you through the UI.";
        
        return "That's a great question! Since I'm in **Simulation Mode** (no API Key connected), I can't generate a dynamic answer for that specific query, but I assure you the real Gemini model would have a brilliant response! 🚀";
    }

    // 2. LIVE MODE ATTEMPT
    try {
        return await this.withTimeout(
            this._chatSupportInternal(message, history),
            12000, 
            "I'm taking a bit too long to think. Please ask again in a moment."
        );
    } catch (error: any) {
        console.error("Chat Support Error:", error);
        // Fallback to simulation response on error
        this.isSimulationMode = true; 
        return "I encountered a connection error with the AI service. I've switched to **Simulation Mode** so you can continue testing the interface. What would you like to know about the app features?";
    }
  }

  private async _chatSupportInternal(message: string, history: any[]): Promise<string> {
    if (!this.ai) throw new Error("AI not initialized");

    const cleanHistory = history
        .filter(h => h.text && h.text.trim().length > 0)
        .map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text.substring(0, 300) }]
        }))
        .slice(-6); 

    cleanHistory.push({
        role: 'user',
        parts: [{ text: message.substring(0, 500) }]
    });

    const systemInstruction = `You are a helpful Support Assistant for 'Smart Content Platform'. Be concise.`;

    const response = await this.ai.models.generateContent({
        model: MODEL_FAST,
        contents: cleanHistory,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.6,
            maxOutputTokens: 200,
        }
    });

    return response.text || "I didn't have a response to that.";
  }
}
