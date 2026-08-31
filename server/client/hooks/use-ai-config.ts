// server/client/hooks/use-ai-config.ts
import { useState, useEffect } from "react"

export type AIProvider = "openai" | "claude" | "gemini" | "local"

export interface AIProviderMap {
  openai?: string
  claude?: string
  gemini?: string
  // For "local", this holds the Cloudflare Tunnel base URL (e.g. https://xyz.trycloudflare.com)
  // fronting an Ollama server, not an API key.
  local?: string
}

export interface AIConfig {
  provider: AIProvider
  // Model selection is scoped per provider so switching providers never carries
  // over a model id (e.g. an OpenAI model) that doesn't exist for the new one.
  models: AIProviderMap
  keys: AIProviderMap
}

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig>({
    provider: "openai",
    models: {},
    keys: {},
  })

  useEffect(() => {
    const loadConfig = () => {
      const saved = localStorage.getItem("ai-config")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Migrate the old single shared `model: string` shape if present.
          setConfig({
            provider: parsed.provider ?? "openai",
            models: parsed.models ?? (parsed.model ? { [parsed.provider]: parsed.model } : {}),
            keys: parsed.keys ?? {},
          })
        } catch (e) {
          console.error("Failed to parse AI config", e)
        }
      }
    }

    // 1. Load initially
    loadConfig()

    // 2. Listen for our custom sync event from other components
    window.addEventListener("ai-config-updated", loadConfig)

    return () => {
      window.removeEventListener("ai-config-updated", loadConfig)
    }
  }, [])

  const updateKey = (provider: AIProvider, key: string) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        keys: {
          ...prev.keys,
          [provider]: key,
        },
      }
      localStorage.setItem("ai-config", JSON.stringify(newConfig))
      window.dispatchEvent(new Event("ai-config-updated"))
      return newConfig
    })
  }

  const setModel = (provider: AIProvider, model: string) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        models: {
          ...prev.models,
          [provider]: model,
        },
      }
      localStorage.setItem("ai-config", JSON.stringify(newConfig))
      window.dispatchEvent(new Event("ai-config-updated"))
      return newConfig
    })
  }

  const setProvider = (provider: AIProvider) => {
    setConfig((prev) => {
      const newConfig = { ...prev, provider }
      localStorage.setItem("ai-config", JSON.stringify(newConfig))
      window.dispatchEvent(new Event("ai-config-updated"))
      return newConfig
    })
  }

  return { config, updateKey, setProvider, setModel }
}
