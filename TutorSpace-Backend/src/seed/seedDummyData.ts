/**
 * Demo dataset for TutorSpace.
 *
 * Replaces every TUTOR account with a varied, realistic set of tutors, their
 * courses, and bookable session slots — plus a handful of demo students with
 * completed sessions and reviews, so tutor ratings are genuinely derived rather
 * than faked.
 *
 * Why ratings are seeded through reviews
 * --------------------------------------
 * `rating_avg` and `total_reviews` are denormalised aggregates of the Review
 * table. Writing plausible-looking numbers straight onto the profile would make
 * the demo self-contradicting: a tutor showing 4.8 with no reviews behind it.
 * Instead this creates real completed bookings and real reviews, then
 * recomputes the aggregates exactly as the review service does.
 *
 * Accounts are created through Better Auth (`signUpEmail`) so the password and
 * Account rows are written the same way a real registration would write them —
 * every seeded account can actually log in.
 *
 * Usage:
 *   npm run seed:data                # dry run — shows what it would do
 *   npm run seed:data -- --apply     # delete existing tutors and seed
 *
 * DESTRUCTIVE: --apply deletes every user whose role is TUTOR. Their courses,
 * slots, bookings, reviews and assignments cascade with them. Admin accounts and
 * pre-existing student accounts are left untouched.
 */

import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";

const PASSWORD = "password123";
const DEMO_DOMAIN = "tutorspace.demo";

type TutorSeed = {
  name: string;
  email: string;
  display_name: string;
  qualification: string;
  bio: string;
  hourly_rate: number;
  is_verified: boolean;
  courses: { name: string; description: string }[];
};

// Deliberate variety: subject area, level taught, price band, and verification
// state. Two tutors are left unverified so the admin verification flow has
// something to act on during a demo.
const TUTORS: TutorSeed[] = [
  {
    name: "Dr. Rafiqul Islam",
    email: `rafiqul.islam@${DEMO_DOMAIN}`,
    display_name: "Dr. Rafiqul Islam",
    qualification: "PhD in Applied Mathematics, University of Dhaka",
    bio: "Twelve years teaching calculus and linear algebra at university level. I focus on building intuition first — most students struggle with maths because they were taught procedures without reasons.",
    hourly_rate: 2000,
    is_verified: true,
    courses: [
      { name: "University Calculus I & II", description: "Limits, differentiation, integration techniques, sequences and series. Suited to first-year engineering and science undergraduates." },
      { name: "Linear Algebra Foundations", description: "Vectors, matrices, determinants, eigenvalues and their applications, with worked problems every session." },
    ],
  },
  {
    name: "Nusrat Jahan",
    email: `nusrat.jahan@${DEMO_DOMAIN}`,
    display_name: "Nusrat Jahan",
    qualification: "MSc in Physics, BRAC University",
    bio: "I teach HSC and A-Level physics with an emphasis on problem-solving under exam conditions. Past students have moved on to BUET, DU and NSU.",
    hourly_rate: 1200,
    is_verified: true,
    courses: [
      { name: "HSC Physics — Paper 1 & 2", description: "Full syllabus coverage: mechanics, waves, thermodynamics, electricity and modern physics, with past-paper drills." },
    ],
  },
  {
    name: "Tanvir Ahmed",
    email: `tanvir.ahmed@${DEMO_DOMAIN}`,
    display_name: "Tanvir Ahmed",
    qualification: "BSc in Computer Science & Engineering, BRAC University",
    bio: "Software engineer by day, tutor by evening. I teach programming the way it is actually practised — you write code in every session, not just watch me write it.",
    hourly_rate: 1500,
    is_verified: true,
    courses: [
      { name: "Python Programming from Scratch", description: "Variables through to functions, files and simple projects. No prior programming experience assumed." },
      { name: "Data Structures & Algorithms", description: "Arrays, linked lists, trees, graphs, sorting and complexity analysis. Aimed at interview and contest preparation." },
    ],
  },
  {
    name: "Farhana Akter",
    email: `farhana.akter@${DEMO_DOMAIN}`,
    display_name: "Farhana Akter",
    qualification: "MA in English Literature, Jahangirnagar University",
    bio: "IELTS and academic English specialist. I work on writing and speaking together, because most learners lose marks on structure rather than vocabulary.",
    hourly_rate: 1000,
    is_verified: true,
    courses: [
      { name: "IELTS Preparation — Band 7+", description: "All four modules with weekly writing feedback and recorded speaking practice." },
      { name: "Academic Writing for University", description: "Essay structure, argumentation, citation and avoiding plagiarism." },
    ],
  },
  {
    name: "Md. Shahidul Haque",
    email: `shahidul.haque@${DEMO_DOMAIN}`,
    display_name: "Shahidul Haque",
    qualification: "MSc in Chemistry, University of Chittagong",
    bio: "Chemistry for SSC and HSC students. I use a lot of diagrams and everyday examples — organic chemistry stops being memorisation once you can see the mechanism.",
    hourly_rate: 800,
    is_verified: true,
    courses: [
      { name: "HSC Chemistry — Organic Focus", description: "Reaction mechanisms, functional groups and named reactions, taught through problem sets." },
    ],
  },
  {
    name: "Sadia Rahman",
    email: `sadia.rahman@${DEMO_DOMAIN}`,
    display_name: "Sadia Rahman",
    qualification: "MBA in Finance, IBA — University of Dhaka",
    bio: "Accounting and finance made practical. I teach with real company statements rather than textbook abstractions, which is what most students are missing.",
    hourly_rate: 1500,
    is_verified: true,
    courses: [
      { name: "Principles of Accounting", description: "Double-entry bookkeeping, journals, ledgers, trial balance and final accounts." },
      { name: "Business Finance Essentials", description: "Time value of money, capital budgeting, ratio analysis and working capital." },
    ],
  },
  {
    name: "Arif Hossain",
    email: `arif.hossain@${DEMO_DOMAIN}`,
    display_name: "Arif Hossain",
    qualification: "BSc in Statistics, University of Rajshahi",
    bio: "Statistics and data analysis for students who find the subject intimidating. We work in R and Excel so the concepts stay concrete.",
    hourly_rate: 1000,
    is_verified: true,
    courses: [
      { name: "Introductory Statistics", description: "Descriptive statistics, probability, distributions, hypothesis testing and regression." },
    ],
  },
  {
    name: "Ayesha Siddiqua",
    email: `ayesha.siddiqua@${DEMO_DOMAIN}`,
    display_name: "Ayesha Siddiqua",
    qualification: "BA in Bangla Literature, University of Dhaka",
    bio: "Bangla language and literature for school and college students, including board exam preparation and creative writing.",
    hourly_rate: 500,
    is_verified: true,
    courses: [
      { name: "SSC Bangla — Literature & Grammar", description: "Prose, poetry, grammar and composition, with model answers for board questions." },
    ],
  },
  {
    name: "Imran Kabir",
    email: `imran.kabir@${DEMO_DOMAIN}`,
    display_name: "Imran Kabir",
    qualification: "MSc in Biology, Jahangirnagar University",
    bio: "Biology tutor for HSC and medical admission candidates. Heavy focus on diagrams, terminology and rapid recall.",
    hourly_rate: 900,
    is_verified: false, // pending admin verification — useful for the demo
    courses: [
      { name: "HSC Biology — Botany & Zoology", description: "Complete syllabus with labelled diagram practice and admission-style MCQs." },
    ],
  },
  {
    name: "Mehedi Hasan",
    email: `mehedi.hasan@${DEMO_DOMAIN}`,
    display_name: "Mehedi Hasan",
    qualification: "BSc in Economics, North South University",
    bio: "Micro and macroeconomics for undergraduates, taught through current Bangladeshi policy examples rather than abstract models.",
    hourly_rate: 700,
    is_verified: false, // pending admin verification
    courses: [
      { name: "Microeconomics for Undergraduates", description: "Supply and demand, elasticity, market structures and welfare analysis." },
    ],
  },
];

const STUDENTS = [
  { name: "Rakib Hasan", email: `rakib.hasan@${DEMO_DOMAIN}` },
  { name: "Tasnim Ferdous", email: `tasnim.ferdous@${DEMO_DOMAIN}` },
  { name: "Sabbir Rahman", email: `sabbir.rahman@${DEMO_DOMAIN}` },
  { name: "Mim Akter", email: `mim.akter@${DEMO_DOMAIN}` },
];

// Comments paired with the star rating they accompany, so seeded reviews read
// consistently instead of a 5-star review with lukewarm text.
const REVIEWS: { rating: number; comment: string }[] = [
  { rating: 5, comment: "Explained a topic I had struggled with for months in a single session. Genuinely excellent." },
  { rating: 5, comment: "Very well prepared and patient. The shared whiteboard made a big difference for working through problems." },
  { rating: 4, comment: "Clear and helpful throughout. Would have liked a little more practice material afterwards." },
  { rating: 5, comment: "Answered every question properly instead of rushing. My confidence before the exam improved a lot." },
  { rating: 4, comment: "Good session and easy to follow. Started a few minutes late but covered everything promised." },
  { rating: 5, comment: "Best tutor I have had on any platform. Assignments were marked with real feedback, not one-word comments." },
  { rating: 3, comment: "Knowledgeable, but the pace was quicker than I needed. Fine if you already know the basics." },
];

const daysFromNow = (days: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
};

async function main() {
  const apply = process.argv.includes("--apply");

  const existingTutors = await prisma.user.findMany({
    where: { role: "TUTOR" },
    select: { id: true, name: true, email: true },
  });

  console.log(`\n${apply ? "APPLYING" : "DRY RUN"} — TutorSpace demo dataset\n`);
  console.log("Will DELETE these tutor accounts (courses, slots, bookings, reviews cascade):");
  if (existingTutors.length === 0) {
    console.log("  (none found)");
  } else {
    for (const t of existingTutors) console.log(`  - ${t.name} <${t.email}>`);
  }

  console.log(`\nWill CREATE ${TUTORS.length} tutors, ${STUDENTS.length} students,`);
  console.log(
    `  ${TUTORS.reduce((n, t) => n + t.courses.length, 0)} courses, plus slots, completed bookings and reviews.`,
  );
  console.log(`  Every seeded account uses the password: ${PASSWORD}`);

  if (!apply) {
    console.log("\nNothing written. Re-run with --apply to execute.\n");
    return;
  }

  // ---- 1. Remove existing tutors (cascades through their owned records) ----
  console.log("\nDeleting existing tutor accounts...");
  const removed = await prisma.user.deleteMany({ where: { role: "TUTOR" } });
  console.log(`  removed ${removed.count} account(s)`);

  // Remove any previously seeded demo students so re-running stays clean.
  await prisma.user.deleteMany({
    where: { email: { endsWith: `@${DEMO_DOMAIN}` }, role: "STUDENT" },
  });

  // ---- 2. Create tutors, profiles, courses and slots ----
  const createdTutors: { profileId: string; courseIds: string[]; slotIds: string[] }[] = [];

  for (const [i, seed] of TUTORS.entries()) {
    await auth.api.signUpEmail({
      body: {
        name: seed.name,
        email: seed.email,
        password: PASSWORD,
        role: "TUTOR",
        status: "ACTIVE",
      } as any,
    });

    const user = await prisma.user.findUnique({ where: { email: seed.email } });
    if (!user) throw new Error(`Failed to create tutor account: ${seed.email}`);

    const profile = await prisma.tutorProfile.create({
      data: {
        user_id: user.id,
        display_name: seed.display_name,
        bio: seed.bio,
        qualification: seed.qualification,
        hourly_rate: seed.hourly_rate,
        is_verified: seed.is_verified,
        // rating_avg and total_reviews are left at their defaults and are
        // recomputed from the reviews created further down.
      },
    });

    const courseIds: string[] = [];
    const slotIds: string[] = [];

    for (const [ci, course] of seed.courses.entries()) {
      const created = await prisma.course.create({
        data: {
          name: course.name,
          description: course.description,
          tutor_id: profile.id,
        },
      });
      courseIds.push(created.id);

      // One past session (used below for a completed booking and a review),
      // then upcoming sessions that are free to book during a demo. The mix of
      // ONE_ON_ONE and GROUP gives the session-type feature something to show.
      const schedule = [
        { offset: -7 - i, hour: 17, type: "ONE_ON_ONE" as const, capacity: 1, label: "Session 1" },
        { offset: 1 + ci, hour: 18, type: "ONE_ON_ONE" as const, capacity: 1, label: "Session 2" },
        { offset: 3 + ci, hour: 20, type: "GROUP" as const, capacity: 5, label: "Group Session" },
      ];

      for (const s of schedule) {
        const start = daysFromNow(s.offset, s.hour);
        const end = new Date(start.getTime() + 90 * 60 * 1000); // 90 minutes

        const slot = await prisma.courseSlot.create({
          data: {
            name: `${course.name} — ${s.label}`,
            description:
              s.type === "GROUP"
                ? "Small group session. Bring questions; we work through them together on the shared whiteboard."
                : "One-to-one session tailored to what you need most on the day.",
            date: start,
            start_time: start,
            end_time: end,
            session_type: s.type,
            capacity: s.capacity,
            course_id: created.id,
            tutor_id: profile.id,
          },
        });
        slotIds.push(slot.id);
      }
    }

    createdTutors.push({ profileId: profile.id, courseIds, slotIds });
    console.log(`  + ${seed.display_name} (৳${seed.hourly_rate}/hr${seed.is_verified ? "" : ", unverified"})`);
  }

  // ---- 3. Create demo students ----
  const studentIds: string[] = [];
  for (const s of STUDENTS) {
    await auth.api.signUpEmail({
      body: { name: s.name, email: s.email, password: PASSWORD, role: "STUDENT", status: "ACTIVE" } as any,
    });
    const user = await prisma.user.findUnique({ where: { email: s.email } });
    if (user) studentIds.push(user.id);
  }
  console.log(`  + ${studentIds.length} demo students`);

  // ---- 4. Completed bookings on the past slots, each with a review ----
  let reviewCount = 0;

  for (const [ti, tutor] of createdTutors.entries()) {
    // The first slot of each course is the past one.
    const pastSlots = await prisma.courseSlot.findMany({
      where: { tutor_id: tutor.profileId, start_time: { lt: new Date() } },
    });

    for (const [si, slot] of pastSlots.entries()) {
      // Two students per past session, so ratings average over more than one
      // data point and the group capacity figures look plausible.
      const reviewers = [
        studentIds[(ti + si) % studentIds.length],
        studentIds[(ti + si + 1) % studentIds.length],
      ].filter((v, idx, arr): v is string => Boolean(v) && arr.indexOf(v) === idx);

      for (const studentId of reviewers) {
        const durationHours =
          (new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) / 3_600_000;

        const profile = await prisma.tutorProfile.findUnique({ where: { id: tutor.profileId } });

        const booking = await prisma.booking.create({
          data: {
            student_id: studentId,
            tutor_id: tutor.profileId,
            course_slot_id: slot.id,
            booking_status: "COMPLETED",
            payment_status: "PAID",
            total_price: durationHours * (profile?.hourly_rate ?? 0),
            reminder_sent: true,
          },
        });

        const review = REVIEWS[reviewCount % REVIEWS.length]!;
        await prisma.review.create({
          data: {
            booking_id: booking.id,
            tutor_id: tutor.profileId,
            student_id: studentId,
            rating: review.rating,
            comment: review.comment,
          },
        });
        reviewCount++;
      }
    }

    // Recompute the denormalised aggregates the same way the review service
    // does, so the seeded figures are genuinely derived from the reviews above.
    const reviews = await prisma.review.findMany({ where: { tutor_id: tutor.profileId } });
    const total = reviews.length;
    const avg = total
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
      : 0;
    await prisma.tutorProfile.update({
      where: { id: tutor.profileId },
      data: { rating_avg: avg, total_reviews: total },
    });
  }

  console.log(`  + ${reviewCount} completed bookings with reviews (ratings recomputed)\n`);
  console.log("Done. Sign in with any seeded email and the password above.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
