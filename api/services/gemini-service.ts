import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Env, NewsArticle } from "../../types";

const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_QUALITY = 'gemini-3-pro-preview';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(env: Env) {
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  private safeJsonParse(text: string | undefined): any {
    if (!text) return {};
    try {
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {}
    try {
      const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        const extracted = JSON.parse(match[0]);
        if (extracted && typeof extracted === 'object') return extracted;
      }
    } catch (e) {}
    console.warn("Gemini JSON Parse Failed:", text.substring(0, 100));
    return {};
  }

  async searchNews(query: string): Promise<Partial<NewsArticle>[]> {
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Find the latest news about: "${query}". 
        Return a list of 5 key articles from the last 24 hours.
        For each article, you MUST provide:
        1. Title
        2. Source Name
        3. URL
        4. Brief Summary
        
        Important: Ensure you use the Google Search tool to find real, recent URLs.`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      // 1. Try Grounding Metadata (Most Reliable for URLs)
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webChunks = groundingChunks.filter((c: any) => c.web);
      
      let articles: Partial<NewsArticle>[] = webChunks.map((chunk: any) => ({
        title: chunk.web.title,
        url: chunk.web.uri,
        source: new URL(chunk.web.uri).hostname.replace('www.', ''),
        content: "Summary available in full report",
        published_at: new Date().toISOString(),
        status: 'new'
      }));

      // 2. If metadata is empty (model didn't cite properly), try to parse the text
      if (articles.length === 0 && response.text) {
          console.log("Fallback: Parsing text for links");
          // Simple regex to find Markdown links [Title](URL)
          const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
          let match;
          while ((match = linkRegex.exec(response.text)) !== null) {
              articles.push({
                  title: match[1],
                  url: match[2],
                  source: new URL(match[2]).hostname.replace('www.', ''),
                  content: "Extracted from text",
                  published_at: new Date().toISOString(),
                  status: 'new'
              });
          }
      }

      // Deduplicate by URL
      const uniqueArticles = Array.from(new Map(articles.map(item => [item.url, item])).values());
      return uniqueArticles.slice(0, 5);
    } catch (error) {
      console.error("Gemini Search Error:", error);
      return [];
    }
  }

  async generateBlog(prompt: string, systemInstruction: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_QUALITY,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });
      return response.text || "";
    } catch (error) {
      console.error("Gemini Blog Gen Error:", error);
      throw error;
    }
  }

  async extractMetadata(content: string): Promise<any> {
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Extract the following metadata from this blog post content as JSON:
        - title (string)
        - excerpt (string, max 150 chars)
        - tags (array of strings)
        
        Content: ${content.substring(0, 3000)}...`,
        config: {
          responseMimeType: "application/json"
        }
      });
      return this.safeJsonParse(response.text);
    } catch (error) {
      return { title: "Untitled", excerpt: "", tags: [] };
    }
  }

  async researchTopic(query: string): Promise<string[]> {
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Research this topic in depth: "${query}". Provide 3 key insights or facts with sources.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      return [response.text || ""];
    } catch (error) {
      return ["Research failed."];
    }
  }

  async analyzeSEO(content: string, keyword: string = "general"): Promise<any> {
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Analyze this blog post content for SEO based on the keyword: "${keyword}".
        Return JSON with:
        - score (number 0-100)
        - suggestions (array of strings)
        - keywords_found (array of strings)
        - meta_description (string suggestion)
        
        Content: ${content.substring(0, 4000)}...`,
        config: { responseMimeType: "application/json" }
      });
      return this.safeJsonParse(response.text);
    } catch (error) {
      return { score: 0, suggestions: ["Analysis failed"] };
    }
  }

  async generateSocialPosts(content: string): Promise<any> {
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_FAST,
        contents: `Generate social media posts for this blog content.
        Return JSON with:
        - twitter (string, max 280 chars, thread style)
        - linkedin (string, professional tone)
        - instagram (string, engaging caption with hashtags)
        
        Content: ${content.substring(0, 3000)}...`,
        config: { responseMimeType: "application/json" }
      });
      return this.safeJsonParse(response.text);
    } catch (error) {
      return { twitter: "", linkedin: "", instagram: "" };
    }
  }

  async checkQuality(content: string, brandVoice: string): Promise<any> {
    try {
        const response = await this.ai.models.generateContent({
            model: MODEL_FAST,
            contents: `Evaluate this content for quality and brand consistency.
            Brand Voice: ${brandVoice}
            
            Return JSON with:
            - naturalness_score (0-100, how human-like it sounds)
            - brand_score (0-100, how well it matches brand voice)
            - issues (array of strings: grammar, robotic phrases, etc)
            
            Content: ${content.substring(0, 3000)}...`,
            config: { responseMimeType: "application/json" }
        });
        return this.safeJsonParse(response.text);
    } catch (error) {
        return { naturalness_score: 50, brand_score: 50, issues: ["Check failed"] };
    }
  }
}