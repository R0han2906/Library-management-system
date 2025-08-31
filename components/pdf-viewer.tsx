"use client"

export function PdfViewer({ url }: { url: string }) {
  return (
    <div className="h-[calc(100vh-160px)] w-full overflow-hidden rounded-md border">
      <iframe src={url} title="PDF Reader" className="h-full w-full" aria-label="Document reader" />
    </div>
  )
}
