// app/session/[code]/page.tsx

import TerminalView from "@/components/terminal/terminal-view"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  return (
    <main className="h-screen overflow-hidden bg-background">
      <TerminalView sessionCode={code} />
    </main>
  )
}
