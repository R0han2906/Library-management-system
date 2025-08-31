"use client"

import Link from "next/link"
import type { Book } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLibrary } from "@/lib/library-store"
import { toast } from "@/hooks/use-toast"
import { useState } from "react" // add local state for loading/borrowed UI

export function BookCard({ book }: { book: Book }) {
  const { borrowBook, currentUser, getReservationPosition, reserveBook } = useLibrary()

  const [isBorrowing, setIsBorrowing] = useState(false)
  const [borrowedNow, setBorrowedNow] = useState(false)

  const handleBorrow = () => {
    if (isBorrowing) return
    setIsBorrowing(true)
    const res = borrowBook(book.id)
    setIsBorrowing(false)
    if (res.ok) {
      setBorrowedNow(true)
      toast({ title: "Borrowed", description: `${book.title} is now in your loans.` })
    } else {
      toast({ title: "Unable to borrow", description: res.message, variant: "destructive" })
    }
  }

  const handleReserve = () => {
    const res = reserveBook(book.id)
    if (res.ok) {
      const pos = getReservationPosition(book.id, currentUser!.id)
      toast({ title: "Reserved", description: `You're in queue position ${pos}.` })
    } else {
      toast({ title: "Unable to reserve", description: res.message, variant: "destructive" })
    }
  }

  return (
    <Card className="group relative overflow-hidden transition duration-200 hover:shadow-md">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={book.coverUrl || "/placeholder.svg?height=240&width=180&query=Library%20book%20cover"}
            alt={`${book.title} cover`}
            className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            onError={(e) => {
              const img = e.currentTarget
              if (img.dataset.fallbackSet) return
              img.src = "/library-book-cover.png"
              img.dataset.fallbackSet = "true"
            }}
          />
          <div className="absolute left-2 top-2 flex gap-1">
            {book.categories.slice(0, 2).map((c) => (
              <Badge key={c} variant="secondary" className="bg-blue-50 text-blue-700">
                {c}
              </Badge>
            ))}
            {book.isFree && <Badge className="bg-amber-500 text-white">Free</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 p-3">
        <Link href={`/book/${book.id}`} className="block">
          <h3 className="line-clamp-1 font-semibold hover:text-blue-600">{book.title}</h3>
        </Link>
        <p className="line-clamp-1 text-sm text-muted-foreground">{book.author}</p>
        <p className="text-xs text-muted-foreground">
          {book.availableCopies > 0 ? (
            <span className="text-blue-700">{book.availableCopies} available</span>
          ) : (
            <span className="text-foreground">Not available</span>
          )}
        </p>
      </CardContent>
      <CardFooter className="flex items-center gap-2 p-3">
        <Link href={`/book/${book.id}`} className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            Details
          </Button>
        </Link>
        <Button
          onClick={handleBorrow}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          disabled={isBorrowing || borrowedNow || book.availableCopies <= 0}
        >
          {isBorrowing ? "Borrowing..." : borrowedNow ? "Borrowed" : "Borrow"}
        </Button>
        {book.availableCopies <= 0 && (
          <Button variant="ghost" onClick={handleReserve}>
            Reserve
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
