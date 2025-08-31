"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLibrary } from "@/lib/library-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function AppNav({
  onSearch,
  defaultQuery = "",
}: {
  onSearch?: (q: string) => void
  defaultQuery?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout, seedIfEmpty } = useLibrary()
  const [q, setQ] = useState(defaultQuery)

  useEffect(() => {
    seedIfEmpty()
  }, [seedIfEmpty])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/catalog", label: "Catalog" },
    { href: "/dashboard", label: "Dashboard" },
  ]

  const NavLinks = () => (
    <nav className="flex items-center gap-3">
      {navItems.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-blue-600",
            pathname === n.href ? "text-blue-600" : "text-muted-foreground",
          )}
        >
          {n.label}
        </Link>
      ))}
    </nav>
  )

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" aria-label="Open menu">
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="mt-6 flex flex-col gap-4">
                {navItems.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-blue-600",
                      pathname === n.href ? "text-blue-600" : "text-muted-foreground",
                    )}
                  >
                    {n.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">L</span>
            <span className="font-semibold">djsce Library</span>
          </Link>
        </div>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (onSearch) onSearch(q)
              else router.push(`/catalog?q=${encodeURIComponent(q)}`)
            }}
            className="w-full max-w-lg"
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search books, authors, categories..."
              className="rounded-md"
              aria-label="Search catalog"
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">
                Hi, {currentUser.name.split(" ")[0]}
              </span>
              <Button variant="ghost" onClick={() => logout()} className="hover:bg-blue-50 hover:text-blue-700">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-blue-50 hover:text-blue-700">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
