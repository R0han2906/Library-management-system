"use client"

import Link from "next/link"
import { useLibrary } from "@/lib/library-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

export function LoansSection() {
  const { currentUser, getUserLoans, getOverdueFine, returnBook, renewLoan, getBookById } = useLibrary()
  if (!currentUser) return null
  const loans = getUserLoans(currentUser.id)

  return (
    <div className="space-y-3">
      {loans.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No active loans. Browse the{" "}
            <Link className="text-blue-600 underline" href="/catalog">
              catalog
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        loans.map((l) => {
          const book = getBookById(l.bookId)!
          const { daysOverdue, amount } = getOverdueFine(l)
          return (
            <Card key={l.id} className="transition hover:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <h3 className="font-medium">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">Due: {new Date(l.dueAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {daysOverdue > 0 && (
                    <Badge className="bg-amber-500 text-white">
                      {daysOverdue} days overdue • {amount}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const r = renewLoan(l.id)
                    if (r.ok) toast({ title: "Renewed", description: "Due date extended." })
                    else toast({ title: "Cannot renew", description: r.message, variant: "destructive" })
                  }}
                >
                  Renew
                </Button>
                <Button
                  onClick={() => {
                    const r = returnBook(l.id)
                    if (r.ok) toast({ title: "Returned", description: "Book returned successfully." })
                    else toast({ title: "Cannot return", description: r.message, variant: "destructive" })
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Return
                </Button>
                {book.isFree && book.pdfUrl && (
                  <Link href={`/reader/${book.id}`}>
                    <Button variant="ghost">Read</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

export function ReservationsSection() {
  const { currentUser, reservations, getBookById, cancelReservation, getReservationPosition } = useLibrary()
  if (!currentUser) return null
  const myRes = reservations
    .map((r) => ({ bookId: r.bookId, pos: getReservationPosition(r.bookId, currentUser.id) }))
    .filter((x) => x.pos !== null)
  return (
    <div className="space-y-3">
      {myRes.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">No reservations yet.</CardContent>
        </Card>
      ) : (
        myRes.map(({ bookId, pos }) => {
          const book = getBookById(bookId)!
          return (
            <Card key={bookId} className="transition hover:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <h3 className="font-medium">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">Queue position: {pos}</p>
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Link href={`/book/${book.id}`}>
                  <Button variant="outline">View book</Button>
                </Link>
                <Button variant="ghost" onClick={() => cancelReservation(book.id)}>
                  Cancel reservation
                </Button>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

export function FinesSection() {
  const { currentUser, fines, loans, getBookById } = useLibrary()
  if (!currentUser) return null
  const myFines = fines.filter((f) => f.userId === currentUser.id)

  return (
    <div className="space-y-3">
      {myFines.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">No fines on record. Nice!</CardContent>
        </Card>
      ) : (
        myFines.map((f) => {
          const loan = loans.find((l) => l.id === f.loanId)!
          const book = getBookById(loan.bookId)!
          return (
            <Card key={f.id} className="transition hover:shadow-sm">
              <CardHeader>
                <h3 className="font-medium">{book.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {f.daysOverdue} days overdue • Calculated on {new Date(f.calculatedAt).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <Badge className="bg-amber-500 text-white">Fine amount: {f.amount}</Badge>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
