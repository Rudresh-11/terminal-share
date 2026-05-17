// app/session/[code]/page.tsx

import TerminalView from "@/components/terminal/terminal-view"
import AISidebar from "@/components/terminal/ai-prompt"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "24rem",
        } as React.CSSProperties
      }
    >
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Main Terminal */}
        <SidebarInset className="flex-1 overflow-hidden">
          <main className="h-full w-full">
            <TerminalView sessionCode={code} />
          </main>
        </SidebarInset>

        {/* AI Sidebar */}
        <AISidebar sessionCode={code} />
      </div>
    </SidebarProvider>
  )
}
