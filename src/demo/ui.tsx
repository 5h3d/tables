import * as React from 'react'

export function PageIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{description}</p>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = React.useState<{ id: number; text: string } | null>(null)
  const show = React.useCallback((text: string) => setToast({ id: Date.now(), text }), [])
  React.useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(id)
  }, [toast])
  return { toast, show }
}

export function Toast({ toast }: { toast: { id: number; text: string } | null }) {
  if (!toast) return null
  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-background shadow-menu"
    >
      {toast.text}
    </div>
  )
}
