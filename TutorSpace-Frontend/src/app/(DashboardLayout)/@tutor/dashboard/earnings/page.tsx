// @tutor/dashboard/earnings/page.tsx
import { getBookings } from "@/services/bookings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TrendingUp, Clock, CheckCircle } from "lucide-react"
import { formatBDT, formatRate, TAKA } from "@/lib/currency"
import {
  TableView,
  CardView,
  MobileCard,
  Field,
} from "@/components/shared/responsiveTable"

export default async function TutorEarningsPage() {
  const bookings = (await getBookings()) ?? []
  const price = (b: any) => Number(b.total_price) || 0
  const money = (n: number) => formatBDT(n)

  const paid = bookings.filter((b: any) => b.payment_status === "PAID")
  const totalEarned = paid.reduce((s: number, b: any) => s + price(b), 0)

  const now = new Date()
  const inMonth = (d: string, y: number, m: number) => {
    const dt = new Date(d)
    return dt.getFullYear() === y && dt.getMonth() === m
  }

  const thisMonth = paid
    .filter(
      (b: any) =>
        b.courseSlot?.date &&
        inMonth(b.courseSlot.date, now.getFullYear(), now.getMonth())
    )
    .reduce((s: number, b: any) => s + price(b), 0)

  // Money not yet collected (unpaid, non-cancelled bookings).
  const pending = bookings
    .filter(
      (b: any) => b.payment_status !== "PAID" && b.booking_status !== "CANCELLED"
    )
    .reduce((s: number, b: any) => s + price(b), 0)

  // Earnings per month over the last 6 months (by session date).
  const months: { label: string; total: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const total = paid
      .filter(
        (b: any) =>
          b.courseSlot?.date &&
          inMonth(b.courseSlot.date, d.getFullYear(), d.getMonth())
      )
      .reduce((s: number, b: any) => s + price(b), 0)
    months.push({
      label: d.toLocaleDateString(undefined, { month: "short" }),
      total,
    })
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total))

  const txns = [...bookings]
    .sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 10)

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-0 sm:px-4 space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <span className="text-xl font-bold leading-none">{TAKA}</span>
        Earnings
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<span className="text-sm font-bold leading-none">{TAKA}</span>} label="Total Earned" value={money(totalEarned)} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="This Month" value={money(thisMonth)} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Pending" value={money(pending)} />
        <StatCard icon={<CheckCircle className="h-4 w-4" />} label="Paid Sessions" value={String(paid.length)} />
      </div>

      {/* Monthly breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Last 6 months</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {months.map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <span className="w-10 text-xs text-muted-foreground">{m.label}</span>
              <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary/70 rounded"
                  style={{ width: `${(m.total / maxMonth) * 100}%` }}
                />
              </div>
              <span className="w-20 text-right text-sm font-medium">
                {money(m.total)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {txns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No bookings yet.
            </p>
          ) : (
            <>
            <TableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txns.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell className="text-sm">{b.student?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm">{b.courseSlot?.name ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {b.courseSlot?.date
                        ? new Date(b.courseSlot.date).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{money(price(b))}</TableCell>
                    <TableCell>
                      <Badge variant={b.payment_status === "PAID" ? "default" : "outline"}>
                        {b.payment_status === "PAID" ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TableView>

            {/* Phones: the amount is what a tutor opens this page for, so it
                leads the card rather than sitting in a column off-screen. */}
            <CardView>
              {txns.map((b: any) => (
                <MobileCard key={b.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {b.courseSlot?.name ?? "Session"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {b.student?.name ?? "Student"}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold">{money(price(b))}</div>
                      <Badge
                        variant={b.payment_status === "PAID" ? "default" : "outline"}
                        className="text-[10px] mt-1"
                      >
                        {b.payment_status === "PAID" ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                  </div>
                  <Field label="Date">
                    {b.courseSlot?.date
                      ? new Date(b.courseSlot.date).toLocaleDateString()
                      : "—"}
                  </Field>
                </MobileCard>
              ))}
              {txns.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No earnings yet.
                </p>
              )}
            </CardView>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
