// server/client/lib/ai-models.ts
import { AIProvider } from "@/hooks/use-ai-config"

export interface AIModel {
  id: string
  name: string
}

export async function fetchModels(provider: AIProvider = "claude"): Promise<AIModel[]> {
  try {
    if (provider === "openai") {
      /* const response = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!response.ok) return []
      const data = await response.json()
      return data.data.map((m: any) => ({
        id: m.id,
        name: m.id.replace(/-/g, " ").replace(/_/g, " "),
      })) */

      return [
        { id: "gpt-5", name: "GPT-5" },
        { id: "gpt-5-mini", name: "GPT-5 Mini" },
        { id: "gpt-5-nano", name: "GPT-5 Nano" },

        { id: "gpt-4.1", name: "GPT-4.1" },
        { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
        { id: "gpt-4.1-nano", name: "GPT-4.1 Nano" },

        { id: "o4-mini", name: "o4 Mini" },

        { id: "gpt-4o", name: "GPT-4o" },
        { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      ]
    }

    if (provider === "gemini") {
      /*const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
        method: "GET",
      })
      if (!response.ok) return []
      const data = await response.json()
      return data.models.map((m: any) => ({
        id: m.name.replace("models/", ""),
        name: m.displayName || m.name.replace("models/", ""),
      })) */
      return [
        { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
        { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite" },

        { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
        { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite" },

        { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
        { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
      ]
    }

    if (provider === "claude") {
      // Anthropic does not have a list models endpoint.
      // Using a curated list of the most common/latest models.
      return [
        { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet" },
        { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
        { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
      ]
    }
  } catch (error) {
    console.error(`Failed to fetch models for ${provider}:`, error)
  }
  return []
}
