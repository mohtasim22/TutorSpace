var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express17 from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// src/modules/course/course.router.ts
import express from "express";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.4.1",
  "engineVersion": "55ae170b1ced7fc6ed07a15f110549408c501bb3",
  "activeProvider": "postgresql",
  "inlineSchema": `generator client {
  provider = "prisma-client"
  // output   = "../generated/prisma"
  output   = "../src/generated/prisma"
  // moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String     @id @default(uuid())
  role          Role       @default(STUDENT)
  name          String
  email         String     @unique
  password      String? // Needed by Better Auth
  emailVerified Boolean    @default(false)
  image         String?
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  sessions Session[]
  accounts Account[]

  tutorProfile  TutorProfile?
  bookings      Booking[]
  reviews       Review[]
  submissions   Submission[]
  notifications Notification[]
  practiceSets  PracticeSet[]

  @@index([status])
  @@map("users")
}

model Session {
  id        String   @id @default(uuid())
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("session")
}

model Account {
  id                    String    @id @default(uuid())
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@map("account")
}

model Verification {
  id         String    @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt

  @@map("verification")
}

enum Role {
  STUDENT
  TUTOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  BANNED
}

model TutorProfile {
  id            String   @id @default(uuid())
  display_name  String
  bio           String
  qualification String
  hourly_rate   Float    @default(0)
  rating_avg    Float    @default(0)
  total_reviews Int      @default(0)
  is_verified   Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user_id       String   @unique

  user         User          @relation(fields: [user_id], references: [id], onDelete: Cascade)
  courseSlots  CourseSlot[]
  bookings     Booking[]
  reviews      Review[]
  courses      Course[]
  assignments  Assignment[]
  practiceSets PracticeSet[]

  @@map("tutorprofiles")
}

model Course {
  id          String       @id @default(uuid())
  name        String
  tutor_id    String
  description String       @db.Text
  status      CourseStatus @default(ACTIVE)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  tutor         TutorProfile     @relation(fields: [tutor_id], references: [id], onDelete: Cascade)
  courseSlots   CourseSlot[]
  assignments   Assignment[]
  materials     CourseMaterial[]
  announcements Announcement[]
  practiceSets  PracticeSet[]

  @@map("courses")
}

enum CourseStatus {
  ACTIVE
  INACTIVE
}

enum SessionType {
  ONE_ON_ONE
  GROUP
}

model CourseSlot {
  id           String      @id @default(uuid())
  name         String
  description  String?     @db.Text
  start_time   DateTime
  end_time     DateTime
  date         DateTime
  meeting_link String?
  session_type SessionType @default(ONE_ON_ONE)
  capacity     Int         @default(1)
  tutor_id     String
  course_id    String
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  tutor    TutorProfile @relation(fields: [tutor_id], references: [id], onDelete: Cascade)
  course   Course       @relation(fields: [course_id], references: [id], onDelete: Cascade)
  bookings Booking[]

  @@index([tutor_id])
  @@map("course_slots")
}

model Booking {
  id             String        @id @default(uuid())
  student_id     String
  tutor_id       String
  course_slot_id String
  booking_status BookingStatus @default(PENDING)
  payment_status PaymentStatus @default(UNPAID)
  /// The Stripe Checkout Session id (cs_...). Note this is NOT a PaymentIntent,
  /// so a refund resolves the intent from this session rather than using it
  /// directly.
  transaction_id String?       @unique

  /// Stripe refund id, set when a paid booking is cancelled with a refund.
  /// Its presence is the record that money actually went back.
  refund_id    String?
  cancelled_at DateTime?

  total_price   Float    @default(0)
  reminder_sent Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  student    User         @relation(fields: [student_id], references: [id], onDelete: Cascade)
  tutor      TutorProfile @relation(fields: [tutor_id], references: [id], onDelete: Cascade)
  courseSlot CourseSlot   @relation(fields: [course_slot_id], references: [id], onDelete: Cascade)
  review     Review?

  @@index([student_id])
  @@index([tutor_id])
  @@map("bookings")
}

enum PaymentStatus {
  UNPAID
  PAID
  FAILED
  REFUNDED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

model Review {
  id         String       @id @default(uuid())
  booking_id String       @unique
  tutor_id   String
  student_id String
  rating     Int // 1-5 stars
  comment    String?      @db.Text
  status     ReviewStatus @default(APPROVED)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  booking Booking      @relation(fields: [booking_id], references: [id], onDelete: Cascade)
  tutor   TutorProfile @relation(fields: [tutor_id], references: [id], onDelete: Cascade)
  student User         @relation(fields: [student_id], references: [id], onDelete: Cascade)

  @@map("reviews")
}

enum ReviewStatus {
  APPROVED
  REJECTED
}

model Assignment {
  id            String    @id @default(uuid())
  title         String
  description   String    @db.Text
  due_date      DateTime?
  reminder_sent Boolean   @default(false)
  course_id     String
  tutor_id      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  course      Course       @relation(fields: [course_id], references: [id], onDelete: Cascade)
  tutor       TutorProfile @relation(fields: [tutor_id], references: [id], onDelete: Cascade)
  submissions Submission[]

  @@index([course_id])
  @@index([tutor_id])
  @@map("assignments")
}

model Submission {
  id            String           @id @default(uuid())
  assignment_id String
  student_id    String
  file_url      String
  note          String?          @db.Text
  grade         Int?
  feedback      String?          @db.Text
  status        SubmissionStatus @default(SUBMITTED)
  submittedAt   DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  assignment Assignment @relation(fields: [assignment_id], references: [id], onDelete: Cascade)
  student    User       @relation(fields: [student_id], references: [id], onDelete: Cascade)

  @@unique([assignment_id, student_id])
  @@index([student_id])
  @@map("submissions")
}

enum SubmissionStatus {
  SUBMITTED
  GRADED
}

model CourseMaterial {
  id        String @id @default(uuid())
  title     String
  file_url  String
  course_id String
  tutor_id  String

  /// AI summary of this material: { overview, key_points[], key_terms[] }.
  /// Generated once, on first request, and shared by everyone in the course,
  /// so every student reads the same summary and the model is called once per
  /// material rather than once per student. The tutor can regenerate it.
  summary    Json?
  summary_at DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  course       Course        @relation(fields: [course_id], references: [id], onDelete: Cascade)
  practiceSets PracticeSet[]

  @@index([course_id])
  @@map("course_materials")
}

model Announcement {
  id        String   @id @default(uuid())
  message   String   @db.Text
  course_id String
  tutor_id  String
  createdAt DateTime @default(now())

  course Course @relation(fields: [course_id], references: [id], onDelete: Cascade)

  @@index([course_id])
  @@map("announcements")
}

model Notification {
  id        String   @id @default(uuid())
  user_id   String
  message   String
  link      String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@map("notifications")
}

model PracticeSet {
  id    String @id @default(uuid())
  title String

  /// [{ question, options[], answer, explanation }] - generated by the model,
  /// then editable by the tutor. Stored as JSON because the shape is fixed and
  /// only ever read as a whole set; normalising it into a questions table would
  /// buy nothing here.
  questions Json

  /// Only meaningful for a tutor's set: other students in the course see it
  /// once the tutor has read and published it. A student's own quiz is never
  /// published \u2014 it is visible to that student alone.
  is_published Boolean @default(false)

  /// Set when a STUDENT generated this quiz for their own revision. Null for a
  /// set the tutor generated for the whole course. \`tutor_id\` is filled in
  /// either way (the course's tutor), so a tutor's view can tell the two apart.
  student_id String?

  course_id   String
  material_id String?
  tutor_id    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  course   Course          @relation(fields: [course_id], references: [id], onDelete: Cascade)
  material CourseMaterial? @relation(fields: [material_id], references: [id], onDelete: SetNull)
  tutor    TutorProfile    @relation(fields: [tutor_id], references: [id], onDelete: Cascade)
  student  User?           @relation(fields: [student_id], references: [id], onDelete: Cascade)

  @@index([course_id])
  @@index([tutor_id])
  @@index([student_id])
  @@map("practice_sets")
}
`,
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"submissions","kind":"object","type":"Submission","relationName":"SubmissionToUser"},{"name":"notifications","kind":"object","type":"Notification","relationName":"NotificationToUser"},{"name":"practiceSets","kind":"object","type":"PracticeSet","relationName":"PracticeSetToUser"}],"dbName":"users"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"display_name","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"qualification","kind":"scalar","type":"String"},{"name":"hourly_rate","kind":"scalar","type":"Float"},{"name":"rating_avg","kind":"scalar","type":"Float"},{"name":"total_reviews","kind":"scalar","type":"Int"},{"name":"is_verified","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"courseSlots","kind":"object","type":"CourseSlot","relationName":"CourseSlotToTutorProfile"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTutorProfile"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTutorProfile"},{"name":"courses","kind":"object","type":"Course","relationName":"CourseToTutorProfile"},{"name":"assignments","kind":"object","type":"Assignment","relationName":"AssignmentToTutorProfile"},{"name":"practiceSets","kind":"object","type":"PracticeSet","relationName":"PracticeSetToTutorProfile"}],"dbName":"tutorprofiles"},"Course":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"CourseStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"CourseToTutorProfile"},{"name":"courseSlots","kind":"object","type":"CourseSlot","relationName":"CourseToCourseSlot"},{"name":"assignments","kind":"object","type":"Assignment","relationName":"AssignmentToCourse"},{"name":"materials","kind":"object","type":"CourseMaterial","relationName":"CourseToCourseMaterial"},{"name":"announcements","kind":"object","type":"Announcement","relationName":"AnnouncementToCourse"},{"name":"practiceSets","kind":"object","type":"PracticeSet","relationName":"CourseToPracticeSet"}],"dbName":"courses"},"CourseSlot":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"start_time","kind":"scalar","type":"DateTime"},{"name":"end_time","kind":"scalar","type":"DateTime"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"meeting_link","kind":"scalar","type":"String"},{"name":"session_type","kind":"enum","type":"SessionType"},{"name":"capacity","kind":"scalar","type":"Int"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"CourseSlotToTutorProfile"},{"name":"course","kind":"object","type":"Course","relationName":"CourseToCourseSlot"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToCourseSlot"}],"dbName":"course_slots"},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"student_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"course_slot_id","kind":"scalar","type":"String"},{"name":"booking_status","kind":"enum","type":"BookingStatus"},{"name":"payment_status","kind":"enum","type":"PaymentStatus"},{"name":"transaction_id","kind":"scalar","type":"String"},{"name":"refund_id","kind":"scalar","type":"String"},{"name":"cancelled_at","kind":"scalar","type":"DateTime"},{"name":"total_price","kind":"scalar","type":"Float"},{"name":"reminder_sent","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"User","relationName":"BookingToUser"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"BookingToTutorProfile"},{"name":"courseSlot","kind":"object","type":"CourseSlot","relationName":"BookingToCourseSlot"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"}],"dbName":"bookings"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"booking_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"student_id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ReviewStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"ReviewToTutorProfile"},{"name":"student","kind":"object","type":"User","relationName":"ReviewToUser"}],"dbName":"reviews"},"Assignment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"due_date","kind":"scalar","type":"DateTime"},{"name":"reminder_sent","kind":"scalar","type":"Boolean"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"course","kind":"object","type":"Course","relationName":"AssignmentToCourse"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"AssignmentToTutorProfile"},{"name":"submissions","kind":"object","type":"Submission","relationName":"AssignmentToSubmission"}],"dbName":"assignments"},"Submission":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"assignment_id","kind":"scalar","type":"String"},{"name":"student_id","kind":"scalar","type":"String"},{"name":"file_url","kind":"scalar","type":"String"},{"name":"note","kind":"scalar","type":"String"},{"name":"grade","kind":"scalar","type":"Int"},{"name":"feedback","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"SubmissionStatus"},{"name":"submittedAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"assignment","kind":"object","type":"Assignment","relationName":"AssignmentToSubmission"},{"name":"student","kind":"object","type":"User","relationName":"SubmissionToUser"}],"dbName":"submissions"},"CourseMaterial":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"file_url","kind":"scalar","type":"String"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"summary","kind":"scalar","type":"Json"},{"name":"summary_at","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"course","kind":"object","type":"Course","relationName":"CourseToCourseMaterial"},{"name":"practiceSets","kind":"object","type":"PracticeSet","relationName":"CourseMaterialToPracticeSet"}],"dbName":"course_materials"},"Announcement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"course","kind":"object","type":"Course","relationName":"AnnouncementToCourse"}],"dbName":"announcements"},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"link","kind":"scalar","type":"String"},{"name":"read","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"NotificationToUser"}],"dbName":"notifications"},"PracticeSet":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"questions","kind":"scalar","type":"Json"},{"name":"is_published","kind":"scalar","type":"Boolean"},{"name":"student_id","kind":"scalar","type":"String"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"material_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"course","kind":"object","type":"Course","relationName":"CourseToPracticeSet"},{"name":"material","kind":"object","type":"CourseMaterial","relationName":"CourseMaterialToPracticeSet"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"PracticeSetToTutorProfile"},{"name":"student","kind":"object","type":"User","relationName":"PracticeSetToUser"}],"dbName":"practice_sets"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","tutor","courseSlots","course","assignment","student","submissions","_count","assignments","material","practiceSets","materials","announcements","courseSlot","booking","review","bookings","reviews","courses","tutorProfile","notifications","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","TutorProfile.findUnique","TutorProfile.findUniqueOrThrow","TutorProfile.findFirst","TutorProfile.findFirstOrThrow","TutorProfile.findMany","TutorProfile.createOne","TutorProfile.createMany","TutorProfile.createManyAndReturn","TutorProfile.updateOne","TutorProfile.updateMany","TutorProfile.updateManyAndReturn","TutorProfile.upsertOne","TutorProfile.deleteOne","TutorProfile.deleteMany","_avg","_sum","TutorProfile.groupBy","TutorProfile.aggregate","Course.findUnique","Course.findUniqueOrThrow","Course.findFirst","Course.findFirstOrThrow","Course.findMany","Course.createOne","Course.createMany","Course.createManyAndReturn","Course.updateOne","Course.updateMany","Course.updateManyAndReturn","Course.upsertOne","Course.deleteOne","Course.deleteMany","Course.groupBy","Course.aggregate","CourseSlot.findUnique","CourseSlot.findUniqueOrThrow","CourseSlot.findFirst","CourseSlot.findFirstOrThrow","CourseSlot.findMany","CourseSlot.createOne","CourseSlot.createMany","CourseSlot.createManyAndReturn","CourseSlot.updateOne","CourseSlot.updateMany","CourseSlot.updateManyAndReturn","CourseSlot.upsertOne","CourseSlot.deleteOne","CourseSlot.deleteMany","CourseSlot.groupBy","CourseSlot.aggregate","Booking.findUnique","Booking.findUniqueOrThrow","Booking.findFirst","Booking.findFirstOrThrow","Booking.findMany","Booking.createOne","Booking.createMany","Booking.createManyAndReturn","Booking.updateOne","Booking.updateMany","Booking.updateManyAndReturn","Booking.upsertOne","Booking.deleteOne","Booking.deleteMany","Booking.groupBy","Booking.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","Assignment.findUnique","Assignment.findUniqueOrThrow","Assignment.findFirst","Assignment.findFirstOrThrow","Assignment.findMany","Assignment.createOne","Assignment.createMany","Assignment.createManyAndReturn","Assignment.updateOne","Assignment.updateMany","Assignment.updateManyAndReturn","Assignment.upsertOne","Assignment.deleteOne","Assignment.deleteMany","Assignment.groupBy","Assignment.aggregate","Submission.findUnique","Submission.findUniqueOrThrow","Submission.findFirst","Submission.findFirstOrThrow","Submission.findMany","Submission.createOne","Submission.createMany","Submission.createManyAndReturn","Submission.updateOne","Submission.updateMany","Submission.updateManyAndReturn","Submission.upsertOne","Submission.deleteOne","Submission.deleteMany","Submission.groupBy","Submission.aggregate","CourseMaterial.findUnique","CourseMaterial.findUniqueOrThrow","CourseMaterial.findFirst","CourseMaterial.findFirstOrThrow","CourseMaterial.findMany","CourseMaterial.createOne","CourseMaterial.createMany","CourseMaterial.createManyAndReturn","CourseMaterial.updateOne","CourseMaterial.updateMany","CourseMaterial.updateManyAndReturn","CourseMaterial.upsertOne","CourseMaterial.deleteOne","CourseMaterial.deleteMany","CourseMaterial.groupBy","CourseMaterial.aggregate","Announcement.findUnique","Announcement.findUniqueOrThrow","Announcement.findFirst","Announcement.findFirstOrThrow","Announcement.findMany","Announcement.createOne","Announcement.createMany","Announcement.createManyAndReturn","Announcement.updateOne","Announcement.updateMany","Announcement.updateManyAndReturn","Announcement.upsertOne","Announcement.deleteOne","Announcement.deleteMany","Announcement.groupBy","Announcement.aggregate","Notification.findUnique","Notification.findUniqueOrThrow","Notification.findFirst","Notification.findFirstOrThrow","Notification.findMany","Notification.createOne","Notification.createMany","Notification.createManyAndReturn","Notification.updateOne","Notification.updateMany","Notification.updateManyAndReturn","Notification.upsertOne","Notification.deleteOne","Notification.deleteMany","Notification.groupBy","Notification.aggregate","PracticeSet.findUnique","PracticeSet.findUniqueOrThrow","PracticeSet.findFirst","PracticeSet.findFirstOrThrow","PracticeSet.findMany","PracticeSet.createOne","PracticeSet.createMany","PracticeSet.createManyAndReturn","PracticeSet.updateOne","PracticeSet.updateMany","PracticeSet.updateManyAndReturn","PracticeSet.upsertOne","PracticeSet.deleteOne","PracticeSet.deleteMany","PracticeSet.groupBy","PracticeSet.aggregate","AND","OR","NOT","id","title","questions","is_published","student_id","course_id","material_id","tutor_id","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","user_id","message","link","read","file_url","summary","summary_at","assignment_id","note","grade","feedback","SubmissionStatus","status","submittedAt","description","due_date","reminder_sent","booking_id","rating","comment","ReviewStatus","course_slot_id","BookingStatus","booking_status","PaymentStatus","payment_status","transaction_id","refund_id","cancelled_at","total_price","name","start_time","end_time","date","meeting_link","SessionType","session_type","capacity","CourseStatus","display_name","bio","qualification","hourly_rate","rating_avg","total_reviews","is_verified","every","some","none","identifier","value","expiresAt","accountId","providerId","userId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","Role","role","email","emailVerified","image","UserStatus","assignment_id_student_id","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "0AiJAfABFQQAAJEEACAFAACSBAAgCwAAlAQAIA8AAPADACAVAADsAwAgFgAA7QMAIBgAAJMEACAZAACVBAAgkgIAAI4EADCTAgAAJAAQlAIAAI4EADCVAgEAAAABnQJAAOkDACGeAkAA6QMAIbwCAACQBPcCIs4CAQDlAwAh7QIBAP4DACHyAgAAjwTyAiLzAgEAAAAB9AIgAOgDACH1AgEA_gMAIQEAAAABACAMAwAA6gMAIJICAAClBAAwkwIAAAMAEJQCAAClBAAwlQIBAOUDACGdAkAA6QMAIZ4CQADpAwAh4wJAAOkDACHmAgEA5QMAIe4CAQDlAwAh7wIBAP4DACHwAgEA_gMAIQMDAADGBgAg7wIAAKYEACDwAgAApgQAIAwDAADqAwAgkgIAAKUEADCTAgAAAwAQlAIAAKUEADCVAgEAAAABnQJAAOkDACGeAkAA6QMAIeMCQADpAwAh5gIBAOUDACHuAgEAAAAB7wIBAP4DACHwAgEA_gMAIQMAAAADACABAAAEADACAAAFACARAwAA6gMAIJICAACkBAAwkwIAAAcAEJQCAACkBAAwlQIBAOUDACGdAkAA6QMAIZ4CQADpAwAh5AIBAOUDACHlAgEA5QMAIeYCAQDlAwAh5wIBAP4DACHoAgEA_gMAIekCAQD-AwAh6gJAAPMDACHrAkAA8wMAIewCAQD-AwAh7QIBAP4DACEIAwAAxgYAIOcCAACmBAAg6AIAAKYEACDpAgAApgQAIOoCAACmBAAg6wIAAKYEACDsAgAApgQAIO0CAACmBAAgEQMAAOoDACCSAgAApAQAMJMCAAAHABCUAgAApAQAMJUCAQAAAAGdAkAA6QMAIZ4CQADpAwAh5AIBAOUDACHlAgEA5QMAIeYCAQDlAwAh5wIBAP4DACHoAgEA_gMAIekCAQD-AwAh6gJAAPMDACHrAkAA8wMAIewCAQD-AwAh7QIBAP4DACEDAAAABwAgAQAACAAwAgAACQAgFQMAAOoDACAHAADrAwAgDQAA7wMAIA8AAPADACAVAADsAwAgFgAA7QMAIBcAAO4DACCSAgAA5AMAMJMCAAALABCUAgAA5AMAMJUCAQDlAwAhnQJAAOkDACGeAkAA6QMAIbACAQDlAwAh1wIBAOUDACHYAgEA5QMAIdkCAQDlAwAh2gIIAOYDACHbAggA5gMAIdwCAgDnAwAh3QIgAOgDACEBAAAACwAgEwYAAIEEACAIAACNBAAgFQAA7AMAIJICAACiBAAwkwIAAA0AEJQCAACiBAAwlQIBAOUDACGaAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIb4CAQD-AwAhzgIBAOUDACHPAkAA6QMAIdACQADpAwAh0QJAAOkDACHSAgEA_gMAIdQCAACjBNQCItUCAgDnAwAhBQYAAL4HACAIAADGBwAgFQAAyAYAIL4CAACmBAAg0gIAAKYEACATBgAAgQQAIAgAAI0EACAVAADsAwAgkgIAAKIEADCTAgAADQAQlAIAAKIEADCVAgEAAAABmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG-AgEA_gMAIc4CAQDlAwAhzwJAAOkDACHQAkAA6QMAIdECQADpAwAh0gIBAP4DACHUAgAAowTUAiLVAgIA5wMAIQMAAAANACABAAAOADACAAAPACADAAAADQAgAQAADgAwAgAADwAgDwYAAIEEACAIAACNBAAgCwAAlAQAIJICAAChBAAwkwIAABIAEJQCAAChBAAwlQIBAOUDACGWAgEA5QMAIZoCAQDlAwAhnAIBAOUDACGdAkAA6QMAIZ4CQADpAwAhvgIBAOUDACG_AkAA8wMAIcACIADoAwAhBAYAAL4HACAIAADGBwAgCwAAvwcAIL8CAACmBAAgDwYAAIEEACAIAACNBAAgCwAAlAQAIJICAAChBAAwkwIAABIAEJQCAAChBAAwlQIBAAAAAZYCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG-AgEA5QMAIb8CQADzAwAhwAIgAOgDACEDAAAAEgAgAQAAEwAwAgAAFAAgDwkAAKAEACAKAADqAwAgkgIAAJ0EADCTAgAAFgAQlAIAAJ0EADCVAgEA5QMAIZkCAQDlAwAhngJAAOkDACG0AgEA5QMAIbcCAQDlAwAhuAIBAP4DACG5AgIAngQAIboCAQD-AwAhvAIAAJ8EvAIivQJAAOkDACEFCQAAyAcAIAoAAMYGACC4AgAApgQAILkCAACmBAAgugIAAKYEACAQCQAAoAQAIAoAAOoDACCSAgAAnQQAMJMCAAAWABCUAgAAnQQAMJUCAQAAAAGZAgEA5QMAIZ4CQADpAwAhtAIBAOUDACG3AgEA5QMAIbgCAQD-AwAhuQICAJ4EACG6AgEA_gMAIbwCAACfBLwCIr0CQADpAwAh9wIAAJwEACADAAAAFgAgAQAAFwAwAgAAGAAgAQAAABYAIA4IAACNBAAgDwAA8AMAIJICAACaBAAwkwIAABsAEJQCAACaBAAwlQIBAOUDACGWAgEA5QMAIZoCAQDlAwAhnAIBAOUDACGdAkAA6QMAIZ4CQADpAwAhtAIBAOUDACG1AgAAmwQAILYCQADzAwAhBAgAAMYHACAPAADMBgAgtQIAAKYEACC2AgAApgQAIA4IAACNBAAgDwAA8AMAIJICAACaBAAwkwIAABsAEJQCAACaBAAwlQIBAAAAAZYCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG0AgEA5QMAIbUCAACbBAAgtgJAAPMDACEDAAAAGwAgAQAAHAAwAgAAHQAgEQYAAIEEACAIAACNBAAgCgAAmQQAIA4AAJgEACCSAgAAlgQAMJMCAAAfABCUAgAAlgQAMJUCAQDlAwAhlgIBAOUDACGXAgAAlwQAIJgCIADoAwAhmQIBAP4DACGaAgEA5QMAIZsCAQD-AwAhnAIBAOUDACGdAkAA6QMAIZ4CQADpAwAhBgYAAL4HACAIAADGBwAgCgAAxgYAIA4AAMcHACCZAgAApgQAIJsCAACmBAAgEQYAAIEEACAIAACNBAAgCgAAmQQAIA4AAJgEACCSAgAAlgQAMJMCAAAfABCUAgAAlgQAMJUCAQAAAAGWAgEA5QMAIZcCAACXBAAgmAIgAOgDACGZAgEA_gMAIZoCAQDlAwAhmwIBAP4DACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACEDAAAAHwAgAQAAIAAwAgAAIQAgAQAAABsAIBUEAACRBAAgBQAAkgQAIAsAAJQEACAPAADwAwAgFQAA7AMAIBYAAO0DACAYAACTBAAgGQAAlQQAIJICAACOBAAwkwIAACQAEJQCAACOBAAwlQIBAOUDACGdAkAA6QMAIZ4CQADpAwAhvAIAAJAE9wIizgIBAOUDACHtAgEA_gMAIfICAACPBPICIvMCAQDlAwAh9AIgAOgDACH1AgEA_gMAIQEAAAAkACABAAAAHwAgCQgAAI0EACCSAgAAjAQAMJMCAAAnABCUAgAAjAQAMJUCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhsQIBAOUDACEBCAAAxgcAIAkIAACNBAAgkgIAAIwEADCTAgAAJwAQlAIAAIwEADCVAgEAAAABmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhsQIBAOUDACEDAAAAJwAgAQAAKAAwAgAAKQAgAwAAAB8AIAEAACAAMAIAACEAIAEAAAANACABAAAAEgAgAQAAABsAIAEAAAAnACABAAAAHwAgFAYAAIEEACAKAADqAwAgEgAAigQAIBQAAIsEACCSAgAAhwQAMJMCAAAxABCUAgAAhwQAMJUCAQDlAwAhmQIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACHAAiAA6AMAIcUCAQDlAwAhxwIAAIgExwIiyQIAAIkEyQIiygIBAP4DACHLAgEA_gMAIcwCQADzAwAhzQIIAOYDACEHBgAAvgcAIAoAAMYGACASAADEBwAgFAAAxQcAIMoCAACmBAAgywIAAKYEACDMAgAApgQAIBQGAACBBAAgCgAA6gMAIBIAAIoEACAUAACLBAAgkgIAAIcEADCTAgAAMQAQlAIAAIcEADCVAgEAAAABmQIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACHAAiAA6AMAIcUCAQDlAwAhxwIAAIgExwIiyQIAAIkEyQIiygIBAAAAAcsCAQD-AwAhzAJAAPMDACHNAggA5gMAIQMAAAAxACABAAAyADACAAAzACAPBgAAgQQAIAoAAOoDACATAACGBAAgkgIAAIQEADCTAgAANQAQlAIAAIQEADCVAgEA5QMAIZkCAQDlAwAhnAIBAOUDACGdAkAA6QMAIZ4CQADpAwAhvAIAAIUExQIiwQIBAOUDACHCAgIA5wMAIcMCAQD-AwAhAQAAADUAIAEAAAAxACADAAAAMQAgAQAAMgAwAgAAMwAgBAYAAL4HACAKAADGBgAgEwAAwwcAIMMCAACmBAAgDwYAAIEEACAKAADqAwAgEwAAhgQAIJICAACEBAAwkwIAADUAEJQCAACEBAAwlQIBAAAAAZkCAQDlAwAhnAIBAOUDACGdAkAA6QMAIZ4CQADpAwAhvAIAAIUExQIiwQIBAAAAAcICAgDnAwAhwwIBAP4DACEDAAAANQAgAQAAOQAwAgAAOgAgEAYAAIEEACAHAADrAwAgDQAA7wMAIA8AAPADACAQAACCBAAgEQAAgwQAIJICAAD_AwAwkwIAADwAEJQCAAD_AwAwlQIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG8AgAAgATXAiK-AgEA5QMAIc4CAQDlAwAhBgYAAL4HACAHAADHBgAgDQAAywYAIA8AAMwGACAQAADBBwAgEQAAwgcAIBAGAACBBAAgBwAA6wMAIA0AAO8DACAPAADwAwAgEAAAggQAIBEAAIMEACCSAgAA_wMAMJMCAAA8ABCUAgAA_wMAMJUCAQAAAAGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG8AgAAgATXAiK-AgEA5QMAIc4CAQDlAwAhAwAAADwAIAEAAD0AMAIAAD4AIAMAAAASACABAAATADACAAAUACADAAAAHwAgAQAAIAAwAgAAIQAgAQAAAA0AIAEAAAAxACABAAAANQAgAQAAADwAIAEAAAASACABAAAAHwAgAwAAADEAIAEAADIAMAIAADMAIAMAAAA1ACABAAA5ADACAAA6ACADAAAAFgAgAQAAFwAwAgAAGAAgCgMAAOoDACCSAgAA_QMAMJMCAABLABCUAgAA_QMAMJUCAQDlAwAhnQJAAOkDACGwAgEA5QMAIbECAQDlAwAhsgIBAP4DACGzAiAA6AMAIQIDAADGBgAgsgIAAKYEACAKAwAA6gMAIJICAAD9AwAwkwIAAEsAEJQCAAD9AwAwlQIBAAAAAZ0CQADpAwAhsAIBAOUDACGxAgEA5QMAIbICAQD-AwAhswIgAOgDACEDAAAASwAgAQAATAAwAgAATQAgAwAAAB8AIAEAACAAMAIAACEAIAEAAAADACABAAAABwAgAQAAADEAIAEAAAA1ACABAAAAFgAgAQAAAEsAIAEAAAAfACABAAAAAQAgCgQAALwHACAFAAC9BwAgCwAAvwcAIA8AAMwGACAVAADIBgAgFgAAyQYAIBgAAL4HACAZAADABwAg7QIAAKYEACD1AgAApgQAIAMAAAAkACABAABYADACAAABACADAAAAJAAgAQAAWAAwAgAAAQAgAwAAACQAIAEAAFgAMAIAAAEAIBIEAAC0BwAgBQAAtQcAIAsAALkHACAPAAC7BwAgFQAAtwcAIBYAALgHACAYAAC2BwAgGQAAugcAIJUCAQAAAAGdAkAAAAABngJAAAAAAbwCAAAA9wICzgIBAAAAAe0CAQAAAAHyAgAAAPICAvMCAQAAAAH0AiAAAAAB9QIBAAAAAQEfAABcACAKlQIBAAAAAZ0CQAAAAAGeAkAAAAABvAIAAAD3AgLOAgEAAAAB7QIBAAAAAfICAAAA8gIC8wIBAAAAAfQCIAAAAAH1AgEAAAABAR8AAF4AMAEfAABeADASBAAA3wYAIAUAAOAGACALAADkBgAgDwAA5gYAIBUAAOIGACAWAADjBgAgGAAA4QYAIBkAAOUGACCVAgEAqgQAIZ0CQACsBAAhngJAAKwEACG8AgAA3gb3AiLOAgEAqgQAIe0CAQCtBAAh8gIAAN0G8gIi8wIBAKoEACH0AiAAqwQAIfUCAQCtBAAhAgAAAAEAIB8AAGEAIAqVAgEAqgQAIZ0CQACsBAAhngJAAKwEACG8AgAA3gb3AiLOAgEAqgQAIe0CAQCtBAAh8gIAAN0G8gIi8wIBAKoEACH0AiAAqwQAIfUCAQCtBAAhAgAAACQAIB8AAGMAIAIAAAAkACAfAABjACADAAAAAQAgJgAAXAAgJwAAYQAgAQAAAAEAIAEAAAAkACAFDAAA2gYAICwAANwGACAtAADbBgAg7QIAAKYEACD1AgAApgQAIA2SAgAA9gMAMJMCAABqABCUAgAA9gMAMJUCAQCrAwAhnQJAAK8DACGeAkAArwMAIbwCAAD4A_cCIs4CAQCrAwAh7QIBAK4DACHyAgAA9wPyAiLzAgEAqwMAIfQCIACtAwAh9QIBAK4DACEDAAAAJAAgAQAAaQAwKwAAagAgAwAAACQAIAEAAFgAMAIAAAEAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgCQMAANkGACCVAgEAAAABnQJAAAAAAZ4CQAAAAAHjAkAAAAAB5gIBAAAAAe4CAQAAAAHvAgEAAAAB8AIBAAAAAQEfAAByACAIlQIBAAAAAZ0CQAAAAAGeAkAAAAAB4wJAAAAAAeYCAQAAAAHuAgEAAAAB7wIBAAAAAfACAQAAAAEBHwAAdAAwAR8AAHQAMAkDAADYBgAglQIBAKoEACGdAkAArAQAIZ4CQACsBAAh4wJAAKwEACHmAgEAqgQAIe4CAQCqBAAh7wIBAK0EACHwAgEArQQAIQIAAAAFACAfAAB3ACAIlQIBAKoEACGdAkAArAQAIZ4CQACsBAAh4wJAAKwEACHmAgEAqgQAIe4CAQCqBAAh7wIBAK0EACHwAgEArQQAIQIAAAADACAfAAB5ACACAAAAAwAgHwAAeQAgAwAAAAUAICYAAHIAICcAAHcAIAEAAAAFACABAAAAAwAgBQwAANUGACAsAADXBgAgLQAA1gYAIO8CAACmBAAg8AIAAKYEACALkgIAAPUDADCTAgAAgAEAEJQCAAD1AwAwlQIBAKsDACGdAkAArwMAIZ4CQACvAwAh4wJAAK8DACHmAgEAqwMAIe4CAQCrAwAh7wIBAK4DACHwAgEArgMAIQMAAAADACABAAB_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_QUAIA0AAIEGACAPAACCBgAgFQAA_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_QEAMAEfAAD9AQAwEQYAAIoFACAKAACJBQAgEgAAiwUAIBQAAIwFACCVAgEAqgQAIZkCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhwAIgAKsEACHFAgEAqgQAIccCAACGBccCIskCAACHBckCIsoCAQCtBAAhywIBAK0EACHMAkAAwwQAIc0CCACIBQAhAgAAADMAIB8AAIACACANlQIBAKoEACGZAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIcACIACrBAAhxQIBAKoEACHHAgAAhgXHAiLJAgAAhwXJAiLKAgEArQQAIcsCAQCtBAAhzAJAAMMEACHNAggAiAUAIQIAAAAxACAfAACCAgAgAgAAADEAIB8AAIICACADAAAAMwAgJgAA-wEAICcAAIACACABAAAAMwAgAQAAADEAIAgMAACBBQAgLAAAhAUAIC0AAIMFACBuAACCBQAgbwAAhQUAIMoCAACmBAAgywIAAKYEACDMAgAApgQAIBCSAgAA0gMAMJMCAACJAgAQlAIAANIDADCVAgEAqwMAIZkCAQCrAwAhnAIBAKsDACGdAkAArwMAIZ4CQACvAwAhwAIgAK0DACHFAgEAqwMAIccCAADTA8cCIskCAADUA8kCIsoCAQCuAwAhywIBAK4DACHMAkAAvwMAIc0CCADVAwAhAwAAADEAIAEAAIgCADArAACJAgAgAwAAADEAIAEAADIAMAIAADMAIAEAAAA6ACABAAAAOgAgAwAAADUAIAEAADkAMAIAADoAIAMAAAA1ACABAAA5ADACAAA6ACADAAAANQAgAQAAOQAwAgAAOgAgDAYAAP8EACAKAACABQAgEwAA_gQAIJUCAQAAAAGZAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABvAIAAADFAgLBAgEAAAABwgICAAAAAcMCAQAAAAEBHwAAkQIAIAmVAgEAAAABmQIBAAAAAZwCAQAAAAGdAkAAAAABngJAAAAAAbwCAAAAxQICwQIBAAAAAcICAgAAAAHDAgEAAAABAR8AAJMCADABHwAAkwIAMAwGAAD8BAAgCgAA_QQAIBMAAPsEACCVAgEAqgQAIZkCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAAPoExQIiwQIBAKoEACHCAgIA-QQAIcMCAQCtBAAhAgAAADoAIB8AAJYCACAJlQIBAKoEACGZAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIbwCAAD6BMUCIsECAQCqBAAhwgICAPkEACHDAgEArQQAIQIAAAA1ACAfAACYAgAgAgAAADUAIB8AAJgCACADAAAAOgAgJgAAkQIAICcAAJYCACABAAAAOgAgAQAAADUAIAYMAAD0BAAgLAAA9wQAIC0AAPYEACBuAAD1BAAgbwAA-AQAIMMCAACmBAAgDJICAADLAwAwkwIAAJ8CABCUAgAAywMAMJUCAQCrAwAhmQIBAKsDACGcAgEAqwMAIZ0CQACvAwAhngJAAK8DACG8AgAAzQPFAiLBAgEAqwMAIcICAgDMAwAhwwIBAK4DACEDAAAANQAgAQAAngIAMCsAAJ8CACADAAAANQAgAQAAOQAwAgAAOgAgAQAAABQAIAEAAAAUACADAAAAEgAgAQAAEwAwAgAAFAAgAwAAABIAIAEAABMAMAIAABQAIAMAAAASACABAAATADACAAAUACAMBgAA8gQAIAgAAPEEACALAADzBAAglQIBAAAAAZYCAQAAAAGaAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABvgIBAAAAAb8CQAAAAAHAAiAAAAABAR8AAKcCACAJlQIBAAAAAZYCAQAAAAGaAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABvgIBAAAAAb8CQAAAAAHAAiAAAAABAR8AAKkCADABHwAAqQIAMAwGAADjBAAgCAAA4gQAIAsAAOQEACCVAgEAqgQAIZYCAQCqBAAhmgIBAKoEACGcAgEAqgQAIZ0CQACsBAAhngJAAKwEACG-AgEAqgQAIb8CQADDBAAhwAIgAKsEACECAAAAFAAgHwAArAIAIAmVAgEAqgQAIZYCAQCqBAAhmgIBAKoEACGcAgEAqgQAIZ0CQACsBAAhngJAAKwEACG-AgEAqgQAIb8CQADDBAAhwAIgAKsEACECAAAAEgAgHwAArgIAIAIAAAASACAfAACuAgAgAwAAABQAICYAAKcCACAnAACsAgAgAQAAABQAIAEAAAASACAEDAAA3wQAICwAAOEEACAtAADgBAAgvwIAAKYEACAMkgIAAMoDADCTAgAAtQIAEJQCAADKAwAwlQIBAKsDACGWAgEAqwMAIZoCAQCrAwAhnAIBAKsDACGdAkAArwMAIZ4CQACvAwAhvgIBAKsDACG_AkAAvwMAIcACIACtAwAhAwAAABIAIAEAALQCADArAAC1AgAgAwAAABIAIAEAABMAMAIAABQAIAEAAAAYACABAAAAGAAgAwAAABYAIAEAABcAMAIAABgAIAMAAAAWACABAAAXADACAAAYACADAAAAFgAgAQAAFwAwAgAAGAAgDAkAAN0EACAKAADeBAAglQIBAAAAAZkCAQAAAAGeAkAAAAABtAIBAAAAAbcCAQAAAAG4AgEAAAABuQICAAAAAboCAQAAAAG8AgAAALwCAr0CQAAAAAEBHwAAvQIAIAqVAgEAAAABmQIBAAAAAZ4CQAAAAAG0AgEAAAABtwIBAAAAAbgCAQAAAAG5AgIAAAABugIBAAAAAbwCAAAAvAICvQJAAAAAAQEfAAC_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_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_AkAAvwMAIcACIACtAwAhDJICAADLAwAwkwIAAJ8CABCUAgAAywMAMJUCAQCrAwAhmQIBAKsDACGcAgEAqwMAIZ0CQACvAwAhngJAAK8DACG8AgAAzQPFAiLBAgEAqwMAIcICAgDMAwAhwwIBAK4DACENDAAAsQMAICwAALEDACAtAACxAwAgbgAA0QMAIG8AALEDACCfAgIAAAABoAICAAAABKECAgAAAASiAgIAAAABowICAAAAAaQCAgAAAAGlAgIAAAABpgICANADACEHDAAAsQMAICwAAM8DACAtAADPAwAgnwIAAADFAgKgAgAAAMUCCKECAAAAxQIIpgIAAM4DxQIiBwwAALEDACAsAADPAwAgLQAAzwMAIJ8CAAAAxQICoAIAAADFAgihAgAAAMUCCKYCAADOA8UCIgSfAgAAAMUCAqACAAAAxQIIoQIAAADFAgimAgAAzwPFAiINDAAAsQMAICwAALEDACAtAACxAwAgbgAA0QMAIG8AALEDACCfAgIAAAABoAICAAAABKECAgAAAASiAgIAAAABowICAAAAAaQCAgAAAAGlAgIAAAABpgICANADACEInwIIAAAAAaACCAAAAAShAggAAAAEogIIAAAAAaMCCAAAAAGkAggAAAABpQIIAAAAAaYCCADRAwAhEJICAADSAwAwkwIAAIkCABCUAgAA0gMAMJUCAQCrAwAhmQIBAKsDACGcAgEAqwMAIZ0CQACvAwAhngJAAK8DACHAAiAArQMAIcUCAQCrAwAhxwIAANMDxwIiyQIAANQDyQIiygIBAK4DACHLAgEArgMAIcwCQAC_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_gMAIfICAACPBPICIvMCAQDlAwAh9AIgAOgDACH1AgEA_gMAIfgCAAAkACD5AgAAJAAgA94CAAANACDfAgAADQAg4AIAAA0AIAPeAgAAMQAg3wIAADEAIOACAAAxACAD3gIAADUAIN8CAAA1ACDgAgAANQAgA94CAAA8ACDfAgAAPAAg4AIAADwAIAPeAgAAEgAg3wIAABIAIOACAAASACAD3gIAAB8AIN8CAAAfACDgAgAAHwAgCZICAADxAwAwkwIAAK8BABCUAgAA8QMAMJUCAQCrAwAhnQJAAL8DACGeAkAAvwMAIeECAQCrAwAh4gIBAKsDACHjAkAArwMAIQmSAgAA8gMAMJMCAACcAQAQlAIAAPIDADCVAgEA5QMAIZ0CQADzAwAhngJAAPMDACHhAgEA5QMAIeICAQDlAwAh4wJAAOkDACEInwJAAAAAAaACQAAAAAWhAkAAAAAFogJAAAAAAaMCQAAAAAGkAkAAAAABpQJAAAAAAaYCQADBAwAhEJICAAD0AwAwkwIAAJYBABCUAgAA9AMAMJUCAQCrAwAhnQJAAK8DACGeAkAArwMAIeQCAQCrAwAh5QIBAKsDACHmAgEAqwMAIecCAQCuAwAh6AIBAK4DACHpAgEArgMAIeoCQAC_AwAh6wJAAL8DACHsAgEArgMAIe0CAQCuAwAhC5ICAAD1AwAwkwIAAIABABCUAgAA9QMAMJUCAQCrAwAhnQJAAK8DACGeAkAArwMAIeMCQACvAwAh5gIBAKsDACHuAgEAqwMAIe8CAQCuAwAh8AIBAK4DACENkgIAAPYDADCTAgAAagAQlAIAAPYDADCVAgEAqwMAIZ0CQACvAwAhngJAAK8DACG8AgAA-AP3AiLOAgEAqwMAIe0CAQCuAwAh8gIAAPcD8gIi8wIBAKsDACH0AiAArQMAIfUCAQCuAwAhBwwAALEDACAsAAD8AwAgLQAA_AMAIJ8CAAAA8gICoAIAAADyAgihAgAAAPICCKYCAAD7A_ICIgcMAACxAwAgLAAA-gMAIC0AAPoDACCfAgAAAPcCAqACAAAA9wIIoQIAAAD3AgimAgAA-QP3AiIHDAAAsQMAICwAAPoDACAtAAD6AwAgnwIAAAD3AgKgAgAAAPcCCKECAAAA9wIIpgIAAPkD9wIiBJ8CAAAA9wICoAIAAAD3AgihAgAAAPcCCKYCAAD6A_cCIgcMAACxAwAgLAAA_AMAIC0AAPwDACCfAgAAAPICAqACAAAA8gIIoQIAAADyAgimAgAA-wPyAiIEnwIAAADyAgKgAgAAAPICCKECAAAA8gIIpgIAAPwD8gIiCgMAAOoDACCSAgAA_QMAMJMCAABLABCUAgAA_QMAMJUCAQDlAwAhnQJAAOkDACGwAgEA5QMAIbECAQDlAwAhsgIBAP4DACGzAiAA6AMAIQufAgEAAAABoAIBAAAABaECAQAAAAWiAgEAAAABowIBAAAAAaQCAQAAAAGlAgEAAAABpgIBALUDACGnAgEAAAABqAIBAAAAAakCAQAAAAEQBgAAgQQAIAcAAOsDACANAADvAwAgDwAA8AMAIBAAAIIEACARAACDBAAgkgIAAP8DADCTAgAAPAAQlAIAAP8DADCVAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIbwCAACABNcCIr4CAQDlAwAhzgIBAOUDACEEnwIAAADXAgKgAgAAANcCCKECAAAA1wIIpgIAAOID1wIiFwMAAOoDACAHAADrAwAgDQAA7wMAIA8AAPADACAVAADsAwAgFgAA7QMAIBcAAO4DACCSAgAA5AMAMJMCAAALABCUAgAA5AMAMJUCAQDlAwAhnQJAAOkDACGeAkAA6QMAIbACAQDlAwAh1wIBAOUDACHYAgEA5QMAIdkCAQDlAwAh2gIIAOYDACHbAggA5gMAIdwCAgDnAwAh3QIgAOgDACH4AgAACwAg-QIAAAsAIAPeAgAAGwAg3wIAABsAIOACAAAbACAD3gIAACcAIN8CAAAnACDgAgAAJwAgDwYAAIEEACAKAADqAwAgEwAAhgQAIJICAACEBAAwkwIAADUAEJQCAACEBAAwlQIBAOUDACGZAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIbwCAACFBMUCIsECAQDlAwAhwgICAOcDACHDAgEA_gMAIQSfAgAAAMUCAqACAAAAxQIIoQIAAADFAgimAgAAzwPFAiIWBgAAgQQAIAoAAOoDACASAACKBAAgFAAAiwQAIJICAACHBAAwkwIAADEAEJQCAACHBAAwlQIBAOUDACGZAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIcACIADoAwAhxQIBAOUDACHHAgAAiATHAiLJAgAAiQTJAiLKAgEA_gMAIcsCAQD-AwAhzAJAAPMDACHNAggA5gMAIfgCAAAxACD5AgAAMQAgFAYAAIEEACAKAADqAwAgEgAAigQAIBQAAIsEACCSAgAAhwQAMJMCAAAxABCUAgAAhwQAMJUCAQDlAwAhmQIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACHAAiAA6AMAIcUCAQDlAwAhxwIAAIgExwIiyQIAAIkEyQIiygIBAP4DACHLAgEA_gMAIcwCQADzAwAhzQIIAOYDACEEnwIAAADHAgKgAgAAAMcCCKECAAAAxwIIpgIAANoDxwIiBJ8CAAAAyQICoAIAAADJAgihAgAAAMkCCKYCAADYA8kCIhUGAACBBAAgCAAAjQQAIBUAAOwDACCSAgAAogQAMJMCAAANABCUAgAAogQAMJUCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG-AgEA_gMAIc4CAQDlAwAhzwJAAOkDACHQAkAA6QMAIdECQADpAwAh0gIBAP4DACHUAgAAowTUAiLVAgIA5wMAIfgCAAANACD5AgAADQAgEQYAAIEEACAKAADqAwAgEwAAhgQAIJICAACEBAAwkwIAADUAEJQCAACEBAAwlQIBAOUDACGZAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIbwCAACFBMUCIsECAQDlAwAhwgICAOcDACHDAgEA_gMAIfgCAAA1ACD5AgAANQAgCQgAAI0EACCSAgAAjAQAMJMCAAAnABCUAgAAjAQAMJUCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhsQIBAOUDACESBgAAgQQAIAcAAOsDACANAADvAwAgDwAA8AMAIBAAAIIEACARAACDBAAgkgIAAP8DADCTAgAAPAAQlAIAAP8DADCVAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIbwCAACABNcCIr4CAQDlAwAhzgIBAOUDACH4AgAAPAAg-QIAADwAIBUEAACRBAAgBQAAkgQAIAsAAJQEACAPAADwAwAgFQAA7AMAIBYAAO0DACAYAACTBAAgGQAAlQQAIJICAACOBAAwkwIAACQAEJQCAACOBAAwlQIBAOUDACGdAkAA6QMAIZ4CQADpAwAhvAIAAJAE9wIizgIBAOUDACHtAgEA_gMAIfICAACPBPICIvMCAQDlAwAh9AIgAOgDACH1AgEA_gMAIQSfAgAAAPICAqACAAAA8gIIoQIAAADyAgimAgAA_APyAiIEnwIAAAD3AgKgAgAAAPcCCKECAAAA9wIIpgIAAPoD9wIiA94CAAADACDfAgAAAwAg4AIAAAMAIAPeAgAABwAg3wIAAAcAIOACAAAHACAXAwAA6gMAIAcAAOsDACANAADvAwAgDwAA8AMAIBUAAOwDACAWAADtAwAgFwAA7gMAIJICAADkAwAwkwIAAAsAEJQCAADkAwAwlQIBAOUDACGdAkAA6QMAIZ4CQADpAwAhsAIBAOUDACHXAgEA5QMAIdgCAQDlAwAh2QIBAOUDACHaAggA5gMAIdsCCADmAwAh3AICAOcDACHdAiAA6AMAIfgCAAALACD5AgAACwAgA94CAAAWACDfAgAAFgAg4AIAABYAIAPeAgAASwAg3wIAAEsAIOACAABLACARBgAAgQQAIAgAAI0EACAKAACZBAAgDgAAmAQAIJICAACWBAAwkwIAAB8AEJQCAACWBAAwlQIBAOUDACGWAgEA5QMAIZcCAACXBAAgmAIgAOgDACGZAgEA_gMAIZoCAQDlAwAhmwIBAP4DACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACEMnwKAAAAAAaICgAAAAAGjAoAAAAABpAKAAAAAAaUCgAAAAAGmAoAAAAABqgIBAAAAAasCAQAAAAGsAgEAAAABrQKAAAAAAa4CgAAAAAGvAoAAAAABEAgAAI0EACAPAADwAwAgkgIAAJoEADCTAgAAGwAQlAIAAJoEADCVAgEA5QMAIZYCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG0AgEA5QMAIbUCAACbBAAgtgJAAPMDACH4AgAAGwAg-QIAABsAIBcEAACRBAAgBQAAkgQAIAsAAJQEACAPAADwAwAgFQAA7AMAIBYAAO0DACAYAACTBAAgGQAAlQQAIJICAACOBAAwkwIAACQAEJQCAACOBAAwlQIBAOUDACGdAkAA6QMAIZ4CQADpAwAhvAIAAJAE9wIizgIBAOUDACHtAgEA_gMAIfICAACPBPICIvMCAQDlAwAh9AIgAOgDACH1AgEA_gMAIfgCAAAkACD5AgAAJAAgDggAAI0EACAPAADwAwAgkgIAAJoEADCTAgAAGwAQlAIAAJoEADCVAgEA5QMAIZYCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG0AgEA5QMAIbUCAACbBAAgtgJAAPMDACEMnwKAAAAAAaICgAAAAAGjAoAAAAABpAKAAAAAAaUCgAAAAAGmAoAAAAABqgIBAAAAAasCAQAAAAGsAgEAAAABrQKAAAAAAa4CgAAAAAGvAoAAAAABApkCAQAAAAG3AgEAAAABDwkAAKAEACAKAADqAwAgkgIAAJ0EADCTAgAAFgAQlAIAAJ0EADCVAgEA5QMAIZkCAQDlAwAhngJAAOkDACG0AgEA5QMAIbcCAQDlAwAhuAIBAP4DACG5AgIAngQAIboCAQD-AwAhvAIAAJ8EvAIivQJAAOkDACEInwICAAAAAaACAgAAAAWhAgIAAAAFogICAAAAAaMCAgAAAAGkAgIAAAABpQICAAAAAaYCAgC0AwAhBJ8CAAAAvAICoAIAAAC8AgihAgAAALwCCKYCAADHA7wCIhEGAACBBAAgCAAAjQQAIAsAAJQEACCSAgAAoQQAMJMCAAASABCUAgAAoQQAMJUCAQDlAwAhlgIBAOUDACGaAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIb4CAQDlAwAhvwJAAPMDACHAAiAA6AMAIfgCAAASACD5AgAAEgAgDwYAAIEEACAIAACNBAAgCwAAlAQAIJICAAChBAAwkwIAABIAEJQCAAChBAAwlQIBAOUDACGWAgEA5QMAIZoCAQDlAwAhnAIBAOUDACGdAkAA6QMAIZ4CQADpAwAhvgIBAOUDACG_AkAA8wMAIcACIADoAwAhEwYAAIEEACAIAACNBAAgFQAA7AMAIJICAACiBAAwkwIAAA0AEJQCAACiBAAwlQIBAOUDACGaAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIb4CAQD-AwAhzgIBAOUDACHPAkAA6QMAIdACQADpAwAh0QJAAOkDACHSAgEA_gMAIdQCAACjBNQCItUCAgDnAwAhBJ8CAAAA1AICoAIAAADUAgihAgAAANQCCKYCAADeA9QCIhEDAADqAwAgkgIAAKQEADCTAgAABwAQlAIAAKQEADCVAgEA5QMAIZ0CQADpAwAhngJAAOkDACHkAgEA5QMAIeUCAQDlAwAh5gIBAOUDACHnAgEA_gMAIegCAQD-AwAh6QIBAP4DACHqAkAA8wMAIesCQADzAwAh7AIBAP4DACHtAgEA_gMAIQwDAADqAwAgkgIAAKUEADCTAgAAAwAQlAIAAKUEADCVAgEA5QMAIZ0CQADpAwAhngJAAOkDACHjAkAA6QMAIeYCAQDlAwAh7gIBAOUDACHvAgEA_gMAIfACAQD-AwAhAAAAAAH9AgEAAAABAf0CIAAAAAEB_QJAAAAAAQH9AgEAAAABBSYAAMMIACAnAADPCAAg-gIAAMQIACD7AgAAzggAIIADAAA-ACAHJgAAwQgAICcAAMwIACD6AgAAwggAIPsCAADLCAAg_gIAABsAIP8CAAAbACCAAwAAHQAgBSYAAL8IACAnAADJCAAg-gIAAMAIACD7AgAAyAgAIIADAACyAQAgByYAAL0IACAnAADGCAAg-gIAAL4IACD7AgAAxQgAIP4CAAAkACD_AgAAJAAggAMAAAEAIAMmAADDCAAg-gIAAMQIACCAAwAAPgAgAyYAAMEIACD6AgAAwggAIIADAAAdACADJgAAvwgAIPoCAADACAAggAMAALIBACADJgAAvQgAIPoCAAC-CAAggAMAAAEAIAAAAAUmAAC4CAAgJwAAuwgAIPoCAAC5CAAg-wIAALoIACCAAwAAAQAgAyYAALgIACD6AgAAuQgAIIADAAABACAAAAAFJgAAswgAICcAALYIACD6AgAAtAgAIPsCAAC1CAAggAMAAD4AIAMmAACzCAAg-gIAALQIACCAAwAAPgAgAAAAAf0CQAAAAAEFJgAArQgAICcAALEIACD6AgAArggAIPsCAACwCAAggAMAAD4AIAsmAADGBAAwJwAAywQAMPoCAADHBAAw-wIAAMgEADD8AgAAyQQAIP0CAADKBAAw_gIAAMoEADD_AgAAygQAMIADAADKBAAwgQMAAMwEADCCAwAAzQQAMAwGAAC0BAAgCAAAsgQAIAoAALUEACCVAgEAAAABlgIBAAAAAZcCgAAAAAGYAiAAAAABmQIBAAAAAZoCAQAAAAGcAgEAAAABnQJAAAAAAZ4CQAAAAAECAAAAIQAgJgAA0QQAIAMAAAAhACAmAADRBAAgJwAA0AQAIAEfAACvCAAwEQYAAIEEACAIAACNBAAgCgAAmQQAIA4AAJgEACCSAgAAlgQAMJMCAAAfABCUAgAAlgQAMJUCAQAAAAGWAgEA5QMAIZcCAACXBAAgmAIgAOgDACGZAgEA_gMAIZoCAQDlAwAhmwIBAP4DACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACECAAAAIQAgHwAA0AQAIAIAAADOBAAgHwAAzwQAIA2SAgAAzQQAMJMCAADOBAAQlAIAAM0EADCVAgEA5QMAIZYCAQDlAwAhlwIAAJcEACCYAiAA6AMAIZkCAQD-AwAhmgIBAOUDACGbAgEA_gMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIQ2SAgAAzQQAMJMCAADOBAAQlAIAAM0EADCVAgEA5QMAIZYCAQDlAwAhlwIAAJcEACCYAiAA6AMAIZkCAQD-AwAhmgIBAOUDACGbAgEA_gMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIQmVAgEAqgQAIZYCAQCqBAAhlwKAAAAAAZgCIACrBAAhmQIBAK0EACGaAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIQwGAACwBAAgCAAArgQAIAoAALEEACCVAgEAqgQAIZYCAQCqBAAhlwKAAAAAAZgCIACrBAAhmQIBAK0EACGaAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIQwGAAC0BAAgCAAAsgQAIAoAALUEACCVAgEAAAABlgIBAAAAAZcCgAAAAAGYAiAAAAABmQIBAAAAAZoCAQAAAAGcAgEAAAABnQJAAAAAAZ4CQAAAAAEDJgAArQgAIPoCAACuCAAggAMAAD4AIAQmAADGBAAw-gIAAMcEADD8AgAAyQQAIIADAADKBAAwAAAAAAAF_QICAAAAAYMDAgAAAAGEAwIAAAABhQMCAAAAAYYDAgAAAAEB_QIAAAC8AgIFJgAApQgAICcAAKsIACD6AgAApggAIPsCAACqCAAggAMAABQAIAUmAACjCAAgJwAAqAgAIPoCAACkCAAg-wIAAKcIACCAAwAAAQAgAyYAAKUIACD6AgAApggAIIADAAAUACADJgAAowgAIPoCAACkCAAggAMAAAEAIAAAAAUmAACaCAAgJwAAoQgAIPoCAACbCAAg-wIAAKAIACCAAwAAPgAgBSYAAJgIACAnAACeCAAg-gIAAJkIACD7AgAAnQgAIIADAACyAQAgCyYAAOUEADAnAADqBAAw-gIAAOYEADD7AgAA5wQAMPwCAADoBAAg_QIAAOkEADD-AgAA6QQAMP8CAADpBAAwgAMAAOkEADCBAwAA6wQAMIIDAADsBAAwCgoAAN4EACCVAgEAAAABmQIBAAAAAZ4CQAAAAAG0AgEAAAABuAIBAAAAAbkCAgAAAAG6AgEAAAABvAIAAAC8AgK9AkAAAAABAgAAABgAICYAAPAEACADAAAAGAAgJgAA8AQAICcAAO8EACABHwAAnAgAMBAJAACgBAAgCgAA6gMAIJICAACdBAAwkwIAABYAEJQCAACdBAAwlQIBAAAAAZkCAQDlAwAhngJAAOkDACG0AgEA5QMAIbcCAQDlAwAhuAIBAP4DACG5AgIAngQAIboCAQD-AwAhvAIAAJ8EvAIivQJAAOkDACH3AgAAnAQAIAIAAAAYACAfAADvBAAgAgAAAO0EACAfAADuBAAgDZICAADsBAAwkwIAAO0EABCUAgAA7AQAMJUCAQDlAwAhmQIBAOUDACGeAkAA6QMAIbQCAQDlAwAhtwIBAOUDACG4AgEA_gMAIbkCAgCeBAAhugIBAP4DACG8AgAAnwS8AiK9AkAA6QMAIQ2SAgAA7AQAMJMCAADtBAAQlAIAAOwEADCVAgEA5QMAIZkCAQDlAwAhngJAAOkDACG0AgEA5QMAIbcCAQDlAwAhuAIBAP4DACG5AgIAngQAIboCAQD-AwAhvAIAAJ8EvAIivQJAAOkDACEJlQIBAKoEACGZAgEAqgQAIZ4CQACsBAAhtAIBAKoEACG4AgEArQQAIbkCAgDZBAAhugIBAK0EACG8AgAA2gS8AiK9AkAArAQAIQoKAADcBAAglQIBAKoEACGZAgEAqgQAIZ4CQACsBAAhtAIBAKoEACG4AgEArQQAIbkCAgDZBAAhugIBAK0EACG8AgAA2gS8AiK9AkAArAQAIQoKAADeBAAglQIBAAAAAZkCAQAAAAGeAkAAAAABtAIBAAAAAbgCAQAAAAG5AgIAAAABugIBAAAAAbwCAAAAvAICvQJAAAAAAQMmAACaCAAg-gIAAJsIACCAAwAAPgAgAyYAAJgIACD6AgAAmQgAIIADAACyAQAgBCYAAOUEADD6AgAA5gQAMPwCAADoBAAggAMAAOkEADAAAAAAAAX9AgIAAAABgwMCAAAAAYQDAgAAAAGFAwIAAAABhgMCAAAAAQH9AgAAAMUCAgUmAACNCAAgJwAAlggAIPoCAACOCAAg-wIAAJUIACCAAwAAMwAgBSYAAIsIACAnAACTCAAg-gIAAIwIACD7AgAAkggAIIADAACyAQAgBSYAAIkIACAnAACQCAAg-gIAAIoIACD7AgAAjwgAIIADAAABACADJgAAjQgAIPoCAACOCAAggAMAADMAIAMmAACLCAAg-gIAAIwIACCAAwAAsgEAIAMmAACJCAAg-gIAAIoIACCAAwAAAQAgAAAAAAAB_QIAAADHAgIB_QIAAADJAgIF_QIIAAAAAYMDCAAAAAGEAwgAAAABhQMIAAAAAYYDCAAAAAEFJgAA_gcAICcAAIcIACD6AgAA_wcAIPsCAACGCAAggAMAAAEAIAUmAAD8BwAgJwAAhAgAIPoCAAD9BwAg-wIAAIMIACCAAwAAsgEAIAUmAAD6BwAgJwAAgQgAIPoCAAD7BwAg-wIAAIAIACCAAwAADwAgByYAAI0FACAnAACQBQAg-gIAAI4FACD7AgAAjwUAIP4CAAA1ACD_AgAANQAggAMAADoAIAoGAAD_BAAgCgAAgAUAIJUCAQAAAAGZAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABvAIAAADFAgLCAgIAAAABwwIBAAAAAQIAAAA6ACAmAACNBQAgAwAAADUAICYAAI0FACAnAACRBQAgDAAAADUAIAYAAPwEACAKAAD9BAAgHwAAkQUAIJUCAQCqBAAhmQIBAKoEACGcAgEAqgQAIZ0CQACsBAAhngJAAKwEACG8AgAA-gTFAiLCAgIA-QQAIcMCAQCtBAAhCgYAAPwEACAKAAD9BAAglQIBAKoEACGZAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIbwCAAD6BMUCIsICAgD5BAAhwwIBAK0EACEDJgAA_gcAIPoCAAD_BwAggAMAAAEAIAMmAAD8BwAg-gIAAP0HACCAAwAAsgEAIAMmAAD6BwAg-gIAAPsHACCAAwAADwAgAyYAAI0FACD6AgAAjgUAIIADAAA6ACAAAAAAAAH9AgAAANQCAgUmAADxBwAgJwAA-AcAIPoCAADyBwAg-wIAAPcHACCAAwAAsgEAIAUmAADvBwAgJwAA9QcAIPoCAADwBwAg-wIAAPQHACCAAwAAPgAgCyYAAJ8FADAnAACkBQAw-gIAAKAFADD7AgAAoQUAMPwCAACiBQAg_QIAAKMFADD-AgAAowUAMP8CAACjBQAwgAMAAKMFADCBAwAApQUAMIIDAACmBQAwDwYAAJMFACAKAACSBQAgFAAAlQUAIJUCAQAAAAGZAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABwAIgAAAAAccCAAAAxwICyQIAAADJAgLKAgEAAAABywIBAAAAAcwCQAAAAAHNAggAAAABAgAAADMAICYAAKoFACADAAAAMwAgJgAAqgUAICcAAKkFACABHwAA8wcAMBQGAACBBAAgCgAA6gMAIBIAAIoEACAUAACLBAAgkgIAAIcEADCTAgAAMQAQlAIAAIcEADCVAgEAAAABmQIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACHAAiAA6AMAIcUCAQDlAwAhxwIAAIgExwIiyQIAAIkEyQIiygIBAAAAAcsCAQD-AwAhzAJAAPMDACHNAggA5gMAIQIAAAAzACAfAACpBQAgAgAAAKcFACAfAACoBQAgEJICAACmBQAwkwIAAKcFABCUAgAApgUAMJUCAQDlAwAhmQIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACHAAiAA6AMAIcUCAQDlAwAhxwIAAIgExwIiyQIAAIkEyQIiygIBAP4DACHLAgEA_gMAIcwCQADzAwAhzQIIAOYDACEQkgIAAKYFADCTAgAApwUAEJQCAACmBQAwlQIBAOUDACGZAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIcACIADoAwAhxQIBAOUDACHHAgAAiATHAiLJAgAAiQTJAiLKAgEA_gMAIcsCAQD-AwAhzAJAAPMDACHNAggA5gMAIQyVAgEAqgQAIZkCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhwAIgAKsEACHHAgAAhgXHAiLJAgAAhwXJAiLKAgEArQQAIcsCAQCtBAAhzAJAAMMEACHNAggAiAUAIQ8GAACKBQAgCgAAiQUAIBQAAIwFACCVAgEAqgQAIZkCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhwAIgAKsEACHHAgAAhgXHAiLJAgAAhwXJAiLKAgEArQQAIcsCAQCtBAAhzAJAAMMEACHNAggAiAUAIQ8GAACTBQAgCgAAkgUAIBQAAJUFACCVAgEAAAABmQIBAAAAAZwCAQAAAAGdAkAAAAABngJAAAAAAcACIAAAAAHHAgAAAMcCAskCAAAAyQICygIBAAAAAcsCAQAAAAHMAkAAAAABzQIIAAAAAQMmAADxBwAg-gIAAPIHACCAAwAAsgEAIAMmAADvBwAg-gIAAPAHACCAAwAAPgAgBCYAAJ8FADD6AgAAoAUAMPwCAACiBQAggAMAAKMFADAAAAAB_QIAAADXAgIFJgAA5QcAICcAAO0HACD6AgAA5gcAIPsCAADsBwAggAMAALIBACALJgAA5QUAMCcAAOoFADD6AgAA5gUAMPsCAADnBQAw_AIAAOgFACD9AgAA6QUAMP4CAADpBQAw_wIAAOkFADCAAwAA6QUAMIEDAADrBQAwggMAAOwFADALJgAA2QUAMCcAAN4FADD6AgAA2gUAMPsCAADbBQAw_AIAANwFACD9AgAA3QUAMP4CAADdBQAw_wIAAN0FADCAAwAA3QUAMIEDAADfBQAwggMAAOAFADALJgAAzQUAMCcAANIFADD6AgAAzgUAMPsCAADPBQAw_AIAANAFACD9AgAA0QUAMP4CAADRBQAw_wIAANEFADCAAwAA0QUAMIEDAADTBQAwggMAANQFADALJgAAwQUAMCcAAMYFADD6AgAAwgUAMPsCAADDBQAw_AIAAMQFACD9AgAAxQUAMP4CAADFBQAw_wIAAMUFADCAAwAAxQUAMIEDAADHBQAwggMAAMgFADALJgAAuAUAMCcAALwFADD6AgAAuQUAMPsCAAC6BQAw_AIAALsFACD9AgAAygQAMP4CAADKBAAw_wIAAMoEADCAAwAAygQAMIEDAAC9BQAwggMAAM0EADAMBgAAtAQAIAoAALUEACAOAACzBAAglQIBAAAAAZYCAQAAAAGXAoAAAAABmAIgAAAAAZkCAQAAAAGbAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABAgAAACEAICYAAMAFACADAAAAIQAgJgAAwAUAICcAAL8FACABHwAA6wcAMAIAAAAhACAfAAC_BQAgAgAAAM4EACAfAAC-BQAgCZUCAQCqBAAhlgIBAKoEACGXAoAAAAABmAIgAKsEACGZAgEArQQAIZsCAQCtBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhDAYAALAEACAKAACxBAAgDgAArwQAIJUCAQCqBAAhlgIBAKoEACGXAoAAAAABmAIgAKsEACGZAgEArQQAIZsCAQCtBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhDAYAALQEACAKAAC1BAAgDgAAswQAIJUCAQAAAAGWAgEAAAABlwKAAAAAAZgCIAAAAAGZAgEAAAABmwIBAAAAAZwCAQAAAAGdAkAAAAABngJAAAAAAQSVAgEAAAABnAIBAAAAAZ0CQAAAAAGxAgEAAAABAgAAACkAICYAAMwFACADAAAAKQAgJgAAzAUAICcAAMsFACABHwAA6gcAMAkIAACNBAAgkgIAAIwEADCTAgAAJwAQlAIAAIwEADCVAgEAAAABmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhsQIBAOUDACECAAAAKQAgHwAAywUAIAIAAADJBQAgHwAAygUAIAiSAgAAyAUAMJMCAADJBQAQlAIAAMgFADCVAgEA5QMAIZoCAQDlAwAhnAIBAOUDACGdAkAA6QMAIbECAQDlAwAhCJICAADIBQAwkwIAAMkFABCUAgAAyAUAMJUCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhsQIBAOUDACEElQIBAKoEACGcAgEAqgQAIZ0CQACsBAAhsQIBAKoEACEElQIBAKoEACGcAgEAqgQAIZ0CQACsBAAhsQIBAKoEACEElQIBAAAAAZwCAQAAAAGdAkAAAAABsQIBAAAAAQkPAADTBAAglQIBAAAAAZYCAQAAAAGcAgEAAAABnQJAAAAAAZ4CQAAAAAG0AgEAAAABtQKAAAAAAbYCQAAAAAECAAAAHQAgJgAA2AUAIAMAAAAdACAmAADYBQAgJwAA1wUAIAEfAADpBwAwDggAAI0EACAPAADwAwAgkgIAAJoEADCTAgAAGwAQlAIAAJoEADCVAgEAAAABlgIBAOUDACGaAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIbQCAQDlAwAhtQIAAJsEACC2AkAA8wMAIQIAAAAdACAfAADXBQAgAgAAANUFACAfAADWBQAgDJICAADUBQAwkwIAANUFABCUAgAA1AUAMJUCAQDlAwAhlgIBAOUDACGaAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIbQCAQDlAwAhtQIAAJsEACC2AkAA8wMAIQySAgAA1AUAMJMCAADVBQAQlAIAANQFADCVAgEA5QMAIZYCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG0AgEA5QMAIbUCAACbBAAgtgJAAPMDACEIlQIBAKoEACGWAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIbQCAQCqBAAhtQKAAAAAAbYCQADDBAAhCQ8AAMUEACCVAgEAqgQAIZYCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhtAIBAKoEACG1AoAAAAABtgJAAMMEACEJDwAA0wQAIJUCAQAAAAGWAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABtAIBAAAAAbUCgAAAAAG2AkAAAAABCgYAAPIEACALAADzBAAglQIBAAAAAZYCAQAAAAGcAgEAAAABnQJAAAAAAZ4CQAAAAAG-AgEAAAABvwJAAAAAAcACIAAAAAECAAAAFAAgJgAA5AUAIAMAAAAUACAmAADkBQAgJwAA4wUAIAEfAADoBwAwDwYAAIEEACAIAACNBAAgCwAAlAQAIJICAAChBAAwkwIAABIAEJQCAAChBAAwlQIBAAAAAZYCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG-AgEA5QMAIb8CQADzAwAhwAIgAOgDACECAAAAFAAgHwAA4wUAIAIAAADhBQAgHwAA4gUAIAySAgAA4AUAMJMCAADhBQAQlAIAAOAFADCVAgEA5QMAIZYCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG-AgEA5QMAIb8CQADzAwAhwAIgAOgDACEMkgIAAOAFADCTAgAA4QUAEJQCAADgBQAwlQIBAOUDACGWAgEA5QMAIZoCAQDlAwAhnAIBAOUDACGdAkAA6QMAIZ4CQADpAwAhvgIBAOUDACG_AkAA8wMAIcACIADoAwAhCJUCAQCqBAAhlgIBAKoEACGcAgEAqgQAIZ0CQACsBAAhngJAAKwEACG-AgEAqgQAIb8CQADDBAAhwAIgAKsEACEKBgAA4wQAIAsAAOQEACCVAgEAqgQAIZYCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhvgIBAKoEACG_AkAAwwQAIcACIACrBAAhCgYAAPIEACALAADzBAAglQIBAAAAAZYCAQAAAAGcAgEAAAABnQJAAAAAAZ4CQAAAAAG-AgEAAAABvwJAAAAAAcACIAAAAAEOBgAAqwUAIBUAAK0FACCVAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABvgIBAAAAAc4CAQAAAAHPAkAAAAAB0AJAAAAAAdECQAAAAAHSAgEAAAAB1AIAAADUAgLVAgIAAAABAgAAAA8AICYAAPAFACADAAAADwAgJgAA8AUAICcAAO8FACABHwAA5wcAMBMGAACBBAAgCAAAjQQAIBUAAOwDACCSAgAAogQAMJMCAAANABCUAgAAogQAMJUCAQAAAAGaAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIb4CAQD-AwAhzgIBAOUDACHPAkAA6QMAIdACQADpAwAh0QJAAOkDACHSAgEA_gMAIdQCAACjBNQCItUCAgDnAwAhAgAAAA8AIB8AAO8FACACAAAA7QUAIB8AAO4FACAQkgIAAOwFADCTAgAA7QUAEJQCAADsBQAwlQIBAOUDACGaAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIb4CAQD-AwAhzgIBAOUDACHPAkAA6QMAIdACQADpAwAh0QJAAOkDACHSAgEA_gMAIdQCAACjBNQCItUCAgDnAwAhEJICAADsBQAwkwIAAO0FABCUAgAA7AUAMJUCAQDlAwAhmgIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG-AgEA_gMAIc4CAQDlAwAhzwJAAOkDACHQAkAA6QMAIdECQADpAwAh0gIBAP4DACHUAgAAowTUAiLVAgIA5wMAIQyVAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIb4CAQCtBAAhzgIBAKoEACHPAkAArAQAIdACQACsBAAh0QJAAKwEACHSAgEArQQAIdQCAACbBdQCItUCAgD5BAAhDgYAAJwFACAVAACeBQAglQIBAKoEACGcAgEAqgQAIZ0CQACsBAAhngJAAKwEACG-AgEArQQAIc4CAQCqBAAhzwJAAKwEACHQAkAArAQAIdECQACsBAAh0gIBAK0EACHUAgAAmwXUAiLVAgIA-QQAIQ4GAACrBQAgFQAArQUAIJUCAQAAAAGcAgEAAAABnQJAAAAAAZ4CQAAAAAG-AgEAAAABzgIBAAAAAc8CQAAAAAHQAkAAAAAB0QJAAAAAAdICAQAAAAHUAgAAANQCAtUCAgAAAAEDJgAA5QcAIPoCAADmBwAggAMAALIBACAEJgAA5QUAMPoCAADmBQAw_AIAAOgFACCAAwAA6QUAMAQmAADZBQAw-gIAANoFADD8AgAA3AUAIIADAADdBQAwBCYAAM0FADD6AgAAzgUAMPwCAADQBQAggAMAANEFADAEJgAAwQUAMPoCAADCBQAw_AIAAMQFACCAAwAAxQUAMAQmAAC4BQAw-gIAALkFADD8AgAAuwUAIIADAADKBAAwAAAAAAAFJgAA2gcAICcAAOMHACD6AgAA2wcAIPsCAADiBwAggAMAAAEAIAsmAAC2BgAwJwAAugYAMPoCAAC3BgAw-wIAALgGADD8AgAAuQYAIP0CAADpBQAw_gIAAOkFADD_AgAA6QUAMIADAADpBQAwgQMAALsGADCCAwAA7AUAMAsmAACtBgAwJwAAsQYAMPoCAACuBgAw-wIAAK8GADD8AgAAsAYAIP0CAACjBQAw_gIAAKMFADD_AgAAowUAMIADAACjBQAwgQMAALIGADCCAwAApgUAMAsmAAChBgAwJwAApgYAMPoCAACiBgAw-wIAAKMGADD8AgAApAYAIP0CAAClBgAw_gIAAKUGADD_AgAApQYAMIADAAClBgAwgQMAAKcGADCCAwAAqAYAMAsmAACVBgAwJwAAmgYAMPoCAACWBgAw-wIAAJcGADD8AgAAmAYAIP0CAACZBgAw_gIAAJkGADD_AgAAmQYAMIADAACZBgAwgQMAAJsGADCCAwAAnAYAMAsmAACMBgAwJwAAkAYAMPoCAACNBgAw-wIAAI4GADD8AgAAjwYAIP0CAADdBQAw_gIAAN0FADD_AgAA3QUAMIADAADdBQAwgQMAAJEGADCCAwAA4AUAMAsmAACDBgAwJwAAhwYAMPoCAACEBgAw-wIAAIUGADD8AgAAhgYAIP0CAADKBAAw_gIAAMoEADD_AgAAygQAMIADAADKBAAwgQMAAIgGADCCAwAAzQQAMAwIAACyBAAgCgAAtQQAIA4AALMEACCVAgEAAAABlgIBAAAAAZcCgAAAAAGYAiAAAAABmQIBAAAAAZoCAQAAAAGbAgEAAAABnQJAAAAAAZ4CQAAAAAECAAAAIQAgJgAAiwYAIAMAAAAhACAmAACLBgAgJwAAigYAIAEfAADhBwAwAgAAACEAIB8AAIoGACACAAAAzgQAIB8AAIkGACAJlQIBAKoEACGWAgEAqgQAIZcCgAAAAAGYAiAAqwQAIZkCAQCtBAAhmgIBAKoEACGbAgEArQQAIZ0CQACsBAAhngJAAKwEACEMCAAArgQAIAoAALEEACAOAACvBAAglQIBAKoEACGWAgEAqgQAIZcCgAAAAAGYAiAAqwQAIZkCAQCtBAAhmgIBAKoEACGbAgEArQQAIZ0CQACsBAAhngJAAKwEACEMCAAAsgQAIAoAALUEACAOAACzBAAglQIBAAAAAZYCAQAAAAGXAoAAAAABmAIgAAAAAZkCAQAAAAGaAgEAAAABmwIBAAAAAZ0CQAAAAAGeAkAAAAABCggAAPEEACALAADzBAAglQIBAAAAAZYCAQAAAAGaAgEAAAABnQJAAAAAAZ4CQAAAAAG-AgEAAAABvwJAAAAAAcACIAAAAAECAAAAFAAgJgAAlAYAIAMAAAAUACAmAACUBgAgJwAAkwYAIAEfAADgBwAwAgAAABQAIB8AAJMGACACAAAA4QUAIB8AAJIGACAIlQIBAKoEACGWAgEAqgQAIZoCAQCqBAAhnQJAAKwEACGeAkAArAQAIb4CAQCqBAAhvwJAAMMEACHAAiAAqwQAIQoIAADiBAAgCwAA5AQAIJUCAQCqBAAhlgIBAKoEACGaAgEAqgQAIZ0CQACsBAAhngJAAKwEACG-AgEAqgQAIb8CQADDBAAhwAIgAKsEACEKCAAA8QQAIAsAAPMEACCVAgEAAAABlgIBAAAAAZoCAQAAAAGdAkAAAAABngJAAAAAAb4CAQAAAAG_AkAAAAABwAIgAAAAAQsHAADyBQAgDQAA8wUAIA8AAPYFACAQAAD0BQAgEQAA9QUAIJUCAQAAAAGdAkAAAAABngJAAAAAAbwCAAAA1wICvgIBAAAAAc4CAQAAAAECAAAAPgAgJgAAoAYAIAMAAAA-ACAmAACgBgAgJwAAnwYAIAEfAADfBwAwEAYAAIEEACAHAADrAwAgDQAA7wMAIA8AAPADACAQAACCBAAgEQAAgwQAIJICAAD_AwAwkwIAADwAEJQCAAD_AwAwlQIBAAAAAZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIbwCAACABNcCIr4CAQDlAwAhzgIBAOUDACECAAAAPgAgHwAAnwYAIAIAAACdBgAgHwAAngYAIAqSAgAAnAYAMJMCAACdBgAQlAIAAJwGADCVAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIbwCAACABNcCIr4CAQDlAwAhzgIBAOUDACEKkgIAAJwGADCTAgAAnQYAEJQCAACcBgAwlQIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG8AgAAgATXAiK-AgEA5QMAIc4CAQDlAwAhBpUCAQCqBAAhnQJAAKwEACGeAkAArAQAIbwCAACxBdcCIr4CAQCqBAAhzgIBAKoEACELBwAAswUAIA0AALQFACAPAAC3BQAgEAAAtQUAIBEAALYFACCVAgEAqgQAIZ0CQACsBAAhngJAAKwEACG8AgAAsQXXAiK-AgEAqgQAIc4CAQCqBAAhCwcAAPIFACANAADzBQAgDwAA9gUAIBAAAPQFACARAAD1BQAglQIBAAAAAZ0CQAAAAAGeAkAAAAABvAIAAADXAgK-AgEAAAABzgIBAAAAAQoKAACABQAgEwAA_gQAIJUCAQAAAAGZAgEAAAABnQJAAAAAAZ4CQAAAAAG8AgAAAMUCAsECAQAAAAHCAgIAAAABwwIBAAAAAQIAAAA6ACAmAACsBgAgAwAAADoAICYAAKwGACAnAACrBgAgAR8AAN4HADAPBgAAgQQAIAoAAOoDACATAACGBAAgkgIAAIQEADCTAgAANQAQlAIAAIQEADCVAgEAAAABmQIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG8AgAAhQTFAiLBAgEAAAABwgICAOcDACHDAgEA_gMAIQIAAAA6ACAfAACrBgAgAgAAAKkGACAfAACqBgAgDJICAACoBgAwkwIAAKkGABCUAgAAqAYAMJUCAQDlAwAhmQIBAOUDACGcAgEA5QMAIZ0CQADpAwAhngJAAOkDACG8AgAAhQTFAiLBAgEA5QMAIcICAgDnAwAhwwIBAP4DACEMkgIAAKgGADCTAgAAqQYAEJQCAACoBgAwlQIBAOUDACGZAgEA5QMAIZwCAQDlAwAhnQJAAOkDACGeAkAA6QMAIbwCAACFBMUCIsECAQDlAwAhwgICAOcDACHDAgEA_gMAIQiVAgEAqgQAIZkCAQCqBAAhnQJAAKwEACGeAkAArAQAIbwCAAD6BMUCIsECAQCqBAAhwgICAPkEACHDAgEArQQAIQoKAAD9BAAgEwAA-wQAIJUCAQCqBAAhmQIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAAPoExQIiwQIBAKoEACHCAgIA-QQAIcMCAQCtBAAhCgoAAIAFACATAAD-BAAglQIBAAAAAZkCAQAAAAGdAkAAAAABngJAAAAAAbwCAAAAxQICwQIBAAAAAcICAgAAAAHDAgEAAAABDwoAAJIFACASAACUBQAgFAAAlQUAIJUCAQAAAAGZAgEAAAABnQJAAAAAAZ4CQAAAAAHAAiAAAAABxQIBAAAAAccCAAAAxwICyQIAAADJAgLKAgEAAAABywIBAAAAAcwCQAAAAAHNAggAAAABAgAAADMAICYAALUGACADAAAAMwAgJgAAtQYAICcAALQGACABHwAA3QcAMAIAAAAzACAfAAC0BgAgAgAAAKcFACAfAACzBgAgDJUCAQCqBAAhmQIBAKoEACGdAkAArAQAIZ4CQACsBAAhwAIgAKsEACHFAgEAqgQAIccCAACGBccCIskCAACHBckCIsoCAQCtBAAhywIBAK0EACHMAkAAwwQAIc0CCACIBQAhDwoAAIkFACASAACLBQAgFAAAjAUAIJUCAQCqBAAhmQIBAKoEACGdAkAArAQAIZ4CQACsBAAhwAIgAKsEACHFAgEAqgQAIccCAACGBccCIskCAACHBckCIsoCAQCtBAAhywIBAK0EACHMAkAAwwQAIc0CCACIBQAhDwoAAJIFACASAACUBQAgFAAAlQUAIJUCAQAAAAGZAgEAAAABnQJAAAAAAZ4CQAAAAAHAAiAAAAABxQIBAAAAAccCAAAAxwICyQIAAADJAgLKAgEAAAABywIBAAAAAcwCQAAAAAHNAggAAAABDggAAKwFACAVAACtBQAglQIBAAAAAZoCAQAAAAGdAkAAAAABngJAAAAAAb4CAQAAAAHOAgEAAAABzwJAAAAAAdACQAAAAAHRAkAAAAAB0gIBAAAAAdQCAAAA1AIC1QICAAAAAQIAAAAPACAmAAC-BgAgAwAAAA8AICYAAL4GACAnAAC9BgAgAR8AANwHADACAAAADwAgHwAAvQYAIAIAAADtBQAgHwAAvAYAIAyVAgEAqgQAIZoCAQCqBAAhnQJAAKwEACGeAkAArAQAIb4CAQCtBAAhzgIBAKoEACHPAkAArAQAIdACQACsBAAh0QJAAKwEACHSAgEArQQAIdQCAACbBdQCItUCAgD5BAAhDggAAJ0FACAVAACeBQAglQIBAKoEACGaAgEAqgQAIZ0CQACsBAAhngJAAKwEACG-AgEArQQAIc4CAQCqBAAhzwJAAKwEACHQAkAArAQAIdECQACsBAAh0gIBAK0EACHUAgAAmwXUAiLVAgIA-QQAIQ4IAACsBQAgFQAArQUAIJUCAQAAAAGaAgEAAAABnQJAAAAAAZ4CQAAAAAG-AgEAAAABzgIBAAAAAc8CQAAAAAHQAkAAAAAB0QJAAAAAAdICAQAAAAHUAgAAANQCAtUCAgAAAAEDJgAA2gcAIPoCAADbBwAggAMAAAEAIAQmAAC2BgAw-gIAALcGADD8AgAAuQYAIIADAADpBQAwBCYAAK0GADD6AgAArgYAMPwCAACwBgAggAMAAKMFADAEJgAAoQYAMPoCAACiBgAw_AIAAKQGACCAAwAApQYAMAQmAACVBgAw-gIAAJYGADD8AgAAmAYAIIADAACZBgAwBCYAAIwGADD6AgAAjQYAMPwCAACPBgAggAMAAN0FADAEJgAAgwYAMPoCAACEBgAw_AIAAIYGACCAAwAAygQAMAoEAAC8BwAgBQAAvQcAIAsAAL8HACAPAADMBgAgFQAAyAYAIBYAAMkGACAYAAC-BwAgGQAAwAcAIO0CAACmBAAg9QIAAKYEACAAAAAAAAAAAAAAAAAFJgAA1QcAICcAANgHACD6AgAA1gcAIPsCAADXBwAggAMAAAEAIAMmAADVBwAg-gIAANYHACCAAwAAAQAgAAAABSYAANAHACAnAADTBwAg-gIAANEHACD7AgAA0gcAIIADAAABACADJgAA0AcAIPoCAADRBwAggAMAAAEAIAAAAAH9AgAAAPICAgH9AgAAAPcCAgsmAACoBwAwJwAArQcAMPoCAACpBwAw-wIAAKoHADD8AgAAqwcAIP0CAACsBwAw_gIAAKwHADD_AgAArAcAMIADAACsBwAwgQMAAK4HADCCAwAArwcAMAsmAACcBwAwJwAAoQcAMPoCAACdBwAw-wIAAJ4HADD8AgAAnwcAIP0CAACgBwAw_gIAAKAHADD_AgAAoAcAMIADAACgBwAwgQMAAKIHADCCAwAAowcAMAcmAACXBwAgJwAAmgcAIPoCAACYBwAg-wIAAJkHACD-AgAACwAg_wIAAAsAIIADAACyAQAgCyYAAI4HADAnAACSBwAw-gIAAI8HADD7AgAAkAcAMPwCAACRBwAg_QIAAKMFADD-AgAAowUAMP8CAACjBQAwgAMAAKMFADCBAwAAkwcAMIIDAACmBQAwCyYAAIUHADAnAACJBwAw-gIAAIYHADD7AgAAhwcAMPwCAACIBwAg_QIAAKUGADD-AgAApQYAMP8CAAClBgAwgAMAAKUGADCBAwAAigcAMIIDAACoBgAwCyYAAPwGADAnAACABwAw-gIAAP0GADD7AgAA_gYAMPwCAAD_BgAg_QIAAOkEADD-AgAA6QQAMP8CAADpBAAwgAMAAOkEADCBAwAAgQcAMIIDAADsBAAwCyYAAPAGADAnAAD1BgAw-gIAAPEGADD7AgAA8gYAMPwCAADzBgAg_QIAAPQGADD-AgAA9AYAMP8CAAD0BgAwgAMAAPQGADCBAwAA9gYAMIIDAAD3BgAwCyYAAOcGADAnAADrBgAw-gIAAOgGADD7AgAA6QYAMPwCAADqBgAg_QIAAMoEADD-AgAAygQAMP8CAADKBAAwgAMAAMoEADCBAwAA7AYAMIIDAADNBAAwDAYAALQEACAIAACyBAAgDgAAswQAIJUCAQAAAAGWAgEAAAABlwKAAAAAAZgCIAAAAAGaAgEAAAABmwIBAAAAAZwCAQAAAAGdAkAAAAABngJAAAAAAQIAAAAhACAmAADvBgAgAwAAACEAICYAAO8GACAnAADuBgAgAR8AAM8HADACAAAAIQAgHwAA7gYAIAIAAADOBAAgHwAA7QYAIAmVAgEAqgQAIZYCAQCqBAAhlwKAAAAAAZgCIACrBAAhmgIBAKoEACGbAgEArQQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIQwGAACwBAAgCAAArgQAIA4AAK8EACCVAgEAqgQAIZYCAQCqBAAhlwKAAAAAAZgCIACrBAAhmgIBAKoEACGbAgEArQQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIQwGAAC0BAAgCAAAsgQAIA4AALMEACCVAgEAAAABlgIBAAAAAZcCgAAAAAGYAiAAAAABmgIBAAAAAZsCAQAAAAGcAgEAAAABnQJAAAAAAZ4CQAAAAAEFlQIBAAAAAZ0CQAAAAAGxAgEAAAABsgIBAAAAAbMCIAAAAAECAAAATQAgJgAA-wYAIAMAAABNACAmAAD7BgAgJwAA-gYAIAEfAADOBwAwCgMAAOoDACCSAgAA_QMAMJMCAABLABCUAgAA_QMAMJUCAQAAAAGdAkAA6QMAIbACAQDlAwAhsQIBAOUDACGyAgEA_gMAIbMCIADoAwAhAgAAAE0AIB8AAPoGACACAAAA-AYAIB8AAPkGACAJkgIAAPcGADCTAgAA-AYAEJQCAAD3BgAwlQIBAOUDACGdAkAA6QMAIbACAQDlAwAhsQIBAOUDACGyAgEA_gMAIbMCIADoAwAhCZICAAD3BgAwkwIAAPgGABCUAgAA9wYAMJUCAQDlAwAhnQJAAOkDACGwAgEA5QMAIbECAQDlAwAhsgIBAP4DACGzAiAA6AMAIQWVAgEAqgQAIZ0CQACsBAAhsQIBAKoEACGyAgEArQQAIbMCIACrBAAhBZUCAQCqBAAhnQJAAKwEACGxAgEAqgQAIbICAQCtBAAhswIgAKsEACEFlQIBAAAAAZ0CQAAAAAGxAgEAAAABsgIBAAAAAbMCIAAAAAEKCQAA3QQAIJUCAQAAAAGeAkAAAAABtAIBAAAAAbcCAQAAAAG4AgEAAAABuQICAAAAAboCAQAAAAG8AgAAALwCAr0CQAAAAAECAAAAGAAgJgAAhAcAIAMAAAAYACAmAACEBwAgJwAAgwcAIAEfAADNBwAwAgAAABgAIB8AAIMHACACAAAA7QQAIB8AAIIHACAJlQIBAKoEACGeAkAArAQAIbQCAQCqBAAhtwIBAKoEACG4AgEArQQAIbkCAgDZBAAhugIBAK0EACG8AgAA2gS8AiK9AkAArAQAIQoJAADbBAAglQIBAKoEACGeAkAArAQAIbQCAQCqBAAhtwIBAKoEACG4AgEArQQAIbkCAgDZBAAhugIBAK0EACG8AgAA2gS8AiK9AkAArAQAIQoJAADdBAAglQIBAAAAAZ4CQAAAAAG0AgEAAAABtwIBAAAAAbgCAQAAAAG5AgIAAAABugIBAAAAAbwCAAAAvAICvQJAAAAAAQoGAAD_BAAgEwAA_gQAIJUCAQAAAAGcAgEAAAABnQJAAAAAAZ4CQAAAAAG8AgAAAMUCAsECAQAAAAHCAgIAAAABwwIBAAAAAQIAAAA6ACAmAACNBwAgAwAAADoAICYAAI0HACAnAACMBwAgAR8AAMwHADACAAAAOgAgHwAAjAcAIAIAAACpBgAgHwAAiwcAIAiVAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIbwCAAD6BMUCIsECAQCqBAAhwgICAPkEACHDAgEArQQAIQoGAAD8BAAgEwAA-wQAIJUCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAAPoExQIiwQIBAKoEACHCAgIA-QQAIcMCAQCtBAAhCgYAAP8EACATAAD-BAAglQIBAAAAAZwCAQAAAAGdAkAAAAABngJAAAAAAbwCAAAAxQICwQIBAAAAAcICAgAAAAHDAgEAAAABDwYAAJMFACASAACUBQAgFAAAlQUAIJUCAQAAAAGcAgEAAAABnQJAAAAAAZ4CQAAAAAHAAiAAAAABxQIBAAAAAccCAAAAxwICyQIAAADJAgLKAgEAAAABywIBAAAAAcwCQAAAAAHNAggAAAABAgAAADMAICYAAJYHACADAAAAMwAgJgAAlgcAICcAAJUHACABHwAAywcAMAIAAAAzACAfAACVBwAgAgAAAKcFACAfAACUBwAgDJUCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhwAIgAKsEACHFAgEAqgQAIccCAACGBccCIskCAACHBckCIsoCAQCtBAAhywIBAK0EACHMAkAAwwQAIc0CCACIBQAhDwYAAIoFACASAACLBQAgFAAAjAUAIJUCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhwAIgAKsEACHFAgEAqgQAIccCAACGBccCIskCAACHBckCIsoCAQCtBAAhywIBAK0EACHMAkAAwwQAIc0CCACIBQAhDwYAAJMFACASAACUBQAgFAAAlQUAIJUCAQAAAAGcAgEAAAABnQJAAAAAAZ4CQAAAAAHAAiAAAAABxQIBAAAAAccCAAAAxwICyQIAAADJAgLKAgEAAAABywIBAAAAAcwCQAAAAAHNAggAAAABEAcAAMAGACANAADEBgAgDwAAxQYAIBUAAMEGACAWAADCBgAgFwAAwwYAIJUCAQAAAAGdAkAAAAABngJAAAAAAdcCAQAAAAHYAgEAAAAB2QIBAAAAAdoCCAAAAAHbAggAAAAB3AICAAAAAd0CIAAAAAECAAAAsgEAICYAAJcHACADAAAACwAgJgAAlwcAICcAAJsHACASAAAACwAgBwAA_QUAIA0AAIEGACAPAACCBgAgFQAA_gUAIBYAAP8FACAXAACABgAgHwAAmwcAIJUCAQCqBAAhnQJAAKwEACGeAkAArAQAIdcCAQCqBAAh2AIBAKoEACHZAgEAqgQAIdoCCACIBQAh2wIIAIgFACHcAgIA-QQAId0CIACrBAAhEAcAAP0FACANAACBBgAgDwAAggYAIBUAAP4FACAWAAD_BQAgFwAAgAYAIJUCAQCqBAAhnQJAAKwEACGeAkAArAQAIdcCAQCqBAAh2AIBAKoEACHZAgEAqgQAIdoCCACIBQAh2wIIAIgFACHcAgIA-QQAId0CIACrBAAhDJUCAQAAAAGdAkAAAAABngJAAAAAAeQCAQAAAAHlAgEAAAAB5wIBAAAAAegCAQAAAAHpAgEAAAAB6gJAAAAAAesCQAAAAAHsAgEAAAAB7QIBAAAAAQIAAAAJACAmAACnBwAgAwAAAAkAICYAAKcHACAnAACmBwAgAR8AAMoHADARAwAA6gMAIJICAACkBAAwkwIAAAcAEJQCAACkBAAwlQIBAAAAAZ0CQADpAwAhngJAAOkDACHkAgEA5QMAIeUCAQDlAwAh5gIBAOUDACHnAgEA_gMAIegCAQD-AwAh6QIBAP4DACHqAkAA8wMAIesCQADzAwAh7AIBAP4DACHtAgEA_gMAIQIAAAAJACAfAACmBwAgAgAAAKQHACAfAAClBwAgEJICAACjBwAwkwIAAKQHABCUAgAAowcAMJUCAQDlAwAhnQJAAOkDACGeAkAA6QMAIeQCAQDlAwAh5QIBAOUDACHmAgEA5QMAIecCAQD-AwAh6AIBAP4DACHpAgEA_gMAIeoCQADzAwAh6wJAAPMDACHsAgEA_gMAIe0CAQD-AwAhEJICAACjBwAwkwIAAKQHABCUAgAAowcAMJUCAQDlAwAhnQJAAOkDACGeAkAA6QMAIeQCAQDlAwAh5QIBAOUDACHmAgEA5QMAIecCAQD-AwAh6AIBAP4DACHpAgEA_gMAIeoCQADzAwAh6wJAAPMDACHsAgEA_gMAIe0CAQD-AwAhDJUCAQCqBAAhnQJAAKwEACGeAkAArAQAIeQCAQCqBAAh5QIBAKoEACHnAgEArQQAIegCAQCtBAAh6QIBAK0EACHqAkAAwwQAIesCQADDBAAh7AIBAK0EACHtAgEArQQAIQyVAgEAqgQAIZ0CQACsBAAhngJAAKwEACHkAgEAqgQAIeUCAQCqBAAh5wIBAK0EACHoAgEArQQAIekCAQCtBAAh6gJAAMMEACHrAkAAwwQAIewCAQCtBAAh7QIBAK0EACEMlQIBAAAAAZ0CQAAAAAGeAkAAAAAB5AIBAAAAAeUCAQAAAAHnAgEAAAAB6AIBAAAAAekCAQAAAAHqAkAAAAAB6wJAAAAAAewCAQAAAAHtAgEAAAABB5UCAQAAAAGdAkAAAAABngJAAAAAAeMCQAAAAAHuAgEAAAAB7wIBAAAAAfACAQAAAAECAAAABQAgJgAAswcAIAMAAAAFACAmAACzBwAgJwAAsgcAIAEfAADJBwAwDAMAAOoDACCSAgAApQQAMJMCAAADABCUAgAApQQAMJUCAQAAAAGdAkAA6QMAIZ4CQADpAwAh4wJAAOkDACHmAgEA5QMAIe4CAQAAAAHvAgEA_gMAIfACAQD-AwAhAgAAAAUAIB8AALIHACACAAAAsAcAIB8AALEHACALkgIAAK8HADCTAgAAsAcAEJQCAACvBwAwlQIBAOUDACGdAkAA6QMAIZ4CQADpAwAh4wJAAOkDACHmAgEA5QMAIe4CAQDlAwAh7wIBAP4DACHwAgEA_gMAIQuSAgAArwcAMJMCAACwBwAQlAIAAK8HADCVAgEA5QMAIZ0CQADpAwAhngJAAOkDACHjAkAA6QMAIeYCAQDlAwAh7gIBAOUDACHvAgEA_gMAIfACAQD-AwAhB5UCAQCqBAAhnQJAAKwEACGeAkAArAQAIeMCQACsBAAh7gIBAKoEACHvAgEArQQAIfACAQCtBAAhB5UCAQCqBAAhnQJAAKwEACGeAkAArAQAIeMCQACsBAAh7gIBAKoEACHvAgEArQQAIfACAQCtBAAhB5UCAQAAAAGdAkAAAAABngJAAAAAAeMCQAAAAAHuAgEAAAAB7wIBAAAAAfACAQAAAAEEJgAAqAcAMPoCAACpBwAw_AIAAKsHACCAAwAArAcAMAQmAACcBwAw-gIAAJ0HADD8AgAAnwcAIIADAACgBwAwAyYAAJcHACD6AgAAmAcAIIADAACyAQAgBCYAAI4HADD6AgAAjwcAMPwCAACRBwAggAMAAKMFADAEJgAAhQcAMPoCAACGBwAw_AIAAIgHACCAAwAApQYAMAQmAAD8BgAw-gIAAP0GADD8AgAA_wYAIIADAADpBAAwBCYAAPAGADD6AgAA8QYAMPwCAADzBgAggAMAAPQGADAEJgAA5wYAMPoCAADoBgAw_AIAAOoGACCAAwAAygQAMAAABwMAAMYGACAHAADHBgAgDQAAywYAIA8AAMwGACAVAADIBgAgFgAAyQYAIBcAAMoGACAAAAAABwYAAL4HACAKAADGBgAgEgAAxAcAIBQAAMUHACDKAgAApgQAIMsCAACmBAAgzAIAAKYEACAFBgAAvgcAIAgAAMYHACAVAADIBgAgvgIAAKYEACDSAgAApgQAIAQGAAC-BwAgCgAAxgYAIBMAAMMHACDDAgAApgQAIAYGAAC-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_BgAgBwAAwAYAIA0AAMQGACAPAADFBgAgFQAAwQYAIBYAAMIGACCVAgEAAAABnQJAAAAAAZ4CQAAAAAGwAgEAAAAB1wIBAAAAAdgCAQAAAAHZAgEAAAAB2gIIAAAAAdsCCAAAAAHcAgIAAAAB3QIgAAAAAQIAAACyAQAgJgAA5QcAIAyVAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABvgIBAAAAAc4CAQAAAAHPAkAAAAAB0AJAAAAAAdECQAAAAAHSAgEAAAAB1AIAAADUAgLVAgIAAAABCJUCAQAAAAGWAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABvgIBAAAAAb8CQAAAAAHAAiAAAAABCJUCAQAAAAGWAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABtAIBAAAAAbUCgAAAAAG2AkAAAAABBJUCAQAAAAGcAgEAAAABnQJAAAAAAbECAQAAAAEJlQIBAAAAAZYCAQAAAAGXAoAAAAABmAIgAAAAAZkCAQAAAAGbAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABAwAAAAsAICYAAOUHACAnAADuBwAgEwAAAAsAIAMAAPwFACAHAAD9BQAgDQAAgQYAIA8AAIIGACAVAAD-BQAgFgAA_wUAIB8AAO4HACCVAgEAqgQAIZ0CQACsBAAhngJAAKwEACGwAgEAqgQAIdcCAQCqBAAh2AIBAKoEACHZAgEAqgQAIdoCCACIBQAh2wIIAIgFACHcAgIA-QQAId0CIACrBAAhEQMAAPwFACAHAAD9BQAgDQAAgQYAIA8AAIIGACAVAAD-BQAgFgAA_wUAIJUCAQCqBAAhnQJAAKwEACGeAkAArAQAIbACAQCqBAAh1wIBAKoEACHYAgEAqgQAIdkCAQCqBAAh2gIIAIgFACHbAggAiAUAIdwCAgD5BAAh3QIgAKsEACEMBgAA8QUAIA0AAPMFACAPAAD2BQAgEAAA9AUAIBEAAPUFACCVAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABvAIAAADXAgK-AgEAAAABzgIBAAAAAQIAAAA-ACAmAADvBwAgEQMAAL8GACANAADEBgAgDwAAxQYAIBUAAMEGACAWAADCBgAgFwAAwwYAIJUCAQAAAAGdAkAAAAABngJAAAAAAbACAQAAAAHXAgEAAAAB2AIBAAAAAdkCAQAAAAHaAggAAAAB2wIIAAAAAdwCAgAAAAHdAiAAAAABAgAAALIBACAmAADxBwAgDJUCAQAAAAGZAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABwAIgAAAAAccCAAAAxwICyQIAAADJAgLKAgEAAAABywIBAAAAAcwCQAAAAAHNAggAAAABAwAAADwAICYAAO8HACAnAAD2BwAgDgAAADwAIAYAALIFACANAAC0BQAgDwAAtwUAIBAAALUFACARAAC2BQAgHwAA9gcAIJUCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAALEF1wIivgIBAKoEACHOAgEAqgQAIQwGAACyBQAgDQAAtAUAIA8AALcFACAQAAC1BQAgEQAAtgUAIJUCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAALEF1wIivgIBAKoEACHOAgEAqgQAIQMAAAALACAmAADxBwAgJwAA-QcAIBMAAAALACADAAD8BQAgDQAAgQYAIA8AAIIGACAVAAD-BQAgFgAA_wUAIBcAAIAGACAfAAD5BwAglQIBAKoEACGdAkAArAQAIZ4CQACsBAAhsAIBAKoEACHXAgEAqgQAIdgCAQCqBAAh2QIBAKoEACHaAggAiAUAIdsCCACIBQAh3AICAPkEACHdAiAAqwQAIREDAAD8BQAgDQAAgQYAIA8AAIIGACAVAAD-BQAgFgAA_wUAIBcAAIAGACCVAgEAqgQAIZ0CQACsBAAhngJAAKwEACGwAgEAqgQAIdcCAQCqBAAh2AIBAKoEACHZAgEAqgQAIdoCCACIBQAh2wIIAIgFACHcAgIA-QQAId0CIACrBAAhDwYAAKsFACAIAACsBQAglQIBAAAAAZoCAQAAAAGcAgEAAAABnQJAAAAAAZ4CQAAAAAG-AgEAAAABzgIBAAAAAc8CQAAAAAHQAkAAAAAB0QJAAAAAAdICAQAAAAHUAgAAANQCAtUCAgAAAAECAAAADwAgJgAA-gcAIBEDAAC_BgAgBwAAwAYAIA0AAMQGACAPAADFBgAgFgAAwgYAIBcAAMMGACCVAgEAAAABnQJAAAAAAZ4CQAAAAAGwAgEAAAAB1wIBAAAAAdgCAQAAAAHZAgEAAAAB2gIIAAAAAdsCCAAAAAHcAgIAAAAB3QIgAAAAAQIAAACyAQAgJgAA_AcAIBEEAAC0BwAgBQAAtQcAIAsAALkHACAPAAC7BwAgFgAAuAcAIBgAALYHACAZAAC6BwAglQIBAAAAAZ0CQAAAAAGeAkAAAAABvAIAAAD3AgLOAgEAAAAB7QIBAAAAAfICAAAA8gIC8wIBAAAAAfQCIAAAAAH1AgEAAAABAgAAAAEAICYAAP4HACADAAAADQAgJgAA-gcAICcAAIIIACARAAAADQAgBgAAnAUAIAgAAJ0FACAfAACCCAAglQIBAKoEACGaAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIb4CAQCtBAAhzgIBAKoEACHPAkAArAQAIdACQACsBAAh0QJAAKwEACHSAgEArQQAIdQCAACbBdQCItUCAgD5BAAhDwYAAJwFACAIAACdBQAglQIBAKoEACGaAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIb4CAQCtBAAhzgIBAKoEACHPAkAArAQAIdACQACsBAAh0QJAAKwEACHSAgEArQQAIdQCAACbBdQCItUCAgD5BAAhAwAAAAsAICYAAPwHACAnAACFCAAgEwAAAAsAIAMAAPwFACAHAAD9BQAgDQAAgQYAIA8AAIIGACAWAAD_BQAgFwAAgAYAIB8AAIUIACCVAgEAqgQAIZ0CQACsBAAhngJAAKwEACGwAgEAqgQAIdcCAQCqBAAh2AIBAKoEACHZAgEAqgQAIdoCCACIBQAh2wIIAIgFACHcAgIA-QQAId0CIACrBAAhEQMAAPwFACAHAAD9BQAgDQAAgQYAIA8AAIIGACAWAAD_BQAgFwAAgAYAIJUCAQCqBAAhnQJAAKwEACGeAkAArAQAIbACAQCqBAAh1wIBAKoEACHYAgEAqgQAIdkCAQCqBAAh2gIIAIgFACHbAggAiAUAIdwCAgD5BAAh3QIgAKsEACEDAAAAJAAgJgAA_gcAICcAAIgIACATAAAAJAAgBAAA3wYAIAUAAOAGACALAADkBgAgDwAA5gYAIBYAAOMGACAYAADhBgAgGQAA5QYAIB8AAIgIACCVAgEAqgQAIZ0CQACsBAAhngJAAKwEACG8AgAA3gb3AiLOAgEAqgQAIe0CAQCtBAAh8gIAAN0G8gIi8wIBAKoEACH0AiAAqwQAIfUCAQCtBAAhEQQAAN8GACAFAADgBgAgCwAA5AYAIA8AAOYGACAWAADjBgAgGAAA4QYAIBkAAOUGACCVAgEAqgQAIZ0CQACsBAAhngJAAKwEACG8AgAA3gb3AiLOAgEAqgQAIe0CAQCtBAAh8gIAAN0G8gIi8wIBAKoEACH0AiAAqwQAIfUCAQCtBAAhEQQAALQHACAFAAC1BwAgCwAAuQcAIA8AALsHACAVAAC3BwAgGAAAtgcAIBkAALoHACCVAgEAAAABnQJAAAAAAZ4CQAAAAAG8AgAAAPcCAs4CAQAAAAHtAgEAAAAB8gIAAADyAgLzAgEAAAAB9AIgAAAAAfUCAQAAAAECAAAAAQAgJgAAiQgAIBEDAAC_BgAgBwAAwAYAIA0AAMQGACAPAADFBgAgFQAAwQYAIBcAAMMGACCVAgEAAAABnQJAAAAAAZ4CQAAAAAGwAgEAAAAB1wIBAAAAAdgCAQAAAAHZAgEAAAAB2gIIAAAAAdsCCAAAAAHcAgIAAAAB3QIgAAAAAQIAAACyAQAgJgAAiwgAIBAGAACTBQAgCgAAkgUAIBIAAJQFACCVAgEAAAABmQIBAAAAAZwCAQAAAAGdAkAAAAABngJAAAAAAcACIAAAAAHFAgEAAAABxwIAAADHAgLJAgAAAMkCAsoCAQAAAAHLAgEAAAABzAJAAAAAAc0CCAAAAAECAAAAMwAgJgAAjQgAIAMAAAAkACAmAACJCAAgJwAAkQgAIBMAAAAkACAEAADfBgAgBQAA4AYAIAsAAOQGACAPAADmBgAgFQAA4gYAIBgAAOEGACAZAADlBgAgHwAAkQgAIJUCAQCqBAAhnQJAAKwEACGeAkAArAQAIbwCAADeBvcCIs4CAQCqBAAh7QIBAK0EACHyAgAA3QbyAiLzAgEAqgQAIfQCIACrBAAh9QIBAK0EACERBAAA3wYAIAUAAOAGACALAADkBgAgDwAA5gYAIBUAAOIGACAYAADhBgAgGQAA5QYAIJUCAQCqBAAhnQJAAKwEACGeAkAArAQAIbwCAADeBvcCIs4CAQCqBAAh7QIBAK0EACHyAgAA3QbyAiLzAgEAqgQAIfQCIACrBAAh9QIBAK0EACEDAAAACwAgJgAAiwgAICcAAJQIACATAAAACwAgAwAA_AUAIAcAAP0FACANAACBBgAgDwAAggYAIBUAAP4FACAXAACABgAgHwAAlAgAIJUCAQCqBAAhnQJAAKwEACGeAkAArAQAIbACAQCqBAAh1wIBAKoEACHYAgEAqgQAIdkCAQCqBAAh2gIIAIgFACHbAggAiAUAIdwCAgD5BAAh3QIgAKsEACERAwAA_AUAIAcAAP0FACANAACBBgAgDwAAggYAIBUAAP4FACAXAACABgAglQIBAKoEACGdAkAArAQAIZ4CQACsBAAhsAIBAKoEACHXAgEAqgQAIdgCAQCqBAAh2QIBAKoEACHaAggAiAUAIdsCCACIBQAh3AICAPkEACHdAiAAqwQAIQMAAAAxACAmAACNCAAgJwAAlwgAIBIAAAAxACAGAACKBQAgCgAAiQUAIBIAAIsFACAfAACXCAAglQIBAKoEACGZAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIcACIACrBAAhxQIBAKoEACHHAgAAhgXHAiLJAgAAhwXJAiLKAgEArQQAIcsCAQCtBAAhzAJAAMMEACHNAggAiAUAIRAGAACKBQAgCgAAiQUAIBIAAIsFACCVAgEAqgQAIZkCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhwAIgAKsEACHFAgEAqgQAIccCAACGBccCIskCAACHBckCIsoCAQCtBAAhywIBAK0EACHMAkAAwwQAIc0CCACIBQAhEQMAAL8GACAHAADABgAgDwAAxQYAIBUAAMEGACAWAADCBgAgFwAAwwYAIJUCAQAAAAGdAkAAAAABngJAAAAAAbACAQAAAAHXAgEAAAAB2AIBAAAAAdkCAQAAAAHaAggAAAAB2wIIAAAAAdwCAgAAAAHdAiAAAAABAgAAALIBACAmAACYCAAgDAYAAPEFACAHAADyBQAgDwAA9gUAIBAAAPQFACARAAD1BQAglQIBAAAAAZwCAQAAAAGdAkAAAAABngJAAAAAAbwCAAAA1wICvgIBAAAAAc4CAQAAAAECAAAAPgAgJgAAmggAIAmVAgEAAAABmQIBAAAAAZ4CQAAAAAG0AgEAAAABuAIBAAAAAbkCAgAAAAG6AgEAAAABvAIAAAC8AgK9AkAAAAABAwAAAAsAICYAAJgIACAnAACfCAAgEwAAAAsAIAMAAPwFACAHAAD9BQAgDwAAggYAIBUAAP4FACAWAAD_BQAgFwAAgAYAIB8AAJ8IACCVAgEAqgQAIZ0CQACsBAAhngJAAKwEACGwAgEAqgQAIdcCAQCqBAAh2AIBAKoEACHZAgEAqgQAIdoCCACIBQAh2wIIAIgFACHcAgIA-QQAId0CIACrBAAhEQMAAPwFACAHAAD9BQAgDwAAggYAIBUAAP4FACAWAAD_BQAgFwAAgAYAIJUCAQCqBAAhnQJAAKwEACGeAkAArAQAIbACAQCqBAAh1wIBAKoEACHYAgEAqgQAIdkCAQCqBAAh2gIIAIgFACHbAggAiAUAIdwCAgD5BAAh3QIgAKsEACEDAAAAPAAgJgAAmggAICcAAKIIACAOAAAAPAAgBgAAsgUAIAcAALMFACAPAAC3BQAgEAAAtQUAIBEAALYFACAfAACiCAAglQIBAKoEACGcAgEAqgQAIZ0CQACsBAAhngJAAKwEACG8AgAAsQXXAiK-AgEAqgQAIc4CAQCqBAAhDAYAALIFACAHAACzBQAgDwAAtwUAIBAAALUFACARAAC2BQAglQIBAKoEACGcAgEAqgQAIZ0CQACsBAAhngJAAKwEACG8AgAAsQXXAiK-AgEAqgQAIc4CAQCqBAAhEQQAALQHACAFAAC1BwAgDwAAuwcAIBUAALcHACAWAAC4BwAgGAAAtgcAIBkAALoHACCVAgEAAAABnQJAAAAAAZ4CQAAAAAG8AgAAAPcCAs4CAQAAAAHtAgEAAAAB8gIAAADyAgLzAgEAAAAB9AIgAAAAAfUCAQAAAAECAAAAAQAgJgAAowgAIAsGAADyBAAgCAAA8QQAIJUCAQAAAAGWAgEAAAABmgIBAAAAAZwCAQAAAAGdAkAAAAABngJAAAAAAb4CAQAAAAG_AkAAAAABwAIgAAAAAQIAAAAUACAmAAClCAAgAwAAACQAICYAAKMIACAnAACpCAAgEwAAACQAIAQAAN8GACAFAADgBgAgDwAA5gYAIBUAAOIGACAWAADjBgAgGAAA4QYAIBkAAOUGACAfAACpCAAglQIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAAN4G9wIizgIBAKoEACHtAgEArQQAIfICAADdBvICIvMCAQCqBAAh9AIgAKsEACH1AgEArQQAIREEAADfBgAgBQAA4AYAIA8AAOYGACAVAADiBgAgFgAA4wYAIBgAAOEGACAZAADlBgAglQIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAAN4G9wIizgIBAKoEACHtAgEArQQAIfICAADdBvICIvMCAQCqBAAh9AIgAKsEACH1AgEArQQAIQMAAAASACAmAAClCAAgJwAArAgAIA0AAAASACAGAADjBAAgCAAA4gQAIB8AAKwIACCVAgEAqgQAIZYCAQCqBAAhmgIBAKoEACGcAgEAqgQAIZ0CQACsBAAhngJAAKwEACG-AgEAqgQAIb8CQADDBAAhwAIgAKsEACELBgAA4wQAIAgAAOIEACCVAgEAqgQAIZYCAQCqBAAhmgIBAKoEACGcAgEAqgQAIZ0CQACsBAAhngJAAKwEACG-AgEAqgQAIb8CQADDBAAhwAIgAKsEACEMBgAA8QUAIAcAAPIFACANAADzBQAgDwAA9gUAIBEAAPUFACCVAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABvAIAAADXAgK-AgEAAAABzgIBAAAAAQIAAAA-ACAmAACtCAAgCZUCAQAAAAGWAgEAAAABlwKAAAAAAZgCIAAAAAGZAgEAAAABmgIBAAAAAZwCAQAAAAGdAkAAAAABngJAAAAAAQMAAAA8ACAmAACtCAAgJwAAsggAIA4AAAA8ACAGAACyBQAgBwAAswUAIA0AALQFACAPAAC3BQAgEQAAtgUAIB8AALIIACCVAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIbwCAACxBdcCIr4CAQCqBAAhzgIBAKoEACEMBgAAsgUAIAcAALMFACANAAC0BQAgDwAAtwUAIBEAALYFACCVAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIbwCAACxBdcCIr4CAQCqBAAhzgIBAKoEACEMBgAA8QUAIAcAAPIFACANAADzBQAgDwAA9gUAIBAAAPQFACCVAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABvAIAAADXAgK-AgEAAAABzgIBAAAAAQIAAAA-ACAmAACzCAAgAwAAADwAICYAALMIACAnAAC3CAAgDgAAADwAIAYAALIFACAHAACzBQAgDQAAtAUAIA8AALcFACAQAAC1BQAgHwAAtwgAIJUCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAALEF1wIivgIBAKoEACHOAgEAqgQAIQwGAACyBQAgBwAAswUAIA0AALQFACAPAAC3BQAgEAAAtQUAIJUCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAALEF1wIivgIBAKoEACHOAgEAqgQAIREEAAC0BwAgBQAAtQcAIAsAALkHACAPAAC7BwAgFQAAtwcAIBYAALgHACAYAAC2BwAglQIBAAAAAZ0CQAAAAAGeAkAAAAABvAIAAAD3AgLOAgEAAAAB7QIBAAAAAfICAAAA8gIC8wIBAAAAAfQCIAAAAAH1AgEAAAABAgAAAAEAICYAALgIACADAAAAJAAgJgAAuAgAICcAALwIACATAAAAJAAgBAAA3wYAIAUAAOAGACALAADkBgAgDwAA5gYAIBUAAOIGACAWAADjBgAgGAAA4QYAIB8AALwIACCVAgEAqgQAIZ0CQACsBAAhngJAAKwEACG8AgAA3gb3AiLOAgEAqgQAIe0CAQCtBAAh8gIAAN0G8gIi8wIBAKoEACH0AiAAqwQAIfUCAQCtBAAhEQQAAN8GACAFAADgBgAgCwAA5AYAIA8AAOYGACAVAADiBgAgFgAA4wYAIBgAAOEGACCVAgEAqgQAIZ0CQACsBAAhngJAAKwEACG8AgAA3gb3AiLOAgEAqgQAIe0CAQCtBAAh8gIAAN0G8gIi8wIBAKoEACH0AiAAqwQAIfUCAQCtBAAhEQQAALQHACAFAAC1BwAgCwAAuQcAIBUAALcHACAWAAC4BwAgGAAAtgcAIBkAALoHACCVAgEAAAABnQJAAAAAAZ4CQAAAAAG8AgAAAPcCAs4CAQAAAAHtAgEAAAAB8gIAAADyAgLzAgEAAAAB9AIgAAAAAfUCAQAAAAECAAAAAQAgJgAAvQgAIBEDAAC_BgAgBwAAwAYAIA0AAMQGACAVAADBBgAgFgAAwgYAIBcAAMMGACCVAgEAAAABnQJAAAAAAZ4CQAAAAAGwAgEAAAAB1wIBAAAAAdgCAQAAAAHZAgEAAAAB2gIIAAAAAdsCCAAAAAHcAgIAAAAB3QIgAAAAAQIAAACyAQAgJgAAvwgAIAoIAADSBAAglQIBAAAAAZYCAQAAAAGaAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABtAIBAAAAAbUCgAAAAAG2AkAAAAABAgAAAB0AICYAAMEIACAMBgAA8QUAIAcAAPIFACANAADzBQAgEAAA9AUAIBEAAPUFACCVAgEAAAABnAIBAAAAAZ0CQAAAAAGeAkAAAAABvAIAAADXAgK-AgEAAAABzgIBAAAAAQIAAAA-ACAmAADDCAAgAwAAACQAICYAAL0IACAnAADHCAAgEwAAACQAIAQAAN8GACAFAADgBgAgCwAA5AYAIBUAAOIGACAWAADjBgAgGAAA4QYAIBkAAOUGACAfAADHCAAglQIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAAN4G9wIizgIBAKoEACHtAgEArQQAIfICAADdBvICIvMCAQCqBAAh9AIgAKsEACH1AgEArQQAIREEAADfBgAgBQAA4AYAIAsAAOQGACAVAADiBgAgFgAA4wYAIBgAAOEGACAZAADlBgAglQIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAAN4G9wIizgIBAKoEACHtAgEArQQAIfICAADdBvICIvMCAQCqBAAh9AIgAKsEACH1AgEArQQAIQMAAAALACAmAAC_CAAgJwAAyggAIBMAAAALACADAAD8BQAgBwAA_QUAIA0AAIEGACAVAAD-BQAgFgAA_wUAIBcAAIAGACAfAADKCAAglQIBAKoEACGdAkAArAQAIZ4CQACsBAAhsAIBAKoEACHXAgEAqgQAIdgCAQCqBAAh2QIBAKoEACHaAggAiAUAIdsCCACIBQAh3AICAPkEACHdAiAAqwQAIREDAAD8BQAgBwAA_QUAIA0AAIEGACAVAAD-BQAgFgAA_wUAIBcAAIAGACCVAgEAqgQAIZ0CQACsBAAhngJAAKwEACGwAgEAqgQAIdcCAQCqBAAh2AIBAKoEACHZAgEAqgQAIdoCCACIBQAh2wIIAIgFACHcAgIA-QQAId0CIACrBAAhAwAAABsAICYAAMEIACAnAADNCAAgDAAAABsAIAgAAMQEACAfAADNCAAglQIBAKoEACGWAgEAqgQAIZoCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhtAIBAKoEACG1AoAAAAABtgJAAMMEACEKCAAAxAQAIJUCAQCqBAAhlgIBAKoEACGaAgEAqgQAIZwCAQCqBAAhnQJAAKwEACGeAkAArAQAIbQCAQCqBAAhtQKAAAAAAbYCQADDBAAhAwAAADwAICYAAMMIACAnAADQCAAgDgAAADwAIAYAALIFACAHAACzBQAgDQAAtAUAIBAAALUFACARAAC2BQAgHwAA0AgAIJUCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAALEF1wIivgIBAKoEACHOAgEAqgQAIQwGAACyBQAgBwAAswUAIA0AALQFACAQAAC1BQAgEQAAtgUAIJUCAQCqBAAhnAIBAKoEACGdAkAArAQAIZ4CQACsBAAhvAIAALEF1wIivgIBAKoEACHOAgEAqgQAIQkEBgIFCgMLSggMABQPTwsVSA8WSRAYDAQZThMBAwABAQMAAQgDAAEHEAUMABINQAcPQQsVOA8WOxAXPwYEBgAECAAGDAARFTQPBwYABAcRBQwADg0VBw8rCxAeChEqDQQGAAQIAAYLGQgMAAkCCQAHCgABAQsaAAMIAAYMAAwPIgsEBgAECAAGCiUBDiMKAQ8mAAEIAAYFBywADS0ADzAAEC4AES8ABAYABAoAARIABRQ2EAMGAAQKAAETAA8BFTcABgdCAA1GAA9HABVDABZEABdFAAEDAAEHBFAABVEAC1QAD1YAFVIAFlMAGVUAAAAAAwwAGSwAGi0AGwAAAAMMABksABotABsBAwABAQMAAQMMACAsACEtACIAAAADDAAgLAAhLQAiAQMAAQEDAAEDDAAnLAAoLQApAAAAAwwAJywAKC0AKQAAAAMMAC8sADAtADEAAAADDAAvLAAwLQAxAQMAAQEDAAEFDAA2LAA5LQA6bgA3bwA4AAAAAAAFDAA2LAA5LQA6bgA3bwA4AQYABAEGAAQDDAA_LABALQBBAAAAAwwAPywAQC0AQQIGAAQIAAYCBgAECAAGBQwARiwASS0ASm4AR28ASAAAAAAABQwARiwASS0ASm4AR28ASAMGAAQKAAESAAUDBgAECgABEgAFBQwATywAUi0AU24AUG8AUQAAAAAABQwATywAUi0AU24AUG8AUQMGAAQKAAETAA8DBgAECgABEwAPBQwAWCwAWy0AXG4AWW8AWgAAAAAABQwAWCwAWy0AXG4AWW8AWgIGAAQIAAYCBgAECAAGAwwAYSwAYi0AYwAAAAMMAGEsAGItAGMCCQAHCgABAgkABwoAAQUMAGgsAGstAGxuAGlvAGoAAAAAAAUMAGgsAGstAGxuAGlvAGoBCAAGAQgABgMMAHEsAHItAHMAAAADDABxLAByLQBzAQgABgEIAAYDDAB4LAB5LQB6AAAAAwwAeCwAeS0AegEDAAEBAwABAwwAfywAgAEtAIEBAAAAAwwAfywAgAEtAIEBBAYABAgABgqbAwEOmgMKBAYABAgABgqiAwEOoQMKAwwAhgEsAIcBLQCIAQAAAAMMAIYBLACHAS0AiAEaAgEbVwEcWQEdWgEeWwEgXQEhXxUiYBYjYgEkZBUlZRcoZgEpZwEqaBUuaxgvbBwwbQIxbgIybwIzcAI0cQI1cwI2dRU3dh04eAI5ehU6ex47fAI8fQI9fhU-gQEfP4IBI0CDAQNBhAEDQoUBA0OGAQNEhwEDRYkBA0aLARVHjAEkSI4BA0mQARVKkQElS5IBA0yTAQNNlAEVTpcBJk-YASpQmgErUZsBK1KeAStTnwErVKABK1WiAStWpAEVV6UBLFinAStZqQEVWqoBLVurAStcrAErXa0BFV6wAS5fsQEyYLMBBGG0AQRitgEEY7cBBGS4AQRlugEEZrwBFWe9ATNovwEEacEBFWrCATRrwwEEbMQBBG3FARVwyAE1cckBO3LKAQZzywEGdMwBBnXNAQZ2zgEGd9ABBnjSARV50wE8etUBBnvXARV82AE9fdkBBn7aAQZ_2wEVgAHeAT6BAd8BQoIB4AEFgwHhAQWEAeIBBYUB4wEFhgHkAQWHAeYBBYgB6AEViQHpAUOKAesBBYsB7QEVjAHuAUSNAe8BBY4B8AEFjwHxARWQAfQBRZEB9QFLkgH2AQ-TAfcBD5QB-AEPlQH5AQ-WAfoBD5cB_AEPmAH-ARWZAf8BTJoBgQIPmwGDAhWcAYQCTZ0BhQIPngGGAg-fAYcCFaABigJOoQGLAlSiAYwCEKMBjQIQpAGOAhClAY8CEKYBkAIQpwGSAhCoAZQCFakBlQJVqgGXAhCrAZkCFawBmgJWrQGbAhCuAZwCEK8BnQIVsAGgAlexAaECXbIBogIHswGjAge0AaQCB7UBpQIHtgGmAge3AagCB7gBqgIVuQGrAl66Aa0CB7sBrwIVvAGwAl-9AbECB74BsgIHvwGzAhXAAbYCYMEBtwJkwgG4AgjDAbkCCMQBugIIxQG7AgjGAbwCCMcBvgIIyAHAAhXJAcECZcoBwwIIywHFAhXMAcYCZs0BxwIIzgHIAgjPAckCFdABzAJn0QHNAm3SAc4CCtMBzwIK1AHQAgrVAdECCtYB0gIK1wHUAgrYAdYCFdkB1wJu2gHZAgrbAdsCFdwB3AJv3QHdAgreAd4CCt8B3wIV4AHiAnDhAeMCdOIB5AIN4wHlAg3kAeYCDeUB5wIN5gHoAg3nAeoCDegB7AIV6QHtAnXqAe8CDesB8QIV7AHyAnbtAfMCDe4B9AIN7wH1AhXwAfgCd_EB-QJ78gH6AhPzAfsCE_QB_AIT9QH9AhP2Af4CE_cBgAMT-AGCAxX5AYMDfPoBhQMT-wGHAxX8AYgDff0BiQMT_gGKAxP_AYsDFYACjgN-gQKPA4IBggKQAwuDApEDC4QCkgMLhQKTAwuGApQDC4cClgMLiAKYAxWJApkDgwGKAp0DC4sCnwMVjAKgA4QBjQKjAwuOAqQDC48CpQMVkAKoA4UBkQKpA4kB"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnnouncementScalarFieldEnum: () => AnnouncementScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AssignmentScalarFieldEnum: () => AssignmentScalarFieldEnum,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  CourseMaterialScalarFieldEnum: () => CourseMaterialScalarFieldEnum,
  CourseScalarFieldEnum: () => CourseScalarFieldEnum,
  CourseSlotScalarFieldEnum: () => CourseSlotScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  JsonNullValueInput: () => JsonNullValueInput,
  ModelName: () => ModelName,
  NotificationScalarFieldEnum: () => NotificationScalarFieldEnum,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PracticeSetScalarFieldEnum: () => PracticeSetScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  SubmissionScalarFieldEnum: () => SubmissionScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorProfileScalarFieldEnum: () => TutorProfileScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.4.1",
  engine: "55ae170b1ced7fc6ed07a15f110549408c501bb3"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  TutorProfile: "TutorProfile",
  Course: "Course",
  CourseSlot: "CourseSlot",
  Booking: "Booking",
  Review: "Review",
  Assignment: "Assignment",
  Submission: "Submission",
  CourseMaterial: "CourseMaterial",
  Announcement: "Announcement",
  Notification: "Notification",
  PracticeSet: "PracticeSet"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  role: "role",
  name: "name",
  email: "email",
  password: "password",
  emailVerified: "emailVerified",
  image: "image",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TutorProfileScalarFieldEnum = {
  id: "id",
  display_name: "display_name",
  bio: "bio",
  qualification: "qualification",
  hourly_rate: "hourly_rate",
  rating_avg: "rating_avg",
  total_reviews: "total_reviews",
  is_verified: "is_verified",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  user_id: "user_id"
};
var CourseScalarFieldEnum = {
  id: "id",
  name: "name",
  tutor_id: "tutor_id",
  description: "description",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CourseSlotScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description",
  start_time: "start_time",
  end_time: "end_time",
  date: "date",
  meeting_link: "meeting_link",
  session_type: "session_type",
  capacity: "capacity",
  tutor_id: "tutor_id",
  course_id: "course_id",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var BookingScalarFieldEnum = {
  id: "id",
  student_id: "student_id",
  tutor_id: "tutor_id",
  course_slot_id: "course_slot_id",
  booking_status: "booking_status",
  payment_status: "payment_status",
  transaction_id: "transaction_id",
  refund_id: "refund_id",
  cancelled_at: "cancelled_at",
  total_price: "total_price",
  reminder_sent: "reminder_sent",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  booking_id: "booking_id",
  tutor_id: "tutor_id",
  student_id: "student_id",
  rating: "rating",
  comment: "comment",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AssignmentScalarFieldEnum = {
  id: "id",
  title: "title",
  description: "description",
  due_date: "due_date",
  reminder_sent: "reminder_sent",
  course_id: "course_id",
  tutor_id: "tutor_id",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SubmissionScalarFieldEnum = {
  id: "id",
  assignment_id: "assignment_id",
  student_id: "student_id",
  file_url: "file_url",
  note: "note",
  grade: "grade",
  feedback: "feedback",
  status: "status",
  submittedAt: "submittedAt",
  updatedAt: "updatedAt"
};
var CourseMaterialScalarFieldEnum = {
  id: "id",
  title: "title",
  file_url: "file_url",
  course_id: "course_id",
  tutor_id: "tutor_id",
  summary: "summary",
  summary_at: "summary_at",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AnnouncementScalarFieldEnum = {
  id: "id",
  message: "message",
  course_id: "course_id",
  tutor_id: "tutor_id",
  createdAt: "createdAt"
};
var NotificationScalarFieldEnum = {
  id: "id",
  user_id: "user_id",
  message: "message",
  link: "link",
  read: "read",
  createdAt: "createdAt"
};
var PracticeSetScalarFieldEnum = {
  id: "id",
  title: "title",
  questions: "questions",
  is_published: "is_published",
  student_id: "student_id",
  course_id: "course_id",
  material_id: "material_id",
  tutor_id: "tutor_id",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var JsonNullValueInput = {
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"]
});

// src/lib/pick.ts
var pick = (source, keys) => {
  const out = {};
  if (source && typeof source === "object") {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        out[key] = source[key];
      }
    }
  }
  return out;
};

// src/modules/course/course.service.ts
var createCourse = async (payload, userID) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: userID
    }
  });
  if (!userData) {
    throw new Error("Unauthorized!");
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      user_id: userID
    }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  const result = await prisma.course.create({
    data: {
      ...payload,
      tutor_id: tutorProfile.id
    }
  });
  return result;
};
var getAllCourses = async (userID) => {
  const userData = await prisma.user.findUnique({
    where: { id: userID }
  });
  if (!userData) throw new Error("Unauthorized!");
  if (userData.role === "ADMIN") {
    return prisma.course.findMany({
      include: { tutor: true }
    });
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userID }
  });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  return prisma.course.findMany({
    where: { tutor_id: tutorProfile.id }
  });
};
var getAllCourseByTid = async (tutorID) => {
  const result = await prisma.course.findMany({
    where: {
      tutor_id: tutorID
    }
  });
  return result;
};
var updateCourse = async (courseID, payload, userID) => {
  const user = await prisma.user.findUnique({ where: { id: userID } });
  if (!user) throw new Error("User not found");
  const course = await prisma.course.findUnique({ where: { id: courseID } });
  if (!course) throw new Error("Course not found");
  if (user.role !== "ADMIN") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userID }
    });
    if (!tutorProfile) throw new Error("Tutor profile not found");
    if (course.tutor_id !== tutorProfile.id) {
      throw new Error("Unauthorized! You can only update your own courses");
    }
  }
  return prisma.course.update({
    where: { id: courseID },
    // Whitelisted so `tutor_id` cannot be rewritten to hand the course to
    // (or take it from) another tutor.
    data: pick(payload, ["name", "description", "status"])
  });
};
var deleteCourse = async (courseID, userID) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userID }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  const course = await prisma.course.findUnique({
    where: { id: courseID }
  });
  if (!course) {
    throw new Error("Course not found");
  }
  if (course.tutor_id !== tutorProfile.id) {
    throw new Error("Unauthorized! You can only delete your own courses");
  }
  const result = await prisma.course.delete({
    where: {
      id: courseID
    }
  });
  return result;
};
var courseService = {
  createCourse,
  getAllCourses,
  getAllCourseByTid,
  updateCourse,
  deleteCourse
};

// src/modules/course/course.controller.ts
var createCourse2 = async (req, res, next) => {
  try {
    const result = await courseService.createCourse(req.body, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Course created successfully",
      course: result
    });
  } catch (e) {
    next(e);
  }
};
var getAllCourses2 = async (req, res, next) => {
  try {
    const result = await courseService.getAllCourses(req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Courses fetched successfully",
      courses: result
    });
  } catch (e) {
    next(e);
  }
};
var getCourseByTutorId = async (req, res, next) => {
  try {
    const result = await courseService.getAllCourseByTid(req.params?.id);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};
var deleteCourse2 = async (req, res, next) => {
  try {
    const result = await courseService.deleteCourse(req.params?.id, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "course deleted successfully",
      course: result
    });
  } catch (e) {
    next(e);
  }
};
var updateCourse2 = async (req, res, next) => {
  try {
    const result = await courseService.updateCourse(req.params?.id, req.body, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "course updated successfully",
      course: result
    });
  } catch (e) {
    next(e);
  }
};
var CourseController = {
  createCourse: createCourse2,
  getAllCourses: getAllCourses2,
  getCourseByTutorId,
  updateCourse: updateCourse2,
  deleteCourse: deleteCourse2
};

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import nodemailer from "nodemailer";
var isProd = process.env.NODE_ENV === "production";
var auth = betterAuth({
  baseURL: process.env.FRONTEND_URL,
  basePath: "/api/v1/auth",
  trustedOrigins: [
    process.env.FRONTEND_URL,
    "http://localhost:3000"
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      try {
        const transporter2 = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        const info = await transporter2.sendMail({
          from: process.env.EMAIL_FROM || '"TutorSpace" <noreply@tutorspace.com>',
          to: user.email,
          subject: "Reset your password - TutorSpace",
          text: `Click the link to reset your password: ${url}. The token is ${token}.`,
          html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                            <h2>TutorSpace \u{1F393}</h2>
                            <p>Hi ${user.name},</p>
                            <p>You requested to reset your password. Click the button below to set a new password:</p>
                            <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                            <p>Alternatively, you can copy and paste this link into your browser:</p>
                            <p><a href="${url}">${url}</a></p>
                            <hr />
                            <p style="font-size: 0.8rem; color: #777;">If you did not request this, please ignore this email.</p>
                        </div>
                    `
        });
      } catch (error) {
        console.error("\u274C Failed to send password reset email:", error);
      }
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "STUDENT"
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE"
      }
    }
  },
  advanced: {
    cookies: {
      session_token: {
        name: "session_token",
        attributes: {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          partitioned: isProd
        }
      },
      // The OAuth state cookie MUST NOT share a name with the session
      // cookie. Better Auth sets `state` before redirecting to the
      // provider and clears it when the provider redirects back; under a
      // shared name that cleanup deleted the session cookie the callback
      // had just set. The result was a successful Google sign-in — account
      // linked, session row written — that still bounced to /login,
      // because the browser was left holding no session token.
      // Email/password login was unaffected, since it sets no state cookie.
      state: {
        name: "oauth_state",
        attributes: {
          httpOnly: true,
          secure: isProd,
          // Needed for the cross-site redirect back from the provider
          // in production; `lax` is correct over plain http locally.
          sameSite: isProd ? "none" : "lax",
          partitioned: isProd
        }
      }
    }
  },
  // No oAuthProxy() here, deliberately.
  //
  // That plugin exists so a deployment whose URL changes per build (Vercel
  // preview deployments) can register ONE redirect URI with the provider and
  // have callbacks forwarded to the real origin. We don't need it: Google
  // sign-in is used on one known frontend origin.
  //
  // It was also actively breaking Google sign-in. The plugin builds its
  // forwarding URL from the origin of the incoming request — which, because
  // the frontend rewrite forwards to API_BASE (`http://127.0.0.1:5000`),
  // is `127.0.0.1`, not `localhost`. So the browser was sent to
  // 127.0.0.1:5000, the session cookie was set for THAT host, and the final
  // redirect landed on localhost:3000 where a 127.0.0.1 cookie is never
  // sent — cookies are scoped by host and the two are distinct. Sign-in
  // succeeded server-side (account linked, session row written) and the user
  // still bounced to /login.
  //
  // Without the plugin the callback is handled in place: Google returns to
  // `${baseURL}/api/v1/auth/callback/google`, the browser is on the frontend
  // origin throughout, and the cookie is set where it will actually be read.
  plugins: []
});

// src/middlewares/auth.ts
import { fromNodeHeaders } from "better-auth/node";
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
      });
      if (!session) {
        throw new Error("Unauthorized! Session not found or invalid.");
      }
      const { user } = session;
      if (user.status !== "ACTIVE") {
        throw new Error("Unauthorized! Account is not active.");
      }
      if (roles.length && !roles.includes(user.role)) {
        throw new Error("Unauthorized! Insufficient permissions.");
      }
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth2;

// src/middlewares/validateRequest.ts
var validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        cookies: req.cookies,
        query: req.query
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/modules/course/course.validation.ts
import { z } from "zod";
var createCourseSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Course name is required"),
    description: z.string().min(1, "Description is required")
  })
});
var updateCourseSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional()
  })
});

// src/modules/course/course.router.ts
var router = express.Router();
router.post("/", auth_default("TUTOR" /* tutor */), validateRequest(createCourseSchema), CourseController.createCourse);
router.get("/", auth_default("TUTOR" /* tutor */, "ADMIN" /* admin */), CourseController.getAllCourses);
router.get("/:id", CourseController.getCourseByTutorId);
router.patch("/:id", auth_default("TUTOR" /* tutor */, "ADMIN" /* admin */), validateRequest(updateCourseSchema), CourseController.updateCourse);
router.delete("/:id", auth_default("TUTOR" /* tutor */), CourseController.deleteCourse);
var courseRouter = router;

// src/app.ts
import { toNodeHandler } from "better-auth/node";

// src/modules/tutor/tutor.router.ts
import express2 from "express";

// src/lib/select.ts
var publicUserSelect = {
  id: true,
  name: true,
  image: true
};
var privateUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  status: true,
  createdAt: true
};
var contactUserSelect = {
  id: true,
  name: true,
  email: true
};

// src/modules/tutor/tutor.service.ts
var TUTOR_EDITABLE = ["display_name", "bio", "qualification", "hourly_rate"];
var ADMIN_EDITABLE = [...TUTOR_EDITABLE, "is_verified"];
var createTutorIntoDB = async (payload, userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) throw new Error("User not found");
  if (user.role !== "TUTOR") throw new Error("Only tutors can create a tutor profile");
  const existing = await prisma.tutorProfile.findUnique({
    where: { user_id: user.id }
  });
  if (existing) throw new Error("Tutor profile already exists");
  return prisma.tutorProfile.create({
    data: {
      display_name: payload.display_name,
      bio: payload.bio,
      qualification: payload.qualification,
      hourly_rate: payload.hourly_rate || 0,
      user_id: user.id
    }
  });
};
var getAllTutor = async (filters = {}) => {
  let where = {};
  if (filters.minPrice !== void 0 || filters.maxPrice !== void 0) {
    where.hourly_rate = {};
    if (filters.minPrice !== void 0) where.hourly_rate.gte = filters.minPrice;
    if (filters.maxPrice !== void 0) where.hourly_rate.lte = filters.maxPrice;
  }
  if (filters.course) {
    where.courses = {
      some: {
        name: { contains: filters.course, mode: "insensitive" }
      }
    };
  }
  const result = await prisma.tutorProfile.findMany({
    where,
    include: {
      courses: true,
      courseSlots: true,
      // This route is PUBLIC. `user: true` would return every scalar column
      // of the user row, including the bcrypt password hash, to anyone who
      // called it unauthenticated.
      user: { select: publicUserSelect }
    }
  });
  return result;
};
var getTutorService = async ({ userId, tutorId }) => {
  if (!userId && !tutorId) {
    throw new Error("Provide either userId or tutorId");
  }
  const result = await prisma.tutorProfile.findUnique({
    where: userId ? { user_id: userId } : { id: tutorId }
  });
  return result;
};
var updateTutor = async (payload, userId, tutorProfileId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) throw new Error("User not found");
  if (user.role === "ADMIN") {
    if (!tutorProfileId) throw new Error("Tutor profile ID is required");
    const tutor = await prisma.tutorProfile.findUnique({
      where: { id: tutorProfileId }
    });
    if (!tutor) throw new Error("Tutor profile not found");
    return prisma.tutorProfile.update({
      where: { id: tutorProfileId },
      data: pick(payload, ADMIN_EDITABLE)
    });
  }
  return prisma.tutorProfile.update({
    where: { user_id: userId },
    data: pick(payload, TUTOR_EDITABLE)
  });
};
var deleteTutor = async (tutorId, userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user) {
    throw new Error("User not found");
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { id: tutorId }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  if (tutorProfile.user_id !== user.id) {
    throw new Error("Unauthorized! You can only delete your own tutor profile");
  }
  const result = await prisma.tutorProfile.delete({
    where: { id: tutorId }
  });
  return result;
};
var tutorService = {
  createTutorIntoDB,
  getAllTutor,
  updateTutor,
  getTutorService,
  deleteTutor
};

// src/modules/tutor/tutor.controller.ts
var createTutor = async (req, res, next) => {
  try {
    const result = await tutorService.createTutorIntoDB(req.body, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Tutor profile created successfully",
      tutor: result
    });
  } catch (e) {
    next(e);
  }
};
var getAllTutor2 = async (req, res, next) => {
  try {
    const { minPrice, maxPrice, course } = req.query;
    const filters = {};
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (course) filters.course = course;
    const result = await tutorService.getAllTutor(filters);
    res.status(201).json({
      status: "success",
      message: "Tutor retrieved successfully",
      tutor: result
    });
  } catch (e) {
    next(e);
  }
};
var getTutor = async (req, res, next) => {
  try {
    const { userId, tutorId } = req.query;
    if (!userId && !tutorId) {
      res.status(400).json({
        status: "error",
        message: "Provide either userId or tutorId"
      });
      return;
    }
    const result = await tutorService.getTutorService({
      userId,
      tutorId
    });
    if (!result) {
      res.status(404).json({
        status: "error",
        message: "Tutor not found"
      });
      return;
    }
    res.status(201).json({
      status: "success",
      message: "Tutor retrieved successfully",
      tutor: result
    });
  } catch (e) {
    next(e);
  }
};
var updateTutor2 = async (req, res, next) => {
  try {
    const result = await tutorService.updateTutor(
      req.body,
      req.user?.id,
      req.params?.id
    );
    res.status(200).json({
      status: "success",
      message: "Tutor profile updated successfully",
      tutor: result
    });
  } catch (e) {
    next(e);
  }
};
var deleteTutor2 = async (req, res, next) => {
  try {
    const result = await tutorService.deleteTutor(req.params?.id, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Tutor deleted successfully",
      user: result
    });
  } catch (e) {
    next(e);
  }
};
var tutorController = {
  createTutor,
  getAllTutor: getAllTutor2,
  updateTutor: updateTutor2,
  getTutor,
  deleteTutor: deleteTutor2
};

// src/modules/tutor/tutor.validation.ts
import { z as z2 } from "zod";
var createTutorSchema = z2.object({
  body: z2.object({
    display_name: z2.string().min(1, "Display name is required"),
    bio: z2.string().min(1, "Bio is required"),
    qualification: z2.string().min(1, "Qualification is required"),
    hourly_rate: z2.number().nonnegative("Hourly rate cannot be negative").optional()
  })
});
var updateTutorSchema = z2.object({
  body: z2.object({
    display_name: z2.string().min(1).optional(),
    bio: z2.string().min(1).optional(),
    qualification: z2.string().min(1).optional(),
    hourly_rate: z2.number().nonnegative("Hourly rate cannot be negative").optional(),
    // Accepted only on the admin verify route; the service ignores it for tutors.
    is_verified: z2.boolean().optional()
  })
});

// src/modules/tutor/tutor.router.ts
var router2 = express2.Router();
router2.post("/", auth_default("TUTOR" /* tutor */), validateRequest(createTutorSchema), tutorController.createTutor);
router2.get("/", tutorController.getAllTutor);
router2.get("/single", tutorController.getTutor);
router2.patch("/profile", auth_default("TUTOR" /* tutor */), validateRequest(updateTutorSchema), tutorController.updateTutor);
router2.patch("/:id/verify", auth_default("ADMIN" /* admin */), validateRequest(updateTutorSchema), tutorController.updateTutor);
router2.delete("/:id", auth_default("TUTOR" /* tutor */), tutorController.deleteTutor);
var tutorRouter = router2;

// src/modules/courseSlot/slot.router.ts
import express3 from "express";

// src/modules/courseSlot/slot.service.ts
var SLOT_EDITABLE = [
  "name",
  "description",
  "date",
  "start_time",
  "end_time",
  "capacity",
  "course_id"
];
var sessionTypeFor = (capacity) => capacity > 1 ? "GROUP" : "ONE_ON_ONE";
var assertValidCapacity = (capacity) => {
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new Error("Capacity must be a whole number of at least 1");
  }
};
var createSlotIntoDB = async (payload, userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user) {
    throw new Error("User not found");
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userId }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  const data = pick(
    payload,
    SLOT_EDITABLE
  );
  if (!data.course_id) {
    throw new Error("A course_id is required");
  }
  const course = await prisma.course.findUnique({ where: { id: data.course_id } });
  if (!course || course.tutor_id !== tutorProfile.id) {
    throw new Error("You can only create slots for your own courses");
  }
  if (data.start_time && data.end_time) {
    if (new Date(data.end_time).getTime() <= new Date(data.start_time).getTime()) {
      throw new Error("Invalid course slot duration");
    }
  }
  const capacity = data.capacity ?? 1;
  assertValidCapacity(capacity);
  const result = await prisma.courseSlot.create({
    data: {
      ...data,
      capacity,
      session_type: sessionTypeFor(capacity),
      tutor_id: tutorProfile.id
    },
    include: {
      course: true
    }
  });
  return result;
};
var getAllSlots = async () => {
  const result = await prisma.courseSlot.findMany({
    include: {
      tutor: true,
      course: true
    }
  });
  return result;
};
var getAllSlotsByTutor = async (tutorID) => {
  const result = await prisma.courseSlot.findMany({
    where: {
      tutor_id: tutorID
    },
    include: {
      course: true,
      // Count how many students have actively booked each slot (cancelled
      // bookings free their seat), so the tutor's calendar can show
      // "3 / 10 booked" or mark an empty slot as still open.
      _count: {
        select: {
          bookings: {
            where: { booking_status: { not: "CANCELLED" } }
          }
        }
      }
    }
  });
  return result;
};
var getSlotById = async (slotId, userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user) {
    throw new Error("User not found");
  }
  const result = await prisma.courseSlot.findUnique({
    where: { id: slotId },
    include: {
      tutor: true,
      course: true
    }
  });
  return result;
};
var updateSlot = async (slotId, payload, userId) => {
  const slot = await prisma.courseSlot.findUnique({
    where: { id: slotId }
  });
  if (!slot) {
    throw new Error("Slot not found");
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userId }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  if (slot.tutor_id !== tutorProfile.id) {
    throw new Error("Unauthorized! You can only update your own slots");
  }
  const data = pick(payload, SLOT_EDITABLE);
  if (data.course_id && data.course_id !== slot.course_id) {
    const course = await prisma.course.findUnique({ where: { id: data.course_id } });
    if (!course || course.tutor_id !== tutorProfile.id) {
      throw new Error("You can only move a slot to your own course");
    }
  }
  if (data.capacity !== void 0) {
    assertValidCapacity(data.capacity);
  }
  if (data.capacity !== void 0 && data.capacity !== slot.capacity) {
    const booked = await prisma.booking.count({
      where: { course_slot_id: slotId, booking_status: { not: "CANCELLED" } }
    });
    if (data.capacity < booked) {
      throw new Error(
        `${booked} student${booked === 1 ? " has" : "s have"} already booked this slot, so capacity can't be less than ${booked}`
      );
    }
  }
  const result = await prisma.courseSlot.update({
    where: {
      id: slotId
    },
    data: {
      ...data,
      ...data.capacity !== void 0 && { session_type: sessionTypeFor(data.capacity) }
    },
    include: {
      course: true,
      tutor: true
    }
  });
  return result;
};
var deleteSlot = async (slotId, userId) => {
  const slot = await prisma.courseSlot.findUnique({
    where: { id: slotId }
  });
  if (!slot) {
    throw new Error("Slot not found");
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userId }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  if (slot.tutor_id !== tutorProfile.id) {
    throw new Error("Unauthorized! You can only delete your own slots");
  }
  const result = await prisma.courseSlot.delete({
    where: {
      id: slotId
    }
  });
  return result;
};
var slotService = {
  createSlotIntoDB,
  getAllSlotsByTutor,
  getAllSlots,
  updateSlot,
  deleteSlot,
  getSlotById
};

// src/modules/courseSlot/slot.controller.ts
var createSlot = async (req, res, next) => {
  try {
    const result = await slotService.createSlotIntoDB(req.body, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Slot created successfully",
      slot: result
    });
  } catch (e) {
    console.error("Full error:", e);
    next(e);
  }
};
var getAllSlotsByTutor2 = async (req, res, next) => {
  try {
    const result = await slotService.getAllSlotsByTutor(req.params?.id);
    res.status(201).json({
      status: "success",
      message: "Slots retrieved successfully",
      slots: result
    });
  } catch (e) {
    next(e);
  }
};
var getAllSlots2 = async (req, res, next) => {
  try {
    const result = await slotService.getAllSlots();
    res.status(201).json({
      status: "success",
      message: "Slots retrieved successfully",
      slots: result
    });
  } catch (e) {
    next(e);
  }
};
var getSlotById2 = async (req, res, next) => {
  try {
    const result = await slotService.getSlotById(req.params?.id, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Slot retrieved successfully",
      slot: result
    });
  } catch (e) {
    next(e);
  }
};
var updateSlot2 = async (req, res, next) => {
  try {
    const result = await slotService.updateSlot(req.params?.id, req.body, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Slot updated successfully",
      slot: result
    });
  } catch (e) {
    next(e);
  }
};
var deleteSlot2 = async (req, res, next) => {
  try {
    const result = await slotService.deleteSlot(req.params?.id, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Slot deleted successfully",
      slot: result
    });
  } catch (e) {
    next(e);
  }
};
var slotController = {
  createSlot,
  getAllSlotsByTutor: getAllSlotsByTutor2,
  getAllSlots: getAllSlots2,
  updateSlot: updateSlot2,
  deleteSlot: deleteSlot2,
  getSlotById: getSlotById2
};

// src/modules/courseSlot/slot.validation.ts
import { z as z3 } from "zod";
var createSlotSchema = z3.object({
  body: z3.object({
    name: z3.string().min(1, "Slot name is required"),
    description: z3.string().optional().nullable(),
    course_id: z3.string().min(1, "A course must be selected"),
    date: z3.string().min(1, "A date is required"),
    start_time: z3.string().min(1, "A start time is required"),
    end_time: z3.string().min(1, "An end time is required"),
    capacity: z3.number().int().min(1, "Capacity must be at least 1").optional()
  })
});
var updateSlotSchema = z3.object({
  body: z3.object({
    name: z3.string().min(1).optional(),
    description: z3.string().optional().nullable(),
    course_id: z3.string().min(1).optional(),
    date: z3.string().min(1).optional(),
    start_time: z3.string().min(1).optional(),
    end_time: z3.string().min(1).optional(),
    capacity: z3.number().int().min(1, "Capacity must be at least 1").optional()
  })
});

// src/modules/courseSlot/slot.router.ts
var router3 = express3.Router();
router3.post("/", auth_default("TUTOR" /* tutor */), validateRequest(createSlotSchema), slotController.createSlot);
router3.get("/tutor/:id", slotController.getAllSlotsByTutor);
router3.get("/allslots", slotController.getAllSlots);
router3.get("/:id", auth_default("TUTOR" /* tutor */, "STUDENT" /* student */, "ADMIN" /* admin */), slotController.getSlotById);
router3.patch("/:id", auth_default("TUTOR" /* tutor */), validateRequest(updateSlotSchema), slotController.updateSlot);
router3.delete("/:id", auth_default("TUTOR" /* tutor */), slotController.deleteSlot);
var courseSlotRouter = router3;

// src/modules/review/review.router.ts
import express4 from "express";

// src/modules/review/review.service.ts
var recalculateTutorRating = async (tutorId) => {
  const reviews = await prisma.review.findMany({
    where: { tutor_id: tutorId }
  });
  const total = reviews.length;
  const avg = total ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / total * 10) / 10 : 0;
  await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: {
      rating_avg: avg,
      total_reviews: total
    }
  });
};
var createReviewIntoDB = async (payload, userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user) {
    throw new Error("User not found");
  }
  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.booking_id
    }
  });
  if (!booking) {
    throw new Error("Booking not found");
  }
  if (booking.student_id !== user.id) throw new Error("Unauthorized! You can only review your own bookings");
  if (booking.booking_status !== "COMPLETED") throw new Error("You can only review completed sessions");
  const fields = pick(payload, ["rating", "comment"]);
  const rating = fields.rating;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be a whole number between 1 and 5");
  }
  const result = await prisma.review.create({
    data: {
      rating,
      comment: fields.comment ?? null,
      booking_id: booking.id,
      student_id: user.id,
      tutor_id: booking.tutor_id
    }
  });
  await recalculateTutorRating(booking.tutor_id);
  return result;
};
var getAllReviews = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) throw new Error("User not found");
  if (user.role === "STUDENT") {
    return prisma.review.findMany({
      where: { student_id: userId },
      include: {
        booking: {
          include: { courseSlot: true }
        },
        tutor: true
      }
    });
  }
  if (user.role === "ADMIN") {
    return prisma.review.findMany({
      include: {
        student: { select: privateUserSelect },
        tutor: {
          include: { user: { select: privateUserSelect } }
        },
        booking: {
          include: { courseSlot: { include: { course: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  if (user.role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userId }
    });
    if (!tutorProfile) throw new Error("Tutor profile not found");
    return prisma.review.findMany({
      where: { tutor_id: tutorProfile.id },
      include: {
        booking: {
          include: { courseSlot: true }
        },
        student: { select: privateUserSelect }
      }
    });
  }
  throw new Error("Invalid role");
};
var updateReview = async (reviewId, payload, userId) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });
  if (!review) {
    throw new Error("Review not found");
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  const isAdmin = user?.role === "ADMIN";
  if (!isAdmin && review.student_id !== user?.id) {
    throw new Error("Unauthorized! You can only update your own reviews");
  }
  const data = isAdmin ? pick(payload, ["rating", "comment", "status"]) : pick(payload, ["rating", "comment"]);
  if (Object.keys(data).length === 0) {
    throw new Error("Nothing to update");
  }
  const rating = data.rating;
  if (rating !== void 0) {
    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating must be a whole number between 1 and 5");
    }
  }
  const result = await prisma.review.update({
    where: {
      id: reviewId
    },
    data
  });
  await recalculateTutorRating(review.tutor_id);
  return result;
};
var deleteReview = async (reviewId, userId) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });
  if (!review) {
    throw new Error("Review not found");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new Error("User not found");
  }
  if (user.role !== "ADMIN" && review.student_id !== user.id) {
    throw new Error("Unauthorized! You can only delete your own reviews");
  }
  const result = await prisma.review.delete({
    where: {
      id: reviewId
    }
  });
  await recalculateTutorRating(review.tutor_id);
  return result;
};
var getTutorReviewsById = async (tutorId, userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) throw new Error("User not found");
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId }
  });
  if (!tutor) throw new Error("Tutor not found");
  const reviews = await prisma.review.findMany({
    where: { tutor_id: tutorId },
    include: {
      student: { select: publicUserSelect },
      booking: {
        include: {
          courseSlot: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return reviews;
};
var getPublicTutorReviews = async (tutorId) => {
  const tutor = await prisma.tutorProfile.findUnique({ where: { id: tutorId } });
  if (!tutor) throw new Error("Tutor not found");
  return prisma.review.findMany({
    where: {
      tutor_id: tutorId,
      status: "APPROVED"
      // ✅ only approved
    },
    include: {
      // Public route — a reviewer's email address must not be published
      // alongside their review.
      student: { select: publicUserSelect },
      booking: {
        include: { courseSlot: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var reviewService = {
  createReviewIntoDB,
  getAllReviews,
  getPublicTutorReviews,
  getTutorReviewsById,
  updateReview,
  deleteReview
};

// src/modules/review/review.controller.ts
var createReview = async (req, res, next) => {
  try {
    const result = await reviewService.createReviewIntoDB(req.body, req.user?.id);
    res.status(200).json({
      status: "success",
      message: "Review created successfully",
      review: result
    });
  } catch (e) {
    next(e);
  }
};
var getAllReviews2 = async (req, res, next) => {
  try {
    const result = await reviewService.getAllReviews(req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Reviews retrieved successfully",
      reviews: result
    });
  } catch (e) {
    next(e);
  }
};
var getTutorReviewsById2 = async (req, res, next) => {
  try {
    const result = await reviewService.getTutorReviewsById(req.params?.id, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Reviews retrieved successfully",
      reviews: result
    });
  } catch (e) {
    next(e);
  }
};
var updateReview2 = async (req, res, next) => {
  try {
    const result = await reviewService.updateReview(req.params?.id, req.body, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Review updated successfully",
      review: result
    });
  } catch (e) {
    next(e);
  }
};
var deleteReview2 = async (req, res, next) => {
  try {
    const result = await reviewService.deleteReview(req.params?.id, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Review deleted successfully",
      review: result
    });
  } catch (e) {
    next(e);
  }
};
var getPublicTutorReviews2 = async (req, res, next) => {
  try {
    const result = await reviewService.getPublicTutorReviews(req.params?.id);
    res.status(201).json({
      status: "success",
      message: "Reviews retrieved successfully",
      reviews: result
    });
  } catch (e) {
    next(e);
  }
};
var reviewController = {
  createReview,
  getAllReviews: getAllReviews2,
  getTutorReviewsById: getTutorReviewsById2,
  getPublicTutorReviews: getPublicTutorReviews2,
  updateReview: updateReview2,
  deleteReview: deleteReview2
};

// src/modules/review/review.validation.ts
import { z as z4 } from "zod";
var createReviewSchema = z4.object({
  body: z4.object({
    booking_id: z4.string().min(1, "A booking is required"),
    rating: z4.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    comment: z4.string().optional().nullable()
  })
});
var updateReviewSchema = z4.object({
  body: z4.object({
    rating: z4.number().int().min(1).max(5).optional(),
    comment: z4.string().optional().nullable(),
    // Moderation only — the service permits this for administrators alone.
    status: z4.enum(["APPROVED", "REJECTED"]).optional()
  })
});

// src/modules/review/review.router.ts
var router4 = express4.Router();
router4.post("/", auth_default("STUDENT" /* student */), validateRequest(createReviewSchema), reviewController.createReview);
router4.get("/", auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */), reviewController.getAllReviews);
router4.get("/:id", auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */), reviewController.getTutorReviewsById);
router4.get("/tutor/:id/public", reviewController.getPublicTutorReviews);
router4.patch("/:id", auth_default("STUDENT" /* student */, "ADMIN" /* admin */), validateRequest(updateReviewSchema), reviewController.updateReview);
router4.delete("/:id", auth_default("STUDENT" /* student */, "ADMIN" /* admin */), reviewController.deleteReview);
var reviewRouter = router4;

// src/modules/booking/booking.router.ts
import express5 from "express";

// src/lib/notify.ts
var notify = async (userIds, message, link) => {
  const unique = [...new Set(userIds)].filter(Boolean);
  if (unique.length === 0) return;
  await prisma.notification.createMany({
    data: unique.map((user_id) => ({ user_id, message, link: link ?? null }))
  });
};

// src/modules/payment/payment.service.ts
import Stripe from "stripe";
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10"
  // fallback to any if TS complains
});
var CURRENCY = (process.env.STRIPE_CURRENCY || "bdt").toLowerCase();
var createCheckoutSession = async (userId, bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      student: { select: contactUserSelect },
      tutor: true,
      courseSlot: { include: { course: true } }
    }
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.student_id !== userId) throw new Error("Unauthorized");
  if (booking.payment_status === "PAID") throw new Error("Already paid");
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: booking.student.email,
    line_items: [
      {
        price_data: {
          // The platform prices in Bangladeshi Taka. Kept configurable because
          // which presentment currencies a Stripe account may charge in depends
          // on the account's country — if a test charge is rejected with an
          // unsupported-currency error, set STRIPE_CURRENCY=usd to fall back.
          currency: CURRENCY,
          product_data: {
            name: `Tutoring Session: ${booking.courseSlot.course.name}`,
            description: `Tutor: ${booking.tutor.display_name}`
          },
          unit_amount: Math.round(booking.total_price * 100)
          // Stripe uses cents
        },
        quantity: 1
      }
    ],
    metadata: {
      bookingId: booking.id
      // For the webhook to know which booking this is
    },
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard/bookings?payment=success`,
    cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard/bookings?payment=cancelled`
  });
  if (!session.url) throw new Error("Failed to generate Stripe checkout URL");
  return { url: session.url };
};
var processWebhook = async (rawBody, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("Missing Stripe Webhook Secret");
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) throw new Error("No bookingId in metadata");
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        payment_status: "PAID",
        transaction_id: session.id
        // Store stripe session ID
      }
    });
  }
};
var refundBooking = async (bookingId) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");
  if (booking.payment_status !== "PAID") {
    throw new Error("This booking has not been paid, so there is nothing to refund");
  }
  if (!booking.transaction_id) {
    throw new Error("This booking has no payment on record to refund");
  }
  const session = await stripe.checkout.sessions.retrieve(booking.transaction_id);
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!paymentIntentId) {
    throw new Error("Could not find the original payment to refund");
  }
  const existing = await stripe.refunds.list({
    payment_intent: paymentIntentId,
    limit: 1
  });
  if (existing.data.length > 0) {
    return { refundId: existing.data[0].id, alreadyRefunded: true };
  }
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason: "requested_by_customer",
    metadata: { bookingId: booking.id }
  });
  return { refundId: refund.id, alreadyRefunded: false };
};
var PaymentService = {
  createCheckoutSession,
  processWebhook,
  refundBooking
};

// src/modules/booking/booking.service.ts
var BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
var createBookingIntoDB = async (payload, userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!user) {
    throw new Error("Student not found");
  }
  const slot = await prisma.courseSlot.findUnique({
    where: {
      id: payload.course_slot_id
    }
  });
  if (!slot) {
    throw new Error("Course Slot not found");
  }
  const existing = await prisma.booking.findFirst({
    where: {
      student_id: userId,
      course_slot_id: payload.course_slot_id
    }
  });
  if (existing) throw new Error("You have already booked this slot");
  const result = await prisma.$transaction(async (tx) => {
    const tutor = await tx.tutorProfile.findUnique({
      where: { id: payload.tutor_id }
    });
    if (!tutor) {
      throw new Error("Tutor profile not found");
    }
    const activeBookings = await tx.booking.count({
      where: {
        course_slot_id: payload.course_slot_id,
        booking_status: { not: "CANCELLED" }
      }
    });
    if (activeBookings >= slot.capacity) {
      throw new Error("This session is full");
    }
    const start = new Date(slot.start_time).getTime();
    const end = new Date(slot.end_time).getTime();
    if (end <= start) {
      throw new Error("Invalid course slot duration");
    }
    const durationHours = (end - start) / (1e3 * 60 * 60);
    const calculatedPrice = durationHours * tutor.hourly_rate;
    return await tx.booking.create({
      data: {
        student_id: userId,
        tutor_id: payload.tutor_id,
        course_slot_id: payload.course_slot_id,
        booking_status: "PENDING",
        total_price: calculatedPrice
      }
    });
  });
  return result;
};
var getAllBookings = async (userID) => {
  const userData = await prisma.user.findUnique({
    where: { id: userID }
  });
  if (!userData) {
    throw new Error("Unauthorized!");
  }
  if (userData.role === "STUDENT") {
    const result = await prisma.booking.findMany({
      where: { student_id: userID },
      include: {
        tutor: true,
        // Include the slot's live seat usage so the calendar can show
        // "X / Y booked" (active, non-cancelled bookings out of capacity).
        courseSlot: {
          include: {
            _count: {
              select: {
                bookings: {
                  where: { booking_status: { not: "CANCELLED" } }
                }
              }
            }
          }
        },
        review: true
      }
    });
    return result;
  }
  if (userData.role === "ADMIN") {
    const result = await prisma.booking.findMany({
      include: {
        tutor: true,
        courseSlot: true,
        student: { select: privateUserSelect }
      }
    });
    return result;
  }
  if (userData.role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userID }
    });
    if (!tutorProfile) {
      throw new Error("Tutor profile not found!");
    }
    const result = await prisma.booking.findMany({
      where: { tutor_id: tutorProfile.id },
      include: {
        tutor: true,
        courseSlot: true,
        student: { select: privateUserSelect }
      }
    });
    return result;
  }
  throw new Error("Invalid role!");
};
var updateBooking = async (bookingId, payload, userID) => {
  const user = await prisma.user.findUnique({ where: { id: userID } });
  if (!user) throw new Error("User not found");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");
  if (user.role !== "ADMIN") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userID }
    });
    if (!tutorProfile) throw new Error("Tutor profile not found");
    if (booking.tutor_id !== tutorProfile.id) {
      throw new Error("Unauthorized! You can only update your own bookings");
    }
  }
  const { booking_status } = pick(payload, ["booking_status"]);
  if (!booking_status) {
    throw new Error("A booking_status is required");
  }
  if (!BOOKING_STATUSES.includes(booking_status)) {
    throw new Error("Invalid booking status");
  }
  return prisma.booking.update({
    where: { id: bookingId },
    data: { booking_status }
  });
};
var CANCELLATION_WINDOW_HOURS = 24;
var describeCancellation = (booking, startTime, cancelledByTutor) => {
  const msUntilStart = new Date(startTime).getTime() - Date.now();
  const withinWindow = msUntilStart < CANCELLATION_WINDOW_HOURS * 60 * 60 * 1e3;
  const wasPaid = booking.payment_status === "PAID";
  const refundable = wasPaid && (cancelledByTutor || !withinWindow);
  return {
    refundable,
    withinWindow,
    wasPaid,
    hoursUntilStart: Math.max(0, msUntilStart / (60 * 60 * 1e3)),
    windowHours: CANCELLATION_WINDOW_HOURS
  };
};
var cancelBooking = async (bookingId, userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      courseSlot: { select: { start_time: true, name: true } },
      tutor: { select: { id: true, user_id: true, display_name: true } }
    }
  });
  if (!booking) throw new Error("Booking not found");
  let cancelledByTutor = false;
  if (user.role === "STUDENT") {
    if (booking.student_id !== userId) {
      throw new Error("Forbidden! This is not your booking");
    }
  } else if (user.role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userId },
      select: { id: true }
    });
    if (!tutorProfile || booking.tutor_id !== tutorProfile.id) {
      throw new Error("Forbidden! This is not your booking");
    }
    cancelledByTutor = true;
  } else if (user.role === "ADMIN") {
    cancelledByTutor = true;
  } else {
    throw new Error("Unauthorized!");
  }
  if (booking.booking_status === "CANCELLED") {
    throw new Error("This booking is already cancelled");
  }
  if (booking.booking_status === "COMPLETED") {
    throw new Error("A completed session cannot be cancelled");
  }
  const outcome = describeCancellation(
    booking,
    booking.courseSlot.start_time,
    cancelledByTutor
  );
  let refundId = null;
  if (outcome.refundable) {
    const refund = await PaymentService.refundBooking(bookingId);
    refundId = refund.refundId;
  }
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      booking_status: "CANCELLED",
      cancelled_at: /* @__PURE__ */ new Date(),
      ...refundId ? { refund_id: refundId, payment_status: "REFUNDED" } : {}
    }
  });
  const sessionName = booking.courseSlot.name;
  if (cancelledByTutor) {
    await notify(
      [booking.student_id],
      refundId ? `Your session "${sessionName}" was cancelled by the tutor. A refund has been issued.` : `Your session "${sessionName}" was cancelled by the tutor.`,
      "/dashboard/bookings"
    );
  } else {
    await notify(
      [booking.tutor.user_id],
      `A student cancelled their booking for "${sessionName}".`,
      "/dashboard/bookings"
    );
  }
  return { booking: updated, refunded: Boolean(refundId), ...outcome };
};
var BookingService = {
  createBookingIntoDB,
  getAllBookings,
  updateBooking,
  cancelBooking,
  describeCancellation,
  CANCELLATION_WINDOW_HOURS
};

// src/modules/booking/booking.controller.ts
var createBooking = async (req, res, next) => {
  try {
    const result = await BookingService.createBookingIntoDB(
      req.body,
      req.user?.id
    );
    res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      booking: result
    });
  } catch (error) {
    next(error);
  }
};
var getAllBookings2 = async (req, res, next) => {
  try {
    const result = await BookingService.getAllBookings(req.user?.id);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};
var updateBooking2 = async (req, res, next) => {
  try {
    const result = await BookingService.updateBooking(req.params?.id, req.body, req.user?.id);
    res.status(200).json({
      status: "success",
      message: "Booking updated successfully",
      booking: result
    });
  } catch (e) {
    next(e);
  }
};
var cancelBooking2 = async (req, res, next) => {
  try {
    const result = await BookingService.cancelBooking(
      req.params?.id,
      req.user?.id
    );
    res.status(200).json({
      status: "success",
      message: result.refunded ? "Booking cancelled and refunded" : "Booking cancelled",
      booking: result.booking,
      refunded: result.refunded,
      withinWindow: result.withinWindow
    });
  } catch (e) {
    next(e);
  }
};
var BookingController = {
  // Add controller methods here
  createBooking,
  getAllBookings: getAllBookings2,
  updateBooking: updateBooking2,
  cancelBooking: cancelBooking2
};

// src/modules/booking/booking.validation.ts
import { z as z5 } from "zod";
var createBookingSchema = z5.object({
  body: z5.object({
    course_slot_id: z5.string().min(1, "A session slot is required"),
    tutor_id: z5.string().min(1, "A tutor is required")
  })
});
var updateBookingSchema = z5.object({
  body: z5.object({
    booking_status: z5.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"])
  })
});

// src/modules/booking/booking.router.ts
var router5 = express5.Router();
router5.post("/", auth_default("STUDENT" /* student */), validateRequest(createBookingSchema), BookingController.createBooking);
router5.get("/", auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */), BookingController.getAllBookings);
router5.patch("/:id", auth_default("TUTOR" /* tutor */, "ADMIN" /* admin */), validateRequest(updateBookingSchema), BookingController.updateBooking);
router5.post("/:id/cancel", auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */), BookingController.cancelBooking);
var bookingRouter = router5;

// src/middlewares/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    date: (/* @__PURE__ */ new Date()).toISOString()
  });
};

// src/middlewares/globalErrorHandler.ts
import { ZodError } from "zod";
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = "Internal server Error!";
  if (err instanceof ZodError) {
    statusCode = 400;
    message = err.issues.map((e) => e.message).join(", ");
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    message = "Incorrect body or missing fields";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    statusCode = 400;
    switch (err.code) {
      case "P2002":
        message = "A record with this value already exists";
        break;
      case "P2025":
        message = "Record not found";
        statusCode = 404;
        break;
      case "P2003":
        message = "Foreign key constraint failed";
        break;
      default:
        message = "Database error";
    }
  } else if (err instanceof Error) {
    statusCode = err.message.toLowerCase().includes("not found") ? 404 : err.message.toLowerCase().includes("unauthorized") ? 401 : err.message.toLowerCase().includes("forbidden") ? 403 : 400;
    message = err.message;
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message || message;
  }
  if (process.env.NODE_ENV !== "production") {
    console.error("Error:", err);
  }
  res.status(statusCode).json({
    success: false,
    message,
    ...process.env.NODE_ENV !== "production" && { error: err }
  });
}

// src/modules/admin/admin.router.ts
import express6 from "express";

// src/modules/admin/admin.service.ts
var getAllUsers = async (userID) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: userID
    }
  });
  if (!userData) {
    throw new Error("Unauthorized!");
  }
  const result = await prisma.user.findMany({
    select: privateUserSelect,
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var getAdminStats = async () => {
  const [totalUsers, totalBookings, totalCourses, totalReviews] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.course.count(),
    prisma.review.count()
  ]);
  return { totalUsers, totalBookings, totalCourses, totalReviews };
};
var updateUserStatus = async (userId, status) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  return prisma.user.update({
    where: { id: userId },
    data: { status }
  });
};
var adminService = {
  getAllUsers,
  updateUserStatus,
  getAdminStats
};

// src/modules/admin/admin.controller.ts
var getAllUsers2 = async (req, res, next) => {
  try {
    const result = await adminService.getAllUsers(req.user?.id);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};
var updateUserStatus2 = async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await adminService.updateUserStatus(req.params.id, status);
    res.status(200).json({
      status: "success",
      message: "User status updated successfully",
      user: result
    });
  } catch (e) {
    next(e);
  }
};
var getAdminStats2 = async (req, res, next) => {
  try {
    const result = await adminService.getAdminStats();
    res.status(200).json({
      status: "success",
      message: "Stats retrieved successfully",
      stats: result
    });
  } catch (e) {
    next(e);
  }
};
var adminController = {
  getAllUsers: getAllUsers2,
  updateUserStatus: updateUserStatus2,
  getAdminStats: getAdminStats2
};

// src/modules/admin/admin.validation.ts
import { z as z6 } from "zod";
var updateUserStatusSchema = z6.object({
  body: z6.object({
    status: z6.enum(["ACTIVE", "BANNED"])
  })
});

// src/modules/admin/admin.router.ts
var router6 = express6.Router();
router6.get("/users", auth_default("ADMIN" /* admin */), adminController.getAllUsers);
router6.get("/stats", auth_default("ADMIN" /* admin */), adminController.getAdminStats);
router6.patch("/users/:id/status", auth_default("ADMIN" /* admin */), validateRequest(updateUserStatusSchema), adminController.updateUserStatus);
var adminRouter = router6;

// src/modules/payment/payment.controller.ts
var createCheckoutSession2 = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.id;
    const result = await PaymentService.createCheckoutSession(userId, bookingId);
    res.status(200).json({
      status: "success",
      message: "Checkout session created",
      url: result.url
    });
  } catch (e) {
    next(e);
  }
};
var handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    await PaymentService.processWebhook(req.body, sig);
    res.status(200).send("Webhook received");
  } catch (e) {
    res.status(400).send(`Webhook Error: ${e instanceof Error ? e.message : "Unknown Error"}`);
  }
};
var PaymentController = {
  createCheckoutSession: createCheckoutSession2,
  handleWebhook
};

// src/modules/payment/payment.router.ts
import express7 from "express";

// src/modules/payment/payment.validation.ts
import { z as z7 } from "zod";
var createCheckoutSessionSchema = z7.object({
  body: z7.object({
    bookingId: z7.string().min(1, "A booking is required")
  })
});

// src/modules/payment/payment.router.ts
var router7 = express7.Router();
router7.post("/create-checkout-session", auth_default("STUDENT" /* student */), validateRequest(createCheckoutSessionSchema), PaymentController.createCheckoutSession);
var paymentRouter = router7;

// src/modules/assignment/assignment.router.ts
import express8 from "express";

// src/modules/assignment/assignment.service.ts
var getTutorProfileOrThrow = async (userId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userId }
  });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  return tutorProfile;
};
var createAssignment = async (payload, userId) => {
  const tutorProfile = await getTutorProfileOrThrow(userId);
  const course = await prisma.course.findUnique({
    where: { id: payload.course_id }
  });
  if (!course || course.tutor_id !== tutorProfile.id) {
    throw new Error("You can only add assignments to your own courses");
  }
  const created = await prisma.assignment.create({
    data: {
      title: payload.title,
      description: payload.description,
      due_date: payload.due_date ? new Date(payload.due_date) : null,
      course_id: payload.course_id,
      tutor_id: tutorProfile.id
    },
    include: { course: true }
  });
  const bookings = await prisma.booking.findMany({
    where: {
      courseSlot: { course_id: payload.course_id },
      booking_status: { not: "CANCELLED" }
    },
    select: { student_id: true }
  });
  await notify(
    bookings.map((b) => b.student_id),
    `New assignment: ${created.title}`,
    "/dashboard/assignments"
  );
  return created;
};
var getAssignments = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");
  if (user.role === "TUTOR") {
    const tutorProfile = await getTutorProfileOrThrow(userId);
    return prisma.assignment.findMany({
      where: { tutor_id: tutorProfile.id },
      include: {
        course: true,
        _count: { select: { submissions: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  if (user.role === "STUDENT") {
    const bookings = await prisma.booking.findMany({
      where: { student_id: userId },
      include: { courseSlot: { select: { course_id: true } } }
    });
    const courseIds = [
      ...new Set(bookings.map((b) => b.courseSlot.course_id))
    ];
    return prisma.assignment.findMany({
      where: { course_id: { in: courseIds } },
      include: {
        course: true,
        tutor: { select: { display_name: true } },
        // Only THIS student's submission for each assignment.
        submissions: { where: { student_id: userId } }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  return prisma.assignment.findMany({
    include: { course: true, _count: { select: { submissions: true } } },
    orderBy: { createdAt: "desc" }
  });
};
var getAssignmentById = async (assignmentId, userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      course: true,
      submissions: {
        include: { student: { select: { name: true, email: true } } },
        orderBy: { submittedAt: "desc" }
      }
    }
  });
  if (!assignment) throw new Error("Assignment not found");
  if (user.role !== "ADMIN") {
    const tutorProfile = await getTutorProfileOrThrow(userId);
    if (assignment.tutor_id !== tutorProfile.id) {
      throw new Error("Unauthorized! Not your assignment");
    }
  }
  return assignment;
};
var submitAssignment = async (assignmentId, payload, userId) => {
  if (!payload.file_url) throw new Error("A file is required to submit");
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId }
  });
  if (!assignment) throw new Error("Assignment not found");
  const entitled = await prisma.booking.findFirst({
    where: {
      student_id: userId,
      booking_status: { not: "CANCELLED" },
      courseSlot: { course_id: assignment.course_id }
    },
    select: { id: true }
  });
  if (!entitled) {
    throw new Error("You have not booked a session in this course");
  }
  return prisma.submission.upsert({
    where: {
      assignment_id_student_id: {
        assignment_id: assignmentId,
        student_id: userId
      }
    },
    update: {
      file_url: payload.file_url,
      note: payload.note ?? null,
      status: "SUBMITTED"
    },
    create: {
      assignment_id: assignmentId,
      student_id: userId,
      file_url: payload.file_url,
      note: payload.note ?? null
    }
  });
};
var gradeSubmission = async (submissionId, payload, userId) => {
  const tutorProfile = await getTutorProfileOrThrow(userId);
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: true }
  });
  if (!submission) throw new Error("Submission not found");
  if (submission.assignment.tutor_id !== tutorProfile.id) {
    throw new Error("Unauthorized! You can only grade your own assignments");
  }
  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      grade: payload.grade,
      feedback: payload.feedback ?? null,
      status: "GRADED"
    }
  });
  await notify(
    [submission.student_id],
    `Your submission for "${submission.assignment.title}" was graded`,
    "/dashboard/assignments"
  );
  return updated;
};
var AssignmentService = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  submitAssignment,
  gradeSubmission
};

// src/modules/assignment/assignment.controller.ts
var createAssignment2 = async (req, res, next) => {
  try {
    const result = await AssignmentService.createAssignment(req.body, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Assignment created successfully",
      assignment: result
    });
  } catch (e) {
    next(e);
  }
};
var getAssignments2 = async (req, res, next) => {
  try {
    const result = await AssignmentService.getAssignments(req.user?.id);
    res.status(200).json({
      status: "success",
      message: "Assignments retrieved successfully",
      assignments: result
    });
  } catch (e) {
    next(e);
  }
};
var getAssignmentById2 = async (req, res, next) => {
  try {
    const result = await AssignmentService.getAssignmentById(
      req.params?.id,
      req.user?.id
    );
    res.status(200).json({
      status: "success",
      message: "Assignment retrieved successfully",
      assignment: result
    });
  } catch (e) {
    next(e);
  }
};
var submitAssignment2 = async (req, res, next) => {
  try {
    const result = await AssignmentService.submitAssignment(
      req.params?.id,
      req.body,
      req.user?.id
    );
    res.status(201).json({
      status: "success",
      message: "Submission saved successfully",
      submission: result
    });
  } catch (e) {
    next(e);
  }
};
var gradeSubmission2 = async (req, res, next) => {
  try {
    const result = await AssignmentService.gradeSubmission(
      req.params?.id,
      req.body,
      req.user?.id
    );
    res.status(200).json({
      status: "success",
      message: "Submission graded successfully",
      submission: result
    });
  } catch (e) {
    next(e);
  }
};
var AssignmentController = {
  createAssignment: createAssignment2,
  getAssignments: getAssignments2,
  getAssignmentById: getAssignmentById2,
  submitAssignment: submitAssignment2,
  gradeSubmission: gradeSubmission2
};

// src/modules/assignment/assignment.validation.ts
import { z as z8 } from "zod";
var createAssignmentSchema = z8.object({
  body: z8.object({
    title: z8.string().min(1, "Title is required"),
    description: z8.string().min(1, "Description is required"),
    course_id: z8.string().min(1, "A course must be selected"),
    due_date: z8.string().optional().nullable()
  })
});
var submitAssignmentSchema = z8.object({
  body: z8.object({
    file_url: z8.string().min(1, "A file is required to submit"),
    note: z8.string().optional().nullable()
  })
});
var gradeSubmissionSchema = z8.object({
  body: z8.object({
    grade: z8.number().int("Grade must be a whole number").min(0, "Grade cannot be negative").max(100, "Grade cannot exceed 100"),
    feedback: z8.string().optional().nullable()
  })
});

// src/modules/assignment/assignment.router.ts
var router8 = express8.Router();
router8.post("/", auth_default("TUTOR" /* tutor */), validateRequest(createAssignmentSchema), AssignmentController.createAssignment);
router8.get(
  "/",
  auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */),
  AssignmentController.getAssignments
);
router8.patch(
  "/submissions/:id/grade",
  auth_default("TUTOR" /* tutor */),
  validateRequest(gradeSubmissionSchema),
  AssignmentController.gradeSubmission
);
router8.post(
  "/:id/submit",
  auth_default("STUDENT" /* student */),
  validateRequest(submitAssignmentSchema),
  AssignmentController.submitAssignment
);
router8.get(
  "/:id",
  auth_default("TUTOR" /* tutor */, "ADMIN" /* admin */),
  AssignmentController.getAssignmentById
);
var assignmentRouter = router8;

// src/modules/video/video.router.ts
import express9 from "express";

// src/lib/sessionAccess.ts
import { createHmac } from "crypto";
var JOIN_OPENS_BEFORE_MS = 15 * 60 * 1e3;
var JOIN_CLOSES_AFTER_MS = 15 * 60 * 1e3;
var resolveSessionAccess = async (slotId, userId, { enforceWindow = true } = {}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, status: true }
  });
  if (!user || user.status !== "ACTIVE") throw new Error("Unauthorized!");
  const slot = await prisma.courseSlot.findUnique({
    where: { id: slotId },
    select: {
      id: true,
      name: true,
      start_time: true,
      end_time: true,
      course_id: true,
      tutor_id: true
    }
  });
  if (!slot) throw new Error("Session not found");
  let isOwner = false;
  if (user.role === "ADMIN") {
    isOwner = true;
    enforceWindow = false;
  } else if (user.role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userId },
      select: { id: true }
    });
    if (!tutorProfile || tutorProfile.id !== slot.tutor_id) {
      throw new Error("Forbidden! This is not your session");
    }
    isOwner = true;
  } else if (user.role === "STUDENT") {
    const booking = await prisma.booking.findFirst({
      where: { course_slot_id: slotId, student_id: userId },
      select: { booking_status: true, payment_status: true }
    });
    if (!booking || booking.booking_status === "CANCELLED") {
      throw new Error("Forbidden! You have not booked this session");
    }
    if (booking.booking_status === "PENDING") {
      throw new Error("Your booking is still waiting for the tutor to confirm it");
    }
    if (booking.payment_status !== "PAID") {
      throw new Error("This booking hasn't been paid for yet");
    }
  } else {
    throw new Error("Unauthorized!");
  }
  const start = new Date(slot.start_time).getTime();
  const end = new Date(slot.end_time).getTime();
  const opensAt = start - JOIN_OPENS_BEFORE_MS;
  const closesAt = end + JOIN_CLOSES_AFTER_MS;
  if (enforceWindow) {
    const now = Date.now();
    if (now < opensAt) {
      const minutes = Math.ceil((opensAt - now) / 6e4);
      throw new Error(
        minutes > 60 ? `This session opens ${JOIN_OPENS_BEFORE_MS / 6e4} minutes before it starts (${new Date(start).toLocaleString()})` : `This session opens in ${minutes} minute${minutes === 1 ? "" : "s"}`
      );
    }
    if (now > closesAt) {
      throw new Error("This session has already ended");
    }
  }
  return {
    slot,
    isOwner,
    displayName: user.name,
    expiresAt: Math.floor(closesAt / 1e3)
  };
};
var whiteboardRoomId = (slotId) => {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("Whiteboard is not configured (missing BETTER_AUTH_SECRET)");
  }
  const digest = createHmac("sha256", secret).update(`whiteboard:${slotId}`).digest("hex");
  return `ts-wb-${digest.slice(0, 32)}`;
};

// src/modules/video/video.service.ts
var DAILY_API = "https://api.daily.co/v1";
var dailyKey = () => {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) throw new Error("Video is not configured (missing DAILY_API_KEY)");
  return apiKey;
};
var dailyHeaders = () => ({
  Authorization: `Bearer ${dailyKey()}`,
  "Content-Type": "application/json"
});
var roomProperties = (access) => ({
  exp: access.expiresAt,
  eject_at_room_exp: true,
  enable_screenshare: true,
  enable_chat: true,
  // Lets a participant check their camera and mic before walking into a
  // lesson, and gives the browser a user gesture to attach permissions to.
  enable_prejoin_ui: true
});
var ensureRoom = async (roomName, access) => {
  const createRes = await fetch(`${DAILY_API}/rooms`, {
    method: "POST",
    headers: dailyHeaders(),
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: roomProperties(access)
    })
  });
  if (createRes.ok) {
    const data = await createRes.json();
    return data.url;
  }
  const updateRes = await fetch(`${DAILY_API}/rooms/${roomName}`, {
    method: "POST",
    headers: dailyHeaders(),
    body: JSON.stringify({
      privacy: "private",
      properties: roomProperties(access)
    })
  });
  if (updateRes.ok) {
    const data = await updateRes.json();
    return data.url;
  }
  const err = await createRes.json().catch(() => ({}));
  throw new Error(err?.info || "Failed to prepare the video room");
};
var mintMeetingToken = async (roomName, access) => {
  const res = await fetch(`${DAILY_API}/meeting-tokens`, {
    method: "POST",
    headers: dailyHeaders(),
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: access.displayName,
        is_owner: access.isOwner,
        exp: access.expiresAt,
        eject_at_token_exp: true
      }
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.info || "Failed to authorise you for the video room");
  }
  const data = await res.json();
  if (!data?.token) throw new Error("Failed to authorise you for the video room");
  return data.token;
};
var getOrCreateRoom = async (slotId, userId) => {
  const access = await resolveSessionAccess(slotId, userId);
  const roomName = `tutorspace-${slotId}`;
  const url = await ensureRoom(roomName, access);
  const token = await mintMeetingToken(roomName, access);
  return {
    url: `${url}?t=${token}`,
    title: access.slot.name,
    isOwner: access.isOwner
  };
};
var VideoService = { getOrCreateRoom };

// src/modules/video/video.controller.ts
var getRoom = async (req, res, next) => {
  try {
    const result = await VideoService.getOrCreateRoom(
      req.params?.slotId,
      req.user?.id
    );
    res.status(200).json({
      status: "success",
      message: "Video room ready",
      url: result.url,
      title: result.title,
      isOwner: result.isOwner
    });
  } catch (e) {
    next(e);
  }
};
var VideoController = { getRoom };

// src/modules/video/video.router.ts
var router9 = express9.Router();
router9.get(
  "/:slotId/room",
  auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */),
  VideoController.getRoom
);
var videoRouter = router9;

// src/modules/material/material.router.ts
import express10 from "express";

// src/modules/material/material.service.ts
var getTutorProfileOrThrow2 = async (userId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userId }
  });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  return tutorProfile;
};
var createMaterial = async (payload, userId) => {
  const tutorProfile = await getTutorProfileOrThrow2(userId);
  if (!payload.file_url) throw new Error("A file is required");
  const course = await prisma.course.findUnique({
    where: { id: payload.course_id }
  });
  if (!course || course.tutor_id !== tutorProfile.id) {
    throw new Error("You can only add materials to your own courses");
  }
  return prisma.courseMaterial.create({
    data: {
      title: payload.title,
      file_url: payload.file_url,
      course_id: payload.course_id,
      tutor_id: tutorProfile.id
    },
    include: { course: true }
  });
};
var getMaterials = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");
  if (user.role === "TUTOR") {
    const tutorProfile = await getTutorProfileOrThrow2(userId);
    return prisma.courseMaterial.findMany({
      where: { tutor_id: tutorProfile.id },
      include: { course: true },
      orderBy: { createdAt: "desc" }
    });
  }
  if (user.role === "STUDENT") {
    const bookings = await prisma.booking.findMany({
      where: { student_id: userId },
      include: { courseSlot: { select: { course_id: true } } }
    });
    const courseIds = [...new Set(bookings.map((b) => b.courseSlot.course_id))];
    return prisma.courseMaterial.findMany({
      where: { course_id: { in: courseIds } },
      include: { course: true },
      orderBy: { createdAt: "desc" }
    });
  }
  return prisma.courseMaterial.findMany({
    include: { course: true },
    orderBy: { createdAt: "desc" }
  });
};
var deleteMaterial = async (id, userId) => {
  const tutorProfile = await getTutorProfileOrThrow2(userId);
  const material = await prisma.courseMaterial.findUnique({ where: { id } });
  if (!material) throw new Error("Material not found");
  if (material.tutor_id !== tutorProfile.id) {
    throw new Error("Unauthorized! Not your material");
  }
  return prisma.courseMaterial.delete({ where: { id } });
};
var MaterialService = {
  createMaterial,
  getMaterials,
  deleteMaterial
};

// src/modules/material/materialSummary.service.ts
import { z as z9 } from "zod/v4";

// src/lib/anthropic.ts
import Anthropic from "@anthropic-ai/sdk";
var MODEL = "claude-opus-5";
var client = null;
var anthropic = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI features are not configured (missing ANTHROPIC_API_KEY)"
    );
  }
  if (!client) client = new Anthropic({ apiKey });
  return client;
};
var aiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

// src/modules/material/materialSummary.service.ts
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

// src/lib/materialAccess.ts
var MAX_MATERIAL_BYTES = 10 * 1024 * 1024;
var isPdfMaterial = (fileUrl) => /\.pdf($|\?)/i.test(fileUrl);
var resolveMaterialAccess = async (materialId, userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, status: true }
  });
  if (!user || user.status !== "ACTIVE") throw new Error("Unauthorized!");
  const material = await prisma.courseMaterial.findUnique({
    where: { id: materialId },
    include: { course: { select: { id: true, name: true, tutor_id: true } } }
  });
  if (!material) throw new Error("Material not found");
  if (user.role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userId },
      select: { id: true }
    });
    if (!tutorProfile || tutorProfile.id !== material.course.tutor_id) {
      throw new Error("Forbidden! This is not your material");
    }
    return { material, role: user.role, isOwner: true };
  }
  if (user.role === "STUDENT") {
    const booking = await prisma.booking.findFirst({
      where: {
        student_id: userId,
        courseSlot: { course_id: material.course.id },
        booking_status: { not: "CANCELLED" },
        payment_status: "PAID"
      },
      select: { id: true }
    });
    if (!booking) {
      throw new Error("You need a paid booking in this course to use its materials");
    }
    return { material, role: user.role, isOwner: false };
  }
  if (user.role === "ADMIN") {
    return { material, role: user.role, isOwner: false };
  }
  throw new Error("Unauthorized!");
};
var pdfSourceBlock = async (fileUrl, title) => {
  if (!isPdfMaterial(fileUrl)) {
    throw new Error("Only PDF materials can be summarised or turned into a quiz");
  }
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error("Could not download the material file");
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_MATERIAL_BYTES) {
    throw new Error(
      `This PDF is too large (limit ${MAX_MATERIAL_BYTES / 1024 / 1024}MB)`
    );
  }
  return {
    type: "document",
    source: {
      type: "base64",
      media_type: "application/pdf",
      data: buffer.toString("base64")
    },
    title
  };
};

// src/modules/material/materialSummary.service.ts
var REGENERATE_COOLDOWN_MS = 5 * 60 * 1e3;
var SummarySchema = z9.object({
  overview: z9.string().describe("Three to five sentences on what the material covers and why it matters."),
  key_points: z9.array(z9.string()).describe("The main points a student should take away, one sentence each."),
  key_terms: z9.array(z9.object({ term: z9.string(), meaning: z9.string() })).describe("Important terms defined in the material, with a one-line meaning each.")
});
var SYSTEM = `You summarise a tutor's course material for the students taking that course.

Rules:
- Use only what is in the supplied material. Do not add facts, examples or claims from outside it.
- Write for a student revising: plain language, no filler, no praise of the material.
- key_points: between 4 and 8, in the order the material presents them.
- key_terms: only terms the material itself introduces or defines, at most 10. Return an empty list if there are none.
- If part of the material is unreadable (for example a scanned page), summarise what is readable and do not guess at the rest.`;
var getOrCreateSummary = async (materialId, userId, { regenerate = false } = {}) => {
  const { material, isOwner } = await resolveMaterialAccess(materialId, userId);
  if (regenerate && !isOwner) {
    throw new Error("Only the course's tutor can regenerate a summary");
  }
  if (material.summary && !regenerate) {
    return { summary: material.summary, summary_at: material.summary_at, cached: true };
  }
  if (regenerate && material.summary_at && Date.now() - material.summary_at.getTime() < REGENERATE_COOLDOWN_MS) {
    throw new Error("This summary was just generated. Try again in a few minutes.");
  }
  if (!aiConfigured()) {
    throw new Error("AI features are not configured (missing ANTHROPIC_API_KEY)");
  }
  const sourceBlock = await pdfSourceBlock(material.file_url, material.title);
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 4e3,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          sourceBlock,
          {
            type: "text",
            text: `Summarise this material ("${material.title}", from the course "${material.course.name}").`
          }
        ]
      }
    ],
    output_config: { format: zodOutputFormat(SummarySchema) }
  });
  const parsed = response.parsed_output;
  if (!parsed || !parsed.overview) {
    throw new Error("Could not summarise this material");
  }
  const updated = await prisma.courseMaterial.update({
    where: { id: material.id },
    data: { summary: parsed, summary_at: /* @__PURE__ */ new Date() },
    select: { summary: true, summary_at: true }
  });
  return { summary: updated.summary, summary_at: updated.summary_at, cached: false };
};
var MaterialSummaryService = { getOrCreateSummary };

// src/modules/material/material.controller.ts
var createMaterial2 = async (req, res, next) => {
  try {
    const result = await MaterialService.createMaterial(req.body, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Material uploaded successfully",
      material: result
    });
  } catch (e) {
    next(e);
  }
};
var getMaterials2 = async (req, res, next) => {
  try {
    const result = await MaterialService.getMaterials(req.user?.id);
    res.status(200).json({
      status: "success",
      message: "Materials retrieved successfully",
      materials: result
    });
  } catch (e) {
    next(e);
  }
};
var deleteMaterial2 = async (req, res, next) => {
  try {
    await MaterialService.deleteMaterial(req.params?.id, req.user?.id);
    res.status(200).json({
      status: "success",
      message: "Material deleted successfully"
    });
  } catch (e) {
    next(e);
  }
};
var summarise = async (req, res, next) => {
  try {
    const result = await MaterialSummaryService.getOrCreateSummary(
      req.params?.id,
      req.user?.id,
      { regenerate: req.body?.regenerate === true }
    );
    res.status(200).json({
      status: "success",
      message: result.cached ? "Summary retrieved" : "Summary generated",
      ...result
    });
  } catch (e) {
    next(e);
  }
};
var MaterialController = {
  createMaterial: createMaterial2,
  getMaterials: getMaterials2,
  deleteMaterial: deleteMaterial2,
  summarise
};

// src/modules/material/material.validation.ts
import { z as z10 } from "zod";
var createMaterialSchema = z10.object({
  body: z10.object({
    title: z10.string().min(1, "Title is required"),
    file_url: z10.string().min(1, "A file is required"),
    course_id: z10.string().min(1, "A course must be selected")
  })
});

// src/modules/material/material.router.ts
var router10 = express10.Router();
router10.post("/", auth_default("TUTOR" /* tutor */), validateRequest(createMaterialSchema), MaterialController.createMaterial);
router10.get(
  "/",
  auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */),
  MaterialController.getMaterials
);
router10.post(
  "/:id/summary",
  auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */),
  MaterialController.summarise
);
router10.delete("/:id", auth_default("TUTOR" /* tutor */), MaterialController.deleteMaterial);
var materialRouter = router10;

// src/modules/announcement/announcement.router.ts
import express11 from "express";

// src/modules/announcement/announcement.service.ts
var getTutorProfileOrThrow3 = async (userId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userId }
  });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  return tutorProfile;
};
var createAnnouncement = async (payload, userId) => {
  const tutorProfile = await getTutorProfileOrThrow3(userId);
  if (!payload.message?.trim()) throw new Error("A message is required");
  const course = await prisma.course.findUnique({
    where: { id: payload.course_id }
  });
  if (!course || course.tutor_id !== tutorProfile.id) {
    throw new Error("You can only post announcements to your own courses");
  }
  const created = await prisma.announcement.create({
    data: {
      message: payload.message.trim(),
      course_id: payload.course_id,
      tutor_id: tutorProfile.id
    },
    include: { course: true }
  });
  const bookings = await prisma.booking.findMany({
    where: {
      courseSlot: { course_id: payload.course_id },
      booking_status: { not: "CANCELLED" }
    },
    select: { student_id: true }
  });
  await notify(
    bookings.map((b) => b.student_id),
    `New announcement in ${created.course?.name ?? "your course"}`,
    "/dashboard/announcements"
  );
  return created;
};
var getAnnouncements = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");
  if (user.role === "TUTOR") {
    const tutorProfile = await getTutorProfileOrThrow3(userId);
    return prisma.announcement.findMany({
      where: { tutor_id: tutorProfile.id },
      include: { course: true },
      orderBy: { createdAt: "desc" }
    });
  }
  if (user.role === "STUDENT") {
    const bookings = await prisma.booking.findMany({
      where: { student_id: userId },
      include: { courseSlot: { select: { course_id: true } } }
    });
    const courseIds = [...new Set(bookings.map((b) => b.courseSlot.course_id))];
    return prisma.announcement.findMany({
      where: { course_id: { in: courseIds } },
      include: { course: true },
      orderBy: { createdAt: "desc" }
    });
  }
  return prisma.announcement.findMany({
    include: { course: true },
    orderBy: { createdAt: "desc" }
  });
};
var deleteAnnouncement = async (id, userId) => {
  const tutorProfile = await getTutorProfileOrThrow3(userId);
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) throw new Error("Announcement not found");
  if (announcement.tutor_id !== tutorProfile.id) {
    throw new Error("Unauthorized! Not your announcement");
  }
  return prisma.announcement.delete({ where: { id } });
};
var AnnouncementService = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement
};

// src/modules/announcement/announcement.controller.ts
var createAnnouncement2 = async (req, res, next) => {
  try {
    const result = await AnnouncementService.createAnnouncement(req.body, req.user?.id);
    res.status(201).json({
      status: "success",
      message: "Announcement posted successfully",
      announcement: result
    });
  } catch (e) {
    next(e);
  }
};
var getAnnouncements2 = async (req, res, next) => {
  try {
    const result = await AnnouncementService.getAnnouncements(req.user?.id);
    res.status(200).json({
      status: "success",
      message: "Announcements retrieved successfully",
      announcements: result
    });
  } catch (e) {
    next(e);
  }
};
var deleteAnnouncement2 = async (req, res, next) => {
  try {
    await AnnouncementService.deleteAnnouncement(req.params?.id, req.user?.id);
    res.status(200).json({
      status: "success",
      message: "Announcement deleted successfully"
    });
  } catch (e) {
    next(e);
  }
};
var AnnouncementController = {
  createAnnouncement: createAnnouncement2,
  getAnnouncements: getAnnouncements2,
  deleteAnnouncement: deleteAnnouncement2
};

// src/modules/announcement/announcement.validation.ts
import { z as z11 } from "zod";
var createAnnouncementSchema = z11.object({
  body: z11.object({
    message: z11.string().min(1, "A message is required"),
    course_id: z11.string().min(1, "A course must be selected")
  })
});

// src/modules/announcement/announcement.router.ts
var router11 = express11.Router();
router11.post("/", auth_default("TUTOR" /* tutor */), validateRequest(createAnnouncementSchema), AnnouncementController.createAnnouncement);
router11.get(
  "/",
  auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */),
  AnnouncementController.getAnnouncements
);
router11.delete("/:id", auth_default("TUTOR" /* tutor */), AnnouncementController.deleteAnnouncement);
var announcementRouter = router11;

// src/modules/reminder/reminder.router.ts
import express12 from "express";

// src/lib/email.ts
import nodemailer2 from "nodemailer";
var transporter = nodemailer2.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
var sendEmail = async ({
  to,
  subject,
  html,
  text
}) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"TutorSpace" <noreply@tutorspace.com>',
    to,
    subject,
    html,
    text
  });
};

// src/modules/reminder/reminder.service.ts
var fmt = (d) => new Date(d).toLocaleString();
var runReminders = async () => {
  const now = /* @__PURE__ */ new Date();
  const in30 = new Date(now.getTime() + 30 * 60 * 1e3);
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1e3);
  let sessionReminders = 0;
  let assignmentReminders = 0;
  const bookings = await prisma.booking.findMany({
    where: {
      reminder_sent: false,
      booking_status: { not: "CANCELLED" },
      courseSlot: { start_time: { gt: now, lte: in30 } }
    },
    include: { student: { select: contactUserSelect }, courseSlot: true }
  });
  for (const b of bookings) {
    if (b.student?.email) {
      await sendEmail({
        to: b.student.email,
        subject: `Reminder: "${b.courseSlot.name}" starts soon`,
        text: `Hi ${b.student.name}, your session "${b.courseSlot.name}" starts at ${fmt(
          b.courseSlot.start_time
        )}.`,
        html: `<div style="font-family: sans-serif;">
          <h2>TutorSpace \u{1F393}</h2>
          <p>Hi ${b.student.name},</p>
          <p>Your session <b>${b.courseSlot.name}</b> starts at <b>${fmt(
          b.courseSlot.start_time
        )}</b> \u2014 in about 30 minutes.</p>
        </div>`
      });
    }
    await prisma.booking.update({
      where: { id: b.id },
      data: { reminder_sent: true }
    });
    sessionReminders++;
  }
  const assignments = await prisma.assignment.findMany({
    where: { reminder_sent: false, due_date: { gt: now, lte: in24h } },
    include: { course: true }
  });
  for (const a of assignments) {
    const courseBookings = await prisma.booking.findMany({
      where: {
        courseSlot: { course_id: a.course_id },
        booking_status: { not: "CANCELLED" }
      },
      select: {
        student_id: true,
        student: { select: { name: true, email: true } }
      }
    });
    const submissions = await prisma.submission.findMany({
      where: { assignment_id: a.id },
      select: { student_id: true }
    });
    const submitted = new Set(submissions.map((s) => s.student_id));
    const emailed = /* @__PURE__ */ new Set();
    for (const cb of courseBookings) {
      if (submitted.has(cb.student_id) || emailed.has(cb.student_id)) continue;
      emailed.add(cb.student_id);
      if (cb.student?.email) {
        await sendEmail({
          to: cb.student.email,
          subject: `Reminder: "${a.title}" is due soon`,
          text: `Hi ${cb.student.name}, your assignment "${a.title}" is due ${a.due_date ? fmt(a.due_date) : "soon"}.`,
          html: `<div style="font-family: sans-serif;">
            <h2>TutorSpace \u{1F393}</h2>
            <p>Hi ${cb.student.name},</p>
            <p>Your assignment <b>${a.title}</b> for <b>${a.course?.name ?? "your course"}</b> is due <b>${a.due_date ? fmt(a.due_date) : "soon"}</b>.</p>
            <p>You haven't submitted it yet \u2014 don't forget!</p>
          </div>`
        });
      }
    }
    await prisma.assignment.update({
      where: { id: a.id },
      data: { reminder_sent: true }
    });
    assignmentReminders++;
  }
  return { sessionReminders, assignmentReminders };
};
var ReminderService = { runReminders };

// src/modules/reminder/reminder.controller.ts
var runReminders2 = async (req, res, next) => {
  try {
    const secret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const result = await ReminderService.runReminders();
    res.status(200).json({
      status: "success",
      message: "Reminders processed",
      ...result
    });
  } catch (e) {
    next(e);
  }
};
var ReminderController = { runReminders: runReminders2 };

// src/modules/reminder/reminder.router.ts
var router12 = express12.Router();
router12.get("/reminders", ReminderController.runReminders);
router12.post("/reminders", ReminderController.runReminders);
var reminderRouter = router12;

// src/modules/notification/notification.router.ts
import express13 from "express";

// src/modules/notification/notification.service.ts
var getMyNotifications = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { createdAt: "desc" },
    take: 20
  });
  const unread = await prisma.notification.count({
    where: { user_id: userId, read: false }
  });
  return { notifications, unread };
};
var markAllRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { user_id: userId, read: false },
    data: { read: true }
  });
  return { success: true };
};
var NotificationService = { getMyNotifications, markAllRead };

// src/modules/notification/notification.controller.ts
var getMyNotifications2 = async (req, res, next) => {
  try {
    const result = await NotificationService.getMyNotifications(req.user?.id);
    res.status(200).json({ status: "success", ...result });
  } catch (e) {
    next(e);
  }
};
var markAllRead2 = async (req, res, next) => {
  try {
    await NotificationService.markAllRead(req.user?.id);
    res.status(200).json({ status: "success", message: "Marked all as read" });
  } catch (e) {
    next(e);
  }
};
var NotificationController = { getMyNotifications: getMyNotifications2, markAllRead: markAllRead2 };

// src/modules/notification/notification.router.ts
var router13 = express13.Router();
router13.get(
  "/",
  auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */),
  NotificationController.getMyNotifications
);
router13.patch(
  "/read",
  auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */),
  NotificationController.markAllRead
);
var notificationRouter = router13;

// src/modules/search/search.router.ts
import express14 from "express";

// src/modules/search/search.service.ts
var searchAll = async (q) => {
  const query = (q ?? "").trim();
  if (!query) return { tutors: [], courses: [] };
  const [tutors, courses] = await Promise.all([
    prisma.tutorProfile.findMany({
      where: {
        is_verified: true,
        OR: [
          { display_name: { contains: query, mode: "insensitive" } },
          { qualification: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } }
        ]
      },
      take: 10
    }),
    prisma.course.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } }
        ]
      },
      include: { tutor: { select: { id: true, display_name: true } } },
      take: 10
    })
  ]);
  return { tutors, courses };
};
var SearchService = { searchAll };

// src/modules/search/search.controller.ts
var search = async (req, res, next) => {
  try {
    const result = await SearchService.searchAll(req.query.q ?? "");
    res.status(200).json({ status: "success", ...result });
  } catch (e) {
    next(e);
  }
};
var SearchController = { search };

// src/modules/search/search.router.ts
var router14 = express14.Router();
router14.get("/", SearchController.search);
var searchRouter = router14;

// src/modules/whiteboard/whiteboard.router.ts
import express15 from "express";

// src/modules/whiteboard/whiteboard.service.ts
var getAccess = async (slotId, userId) => {
  const access = await resolveSessionAccess(slotId, userId);
  return {
    roomId: whiteboardRoomId(slotId),
    title: access.slot.name,
    isOwner: access.isOwner,
    courseId: access.slot.course_id
  };
};
var saveSnapshot = async (slotId, userId, payload) => {
  const access = await resolveSessionAccess(slotId, userId);
  if (!access.isOwner) {
    throw new Error("Forbidden! Only the tutor can save the whiteboard");
  }
  const { file_url, title } = pick(
    payload,
    ["file_url", "title"]
  );
  if (!file_url) throw new Error("A file is required");
  const course = await prisma.course.findUnique({
    where: { id: access.slot.course_id },
    select: { id: true, tutor_id: true }
  });
  if (!course) throw new Error("Course not found");
  return prisma.courseMaterial.create({
    data: {
      title: title?.trim() || `Whiteboard \u2014 ${access.slot.name}`,
      file_url,
      course_id: course.id,
      tutor_id: course.tutor_id
    },
    include: { course: true }
  });
};
var WhiteboardService = { getAccess, saveSnapshot };

// src/modules/whiteboard/whiteboard.controller.ts
var getAccess2 = async (req, res, next) => {
  try {
    const result = await WhiteboardService.getAccess(
      req.params?.slotId,
      req.user?.id
    );
    res.status(200).json({
      status: "success",
      message: "Whiteboard ready",
      ...result
    });
  } catch (e) {
    next(e);
  }
};
var saveSnapshot2 = async (req, res, next) => {
  try {
    const result = await WhiteboardService.saveSnapshot(
      req.params?.slotId,
      req.user?.id,
      req.body
    );
    res.status(201).json({
      status: "success",
      message: "Whiteboard saved to course materials",
      material: result
    });
  } catch (e) {
    next(e);
  }
};
var WhiteboardController = { getAccess: getAccess2, saveSnapshot: saveSnapshot2 };

// src/modules/whiteboard/whiteboard.validation.ts
import { z as z12 } from "zod";
var saveSnapshotSchema = z12.object({
  body: z12.object({
    file_url: z12.string().min(1, "A file is required"),
    title: z12.string().optional()
  })
});

// src/modules/whiteboard/whiteboard.router.ts
var router15 = express15.Router();
router15.get(
  "/:slotId/access",
  auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */),
  WhiteboardController.getAccess
);
router15.post(
  "/:slotId/snapshot",
  auth_default("TUTOR" /* tutor */, "ADMIN" /* admin */),
  validateRequest(saveSnapshotSchema),
  WhiteboardController.saveSnapshot
);
var whiteboardRouter = router15;

// src/modules/practice/practice.router.ts
import express16 from "express";

// src/modules/practice/practice.service.ts
import { z as z13 } from "zod/v4";
import { zodOutputFormat as zodOutputFormat2 } from "@anthropic-ai/sdk/helpers/zod";
var HOURLY_GENERATION_LIMIT = 10;
var QUESTION_COUNT = 8;
var QuestionSchema = z13.object({
  type: z13.enum(["mcq", "short_answer"]),
  question: z13.string(),
  /** Four choices for an mcq; empty for a short answer. */
  options: z13.array(z13.string()),
  answer: z13.string(),
  explanation: z13.string()
});
var PracticeSetSchema = z13.object({
  title: z13.string().describe("A short title naming the topic covered."),
  questions: z13.array(QuestionSchema)
});
var SYSTEM2 = `You write practice quiz questions from a tutor's course material, for students to revise with.

Rules:
- Every question must be answerable from the supplied material alone. Do not draw on outside knowledge.
- Cover different parts of the material rather than clustering on one section.
- Mix recall and application. Questions that only ask for a definition make weak practice.
- Prefer "mcq". For "mcq", give exactly four options, with exactly one correct, and make "answer" the exact text of the correct option. Wrong options must be plausible, not filler.
- For "short_answer", leave options empty and make the expected answer specific enough to mark.
- The explanation says why the answer is right, in one or two sentences, and points to where in the material it comes from.
- If the material is too short or too thin to support ${QUESTION_COUNT} good questions, return fewer rather than padding.`;
var setInclude = {
  course: { select: { name: true } },
  material: { select: { title: true } }
};
var generateFromMaterial = async (materialId, userId) => {
  const { material, role } = await resolveMaterialAccess(materialId, userId);
  if (role === "ADMIN") throw new Error("Only students and tutors can generate quizzes");
  if (!aiConfigured()) {
    throw new Error("AI features are not configured (missing ANTHROPIC_API_KEY)");
  }
  const isStudent = role === "STUDENT";
  const since = new Date(Date.now() - 60 * 60 * 1e3);
  const recent = await prisma.practiceSet.count({
    where: isStudent ? { student_id: userId, createdAt: { gt: since } } : { tutor_id: material.course.tutor_id, student_id: null, createdAt: { gt: since } }
  });
  if (recent >= HOURLY_GENERATION_LIMIT) {
    throw new Error(
      `You have reached the limit of ${HOURLY_GENERATION_LIMIT} quizzes per hour. Try again later.`
    );
  }
  const sourceBlock = await pdfSourceBlock(material.file_url, material.title);
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 8e3,
    system: SYSTEM2,
    messages: [
      {
        role: "user",
        content: [
          sourceBlock,
          {
            type: "text",
            text: `Write up to ${QUESTION_COUNT} practice questions from this material ("${material.title}", from the course "${material.course.name}").`
          }
        ]
      }
    ],
    output_config: { format: zodOutputFormat2(PracticeSetSchema) }
  });
  const parsed = response.parsed_output;
  if (!parsed || !parsed.questions.length) {
    throw new Error("Could not generate questions from this material");
  }
  return prisma.practiceSet.create({
    data: {
      title: parsed.title || `Practice \u2014 ${material.title}`,
      questions: parsed.questions,
      course_id: material.course.id,
      material_id: material.id,
      tutor_id: material.course.tutor_id,
      student_id: isStudent ? userId : null,
      is_published: false
    },
    include: setInclude
  });
};
var getPracticeSets = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");
  if (user.role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userId }
    });
    if (!tutorProfile) throw new Error("Tutor profile not found");
    return prisma.practiceSet.findMany({
      where: { tutor_id: tutorProfile.id, student_id: null },
      include: setInclude,
      orderBy: { createdAt: "desc" }
    });
  }
  if (user.role === "STUDENT") {
    const bookings = await prisma.booking.findMany({
      where: { student_id: userId, booking_status: { not: "CANCELLED" } },
      include: { courseSlot: { select: { course_id: true } } }
    });
    const courseIds = [...new Set(bookings.map((b) => b.courseSlot.course_id))];
    return prisma.practiceSet.findMany({
      where: {
        OR: [
          { student_id: userId },
          { student_id: null, course_id: { in: courseIds }, is_published: true }
        ]
      },
      include: setInclude,
      orderBy: { createdAt: "desc" }
    });
  }
  return prisma.practiceSet.findMany({ include: setInclude, orderBy: { createdAt: "desc" } });
};
var tutorSetOrThrow = async (id, userId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({ where: { user_id: userId } });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  const set = await prisma.practiceSet.findUnique({ where: { id } });
  if (!set) throw new Error("Practice set not found");
  if (set.tutor_id !== tutorProfile.id || set.student_id !== null) {
    throw new Error("Forbidden! Not your practice set");
  }
  return set;
};
var updatePracticeSet = async (id, userId, payload) => {
  await tutorSetOrThrow(id, userId);
  const data = pick(
    payload,
    ["title", "questions", "is_published"]
  );
  if (data.questions !== void 0 && !Array.isArray(data.questions)) {
    throw new Error("Questions must be a list");
  }
  return prisma.practiceSet.update({
    where: { id },
    data,
    include: setInclude
  });
};
var deletePracticeSet = async (id, userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "STUDENT") {
    const set = await prisma.practiceSet.findUnique({ where: { id } });
    if (!set) throw new Error("Practice set not found");
    if (set.student_id !== userId) throw new Error("Forbidden! Not your quiz");
  } else {
    await tutorSetOrThrow(id, userId);
  }
  return prisma.practiceSet.delete({ where: { id } });
};
var PracticeService = {
  generateFromMaterial,
  getPracticeSets,
  updatePracticeSet,
  deletePracticeSet
};

// src/modules/practice/practice.controller.ts
var generate = async (req, res, next) => {
  try {
    const result = await PracticeService.generateFromMaterial(
      req.params?.materialId,
      req.user?.id
    );
    res.status(201).json({
      status: "success",
      message: result.student_id ? "Your practice quiz is ready." : "Draft practice questions generated. Review them before publishing.",
      practiceSet: result
    });
  } catch (e) {
    next(e);
  }
};
var getPracticeSets2 = async (req, res, next) => {
  try {
    const result = await PracticeService.getPracticeSets(req.user?.id);
    res.status(200).json({
      status: "success",
      message: "Practice sets retrieved successfully",
      practiceSets: result
    });
  } catch (e) {
    next(e);
  }
};
var updatePracticeSet2 = async (req, res, next) => {
  try {
    const result = await PracticeService.updatePracticeSet(
      req.params?.id,
      req.user?.id,
      req.body
    );
    res.status(200).json({
      status: "success",
      message: "Practice set updated successfully",
      practiceSet: result
    });
  } catch (e) {
    next(e);
  }
};
var deletePracticeSet2 = async (req, res, next) => {
  try {
    await PracticeService.deletePracticeSet(
      req.params?.id,
      req.user?.id
    );
    res.status(200).json({
      status: "success",
      message: "Practice set deleted successfully"
    });
  } catch (e) {
    next(e);
  }
};
var PracticeController = {
  generate,
  getPracticeSets: getPracticeSets2,
  updatePracticeSet: updatePracticeSet2,
  deletePracticeSet: deletePracticeSet2
};

// src/modules/practice/practice.validation.ts
import { z as z14 } from "zod";
var questionSchema = z14.object({
  type: z14.enum(["mcq", "short_answer"]),
  question: z14.string().min(1, "A question is required"),
  options: z14.array(z14.string()),
  answer: z14.string().min(1, "An answer is required"),
  explanation: z14.string()
});
var updatePracticeSetSchema = z14.object({
  body: z14.object({
    title: z14.string().min(1).optional(),
    questions: z14.array(questionSchema).optional(),
    is_published: z14.boolean().optional()
  })
});

// src/modules/practice/practice.router.ts
var router16 = express16.Router();
router16.post(
  "/generate/:materialId",
  auth_default("STUDENT" /* student */, "TUTOR" /* tutor */),
  PracticeController.generate
);
router16.get(
  "/",
  auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */),
  PracticeController.getPracticeSets
);
router16.patch(
  "/:id",
  auth_default("TUTOR" /* tutor */),
  validateRequest(updatePracticeSetSchema),
  PracticeController.updatePracticeSet
);
router16.delete(
  "/:id",
  auth_default("STUDENT" /* student */, "TUTOR" /* tutor */),
  PracticeController.deletePracticeSet
);
var practiceRouter = router16;

// src/app.ts
var app = express17();
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "http://localhost:3000"
  ],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"]
}));
app.all("/api/v1/auth/*path", toNodeHandler(auth));
app.post("/api/v1/payments/webhook", express17.raw({ type: "application/json" }), PaymentController.handleWebhook);
app.use(express17.json());
app.use(cookieParser());
app.use("/api/v1/tutors", tutorRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/slots", courseSlotRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/assignments", assignmentRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/whiteboard", whiteboardRouter);
app.use("/api/v1/materials", materialRouter);
app.use("/api/v1/practice", practiceRouter);
app.use("/api/v1/announcements", announcementRouter);
app.use("/api/v1/cron", reminderRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/search", searchRouter);
app.get("/", (req, res) => {
  res.send("Server is running successfully");
});
app.use(notFound);
app.use(errorHandler);
var app_default = app;

// src/server.ts
var PORT = process.env.PORT || 5e3;
async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to database successfully.");
    app_default.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("An error occurred:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
if (!process.env.VERCEL) {
  main();
}
var server_default = app_default;
export {
  server_default as default
};
