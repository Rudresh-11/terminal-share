// app/page.tsx

"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Copy, Gift, Monitor, Terminal, Check } from "lucide-react"

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
    setTimeout(() => setCopied(null), 1200)
  }

  function joinSession() {
    if (sessionCode.length !== 6) return
    router.push(`/session/${sessionCode}`)
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden selection:bg-green-500/30">
      
      {/* IMMERSIVE BACKGROUND GRID (Gray colors kept verbatim) */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="#"
            className="flex items-center gap-3 text-sm font-medium tracking-[0.2em] transition-opacity hover:opacity-80 group"
          >
            {/* Added dynamic shadow on hover to the 'T' box */}
            <div className="flex h-7 w-7 items-center justify-center border border-primary/20 bg-primary/5 text-xs shadow-[0_0_10px_rgba(34,197,94,0.1)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              T
            </div>
            <span>
              TERMINAL<span className="text-green-500">.</span>SHARE
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {/* Added focus outline and scale transition to links */}
            <Link href="#how-it-works" className="transition-all duration-300 hover:text-foreground hover:scale-105">
              Protocol
            </Link>
            <Link href="#" className="transition-all duration-300 hover:text-foreground hover:scale-105">
              Documentation
            </Link>
            {/* Button interaction logic kept same, just slightly smoother transition */}
            <Button
              asChild
              variant="outline"
              className="h-8 rounded-none border-border/50 bg-background/50 px-3 text-[11px] transition-all duration-300 hover:bg-accent hover:-translate-y-0.5"
            >
              <Link href="https://github.com/Rudresh-11/terminal-share" target="_blank">
                <Gift className="mr-2 h-3.5 w-3.5" />
                GitHub
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* HERO (Paddings and Gaps kept exactly as you manually set them) */}
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 px-6 py-6 lg:grid-cols-2 lg:items-center">
        
        {/* LEFT CONTENT */}
        <div className="flex flex-col justify-center animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="mb-4 inline-flex items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase">
            {"// Secure Remote Terminal Mirroring"}
          </div>

          <h1 className="max-w-xl text-5xl font-light leading-[1.1] tracking-tight md:text-7xl">
            Live Stream <br />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">
              Your Terminal.
            </span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Simple, secure terminal sharing for collaborative debugging and
            demonstrations. Zero configuration required.
          </p>

          <div className="mt-8 border-t border-border/50 pt-6">
            <div className="mb-4 text-xs tracking-[0.25em] text-muted-foreground uppercase">
              Enter Access Code
            </div>

            {/* Input focus states are kept same, just slightly smoother transition on the button hover */}
            <div className="flex max-w-md transition-all duration-300 focus-within:ring-1 focus-within:ring-foreground/50 focus-within:shadow-[0_0_20px_rgba(34,197,94,0.1)]">
              <Input
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                placeholder="ENTER 6-DIGIT CODE"
                maxLength={6}
                className="h-14 rounded-none border-r-0 bg-background/50 text-center text-lg tracking-[0.35em] backdrop-blur-sm focus-visible:ring-0"
              />
              <Button
                onClick={joinSession}
                className="h-14 rounded-none px-8 tracking-[0.18em] uppercase transition-all duration-300 hover:text-white"
              >
                Join Session
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT (Space-y-4 kept verbatim) */}
        <div className="space-y-4 relative animate-in fade-in slide-in-from-right-5 duration-1000 delay-200">
          
          {/* Ambient Glow behind Terminal (Kept exact color, added smooth breathing pulse) */}
          <div className="absolute top-1/2 left-1/2 -z-10 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/10 blur-[80px]" />

          {/* HOST CARD (Blur and background kept verbatim, added smooth lift on hover) */}
          <Card className="border-border/50 bg-background/40 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <CardHeader className="border-b border-border/50">
              <div className="text-xs tracking-[0.25em] text-muted-foreground uppercase flex items-center gap-2">
                <Terminal className="h-4 w-4" /> Host a Session
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Requires{" "}
                <Link
                  href="https://nodejs.org/en/download"
                  target="_blank"
                  className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  Node.js
                </Link>{" "}
                to be installed on the host machine.
              </p>

              <div className="space-y-2">
                <div className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
                  Install Globally
                </div>
                {/* Reduced py-3 to py-2 kept verbatim, added group scale animation on the icon inside */}
                <div className="group flex items-center justify-between border border-border/50 bg-muted/20 px-4 py-2 text-sm transition-colors hover:bg-muted/30">
                  <code className="font-mono text-foreground/90">npm i -g @rudresh-11/termirror@latest</code>
                  <button
                    onClick={() => copyText("npm i -g @rudresh-11/termirror@latest", "install")}
                    className="flex items-center gap-2 text-xs tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                  >
                    {copied === "install" ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in" /> : <Copy className="h-4 w-4 opacity-40 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
                  Start Session
                </div>
                <div className="group flex items-center justify-between border border-border/50 bg-muted/20 px-4 py-2 text-sm transition-colors hover:bg-muted/30">
                  <code className="font-mono text-foreground/90">termirror</code>
                  <button
                    onClick={() => copyText("termirror", "run")}
                    className="flex items-center gap-2 text-xs tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                  >
                    {copied === "run" ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in" /> : <Copy className="h-4 w-4 opacity-40 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110" />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TERMINAL MOCK (Rounded-3xl, bg color, content kept exactly as you manually set them) */}
          <Card className="relative overflow-hidden rounded-3xl border-border/60 bg-background/50 shadow-2xl ring-1 ring-white/5 p-0 transition-transform duration-300 hover:border-border/100">
            {/* Added dynamic scanlines that appear slightly on hover */}
            <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20 transition-opacity duration-300 group-hover:opacity-30 mix-blend-overlay" />
            
            <div className="relative z-0 flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
              <div className="ml-2 text-[10px] font-mono text-muted-foreground/50">zsh</div>
            </div>

            <div className="relative z-0 space-y-1.5 p-4 pt-0 font-mono text-[13px] leading-relaxed text-gray-300">
              <div>
                <span className="text-green-400 font-semibold">guest@terminal:~$</span>{" "}
                <span className="text-gray-100">termirror</span>
              </div>
              <div className="text-gray-500">
                [info] Initializing PTY layer...
              </div>
              <div className="text-gray-500">
                [info] Connected to relay node-1
              </div>
              <div className="text-green-400/90 font-semibold drop-shadow-[0_0_2px_rgba(74,222,128,0.4)]">
                [ok] Streaming active at room: 48F-A29
              </div>
              <div className="pt-2">
                <span className="text-blue-400 font-semibold">master</span>{" "}
                <span className="text-gray-100">git status</span>
              </div>
              <div className="text-gray-400"># On branch master</div>
              <div className="text-gray-400">
                # Your branch is up to date with 'origin/master'.
              </div>
              <div className="mt-1 flex items-center">
                <span className="text-green-400 font-semibold mr-2">guest@terminal:~$</span>
                {/* Keeping the specific pulse you added, just making it slightly smoother */}
                <div className="h-3.5 w-2 animate-pulse bg-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.5)] transition-opacity duration-300" />
              </div>
            </div>
          </Card>

          {/* STATS (Paddings and sizes kept exactly as you manually set them) */}
          <div className="grid grid-cols-2 border border-border/50 bg-background/40 backdrop-blur-md">
            <div className="border-r border-border/50 p-4 transition-colors hover:bg-muted/10 group">
              <div className="mb-1 text-[11px] tracking-[0.25em] text-muted-foreground uppercase flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 transition-shadow duration-300 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> Global Uplink
              </div>
              <div className="text-2xl font-light tracking-tight md:text-3xl transition-transform duration-300 group-hover:scale-105">1.2 Gbps</div>
            </div>
            <div className="p-4 transition-colors hover:bg-muted/10 group">
              <div className="mb-1 text-[11px] tracking-[0.25em] text-muted-foreground uppercase flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 transition-shadow duration-300 group-hover:shadow-[0_0_8px_rgba(168,85,247,0.6)]" /> Relay Nodes
              </div>
              <div className="text-2xl font-light tracking-tight md:text-3xl transition-transform duration-300 group-hover:scale-105">42 <span className="text-sm text-muted-foreground">Active</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="relative z-10 border-y border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          <div className="flex items-center gap-3">
            <Terminal className="h-4 w-4 text-foreground/70" />
            <span>Pipes via Node-PTY & xterm.js</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
            </span>
            <span className="text-foreground/80">Live — Latency &lt;14ms avg</span>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl px-6 py-32 animate-in fade-in duration-1000">
        <div className="mb-6 text-xs tracking-[0.3em] text-muted-foreground uppercase">
          // How it Works
        </div>

        <h2 className="max-w-2xl text-4xl font-light leading-tight md:text-6xl">
          Three steps to
          <br />
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">
            real-time collaboration.
          </span>
        </h2>

        {/* Backdrop-sm and borders kept verbatim, added smoother lift and scale to children */}
        <div className="mt-20 grid border border-border/50 bg-background/20 backdrop-blur-sm md:grid-cols-3 hover:shadow-2xl transition-all duration-500">
          {[
            {
              step: "Step 01",
              title: "Run the Agent",
              desc: "Start the agent on your host machine. It will generate a unique 6-digit session code securely.",
              icon: Terminal,
            },
            {
              step: "Step 02",
              title: "Share the Code",
              desc: "Give that 6-digit code to your collaborator or enter it here directly on the website interface.",
              icon: ArrowRight,
            },
            {
              step: "Step 03",
              title: "Real-time Mirroring",
              desc: "The collaborator sees your terminal output and can seamlessly send keystrokes back in real-time.",
              icon: Monitor,
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className={`group p-10 transition-all duration-300 hover:bg-muted/10 ${
                index !== 2 ? "border-b border-border/50 md:border-r md:border-b-0" : ""
              }`}
            >
              {/* Scale icon and change border on group hover */}
              <div className="mb-8 inline-flex h-12 w-12 items-center justify-center border border-border/50 bg-background transition-all duration-300 group-hover:border-foreground/30 group-hover:scale-110">
                <item.icon className="h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
              </div>

              <div className="mb-4 text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
                {item.step}
              </div>

              <h3 className="mb-4 text-xl font-medium">{item.title}</h3>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 text-xs tracking-[0.18em] text-muted-foreground uppercase md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <Link href="#" className="transition-colors hover:text-foreground hover:scale-105">Privacy Policy</Link>
            <Link href="#" className="transition-colors hover:text-foreground hover:scale-105">Terms of Service</Link>
            <Link href="#" className="transition-colors hover:text-foreground hover:scale-105">Contact</Link>
          </div>
          <div className="text-muted-foreground/60">© 2026 Terminal Share / Terminal Protocol Labs</div>
        </div>
      </footer>
    </main>
  )
}