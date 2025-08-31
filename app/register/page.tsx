"use client"

import { AppNav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLibrary } from "@/lib/library-store"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage() {
  const { register } = useLibrary()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const router = useRouter()

  return (
    <main>
      <AppNav />
      <section className="mx-auto max-w-md px-4 py-8">
        <h1 className="mb-4 text-xl font-semibold">Create account</h1>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            const res = register(name.trim(), email.trim())
            if (res.ok) {
              toast({ title: "Account created!" })
              router.push("/dashboard")
            } else toast({ title: "Registration failed", description: res.message, variant: "destructive" })
          }}
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Register
          </Button>
        </form>
      </section>
    </main>
  )
}
