/**
 * Currency formatting for TutorSpace.
 *
 * The platform prices in Bangladeshi Taka (BDT). Amounts were previously
 * rendered with a hard-coded "$" and a lucide `DollarSign` icon scattered
 * across a handful of components, which made the currency impossible to change
 * in one place — and left the icon contradicting the number beside it.
 *
 * Taka amounts are shown without decimal places: hourly tutoring rates and
 * session totals are whole-taka figures in practice, and trailing ".00" adds
 * noise. Pass `decimals` if a fractional amount genuinely needs showing.
 */

export const TAKA = "৳";

export function formatBDT(
  amount: number | string | null | undefined,
  decimals = 0,
): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${TAKA}0`;

  // en-US grouping (1,200 / 12,000) rather than the Indian lakh grouping —
  // this is the form used in most Bangladeshi digital price displays.
  return `${TAKA}${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** An hourly rate, e.g. "৳800/hr". */
export function formatRate(rate: number | string | null | undefined): string {
  return `${formatBDT(rate)}/hr`;
}
