// server/client/hooks/use-ai-config.ts
import { useState, useEffect } from "react"

export type AIProvider = "openai" | "claude" | "gemini"

export interface AIConfig {
  provider: AIProvider
  model: string
  keys: {
    openai?: string
    claude?: string
    gemini?: string
  }
}

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig>({
    provider: "openai",
    model: "",
    keys: {},
  })

  useEffect(() => {
    const loadConfig = () => {
      const saved = localStorage.getItem("ai-config")
      if (saved) {
        try {
          setConfig(JSON.parse(saved))
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

  const setModel = (model: string) => {
    setConfig((prev) => {
      const newConfig = { ...prev, model }
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
