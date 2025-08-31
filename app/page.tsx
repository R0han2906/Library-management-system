"use client"

// Home / Featured
import Link from "next/link"
import { AppNav } from "@/components/nav"
import { useLibrary } from "@/lib/library-store"
import { BookCard } from "@/components/book-card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { books } = useLibrary()
  const featured = books.slice(0, 6)

  return (
    <main>
      <AppNav />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="max-w-xl">
            <h1 className="text-balance text-2xl font-semibold md:text-3xl">
              Discover, Borrow, and Read — all in one place
            </h1>
            <p className="mt-2 text-pretty text-muted-foreground">
              Clean, responsive, and accessible library app with an intuitive workflow.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/catalog">
                <Button className="bg-blue-600 hover:bg-blue-700">Browse Catalog</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">My Dashboard</Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="/minimal-library-bookshelf-illustration.png"
              alt="Library illustration"
              className="rounded-md border transition-transform duration-300 hover:scale-[1.01]"
            />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Featured</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featured.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
