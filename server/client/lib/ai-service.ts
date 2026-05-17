// server/client/lib/ai-service.ts
import { AIProvider } from "@/hooks/use-ai-config"
import { toast } from "sonner"

export async function generateCommand(
  provider: AIProvider,
  key: string,
  prompt: string
): Promise<string> {
  const systemPrompt = `You are an AI assistant controlling a remote terminal.
Your goal is to convert the user's natural language request into valid shell commands.
- Do NOT use markdown formatting (no \`\`\` or \` symbols).
- Do NOT provide explanations or preamble.
- If the request is unclear or dangerous, return an empty string.
- Assume a Linux environment.
- Keep the command concise.
Your output exact format should be : 
{
  response: string
  command: string
}
` // MOCK MODE
  // MOCK MODE
  if (key.startsWith("test-")) {
    const mockCommands: Record<string, { response: string; command: string }> =
      {
        list: { response: "List all files", command: "ls -la" },
        disk: { response: "Check disk usage", command: "df -h" },
        memory: { response: "Show memory usage", command: "free -h" },
        process: { response: "List running processes", command: "ps aux" },
        network: {
          response: "Show network interfaces",
          command: "ip addr show",
        },
        cpu: { response: "Show CPU info", command: "lscpu" },
        uptime: { response: "Show system uptime", command: "uptime" },
        whoami: { response: "Show current user", command: "whoami" },
      }

    const lower = prompt.toLowerCase()
    const match = Object.entries(mockCommands).find(([key]) =>
      lower.includes(key)
    )

    const result = match?.[1] ?? {
      response: `Mock response for: ${prompt}`,
      command: `echo "mock: ${prompt.slice(0, 40)}"`,
    }

    // Simulate variable latency like a real API
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800))

    return JSON.stringify(result)
  }
  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        // reasoning: {effort: "low"},
        input: [
          { role: "developer", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0,
      }),
    })
    const data = await response.json()
    if (data.error) {
      toast.error(data.error.message || "OpenAI API error")
      return ""
    }
    return data.choices[0]?.message?.content?.trim() || ""
  }

  if (provider === "claude") {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: key,
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 256,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    })
    const data = await response.json()
    if (data.error) {
      toast.error(data.error.message || "Claude API error")
      return ""
    }
    return data.content[0]?.text?.trim() || ""
  }

  if (provider === "gemini") {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
            {
              role: "model",
              parts: [{ text: systemPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 100,
          },
        }),
      }
    )
    const data = await response.json()
    if (data.error) {
      toast.error(data.error.message || "Gemini API error")
      return ""
    }
    const candidate = data.candidates?.[0]
    if (!candidate || candidate.finishReason === "MAX_TOKENS") {
      toast.error("Gemini Reached max token limit")
      return ""
    }
    const parts = candidate.content?.parts ?? []

    const textPart = parts.find(
      (p: { thought?: boolean; text?: string }) => !p.thought && p.text
    )

    return textPart?.text?.trim() || ""
  }
  throw new Error("Unsupported AI provider")
}
