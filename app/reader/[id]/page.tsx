"use client"

import { AppNav } from "@/components/nav"
import { useLibrary } from "@/lib/library-store"
import { useParams } from "next/navigation"
import { PdfViewer } from "@/components/pdf-viewer"

export default function ReaderPage() {
  const params = useParams<{ id: string }>()
  const { id } = params
  const { getBookById } = useLibrary()
  const book = getBookById(id)
  const url = book?.pdfUrl

  return (
    <main>
      <AppNav />
      <section className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-3 text-xl font-semibold">Reader</h1>
        {url ? (
          <PdfViewer url={url} />
        ) : (
          <p className="text-sm text-muted-foreground">This book isn't available for in-browser reading.</p>
        )}
      </section>
    </main>
  )
}
