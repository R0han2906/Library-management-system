"use client"

import { AppNav } from "@/components/nav"
import { useLibrary } from "@/lib/library-store"
import { CatalogFilters } from "@/components/filters"
import { BookCard } from "@/components/book-card"
import { useState } from "react"

export default function CatalogPage() {
  const { books } = useLibrary()
  const [list, setList] = useState(books)

  return (
    <main>
      <AppNav />
      <section className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-3 text-xl font-semibold">Catalog</h1>
        <CatalogFilters books={books} onFilter={setList} />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {list.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
        {list.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No books match your filters.</p>}
      </section>
    </main>
  )
}
