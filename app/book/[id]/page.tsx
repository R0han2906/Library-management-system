"use client"

import { AppNav } from "@/components/nav"
import { useLibrary } from "@/lib/library-store"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useState } from "react" // add local loading state for borrow

export default function BookDetailPage() {
  const params = useParams<{ id: string }>()
  const { id } = params
  const { getBookById, borrowBook, reserveBook, currentUser, getReservationPosition } = useLibrary()
  const router = useRouter()
  const [isBorrowing, setIsBorrowing] = useState(false) //

  const book = getBookById(id)
  if (!book) {
    return (
      <main>
        <AppNav />
        <section className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-sm text-muted-foreground">Book not found.</p>
        </section>
      </main>
    )
  }

  const handleBorrow = () => {
    if (isBorrowing) return
    setIsBorrowing(true) // loading feedback
    const r = borrowBook(book.id)
    setIsBorrowing(false)
    if (r.ok) {
      toast({ title: "Borrowed", description: `${book.title} added to your loans.` })
      router.push("/dashboard")
    } else {
      toast({ title: "Cannot borrow", description: r.message, variant: "destructive" })
    }
  }
  const handleReserve = () => {
    const r = reserveBook(book.id)
    if (r.ok) {
      const pos = getReservationPosition(book.id, currentUser!.id)
      toast({ title: "Reserved", description: `You're in queue position ${pos}.` })
    } else {
      toast({ title: "Cannot reserve", description: r.message, variant: "destructive" })
    }
  }

  return (
    <main>
      <AppNav />
      <section className="mx-auto max-w-4xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <img
              src={book.coverUrl || "/placeholder.svg?height=360&width=260&query=Library%20book%20cover"}
              alt={`${book.title} cover`}
              className="w-full rounded-md border"
              onError={(e) => {
                const img = e.currentTarget
                if (img.dataset.fallbackSet) return
                img.src = "/library-book-cover.png"
                img.dataset.fallbackSet = "true"
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{book.title}</h1>
            <p className="text-muted-foreground">{book.author}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {book.categories.map((c) => (
                <Badge key={c} variant="secondary" className="bg-blue-50 text-blue-700">
                  {c}
                </Badge>
              ))}
              {book.isFree && <Badge className="bg-amber-500 text-white">Free</Badge>}
            </div>

            <p className="mt-4 text-pretty text-sm text-muted-foreground">{book.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm">
                Status:{" "}
                {book.availableCopies > 0 ? (
                  <span className="text-blue-700">{book.availableCopies} available</span>
                ) : (
                  <span className="text-foreground">Not available</span>
                )}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={handleBorrow}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                disabled={isBorrowing || book.availableCopies <= 0}
              >
                {isBorrowing ? "Borrowing..." : "Borrow"}
              </Button>
              {book.isFree && book.pdfUrl && (
                <Link href={`/reader/${book.id}`}>
                  <Button variant="outline">Read now</Button>
                </Link>
              )}
              {book.availableCopies <= 0 && (
                <Button variant="ghost" onClick={handleReserve}>
                  Reserve
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
