// Frontend-only store that simulates lending logic, reservations, and fines.
// Uses Zustand with localStorage persistence.

"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import { seedBooks } from "./data"
import type { Book, FineRecord, Loan, ReservationQueue, User } from "./types"

const LOAN_DAYS = 14
const MAX_RENEWS = 2
const FINE_PER_DAY = 1 // currency-agnostic units

type LibraryState = {
  currentUser?: User
  users: User[]
  books: Book[]
  loans: Loan[]
  reservations: ReservationQueue[]
  fines: FineRecord[]

  getUserLoans: (userId: string) => Loan[]
  getBookById: (id: string) => Book | undefined
  getReservationPosition: (bookId: string, userId: string) => number | null
  getOverdueFine: (loan: Loan) => { daysOverdue: number; amount: number }

  register: (name: string, email: string) => { ok: boolean; message?: string }
  login: (email: string) => { ok: boolean; message?: string }
  logout: () => void

  borrowBook: (bookId: string) => { ok: boolean; message?: string }
  returnBook: (loanId: string) => { ok: boolean; message?: string }
  renewLoan: (loanId: string) => { ok: boolean; message?: string }
  reserveBook: (bookId: string) => { ok: boolean; message?: string }
  cancelReservation: (bookId: string) => { ok: boolean; message?: string }

  seedIfEmpty: () => void
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function reservedHeadIsOther(queue: ReservationQueue | undefined, userId: string) {
  if (!queue || queue.userIds.length === 0) return false
  return queue.userIds[0] !== userId
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set, get) => ({
      currentUser: undefined,
      users: [],
      books: [],
      loans: [],
      reservations: [],
      fines: [],

      seedIfEmpty: () => {
        const { books } = get()
        if (books.length === 0) set({ books: seedBooks() })
      },

      getBookById: (id) => get().books.find((b) => b.id === id),

      getUserLoans: (userId) => get().loans.filter((l) => l.userId === userId && !l.returnedAt),

      getReservationPosition: (bookId, userId) => {
        const q = get().reservations.find((r) => r.bookId === bookId)
        if (!q) return null
        const idx = q.userIds.indexOf(userId)
        return idx >= 0 ? idx + 1 : null
      },

      getOverdueFine: (loan) => {
        if (loan.returnedAt) return { daysOverdue: 0, amount: 0 }
        const now = new Date()
        const due = new Date(loan.dueAt)
        const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
        const daysOverdue = Math.max(0, diffDays)
        return { daysOverdue, amount: daysOverdue * FINE_PER_DAY }
      },

      register: (name, email) => {
        const { users } = get()
        if (users.some((u) => u.email === email)) return { ok: false, message: "Email already registered." }
        const user: User = { id: nanoid(), name, email }
        set({ users: [...users, user], currentUser: user })
        return { ok: true }
      },

      login: (email) => {
        const { users } = get()
        const user = users.find((u) => u.email === email)
        if (!user) return { ok: false, message: "No account found for this email." }
        set({ currentUser: user })
        return { ok: true }
      },

      logout: () => set({ currentUser: undefined }),

      borrowBook: (bookId) => {
        const state = get()
        const user = state.currentUser
        if (!user) return { ok: false, message: "Please log in to borrow." }
        const book = state.books.find((b) => b.id === bookId)
        if (!book) return { ok: false, message: "Book not found." }

        const active = state.loans.find((l) => l.userId === user.id && l.bookId === bookId && !l.returnedAt)
        if (active) return { ok: false, message: "You already borrowed this book." }

        const queue = state.reservations.find((r) => r.bookId === bookId)
        if (reservedHeadIsOther(queue, user.id)) return { ok: false, message: "Reserved by another member." }

        if (book.availableCopies <= 0) return { ok: false, message: "No copies available. Consider reserving." }

        const loan: Loan = {
          id: nanoid(),
          userId: user.id,
          bookId,
          borrowedAt: new Date().toISOString(),
          dueAt: addDays(new Date(), LOAN_DAYS).toISOString(),
          renewCount: 0,
        }

        const books = state.books.map((b) => (b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b))

        let reservations = state.reservations
        if (queue && queue.userIds.length > 0 && queue.userIds[0] === user.id) {
          reservations = state.reservations.map((r) =>
            r.bookId === bookId ? { ...r, userIds: r.userIds.slice(1) } : r,
          )
        }

        set({ books, loans: [...state.loans, loan], reservations })
        return { ok: true }
      },

      returnBook: (loanId) => {
        const state = get()
        const loan = state.loans.find((l) => l.id === loanId)
        if (!loan || loan.returnedAt) return { ok: false, message: "Invalid loan." }

        const book = state.books.find((b) => b.id === loan.bookId)
        if (!book) return { ok: false, message: "Book not found." }

        const loans = state.loans.map((l) => (l.id === loanId ? { ...l, returnedAt: new Date().toISOString() } : l))

        const books = state.books.map((b) =>
          b.id === loan.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b,
        )

        const { daysOverdue, amount } = get().getOverdueFine(loan)
        const fines =
          daysOverdue > 0
            ? [
                ...state.fines,
                {
                  id: nanoid(),
                  userId: loan.userId,
                  loanId: loan.id,
                  amount,
                  daysOverdue,
                  calculatedAt: new Date().toISOString(),
                } as FineRecord,
              ]
            : state.fines

        set({ loans, books, fines })
        return { ok: true }
      },

      renewLoan: (loanId) => {
        const state = get()
        const user = state.currentUser
        if (!user) return { ok: false, message: "Please log in." }
        const loan = state.loans.find((l) => l.id === loanId)
        if (!loan || loan.returnedAt) return { ok: false, message: "Invalid loan." }
        if (loan.renewCount >= MAX_RENEWS) return { ok: false, message: "Renewal limit reached." }

        const queue = state.reservations.find((r) => r.bookId === loan.bookId)
        if (reservedHeadIsOther(queue, user.id)) {
          return { ok: false, message: "Renewal blocked: reserved by another member." }
        }

        const loans = state.loans.map((l) =>
          l.id === loanId
            ? { ...l, dueAt: addDays(new Date(l.dueAt), LOAN_DAYS).toISOString(), renewCount: l.renewCount + 1 }
            : l,
        )
        set({ loans })
        return { ok: true }
      },

      reserveBook: (bookId) => {
        const state = get()
        const user = state.currentUser
        if (!user) return { ok: false, message: "Please log in to reserve." }
        const book = state.books.find((b) => b.id === bookId)
        if (!book) return { ok: false, message: "Book not found." }

        let queue = state.reservations.find((r) => r.bookId === bookId)
        if (!queue) {
          queue = { bookId, userIds: [] }
          state.reservations.push(queue)
        }
        if (queue.userIds.includes(user.id)) return { ok: false, message: "Already reserved this book." }

        const reservations = state.reservations.map((r) =>
          r.bookId === bookId ? { ...r, userIds: [...r.userIds, user.id] } : r,
        )
        set({ reservations })
        return { ok: true }
      },

      cancelReservation: (bookId) => {
        const state = get()
        const user = state.currentUser
        if (!user) return { ok: false, message: "Please log in." }
        const reservations = state.reservations.map((r) =>
          r.bookId === bookId ? { ...r, userIds: r.userIds.filter((id) => id !== user.id) } : r,
        )
        set({ reservations })
        return { ok: true }
      },
    }),
    { name: "library-state" },
  ),
)
