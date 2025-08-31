// Domain types for the frontend simulation

export type Category =
  | "Fiction"
  | "Non-Fiction"
  | "Science"
  | "Technology"
  | "History"
  | "Comics"
  | "Philosophy"
  | "Other"

export type Book = {
  id: string
  title: string
  author: string
  description: string
  categories: Category[]
  coverUrl: string
  totalCopies: number
  availableCopies: number
  isFree: boolean
  pdfUrl?: string
}

export type User = {
  id: string
  name: string
  email: string
}

export type Loan = {
  id: string
  userId: string
  bookId: string
  borrowedAt: string // ISO
  dueAt: string // ISO
  returnedAt?: string // ISO
  renewCount: number
}

export type ReservationQueue = {
  bookId: string
  userIds: string[] // queue in order
}

export type FineRecord = {
  id: string
  userId: string
  loanId: string
  amount: number
  daysOverdue: number
  calculatedAt: string // ISO
}
