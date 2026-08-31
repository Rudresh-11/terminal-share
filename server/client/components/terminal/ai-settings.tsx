// server/client/components/terminal/ai-settings.tsx
"use client"

import { useState, useEffect } from "react"
import { AIProvider, AIProviderMap, useAIConfig } from "@/hooks/use-ai-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Eye, EyeOff, Check, Loader2, CircleAlert } from "lucide-react"

interface AISettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function AISettings({ isOpen, onClose }: AISettingsProps) {
  const { config, updateKey, setProvider } = useAIConfig()

  // Local state for input values across different providers
  const [localKeys, setLocalKeys] = useState<AIProviderMap>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [testMessage, setTestMessage] = useState("")
  const [siteOrigin] = useState(() => (typeof window !== "undefined" ? window.location.origin : ""))

  // Sync global config keys to local state when opened or updated
  useEffect(() => {
    if (config?.keys) {
      setLocalKeys(config.keys)
    }
  }, [config.keys])

  // Reset saved indicator when provider changes
  useEffect(() => {
    setIsSaved(false)
    setTestStatus("idle")
    setTestMessage("")
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

  const handleTestConnection = async () => {
    setTestStatus("testing")
    setTestMessage("")

    const base = currentKeyValue.trim().replace(/\/$/, "")
    const url = /^https?:\/\//.test(base) ? base : `https://${base}`

    try {
      const response = await fetch(`${url}/api/tags`)
      if (!response.ok) {
        setTestStatus("error")
        setTestMessage(
          `Server responded with ${response.status}. If the URL is correct, this is almost always Ollama blocking this site's origin — see the note below.`
        )
        return
      }
      const data = await response.json()
      const count = data.models?.length ?? 0
      setTestStatus("success")
      setTestMessage(
        count > 0
          ? `Connected — found ${count} model${count === 1 ? "" : "s"} ready to use.`
          : "Connected, but no models are pulled yet. Run `ollama pull <model>` on the machine running Ollama."
      )
    } catch {
      setTestStatus("error")
      setTestMessage(
        "Couldn't reach the server. Check that Ollama and the tunnel are running, and that Ollama's allowed origins include this site — see the note below."
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md border-border/50 bg-background shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 px-6 py-4">
          <CardTitle className="text-sm font-medium tracking-widest uppercase">AI Configuration</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
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
              {(["openai", "claude", "gemini", "local"] as AIProvider[]).map((p) => (
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

          {/* API Key / Endpoint Input Field */}
          <div className="space-y-3">
            <label className="block text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              {currentProvider === "local" ? "Cloudflare Tunnel URL" : "API Key"}
            </label>
            <div className="relative">
              <Input
                type={currentProvider === "local" ? "text" : showPassword ? "text" : "password"}
                placeholder={
                  currentProvider === "local" ? "https://xyz.trycloudflare.com" : `Enter ${currentProvider} API Key`
                }
                value={currentKeyValue}
                onChange={(e) => {
                  setLocalKeys({
                    ...localKeys,
                    [currentProvider]: e.target.value,
                  })
                  if (currentProvider === "local") {
                    setTestStatus("idle")
                    setTestMessage("")
                  }
                }}
                className="h-10 rounded-none pr-10 font-mono text-xs"
              />
              {currentProvider !== "local" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="h-8 flex-1 rounded-none text-xs transition-all"
                variant={isSaved ? "secondary" : "default"}
                disabled={!currentKeyValue.trim()}
              >
                {isSaved ? (
                  <span className="flex items-center gap-1 font-medium text-green-500">
                    <Check className="h-3.5 w-3.5" /> {currentProvider === "local" ? "Endpoint Saved" : "Key Saved"}
                  </span>
                ) : currentProvider === "local" ? (
                  "Save Endpoint"
                ) : (
                  "Save Key"
                )}
              </Button>

              {currentProvider === "local" && (
                <Button
                  onClick={handleTestConnection}
                  variant="outline"
                  className="h-8 flex-1 rounded-none text-xs"
                  disabled={!currentKeyValue.trim() || testStatus === "testing"}
                >
                  {testStatus === "testing" ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Testing...
                    </span>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
              )}
            </div>

            {currentProvider === "local" && testStatus !== "idle" && testStatus !== "testing" && (
              <div
                className={`flex items-start gap-2 rounded-sm border p-3 text-[10px] leading-relaxed ${
                  testStatus === "success"
                    ? "border-green-500/30 bg-green-500/10 text-green-500"
                    : "border-red-500/30 bg-red-500/10 text-red-400"
                }`}
              >
                {testStatus === "success" ? (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <span>{testMessage}</span>
              </div>
            )}
          </div>

          {/* Local Storage Privacy Note */}
          <div className="rounded-sm border border-border/50 bg-muted/30 p-3">
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              {currentProvider === "local"
                ? "The tunnel URL is stored locally in your browser and never sent to our servers. Commands are generated by calling that URL directly from your browser."
                : "Keys are stored locally in your browser and never sent to our servers. They are used directly to call the AI provider's API."}
            </p>
          </div>

          {currentProvider === "local" && (
            <div className="space-y-2 rounded-sm border border-border/50 bg-muted/30 p-3">
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">How to connect</p>
              <ol className="list-decimal space-y-2 pl-4 text-[10px] leading-relaxed text-muted-foreground">
                <li>
                  Install <a
                    href="https://ollama.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground underline"
                  >
                    Ollama
                  </a>{" "}
                  and pull a model, e.g. <code className="font-mono text-foreground">ollama pull llama3.2</code>.
                </li>
                <li>
                  Allow this site to call it. Before starting Ollama, set:
                  <br />
                  <code className="mt-1 block break-all rounded bg-black/30 px-2 py-1 font-mono text-foreground">
                    OLLAMA_ORIGINS={siteOrigin || "https://your-app-domain"}
                  </code>
                  then (re)start Ollama — it only reads this on startup. Use{" "}
                  <code className="font-mono text-foreground">OLLAMA_ORIGINS=*</code> instead to allow every origin
                  (simpler, less strict).
                </li>
                <li>
                  Expose it publicly with a tunnel, e.g.{" "}
                  <code className="font-mono text-foreground">cloudflared tunnel --url http://localhost:11434</code>{" "}
                  (or a VS Code dev tunnel), and paste the resulting HTTPS URL above.
                </li>
                <li>
                  Click <span className="text-foreground">Save Endpoint</span>, then{" "}
                  <span className="text-foreground">Test Connection</span> to confirm it works before asking the AI
                  anything.
                </li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
