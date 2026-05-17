"use client"

import { useState } from "react"

import { Sparkles, Loader2, Terminal, ChevronRight, Bot } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
} from "@/components/ui/sidebar"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import AISettings from "./ai-settings"

import { useAIConfig } from "@/hooks/use-ai-config"
import { generateCommand } from "@/lib/ai-service"
import { socket } from "@/lib/socket"
import { Settings } from "lucide-react"

import { toast } from "sonner"

type Props = {
  sessionCode: string
}

type AIMessage = {
  id: string
  prompt: string
  response: string
  command: string
}

export default function AISidebar({ sessionCode }: Props) {
  const { config, setProvider } = useAIConfig()
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleAI = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) return

    const key = config.keys[config.provider]

    if (!key) {
      toast.error(`Configure ${config.provider} API key first`)
      return
    }

    setIsLoading(true)

    try {
      const result = await generateCommand(config.provider, key, prompt)
      if (!result) {
        toast.error("AI failed to generate response")
        return
      }
      const parsed = JSON.parse(result)

      const message: AIMessage = {
        id: crypto.randomUUID(),
        prompt,
        response: parsed.response,
        command: parsed.command,
      }

      setMessages((prev) => [message, ...prev])
    } catch (err: any) {
      toast.error(err.message || "AI request failed")
    } finally {
      setIsLoading(false)
      setPrompt("")
    }
  }

  const executeCommand = (command: string) => {
    socket.emit("terminal-input", {
      sessionId: sessionCode,
      data: command + "\n",
    })

    toast.success("Executing command")
  }

  return (
    <Sidebar
      side="right"
      variant="sidebar"
      collapsible="offcanvas"
      className="border-l border-border"
    >
      {/* Header */}
      <SidebarHeader className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">AI Assistant</span>
              <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                {config.provider}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="h-8 w-8 rounded-full p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup className="h-full px-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-4">
              {messages.length === 0 && (
                <>
                  <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                    Ask AI to debug logs, generate commands, install packages,
                    explain errors, or automate workflows.
                  </div>
                  <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                    Use <kbd>ctrl</kbd> + <kbd>b</kbd> to toggle this sidebar.
                  </div>
                </>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="overflow-hidden rounded-xl border border-border bg-muted/20"
                >
                  {/* Prompt */}
                  <div className="border-b border-border px-3 py-3">
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      Prompt
                    </div>
                    <div className="text-sm leading-relaxed">{msg.prompt}</div>
                  </div>

                  {/* Response */}
                  <div className="border-b border-border px-3 py-3">
                    <div className="mb-2 text-xs text-muted-foreground">
                      Output
                    </div>
                    <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {msg.response}
                    </pre>
                  </div>

                  {/* Command */}
                  <div className="space-y-2 px-3 py-3">
                    <div className="text-xs text-muted-foreground">Command</div>
                    <code className="block overflow-x-auto rounded-md bg-black/40 px-2 py-2 font-mono text-xs">
                      {msg.command}
                    </code>
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => executeCommand(msg.command)}
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      Execute Command
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border p-3">
        <form onSubmit={handleAI} className="flex items-center gap-2">
          {/* Cleaned up Select Trigger to show actual provider name cleanly */}
          <Select
            value={config.provider}
            onValueChange={(value) => setProvider(value as any)}
          >
            <SelectTrigger className="h-8 w-[90px] bg-muted/50 text-xs capitalize">
              <SelectValue placeholder="Model" />
            </SelectTrigger>

            <SelectContent align="start">
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
            </SelectContent>
          </Select>

          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask ${config.provider}...`}
            className="h-8 flex-1 text-sm"
          />

          <Button
            type="submit"
            disabled={isLoading}
            size="icon"
            className="h-8 w-8 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </form>
      </SidebarFooter>

      <AISettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </Sidebar>
  )
}
