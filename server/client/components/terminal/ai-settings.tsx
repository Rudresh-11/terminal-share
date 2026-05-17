// server/client/components/terminal/ai-settings.tsx
"use client"

import { useState, useEffect } from "react"
import { AIProvider, useAIConfig } from "@/hooks/use-ai-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Eye, EyeOff, Check } from "lucide-react"

interface AISettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function AISettings({ isOpen, onClose }: AISettingsProps) {
  const { config, updateKey, setProvider } = useAIConfig()

  // Local state for input values across different providers
  const [localKeys, setLocalKeys] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Sync global config keys to local state when opened or updated
  useEffect(() => {
    if (config?.keys) {
      setLocalKeys(config.keys)
    }
  }, [config.keys])

  // Reset saved indicator when provider changes
  useEffect(() => {
    setIsSaved(false)
  }, [config.provider])

  if (!isOpen) return null

  const currentProvider = config.provider
  const currentKeyValue = localKeys[currentProvider] || ""

  const handleSave = () => {
    updateKey(currentProvider, currentKeyValue)
    setIsSaved(true)

    // Reset success checkmark after 2 seconds
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md border-border/50 bg-background shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 px-6 py-4">
          <CardTitle className="text-sm font-medium tracking-widest uppercase">
            AI Configuration
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="block text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Select Provider
            </label>
            <div className="flex gap-2">
              {(["openai", "claude", "gemini"] as AIProvider[]).map((p) => (
                <Button
                  key={p}
                  variant={currentProvider === p ? "default" : "outline"}
                  onClick={() => setProvider(p)}
                  className="h-8 flex-1 text-xs capitalize"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          {/* API Key Input Field */}
          <div className="space-y-3">
            <label className="block text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              API Key
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={`Enter ${currentProvider} API Key`}
                value={currentKeyValue}
                onChange={(e) =>
                  setLocalKeys({
                    ...localKeys,
                    [currentProvider]: e.target.value,
                  })
                }
                className="h-10 rounded-none pr-10 font-mono text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Button
              onClick={handleSave}
              className="h-8 w-full rounded-none text-xs transition-all"
              variant={isSaved ? "secondary" : "default"}
              disabled={!currentKeyValue.trim()}
            >
              {isSaved ? (
                <span className="flex items-center gap-1 font-medium text-green-500">
                  <Check className="h-3.5 w-3.5" /> Key Saved
                </span>
              ) : (
                "Save Key"
              )}
            </Button>
          </div>

          {/* Local Storage Privacy Note */}
          <div className="rounded-sm border border-border/50 bg-muted/30 p-3">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Keys are stored locally in your browser and never sent to our
              servers. They are used directly to call the AI provider's API.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
