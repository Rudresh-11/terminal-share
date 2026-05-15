// app/page.tsx

"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Copy, Gift, Monitor, Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Page() {
  const router = useRouter()
  const [sessionCode, setSessionCode] = useState("")
  const [copied, setCopied] = useState<"install" | "run" | null>(null)

  const copyText = async (text: string, type: "install" | "run") => {
    await navigator.clipboard.writeText(text)

    setCopied(type)

    setTimeout(() => {
      setCopied(null)
    }, 1200)
  }

  function joinSession() {
    if (sessionCode.length !== 6) return

    router.push(`/session/${sessionCode}`)
  }
  return (
    <main className="min-h-screen border-border bg-background text-foreground">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="#"
            className="flex items-center gap-3 text-sm font-medium tracking-[0.2em]"
          >
            <div className="flex h-7 w-7 items-center justify-center border text-xs">
              T
            </div>

            <span>
              TERMINAL<span className="text-muted-foreground">.</span>SHARE
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-xs tracking-[0.18em] text-muted-foreground uppercase">
            <Link href="#how-it-works" className="hover:text-foreground">
              Protocol
            </Link>

            <Link href="#" className="hover:text-foreground">
              Documentation
            </Link>

            <Button
              asChild
              variant="outline"
              className="h-8 rounded-none px-3 text-[11px]"
            >
              <Link
                href="https://github.com/Rudresh-11/terminal-share"
                target="_blank"
              >
                <Gift className="mr-2 h-3.5 w-3.5" />
                Gift
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-12 px-6 py-12 lg:grid-cols-2 lg:items-center">
        {/* LEFT */}
        <div>
          <div className="mb-5 text-xs tracking-[0.3em] text-muted-foreground uppercase">
            {"// Secure Remote Terminal Mirroring"}
          </div>

          <h1 className="max-w-xl text-5xl leading-none tracking-tight md:text-7xl">
            Live Stream
            <br />
            Your Terminal.
          </h1>

          <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">
            Simple, secure terminal sharing for collaborative debugging and
            demonstrations. Zero configuration required.
          </p>

          <div className="mt-12 border-t pt-8">
            <div className="mb-4 text-xs tracking-[0.25em] text-muted-foreground uppercase">
              Enter Access Code
            </div>

            <div className="flex max-w-md gap-0">
              <Input
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                placeholder="ENTER 6-DIGIT CODE"
                maxLength={6}
                className="h-12 rounded-none border-r-0 text-center tracking-[0.35em]"
              />

              <Button
                onClick={joinSession}
                className="h-12 rounded-none px-6 tracking-[0.18em] uppercase"
              >
                Join Session
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* HOST CARD */}
          <Card className="rounded-none">
            <CardHeader className="border-b pb-4">
              <div className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                Host a Session
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <p className="text-sm leading-7 text-muted-foreground">
                Requires{" "}
                <Link
                  href="https://nodejs.org/en/download"
                  target="_blank"
                  className="text-foreground underline underline-offset-4"
                >
                  Node.js
                </Link>{" "}
                to be installed on the host machine.
              </p>

              <div className="space-y-3">
                <div className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
                  Install Globally
                </div>

                <div className="flex items-center justify-between border bg-muted/40 px-4 py-3 text-sm">
                  <code>npm i -g @rudresh-11/termirror</code>

                  <button
                    onClick={() =>
                      copyText("npm i -g @rudresh-11/termirror", "install")
                    }
                    className="flex items-center gap-2 text-xs tracking-[0.18em] text-muted-foreground uppercase transition hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied === "install" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
                  Start Session
                </div>

                <div className="flex items-center justify-between border bg-muted/40 px-4 py-3 text-sm">
                  <code>termirror</code>

                  <button
                    onClick={() => copyText("termirror", "run")}
                    className="flex items-center gap-2 text-xs tracking-[0.18em] text-muted-foreground uppercase transition hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied === "run" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TERMINAL MOCK */}
          <Card className="overflow-hidden rounded-none">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>

            <div className="space-y-2 bg-muted/20 p-5 font-mono text-sm">
              <div>
                <span className="text-green-500">guest@terminal:~$</span>{" "}
                <span>termirror</span>
              </div>

              <div className="text-muted-foreground">
                [info] Initializing PTY layer...
              </div>

              <div className="text-muted-foreground">
                [info] Connected to relay node-1
              </div>

              <div className="text-green-500">
                [ok] Streaming active at room: 48F-A29
              </div>

              <div className="pt-2">
                <span className="text-green-500">master</span>{" "}
                <span>git status</span>
              </div>

              <div className="text-muted-foreground"># On branch master</div>

              <div className="text-muted-foreground">
                # Your branch is up to date with 'origin/master'.
              </div>

              <div className="h-4 w-2 animate-pulse bg-green-500" />
            </div>
          </Card>

          {/* STATS */}
          <div className="grid grid-cols-2 border">
            <div className="border-r p-6">
              <div className="mb-2 text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
                Global Uplink
              </div>

              <div className="text-4xl">1.2 Gbps</div>
            </div>

            <div className="p-6">
              <div className="mb-2 text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
                Relay Nodes
              </div>

              <div className="text-4xl">42 Active</div>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="border-y">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5" />
            Pipes via Node-PTY & xterm.js
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Live — Latency &lt;14ms avg
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-28">
        <div className="mb-4 text-xs tracking-[0.3em] text-muted-foreground uppercase">
          // How it Works
        </div>

        <h2 className="max-w-2xl text-4xl leading-tight md:text-6xl">
          Three steps to
          <br />
          real-time collaboration.
        </h2>

        <div className="mt-16 grid border md:grid-cols-3">
          {[
            {
              step: "Step 01",
              title: "Run the Agent",
              desc: "Start the agent on your host machine. It will generate a unique 6-digit session code.",
              icon: Terminal,
            },
            {
              step: "Step 02",
              title: "Share the Code",
              desc: "Give that 6-digit code to your collaborator or enter it here on the website.",
              icon: ArrowRight,
            },
            {
              step: "Step 03",
              title: "Real-time Mirroring",
              desc: "The collaborator sees your terminal output and can send keystrokes back in real-time.",
              icon: Monitor,
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className={`p-8 ${
                index !== 2 ? "border-b md:border-r md:border-b-0" : ""
              }`}
            >
              <item.icon className="mb-6 h-5 w-5 text-muted-foreground" />

              <div className="mb-4 text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
                {item.step}
              </div>

              <h3 className="mb-4 text-lg">{item.title}</h3>

              <p className="text-sm leading-7 text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-xs tracking-[0.18em] text-muted-foreground uppercase md:flex-row md:items-center md:justify-between">
          <div className="flex gap-6">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Contact</Link>
          </div>

          <div>© 2026 Terminal Share / Terminal Protocol Labs</div>
        </div>
      </footer>
    </main>
  )
}
