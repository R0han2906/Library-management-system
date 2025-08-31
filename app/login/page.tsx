"use client"

import { AppNav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLibrary } from "@/lib/library-store"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const { login } = useLibrary()
  const [email, setEmail] = useState("")
  const router = useRouter()

  return (
    <main>
      <AppNav />
      <section className="mx-auto max-w-md px-4 py-8">
        <h1 className="mb-4 text-xl font-semibold">Login</h1>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            const res = login(email.trim())
            if (res.ok) {
              toast({ title: "Welcome back!" })
              router.push("/dashboard")
            } else toast({ title: "Login failed", description: res.message, variant: "destructive" })
          }}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Login
          </Button>
        </form>
        <p className="mt-3 text-sm text-muted-foreground">
          New here?{" "}
          <a href="/register" className="text-blue-600 underline">
            Create an account
          </a>
        </p>
      </section>
    </main>
  )
}
