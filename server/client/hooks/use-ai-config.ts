// server/client/hooks/use-ai-config.ts
import { useState, useEffect } from "react"

export type AIProvider = "openai" | "claude" | "gemini"

export interface AIConfig {
  provider: AIProvider
  keys: {
    openai?: string
    claude?: string
    gemini?: string
  }
}

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig>({
    provider: "openai",
    keys: {},
  })

  useEffect(() => {
    const loadConfig = async () => {
      const saved = localStorage.getItem("ai-config")
      if (saved) {
        try {
          setConfig(JSON.parse(saved))
        } catch (e) {
          console.error("Failed to parse AI config", e)
        }
      }
    }
    loadConfig()
  }, [])

  const updateKey = (provider: AIProvider, key: string) => {
    const newConfig = {
      ...config,
      keys: {
        ...config.keys,
        [provider]: key,
      },
    }
    setConfig(newConfig)
    localStorage.setItem("ai-config", JSON.stringify(newConfig))
  }

  const setProvider = (provider: AIProvider) => {
    const newConfig = { ...config, provider }
    setConfig(newConfig)
    localStorage.setItem("ai-config", JSON.stringify(newConfig))
  }

  return { config, updateKey, setProvider }
}
