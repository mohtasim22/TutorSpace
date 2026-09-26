import { cn } from "@/lib/utils"

/**
 * Helpers for making a data table usable on a phone.
 *
 * A table wide enough to be useful on a laptop cannot be made narrow enough for
 * a 375px screen — the `overflow-x-auto` on the Table primitive keeps the layout
 * from breaking, but it means a row can only be read by swiping, and the action
 * buttons sit off the right edge where nobody finds them.
 *
 * So each page renders the same data twice: the table above `md`, and a stack of
 * cards below it. These wrappers keep that split consistent and make the intent
 * obvious at the call site, rather than scattering `hidden md:block` around.
 */

/** The existing table, shown only where there is room for it. */
export function TableView({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("hidden md:block", className)}>{children}</div>
}

/** Stacked cards, shown only on narrow screens. */
export function CardView({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("md:hidden space-y-3", className)}>{children}</div>
  )
}

/** One card in the stacked view. */
export function MobileCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-lg border p-3 space-y-2", className)}>
      {children}
    </div>
  )
}

/**
 * A labelled value inside a card — the mobile stand-in for a table column
 * header, since a stacked card has no header row to refer back to.
 */
export function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 text-sm", className)}>
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right min-w-0">{children}</span>
    </div>
  )
}

/** Full-width action row at the foot of a card. */
export function CardActions({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap gap-2 pt-1 [&>*]:flex-1", className)}>
      {children}
    </div>
  )
}
