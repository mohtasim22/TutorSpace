/**
 * Re-price existing tutor profiles in Bangladeshi Taka.
 *
 * The demo tutors were seeded with dollar-scale hourly rates (roughly 20–60),
 * which read as nonsense once the interface shows ৳. This assigns realistic
 * Taka rates instead of applying an exchange rate — a straight FX conversion of
 * $25/hr would produce ~৳3,000/hr, which is far above the going rate for online
 * tutoring in Bangladesh and would make the demo look wrong.
 *
 * Rates are chosen from the bands below by matching the tutor's stated
 * qualification, so a university-level tutor prices higher than a school-level
 * one. Anything already in a plausible Taka range (≥ 200) is left alone, so the
 * script is safe to run more than once.
 *
 * Usage:
 *   npm run rates:bdt          # dry run — prints the changes, writes nothing
 *   npm run rates:bdt -- --apply   # actually writes
 */

import { prisma } from "../lib/prisma";

// Typical online tutoring rates in Bangladesh, in Taka per hour.
const BANDS: { match: RegExp; rate: number; label: string }[] = [
  { match: /phd|doctor|professor/i, rate: 2000, label: "doctoral / professorial" },
  { match: /m\.?sc|m\.?a\b|master|mba|m\.?eng/i, rate: 1500, label: "master's" },
  { match: /engineer|computer|software|programming|data|physics|chemistry/i, rate: 1200, label: "STEM specialist" },
  { match: /b\.?sc|b\.?a\b|bachelor|undergrad|university/i, rate: 1000, label: "bachelor's" },
  { match: /hsc|a.?level|admission|college/i, rate: 800, label: "higher secondary" },
  { match: /ssc|o.?level|school|primary/i, rate: 500, label: "school level" },
];

// Used when the qualification matches nothing above, so a demo dataset still
// shows a spread of prices rather than one repeated figure.
const FALLBACK = [600, 800, 1000, 1200, 1500];

// Below this, a value is assumed to still be on the old dollar scale.
const ALREADY_BDT_THRESHOLD = 200;

const pickRate = (qualification: string, index: number) => {
  for (const band of BANDS) {
    if (band.match.test(qualification || "")) return { rate: band.rate, why: band.label };
  }
  return {
    rate: FALLBACK[index % FALLBACK.length] ?? 800,
    why: "no qualification match — spread",
  };
};

async function main() {
  const apply = process.argv.includes("--apply");

  const tutors = await prisma.tutorProfile.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, display_name: true, qualification: true, hourly_rate: true },
  });

  if (tutors.length === 0) {
    console.log("No tutor profiles found.");
    return;
  }

  console.log(`\n${apply ? "APPLYING" : "DRY RUN"} — ${tutors.length} tutor profile(s)\n`);
  console.log(
    "Tutor".padEnd(26) + "Old".padStart(8) + "New".padStart(10) + "   Reason",
  );
  console.log("-".repeat(78));

  let changed = 0;

  for (const [i, tutor] of tutors.entries()) {
    const old = tutor.hourly_rate ?? 0;

    if (old >= ALREADY_BDT_THRESHOLD) {
      console.log(
        (tutor.display_name || tutor.id).slice(0, 25).padEnd(26) +
          String(old).padStart(8) +
          "—".padStart(10) +
          "   already Taka-scale, skipped",
      );
      continue;
    }

    const { rate, why } = pickRate(tutor.qualification, i);

    console.log(
      (tutor.display_name || tutor.id).slice(0, 25).padEnd(26) +
        String(old).padStart(8) +
        `৳${rate}`.padStart(10) +
        `   ${why}`,
    );

    if (apply) {
      await prisma.tutorProfile.update({
        where: { id: tutor.id },
        data: { hourly_rate: rate },
      });
    }
    changed++;
  }

  console.log("-".repeat(78));
  if (apply) {
    console.log(`\nUpdated ${changed} profile(s).`);
    console.log(
      "Note: existing bookings keep the total_price calculated at booking time.\n",
    );
  } else {
    console.log(`\n${changed} profile(s) would change. Re-run with --apply to write.\n`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
