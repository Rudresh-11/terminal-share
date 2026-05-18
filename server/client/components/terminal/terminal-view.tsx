"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { socket } from "@/lib/socket"
import { Button } from "@/components/ui/button"

type Props = {
  sessionCode: string
}

export default function TerminalView({ sessionCode }: Props) {
  const router = useRouter()
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const termRef = useRef<any>(null)
  const [viewerCount, setViewerCount] = useState(0)
  const [status, setStatus] = useState<"connecting" | "connected" | "invalid">("connecting")

  useEffect(() => {
    if (!terminalRef.current) return

    const container = terminalRef.current

    // Dynamically import xterm only in the browser
    Promise.all([import("xterm"), import("@xterm/addon-fit")]).then(([{ Terminal }, { FitAddon }]) => {
      const term = new Terminal({
        cursorBlink: true,
        convertEol: true,
        fontSize: 14,
        theme: { background: "#0a0a0a" },
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(container)

      requestAnimationFrame(() => {
        fitAddon.fit()
        term.focus()
      })

      termRef.current = term

      socket.connect()
      socket.emit("join-session", sessionCode)

      socket.on("session-joined", ({ status, message }) => {
        if (status === "success") {
          setStatus("connected")
          toast.success("Connected to terminal session")
        } else {
          setStatus("invalid")
          toast.error(message || "Invalid or expired session")
        }
      })

      socket.on("terminal-output", (data) => term.write(data))
      socket.on("viewer-count", (count) => setViewerCount(count))
      socket.on("user-connected", ({ viewers }) => toast.info(`New viewer joined (${viewers} viewers)`))
      socket.on("viewer-disconnected", ({ viewers }) => toast.info(`Viewer disconnected (${viewers} viewers left)`))
      socket.on("session-ended", () => {
        toast.error("Host disconnected")
        setTimeout(() => router.push("/"), 1500)
      })
      socket.on("connect_error", () => toast.error("Unable to connect to relay server"))

      term.onData((data) => socket.emit("terminal-input", { sessionId: sessionCode, data }))
      term.onResize(({ cols, rows }) => socket.emit("resize", { sessionId: sessionCode, cols, rows }))

      const handleResize = () => requestAnimationFrame(() => fitAddon.fit())
      window.addEventListener("resize", handleResize)

      // Store cleanup in a way the return can access it
      ;(container as any).__cleanup = () => {
        window.removeEventListener("resize", handleResize)
        socket.emit("leave-session", sessionCode)
        ;[
          "session-joined",
          "terminal-output",
          "viewer-count",
          "user-connected",
          "viewer-disconnected",
          "session-ended",
          "connect_error",
        ].forEach((ev) => socket.off(ev))
        socket.disconnect()
        term.dispose()
      }
    })

    return () => {
      ;(container as any).__cleanup?.()
    }
  }, [router, sessionCode])

  // ... keep your existing useEffect and state above ...

  return (
    <div className="relative flex h-screen flex-col bg-background">
      {/* INVALID SESSION OVERLAY */}
      {status === "invalid" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
          <div className="w-full max-w-md space-y-4 border p-8 text-center">
            <h1 className="text-3xl font-medium">Invalid Session</h1>
            <p className="text-sm text-muted-foreground">This session does not exist or has expired.</p>
            <Button className="w-full" onClick={() => router.push("/")}>
              Back Home
            </Button>
          </div>
        </div>
      )}

      {/* LOADING OVERLAY */}
      {status === "connecting" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Connecting to session...</p>
          </div>
        </div>
      )}

      {/* TERMINAL UI (Always in DOM so terminalRef is never null) */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="text-xs tracking-[0.25em] uppercase">Session {sessionCode}</span>
          <span className="text-xs text-green-500">{viewerCount} VIEWERS</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {/* Button 1: Leave Session */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                router.push("/")
                // Add any client-side routing or cleanup logic here if needed
              }}
            >
              Leave Session
            </Button>

            {/* Button 2: Stop Session */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                socket.emit("stop-session", sessionCode)
              }}
            >
              Stop Session
            </Button>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </div>
  )
}
