"use client"

import { AppNav } from "@/components/nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoansSection, ReservationsSection, FinesSection } from "@/components/dashboard-sections"
import { useLibrary } from "@/lib/library-store"
import Link from "next/link"

export default function DashboardPage() {
  const { currentUser } = useLibrary()

  return (
    <main>
      <AppNav />
      <section className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-3 text-xl font-semibold">Member Dashboard</h1>
        {!currentUser ? (
          <p className="text-sm text-muted-foreground">
            Please{" "}
            <Link className="text-blue-600 underline" href="/login">
              login
            </Link>{" "}
            to manage your loans and reservations.
          </p>
        ) : (
          <Tabs defaultValue="loans" className="mt-2">
            <TabsList>
              <TabsTrigger value="loans">Loans</TabsTrigger>
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
              <TabsTrigger value="fines">Fines</TabsTrigger>
            </TabsList>
            <TabsContent value="loans">
              <LoansSection />
            </TabsContent>
            <TabsContent value="reservations">
              <ReservationsSection />
            </TabsContent>
            <TabsContent value="fines">
              <FinesSection />
            </TabsContent>
          </Tabs>
        )}
      </section>
    </main>
  )
}
