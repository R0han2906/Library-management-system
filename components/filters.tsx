"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useSearchParams, useRouter } from "next/navigation"
import type { Book, Category } from "@/lib/types"

type Props = {
  books: Book[]
  onFilter: (filtered: Book[]) => void
}

const categories: Category[] = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Comics",
  "Philosophy",
  "Other",
]

export function CatalogFilters({ books, onFilter }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [q, setQ] = useState(searchParams.get("q") ?? "")
  const [cat, setCat] = useState<string>(searchParams.get("cat") ?? "all")
  const [onlyAvail, setOnlyAvail] = useState(searchParams.get("available") === "1")
  const [sort, setSort] = useState(searchParams.get("sort") ?? "relevance")

  useEffect(() => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (cat !== "all") params.set("cat", cat)
    if (onlyAvail) params.set("available", "1")
    if (sort !== "relevance") params.set("sort", sort)
    router.replace(params.toString() ? `/catalog?${params.toString()}` : "/catalog")
  }, [q, cat, onlyAvail, sort, router])

  const filtered = useMemo(() => {
    let list = books
    if (q) {
      const qq = q.toLowerCase()
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(qq) ||
          b.author.toLowerCase().includes(qq) ||
          b.categories.some((c) => c.toLowerCase().includes(qq)),
      )
    }
    if (cat !== "all") list = list.filter((b) => b.categories.includes(cat as any))
    if (onlyAvail) list = list.filter((b) => b.availableCopies > 0)

    switch (sort) {
      case "title":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title))
        break
      case "author":
        list = [...list].sort((a, b) => a.author.localeCompare(b.author))
        break
      case "availability":
        list = [...list].sort((a, b) => b.availableCopies - a.availableCopies)
        break
      default:
        break
    }
    return list
  }, [books, q, cat, onlyAvail, sort])

  useEffect(() => {
    onFilter(filtered)
  }, [filtered, onFilter])

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-end">
      <div className="flex-1">
        <Label htmlFor="q">Search</Label>
        <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, author, category..." />
      </div>
      <div className="w-full md:w-52">
        <Label>Category</Label>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="onlyAvail" checked={onlyAvail} onCheckedChange={setOnlyAvail} />
        <Label htmlFor="onlyAvail">Only available</Label>
      </div>
      <div className="w-full md:w-48">
        <Label>Sort by</Label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue placeholder="Relevance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="availability">Availability</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
