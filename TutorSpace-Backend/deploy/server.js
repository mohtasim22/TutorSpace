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
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated/prisma"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id            String     @id @default(uuid())\n  role          Role       @default(STUDENT)\n  name          String\n  email         String     @unique\n  password      String? // Needed by Better Auth\n  emailVerified Boolean    @default(false)\n  image         String?\n  status        UserStatus @default(ACTIVE)\n  createdAt     DateTime   @default(now())\n  updatedAt     DateTime   @updatedAt\n\n  sessions Session[]\n  accounts Account[]\n\n  tutorProfile  TutorProfile?\n  bookings      Booking[]\n  reviews       Review[]\n  submissions   Submission[]\n  notifications Notification[]\n\n  @@index([status])\n  @@map("users")\n}\n\nmodel Session {\n  id        String   @id @default(uuid())\n  expiresAt DateTime\n  token     String   @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id @default(uuid())\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@map("account")\n}\n\nmodel Verification {\n  id         String    @id @default(uuid())\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime? @default(now())\n  updatedAt  DateTime? @updatedAt\n\n  @@map("verification")\n}\n\nenum Role {\n  STUDENT\n  TUTOR\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  BANNED\n}\n\nmodel TutorProfile {\n  id            String  @id @default(uuid())\n  display_name  String\n  bio           String\n  qualification String\n  hourly_rate   Float   @default(0)\n  rating_avg    Float   @default(0)\n  total_reviews Int     @default(0)\n  is_verified   Boolean @default(false)\n\n  // Cached AI summary of this tutor\'s reviews. Regenerated off the request\n  // path by the cron pass, never on a page view. `review_summary_count`\n  // records how many reviews the cached text was built from, so we can tell\n  // a stale summary from a current one without re-reading the reviews.\n  review_summary       String?   @db.Text\n  review_summary_count Int       @default(0)\n  review_summary_at    DateTime?\n  createdAt            DateTime  @default(now())\n  updatedAt            DateTime  @updatedAt\n  user_id              String    @unique\n\n  user         User          @relation(fields: [user_id], references: [id], onDelete: Cascade)\n  courseSlots  CourseSlot[]\n  bookings     Booking[]\n  reviews      Review[]\n  courses      Course[]\n  assignments  Assignment[]\n  practiceSets PracticeSet[]\n\n  @@map("tutorprofiles")\n}\n\nmodel Course {\n  id          String       @id @default(uuid())\n  name        String\n  tutor_id    String\n  description String       @db.Text\n  status      CourseStatus @default(ACTIVE)\n  createdAt   DateTime     @default(now())\n  updatedAt   DateTime     @updatedAt\n\n  tutor         TutorProfile     @relation(fields: [tutor_id], references: [id], onDelete: Cascade)\n  courseSlots   CourseSlot[]\n  assignments   Assignment[]\n  materials     CourseMaterial[]\n  announcements Announcement[]\n  practiceSets  PracticeSet[]\n\n  @@map("courses")\n}\n\nenum CourseStatus {\n  ACTIVE\n  INACTIVE\n}\n\nenum SessionType {\n  ONE_ON_ONE\n  GROUP\n}\n\nmodel CourseSlot {\n  id           String      @id @default(uuid())\n  name         String\n  description  String?     @db.Text\n  start_time   DateTime\n  end_time     DateTime\n  date         DateTime\n  meeting_link String?\n  session_type SessionType @default(ONE_ON_ONE)\n  capacity     Int         @default(1)\n  tutor_id     String\n  course_id    String\n  createdAt    DateTime    @default(now())\n  updatedAt    DateTime    @updatedAt\n\n  tutor    TutorProfile @relation(fields: [tutor_id], references: [id], onDelete: Cascade)\n  course   Course       @relation(fields: [course_id], references: [id], onDelete: Cascade)\n  bookings Booking[]\n\n  @@index([tutor_id])\n  @@map("course_slots")\n}\n\nmodel Booking {\n  id             String        @id @default(uuid())\n  student_id     String\n  tutor_id       String\n  course_slot_id String\n  booking_status BookingStatus @default(PENDING)\n  payment_status PaymentStatus @default(UNPAID)\n  /// The Stripe Checkout Session id (cs_...). Note this is NOT a PaymentIntent,\n  /// so a refund resolves the intent from this session rather than using it\n  /// directly.\n  transaction_id String?       @unique\n\n  /// Stripe refund id, set when a paid booking is cancelled with a refund.\n  /// Its presence is the record that money actually went back.\n  refund_id    String?\n  cancelled_at DateTime?\n\n  total_price   Float    @default(0)\n  reminder_sent Boolean  @default(false)\n  createdAt     DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n\n  student    User         @relation(fields: [student_id], references: [id], onDelete: Cascade)\n  tutor      TutorProfile @relation(fields: [tutor_id], references: [id], onDelete: Cascade)\n  courseSlot CourseSlot   @relation(fields: [course_slot_id], references: [id], onDelete: Cascade)\n  review     Review?\n\n  @@index([student_id])\n  @@index([tutor_id])\n  @@map("bookings")\n}\n\nenum PaymentStatus {\n  UNPAID\n  PAID\n  FAILED\n  REFUNDED\n}\n\nenum BookingStatus {\n  PENDING\n  CONFIRMED\n  CANCELLED\n  COMPLETED\n}\n\nmodel Review {\n  id         String       @id @default(uuid())\n  booking_id String       @unique\n  tutor_id   String\n  student_id String\n  rating     Int // 1-5 stars\n  comment    String?      @db.Text\n  status     ReviewStatus @default(APPROVED)\n  createdAt  DateTime     @default(now())\n  updatedAt  DateTime     @updatedAt\n\n  booking Booking      @relation(fields: [booking_id], references: [id], onDelete: Cascade)\n  tutor   TutorProfile @relation(fields: [tutor_id], references: [id], onDelete: Cascade)\n  student User         @relation(fields: [student_id], references: [id], onDelete: Cascade)\n\n  @@map("reviews")\n}\n\nenum ReviewStatus {\n  APPROVED\n  REJECTED\n}\n\nmodel Assignment {\n  id            String    @id @default(uuid())\n  title         String\n  description   String    @db.Text\n  due_date      DateTime?\n  reminder_sent Boolean   @default(false)\n  course_id     String\n  tutor_id      String\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n\n  course      Course       @relation(fields: [course_id], references: [id], onDelete: Cascade)\n  tutor       TutorProfile @relation(fields: [tutor_id], references: [id], onDelete: Cascade)\n  submissions Submission[]\n\n  @@index([course_id])\n  @@index([tutor_id])\n  @@map("assignments")\n}\n\nmodel Submission {\n  id            String           @id @default(uuid())\n  assignment_id String\n  student_id    String\n  file_url      String\n  note          String?          @db.Text\n  grade         Int?\n  feedback      String?          @db.Text\n  status        SubmissionStatus @default(SUBMITTED)\n  submittedAt   DateTime         @default(now())\n  updatedAt     DateTime         @updatedAt\n\n  assignment Assignment @relation(fields: [assignment_id], references: [id], onDelete: Cascade)\n  student    User       @relation(fields: [student_id], references: [id], onDelete: Cascade)\n\n  @@unique([assignment_id, student_id])\n  @@index([student_id])\n  @@map("submissions")\n}\n\nenum SubmissionStatus {\n  SUBMITTED\n  GRADED\n}\n\nmodel CourseMaterial {\n  id        String   @id @default(uuid())\n  title     String\n  file_url  String\n  course_id String\n  tutor_id  String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  course       Course        @relation(fields: [course_id], references: [id], onDelete: Cascade)\n  practiceSets PracticeSet[]\n\n  @@index([course_id])\n  @@map("course_materials")\n}\n\nmodel Announcement {\n  id        String   @id @default(uuid())\n  message   String   @db.Text\n  course_id String\n  tutor_id  String\n  createdAt DateTime @default(now())\n\n  course Course @relation(fields: [course_id], references: [id], onDelete: Cascade)\n\n  @@index([course_id])\n  @@map("announcements")\n}\n\nmodel Notification {\n  id        String   @id @default(uuid())\n  user_id   String\n  message   String\n  link      String?\n  read      Boolean  @default(false)\n  createdAt DateTime @default(now())\n\n  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)\n\n  @@index([user_id])\n  @@map("notifications")\n}\n\nmodel PracticeSet {\n  id    String @id @default(uuid())\n  title String\n\n  /// [{ question, options[], answer, explanation }] - generated by the model,\n  /// then editable by the tutor. Stored as JSON because the shape is fixed and\n  /// only ever read as a whole set; normalising it into a questions table would\n  /// buy nothing here.\n  questions Json\n\n  /// Students only ever see published sets. A generated set starts unpublished\n  /// so nothing reaches a student that the tutor has not read and approved.\n  is_published Boolean @default(false)\n\n  course_id   String\n  material_id String?\n  tutor_id    String\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  course   Course          @relation(fields: [course_id], references: [id], onDelete: Cascade)\n  material CourseMaterial? @relation(fields: [material_id], references: [id], onDelete: SetNull)\n  tutor    TutorProfile    @relation(fields: [tutor_id], references: [id], onDelete: Cascade)\n\n  @@index([course_id])\n  @@index([tutor_id])\n  @@map("practice_sets")\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"submissions","kind":"object","type":"Submission","relationName":"SubmissionToUser"},{"name":"notifications","kind":"object","type":"Notification","relationName":"NotificationToUser"}],"dbName":"users"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"display_name","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"qualification","kind":"scalar","type":"String"},{"name":"hourly_rate","kind":"scalar","type":"Float"},{"name":"rating_avg","kind":"scalar","type":"Float"},{"name":"total_reviews","kind":"scalar","type":"Int"},{"name":"is_verified","kind":"scalar","type":"Boolean"},{"name":"review_summary","kind":"scalar","type":"String"},{"name":"review_summary_count","kind":"scalar","type":"Int"},{"name":"review_summary_at","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"courseSlots","kind":"object","type":"CourseSlot","relationName":"CourseSlotToTutorProfile"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTutorProfile"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTutorProfile"},{"name":"courses","kind":"object","type":"Course","relationName":"CourseToTutorProfile"},{"name":"assignments","kind":"object","type":"Assignment","relationName":"AssignmentToTutorProfile"},{"name":"practiceSets","kind":"object","type":"PracticeSet","relationName":"PracticeSetToTutorProfile"}],"dbName":"tutorprofiles"},"Course":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"CourseStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"CourseToTutorProfile"},{"name":"courseSlots","kind":"object","type":"CourseSlot","relationName":"CourseToCourseSlot"},{"name":"assignments","kind":"object","type":"Assignment","relationName":"AssignmentToCourse"},{"name":"materials","kind":"object","type":"CourseMaterial","relationName":"CourseToCourseMaterial"},{"name":"announcements","kind":"object","type":"Announcement","relationName":"AnnouncementToCourse"},{"name":"practiceSets","kind":"object","type":"PracticeSet","relationName":"CourseToPracticeSet"}],"dbName":"courses"},"CourseSlot":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"start_time","kind":"scalar","type":"DateTime"},{"name":"end_time","kind":"scalar","type":"DateTime"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"meeting_link","kind":"scalar","type":"String"},{"name":"session_type","kind":"enum","type":"SessionType"},{"name":"capacity","kind":"scalar","type":"Int"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"CourseSlotToTutorProfile"},{"name":"course","kind":"object","type":"Course","relationName":"CourseToCourseSlot"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToCourseSlot"}],"dbName":"course_slots"},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"student_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"course_slot_id","kind":"scalar","type":"String"},{"name":"booking_status","kind":"enum","type":"BookingStatus"},{"name":"payment_status","kind":"enum","type":"PaymentStatus"},{"name":"transaction_id","kind":"scalar","type":"String"},{"name":"refund_id","kind":"scalar","type":"String"},{"name":"cancelled_at","kind":"scalar","type":"DateTime"},{"name":"total_price","kind":"scalar","type":"Float"},{"name":"reminder_sent","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"User","relationName":"BookingToUser"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"BookingToTutorProfile"},{"name":"courseSlot","kind":"object","type":"CourseSlot","relationName":"BookingToCourseSlot"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"}],"dbName":"bookings"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"booking_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"student_id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ReviewStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"ReviewToTutorProfile"},{"name":"student","kind":"object","type":"User","relationName":"ReviewToUser"}],"dbName":"reviews"},"Assignment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"due_date","kind":"scalar","type":"DateTime"},{"name":"reminder_sent","kind":"scalar","type":"Boolean"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"course","kind":"object","type":"Course","relationName":"AssignmentToCourse"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"AssignmentToTutorProfile"},{"name":"submissions","kind":"object","type":"Submission","relationName":"AssignmentToSubmission"}],"dbName":"assignments"},"Submission":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"assignment_id","kind":"scalar","type":"String"},{"name":"student_id","kind":"scalar","type":"String"},{"name":"file_url","kind":"scalar","type":"String"},{"name":"note","kind":"scalar","type":"String"},{"name":"grade","kind":"scalar","type":"Int"},{"name":"feedback","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"SubmissionStatus"},{"name":"submittedAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"assignment","kind":"object","type":"Assignment","relationName":"AssignmentToSubmission"},{"name":"student","kind":"object","type":"User","relationName":"SubmissionToUser"}],"dbName":"submissions"},"CourseMaterial":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"file_url","kind":"scalar","type":"String"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"course","kind":"object","type":"Course","relationName":"CourseToCourseMaterial"},{"name":"practiceSets","kind":"object","type":"PracticeSet","relationName":"CourseMaterialToPracticeSet"}],"dbName":"course_materials"},"Announcement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"course","kind":"object","type":"Course","relationName":"AnnouncementToCourse"}],"dbName":"announcements"},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"link","kind":"scalar","type":"String"},{"name":"read","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"NotificationToUser"}],"dbName":"notifications"},"PracticeSet":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"questions","kind":"scalar","type":"Json"},{"name":"is_published","kind":"scalar","type":"Boolean"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"material_id","kind":"scalar","type":"String"},{"name":"tutor_id","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"course","kind":"object","type":"Course","relationName":"CourseToPracticeSet"},{"name":"material","kind":"object","type":"CourseMaterial","relationName":"CourseMaterialToPracticeSet"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"PracticeSetToTutorProfile"}],"dbName":"practice_sets"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","tutor","courseSlots","course","assignment","student","submissions","_count","assignments","material","practiceSets","materials","announcements","courseSlot","booking","review","bookings","reviews","courses","tutorProfile","notifications","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","TutorProfile.findUnique","TutorProfile.findUniqueOrThrow","TutorProfile.findFirst","TutorProfile.findFirstOrThrow","TutorProfile.findMany","TutorProfile.createOne","TutorProfile.createMany","TutorProfile.createManyAndReturn","TutorProfile.updateOne","TutorProfile.updateMany","TutorProfile.updateManyAndReturn","TutorProfile.upsertOne","TutorProfile.deleteOne","TutorProfile.deleteMany","_avg","_sum","TutorProfile.groupBy","TutorProfile.aggregate","Course.findUnique","Course.findUniqueOrThrow","Course.findFirst","Course.findFirstOrThrow","Course.findMany","Course.createOne","Course.createMany","Course.createManyAndReturn","Course.updateOne","Course.updateMany","Course.updateManyAndReturn","Course.upsertOne","Course.deleteOne","Course.deleteMany","Course.groupBy","Course.aggregate","CourseSlot.findUnique","CourseSlot.findUniqueOrThrow","CourseSlot.findFirst","CourseSlot.findFirstOrThrow","CourseSlot.findMany","CourseSlot.createOne","CourseSlot.createMany","CourseSlot.createManyAndReturn","CourseSlot.updateOne","CourseSlot.updateMany","CourseSlot.updateManyAndReturn","CourseSlot.upsertOne","CourseSlot.deleteOne","CourseSlot.deleteMany","CourseSlot.groupBy","CourseSlot.aggregate","Booking.findUnique","Booking.findUniqueOrThrow","Booking.findFirst","Booking.findFirstOrThrow","Booking.findMany","Booking.createOne","Booking.createMany","Booking.createManyAndReturn","Booking.updateOne","Booking.updateMany","Booking.updateManyAndReturn","Booking.upsertOne","Booking.deleteOne","Booking.deleteMany","Booking.groupBy","Booking.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","Assignment.findUnique","Assignment.findUniqueOrThrow","Assignment.findFirst","Assignment.findFirstOrThrow","Assignment.findMany","Assignment.createOne","Assignment.createMany","Assignment.createManyAndReturn","Assignment.updateOne","Assignment.updateMany","Assignment.updateManyAndReturn","Assignment.upsertOne","Assignment.deleteOne","Assignment.deleteMany","Assignment.groupBy","Assignment.aggregate","Submission.findUnique","Submission.findUniqueOrThrow","Submission.findFirst","Submission.findFirstOrThrow","Submission.findMany","Submission.createOne","Submission.createMany","Submission.createManyAndReturn","Submission.updateOne","Submission.updateMany","Submission.updateManyAndReturn","Submission.upsertOne","Submission.deleteOne","Submission.deleteMany","Submission.groupBy","Submission.aggregate","CourseMaterial.findUnique","CourseMaterial.findUniqueOrThrow","CourseMaterial.findFirst","CourseMaterial.findFirstOrThrow","CourseMaterial.findMany","CourseMaterial.createOne","CourseMaterial.createMany","CourseMaterial.createManyAndReturn","CourseMaterial.updateOne","CourseMaterial.updateMany","CourseMaterial.updateManyAndReturn","CourseMaterial.upsertOne","CourseMaterial.deleteOne","CourseMaterial.deleteMany","CourseMaterial.groupBy","CourseMaterial.aggregate","Announcement.findUnique","Announcement.findUniqueOrThrow","Announcement.findFirst","Announcement.findFirstOrThrow","Announcement.findMany","Announcement.createOne","Announcement.createMany","Announcement.createManyAndReturn","Announcement.updateOne","Announcement.updateMany","Announcement.updateManyAndReturn","Announcement.upsertOne","Announcement.deleteOne","Announcement.deleteMany","Announcement.groupBy","Announcement.aggregate","Notification.findUnique","Notification.findUniqueOrThrow","Notification.findFirst","Notification.findFirstOrThrow","Notification.findMany","Notification.createOne","Notification.createMany","Notification.createManyAndReturn","Notification.updateOne","Notification.updateMany","Notification.updateManyAndReturn","Notification.upsertOne","Notification.deleteOne","Notification.deleteMany","Notification.groupBy","Notification.aggregate","PracticeSet.findUnique","PracticeSet.findUniqueOrThrow","PracticeSet.findFirst","PracticeSet.findFirstOrThrow","PracticeSet.findMany","PracticeSet.createOne","PracticeSet.createMany","PracticeSet.createManyAndReturn","PracticeSet.updateOne","PracticeSet.updateMany","PracticeSet.updateManyAndReturn","PracticeSet.upsertOne","PracticeSet.deleteOne","PracticeSet.deleteMany","PracticeSet.groupBy","PracticeSet.aggregate","AND","OR","NOT","id","title","questions","is_published","course_id","material_id","tutor_id","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","user_id","message","link","read","file_url","assignment_id","student_id","note","grade","feedback","SubmissionStatus","status","submittedAt","description","due_date","reminder_sent","booking_id","rating","comment","ReviewStatus","course_slot_id","BookingStatus","booking_status","PaymentStatus","payment_status","transaction_id","refund_id","cancelled_at","total_price","name","start_time","end_time","date","meeting_link","SessionType","session_type","capacity","CourseStatus","display_name","bio","qualification","hourly_rate","rating_avg","total_reviews","is_verified","review_summary","review_summary_count","review_summary_at","every","some","none","identifier","value","expiresAt","accountId","providerId","userId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","Role","role","email","emailVerified","image","UserStatus","assignment_id_student_id","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "tAiJAfABFAQAAPoDACAFAAD7AwAgCwAA_QMAIBUAAOcDACAWAADoAwAgGAAA_AMAIBkAAP4DACCSAgAA9wMAMJMCAABUABCUAgAA9wMAMJUCAQAAAAGcAkAA5AMAIZ0CQADkAwAhugIAAPkD-AIizAIBAN4DACHuAgEA4gMAIfMCAAD4A_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_wMAMJMCAABJABCUAgAA_wMAMJUCAQAAAAGcAkAA5AMAIa8CAQDeAwAhsAIBAN4DACGxAgEA4gMAIbICIADhAwAhAwAAAEkAIAEAAEoAMAIAAEsAIAEAAAADACABAAAABwAgAQAAAC8AIAEAAAAzACABAAAAFgAgAQAAAEkAIAEAAAABACAUBAAA-gMAIAUAAPsDACALAAD9AwAgFQAA5wMAIBYAAOgDACAYAAD8AwAgGQAA_gMAIJICAAD3AwAwkwIAAFQAEJQCAAD3AwAwlQIBAN4DACGcAkAA5AMAIZ0CQADkAwAhugIAAPkD-AIizAIBAN4DACHuAgEA4gMAIfMCAAD4A_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_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-gEAMBEGAAD_BAAgCgAA_gQAIBIAAIAFACAUAACBBQAglQIBAKEEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACG1AgEAoQQAIb4CIACiBAAhwwIBAKEEACHFAgAA-wTFAiLHAgAA_ATHAiLIAgEApAQAIckCAQCkBAAhygJAANYEACHLAggA_QQAIQIAAAAxACAfAAD9AQAgDZUCAQChBAAhmwIBAKEEACGcAkAAowQAIZ0CQACjBAAhtQIBAKEEACG-AiAAogQAIcMCAQChBAAhxQIAAPsExQIixwIAAPwExwIiyAIBAKQEACHJAgEApAQAIcoCQADWBAAhywIIAP0EACECAAAALwAgHwAA_wEAIAIAAAAvACAfAAD_AQAgAwAAADEAICYAAPgBACAnAAD9AQAgAQAAADEAIAEAAAAvACAIDAAA9gQAICwAAPkEACAtAAD4BAAgbgAA9wQAIG8AAPoEACDIAgAAnQQAIMkCAACdBAAgygIAAJ0EACAQkgIAAMsDADCTAgAAhgIAEJQCAADLAwAwlQIBAKYDACGbAgEApgMAIZwCQACqAwAhnQJAAKoDACG1AgEApgMAIb4CIACoAwAhwwIBAKYDACHFAgAAzAPFAiLHAgAAzQPHAiLIAgEAqQMAIckCAQCpAwAhygJAAMEDACHLAggAzgMAIQMAAAAvACABAACFAgAwKwAAhgIAIAMAAAAvACABAAAwADACAAAxACABAAAAOAAgAQAAADgAIAMAAAAzACABAAA3ADACAAA4ACADAAAAMwAgAQAANwAwAgAAOAAgAwAAADMAIAEAADcAMAIAADgAIAwGAAD0BAAgCgAA9QQAIBMAAPMEACCVAgEAAAABmwIBAAAAAZwCQAAAAAGdAkAAAAABtQIBAAAAAboCAAAAwwICvwIBAAAAAcACAgAAAAHBAgEAAAABAR8AAI4CACAJlQIBAAAAAZsCAQAAAAGcAkAAAAABnQJAAAAAAbUCAQAAAAG6AgAAAMMCAr8CAQAAAAHAAgIAAAABwQIBAAAAAQEfAACQAgAwAR8AAJACADAMBgAA8QQAIAoAAPIEACATAADwBAAglQIBAKEEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACG1AgEAoQQAIboCAADvBMMCIr8CAQChBAAhwAICAO4EACHBAgEApAQAIQIAAAA4ACAfAACTAgAgCZUCAQChBAAhmwIBAKEEACGcAkAAowQAIZ0CQACjBAAhtQIBAKEEACG6AgAA7wTDAiK_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_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_AwAgbwAArwMAIJ4CAgAAAAGfAgIAAAAFoAICAAAABaECAgAAAAGiAgIAAAABowICAAAAAaQCAgAAAAGlAgIAvgMAIQcMAACsAwAgLAAAvQMAIC0AAL0DACCeAgAAALoCAp8CAAAAugIIoAIAAAC6AgilAgAAvAO6AiIHDAAArAMAICwAAL0DACAtAAC9AwAgngIAAAC6AgKfAgAAALoCCKACAAAAugIIpQIAALwDugIiBJ4CAAAAugICnwIAAAC6AgigAgAAALoCCKUCAAC9A7oCIg0MAACvAwAgLAAArwMAIC0AAK8DACBuAAC_AwAgbwAArwMAIJ4CAgAAAAGfAgIAAAAFoAICAAAABaECAgAAAAGiAgIAAAABowICAAAAAaQCAgAAAAGlAgIAvgMAIQieAggAAAABnwIIAAAABaACCAAAAAWhAggAAAABogIIAAAAAaMCCAAAAAGkAggAAAABpQIIAL8DACEMkgIAAMADADCTAgAAsgIAEJQCAADAAwAwlQIBAKYDACGWAgEApgMAIZkCAQCmAwAhmwIBAKYDACGcAkAAqgMAIZ0CQACqAwAhvAIBAKYDACG9AkAAwQMAIb4CIACoAwAhCwwAAK8DACAsAADDAwAgLQAAwwMAIJ4CQAAAAAGfAkAAAAAFoAJAAAAABaECQAAAAAGiAkAAAAABowJAAAAAAaQCQAAAAAGlAkAAwgMAIQsMAACvAwAgLAAAwwMAIC0AAMMDACCeAkAAAAABnwJAAAAABaACQAAAAAWhAkAAAAABogJAAAAAAaMCQAAAAAGkAkAAAAABpQJAAMIDACEIngJAAAAAAZ8CQAAAAAWgAkAAAAAFoQJAAAAAAaICQAAAAAGjAkAAAAABpAJAAAAAAaUCQADDAwAhDJICAADEAwAwkwIAAJwCABCUAgAAxAMAMJUCAQCmAwAhmwIBAKYDACGcAkAAqgMAIZ0CQACqAwAhtQIBAKYDACG6AgAAxgPDAiK_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_QMAIBUAAOcDACAWAADoAwAgGAAA_AMAIBkAAP4DACCSAgAA9wMAMJMCAABUABCUAgAA9wMAMJUCAQDeAwAhnAJAAOQDACGdAkAA5AMAIboCAAD5A_gCIswCAQDeAwAh7gIBAOIDACHzAgAA-APzAiL0AgEA3gMAIfUCIADhAwAh9gIBAOIDACH5AgAAVAAg-gIAAFQAIAPfAgAADQAg4AIAAA0AIOECAAANACAD3wIAAC8AIOACAAAvACDhAgAALwAgA98CAAAzACDgAgAAMwAg4QIAADMAIAPfAgAAOgAg4AIAADoAIOECAAA6ACAD3wIAABIAIOACAAASACDhAgAAEgAgA98CAAAfACDgAgAAHwAg4QIAAB8AIAmSAgAA7AMAMJMCAACsAQAQlAIAAOwDADCVAgEApgMAIZwCQADBAwAhnQJAAMEDACHiAgEApgMAIeMCAQCmAwAh5AJAAKoDACEJkgIAAO0DADCTAgAAmQEAEJQCAADtAwAwlQIBAN4DACGcAkAA4wMAIZ0CQADjAwAh4gIBAN4DACHjAgEA3gMAIeQCQADkAwAhEJICAADuAwAwkwIAAJMBABCUAgAA7gMAMJUCAQCmAwAhnAJAAKoDACGdAkAAqgMAIeUCAQCmAwAh5gIBAKYDACHnAgEApgMAIegCAQCpAwAh6QIBAKkDACHqAgEAqQMAIesCQADBAwAh7AJAAMEDACHtAgEAqQMAIe4CAQCpAwAhC5ICAADvAwAwkwIAAH0AEJQCAADvAwAwlQIBAKYDACGcAkAAqgMAIZ0CQACqAwAh5AJAAKoDACHnAgEApgMAIe8CAQCmAwAh8AIBAKkDACHxAgEAqQMAIQ2SAgAA8AMAMJMCAABnABCUAgAA8AMAMJUCAQCmAwAhnAJAAKoDACGdAkAAqgMAIboCAADyA_gCIswCAQCmAwAh7gIBAKkDACHzAgAA8QPzAiL0AgEApgMAIfUCIACoAwAh9gIBAKkDACEHDAAArAMAICwAAPYDACAtAAD2AwAgngIAAADzAgKfAgAAAPMCCKACAAAA8wIIpQIAAPUD8wIiBwwAAKwDACAsAAD0AwAgLQAA9AMAIJ4CAAAA-AICnwIAAAD4AgigAgAAAPgCCKUCAADzA_gCIgcMAACsAwAgLAAA9AMAIC0AAPQDACCeAgAAAPgCAp8CAAAA-AIIoAIAAAD4AgilAgAA8wP4AiIEngIAAAD4AgKfAgAAAPgCCKACAAAA-AIIpQIAAPQD-AIiBwwAAKwDACAsAAD2AwAgLQAA9gMAIJ4CAAAA8wICnwIAAADzAgigAgAAAPMCCKUCAAD1A_MCIgSeAgAAAPMCAp8CAAAA8wIIoAIAAADzAgilAgAA9gPzAiIUBAAA-gMAIAUAAPsDACALAAD9AwAgFQAA5wMAIBYAAOgDACAYAAD8AwAgGQAA_gMAIJICAAD3AwAwkwIAAFQAEJQCAAD3AwAwlQIBAN4DACGcAkAA5AMAIZ0CQADkAwAhugIAAPkD-AIizAIBAN4DACHuAgEA4gMAIfMCAAD4A_MCIvQCAQDeAwAh9QIgAOEDACH2AgEA4gMAIQSeAgAAAPMCAp8CAAAA8wIIoAIAAADzAgilAgAA9gPzAiIEngIAAAD4AgKfAgAAAPgCCKACAAAA-AIIpQIAAPQD-AIiA98CAAADACDgAgAAAwAg4QIAAAMAIAPfAgAABwAg4AIAAAcAIOECAAAHACAaAwAA5QMAIAcAAOYDACANAADqAwAgDwAA6wMAIBUAAOcDACAWAADoAwAgFwAA6QMAIJICAADdAwAwkwIAAAsAEJQCAADdAwAwlQIBAN4DACGcAkAA5AMAIZ0CQADkAwAhrwIBAN4DACHVAgEA3gMAIdYCAQDeAwAh1wIBAN4DACHYAggA3wMAIdkCCADfAwAh2gICAOADACHbAiAA4QMAIdwCAQDiAwAh3QICAOADACHeAkAA4wMAIfkCAAALACD6AgAACwAgA98CAAAWACDgAgAAFgAg4QIAABYAIAPfAgAASQAg4AIAAEkAIOECAABJACAKAwAA5QMAIJICAAD_AwAwkwIAAEkAEJQCAAD_AwAwlQIBAN4DACGcAkAA5AMAIa8CAQDeAwAhsAIBAN4DACGxAgEA4gMAIbICIADhAwAhEAYAAIIEACAHAADmAwAgDQAA6gMAIA8AAOsDACAQAACDBAAgEQAAhAQAIJICAACABAAwkwIAADoAEJQCAACABAAwlQIBAN4DACGbAgEA3gMAIZwCQADkAwAhnQJAAOQDACG6AgAAgQTVAiK8AgEA3gMAIcwCAQDeAwAhBJ4CAAAA1QICnwIAAADVAgigAgAAANUCCKUCAADbA9UCIhoDAADlAwAgBwAA5gMAIA0AAOoDACAPAADrAwAgFQAA5wMAIBYAAOgDACAXAADpAwAgkgIAAN0DADCTAgAACwAQlAIAAN0DADCVAgEA3gMAIZwCQADkAwAhnQJAAOQDACGvAgEA3gMAIdUCAQDeAwAh1gIBAN4DACHXAgEA3gMAIdgCCADfAwAh2QIIAN8DACHaAgIA4AMAIdsCIADhAwAh3AIBAOIDACHdAgIA4AMAId4CQADjAwAh-QIAAAsAIPoCAAALACAD3wIAABsAIOACAAAbACDhAgAAGwAgA98CAAAlACDgAgAAJQAg4QIAACUAIA8GAACCBAAgCgAA5QMAIBMAAIcEACCSAgAAhQQAMJMCAAAzABCUAgAAhQQAMJUCAQDeAwAhmwIBAN4DACGcAkAA5AMAIZ0CQADkAwAhtQIBAN4DACG6AgAAhgTDAiK_AgEA3gMAIcACAgDgAwAhwQIBAOIDACEEngIAAADDAgKfAgAAAMMCCKACAAAAwwIIpQIAAMgDwwIiFgYAAIIEACAKAADlAwAgEgAAiwQAIBQAAIwEACCSAgAAiAQAMJMCAAAvABCUAgAAiAQAMJUCAQDeAwAhmwIBAN4DACGcAkAA5AMAIZ0CQADkAwAhtQIBAN4DACG-AiAA4QMAIcMCAQDeAwAhxQIAAIkExQIixwIAAIoExwIiyAIBAOIDACHJAgEA4gMAIcoCQADjAwAhywIIAN8DACH5AgAALwAg-gIAAC8AIBQGAACCBAAgCgAA5QMAIBIAAIsEACAUAACMBAAgkgIAAIgEADCTAgAALwAQlAIAAIgEADCVAgEA3gMAIZsCAQDeAwAhnAJAAOQDACGdAkAA5AMAIbUCAQDeAwAhvgIgAOEDACHDAgEA3gMAIcUCAACJBMUCIscCAACKBMcCIsgCAQDiAwAhyQIBAOIDACHKAkAA4wMAIcsCCADfAwAhBJ4CAAAAxQICnwIAAADFAgigAgAAAMUCCKUCAADTA8UCIgSeAgAAAMcCAp8CAAAAxwIIoAIAAADHAgilAgAA0QPHAiIVBgAAggQAIAgAAI4EACAVAADnAwAgkgIAAJkEADCTAgAADQAQlAIAAJkEADCVAgEA3gMAIZkCAQDeAwAhmwIBAN4DACGcAkAA5AMAIZ0CQADkAwAhvAIBAOIDACHMAgEA3gMAIc0CQADkAwAhzgJAAOQDACHPAkAA5AMAIdACAQDiAwAh0gIAAJoE0gIi0wICAOADACH5AgAADQAg-gIAAA0AIBEGAACCBAAgCgAA5QMAIBMAAIcEACCSAgAAhQQAMJMCAAAzABCUAgAAhQQAMJUCAQDeAwAhmwIBAN4DACGcAkAA5AMAIZ0CQADkAwAhtQIBAN4DACG6AgAAhgTDAiK_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_gIBAAAAAQH-AiAAAAABAf4CQAAAAAEB_gIBAAAAAQUmAACqCAAgJwAAswgAIPsCAACrCAAg_AIAALIIACCBAwAAPAAgByYAAKgIACAnAACwCAAg-wIAAKkIACD8AgAArwgAIP8CAAAbACCAAwAAGwAggQMAAB0AIAUmAACmCAAgJwAArQgAIPsCAACnCAAg_AIAAKwIACCBAwAArwEAIAMmAACqCAAg-wIAAKsIACCBAwAAPAAgAyYAAKgIACD7AgAAqQgAIIEDAAAdACADJgAApggAIPsCAACnCAAggQMAAK8BACAAAAAFJgAAoQgAICcAAKQIACD7AgAAoggAIPwCAACjCAAggQMAAAEAIAMmAAChCAAg-wIAAKIIACCBAwAAAQAgAAAABSYAAJwIACAnAACfCAAg-wIAAJ0IACD8AgAAnggAIIEDAAA8ACADJgAAnAgAIPsCAACdCAAggQMAADwAIAAAAAUmAACWCAAgJwAAmggAIPsCAACXCAAg_AIAAJkIACCBAwAAPAAgCyYAALoEADAnAAC_BAAw-wIAALsEADD8AgAAvAQAMP0CAAC9BAAg_gIAAL4EADD_AgAAvgQAMIADAAC-BAAwgQMAAL4EADCCAwAAwAQAMIMDAADBBAAwCgYAAKoEACAIAACoBAAglQIBAAAAAZYCAQAAAAGXAoAAAAABmAIgAAAAAZkCAQAAAAGbAgEAAAABnAJAAAAAAZ0CQAAAAAECAAAAIQAgJgAAxQQAIAMAAAAhACAmAADFBAAgJwAAxAQAIAEfAACYCAAwDwYAAIIEACAIAACOBAAgDgAAkQQAIJICAACPBAAwkwIAAB8AEJQCAACPBAAwlQIBAAAAAZYCAQDeAwAhlwIAAJAEACCYAiAA4QMAIZkCAQDeAwAhmgIBAOIDACGbAgEA3gMAIZwCQADkAwAhnQJAAOQDACECAAAAIQAgHwAAxAQAIAIAAADCBAAgHwAAwwQAIAySAgAAwQQAMJMCAADCBAAQlAIAAMEEADCVAgEA3gMAIZYCAQDeAwAhlwIAAJAEACCYAiAA4QMAIZkCAQDeAwAhmgIBAOIDACGbAgEA3gMAIZwCQADkAwAhnQJAAOQDACEMkgIAAMEEADCTAgAAwgQAEJQCAADBBAAwlQIBAN4DACGWAgEA3gMAIZcCAACQBAAgmAIgAOEDACGZAgEA3gMAIZoCAQDiAwAhmwIBAN4DACGcAkAA5AMAIZ0CQADkAwAhCJUCAQChBAAhlgIBAKEEACGXAoAAAAABmAIgAKIEACGZAgEAoQQAIZsCAQChBAAhnAJAAKMEACGdAkAAowQAIQoGAACnBAAgCAAApQQAIJUCAQChBAAhlgIBAKEEACGXAoAAAAABmAIgAKIEACGZAgEAoQQAIZsCAQChBAAhnAJAAKMEACGdAkAAowQAIQoGAACqBAAgCAAAqAQAIJUCAQAAAAGWAgEAAAABlwKAAAAAAZgCIAAAAAGZAgEAAAABmwIBAAAAAZwCQAAAAAGdAkAAAAABAyYAAJYIACD7AgAAlwgAIIEDAAA8ACAEJgAAugQAMPsCAAC7BAAw_QIAAL0EACCBAwAAvgQAMAAAAAAABf4CAgAAAAGEAwIAAAABhQMCAAAAAYYDAgAAAAGHAwIAAAABAf4CAAAAugICBSYAAI4IACAnAACUCAAg-wIAAI8IACD8AgAAkwgAIIEDAAAUACAFJgAAjAgAICcAAJEIACD7AgAAjQgAIPwCAACQCAAggQMAAAEAIAMmAACOCAAg-wIAAI8IACCBAwAAFAAgAyYAAIwIACD7AgAAjQgAIIEDAAABACAAAAAB_gJAAAAAAQUmAACDCAAgJwAAiggAIPsCAACECAAg_AIAAIkIACCBAwAAPAAgBSYAAIEIACAnAACHCAAg-wIAAIIIACD8AgAAhggAIIEDAACvAQAgCyYAANoEADAnAADfBAAw-wIAANsEADD8AgAA3AQAMP0CAADdBAAg_gIAAN4EADD_AgAA3gQAMIADAADeBAAwgQMAAN4EADCCAwAA4AQAMIMDAADhBAAwCgoAANIEACCVAgEAAAABnQJAAAAAAbMCAQAAAAG1AgEAAAABtgIBAAAAAbcCAgAAAAG4AgEAAAABugIAAAC6AgK7AkAAAAABAgAAABgAICYAAOUEACADAAAAGAAgJgAA5QQAICcAAOQEACABHwAAhQgAMBAJAACXBAAgCgAA5QMAIJICAACUBAAwkwIAABYAEJQCAACUBAAwlQIBAAAAAZ0CQADkAwAhswIBAN4DACG0AgEA3gMAIbUCAQDeAwAhtgIBAOIDACG3AgIAlQQAIbgCAQDiAwAhugIAAJYEugIiuwJAAOQDACH4AgAAkwQAIAIAAAAYACAfAADkBAAgAgAAAOIEACAfAADjBAAgDZICAADhBAAwkwIAAOIEABCUAgAA4QQAMJUCAQDeAwAhnQJAAOQDACGzAgEA3gMAIbQCAQDeAwAhtQIBAN4DACG2AgEA4gMAIbcCAgCVBAAhuAIBAOIDACG6AgAAlgS6AiK7AkAA5AMAIQ2SAgAA4QQAMJMCAADiBAAQlAIAAOEEADCVAgEA3gMAIZ0CQADkAwAhswIBAN4DACG0AgEA3gMAIbUCAQDeAwAhtgIBAOIDACG3AgIAlQQAIbgCAQDiAwAhugIAAJYEugIiuwJAAOQDACEJlQIBAKEEACGdAkAAowQAIbMCAQChBAAhtQIBAKEEACG2AgEApAQAIbcCAgDNBAAhuAIBAKQEACG6AgAAzgS6AiK7AkAAowQAIQoKAADQBAAglQIBAKEEACGdAkAAowQAIbMCAQChBAAhtQIBAKEEACG2AgEApAQAIbcCAgDNBAAhuAIBAKQEACG6AgAAzgS6AiK7AkAAowQAIQoKAADSBAAglQIBAAAAAZ0CQAAAAAGzAgEAAAABtQIBAAAAAbYCAQAAAAG3AgIAAAABuAIBAAAAAboCAAAAugICuwJAAAAAAQMmAACDCAAg-wIAAIQIACCBAwAAPAAgAyYAAIEIACD7AgAAgggAIIEDAACvAQAgBCYAANoEADD7AgAA2wQAMP0CAADdBAAggQMAAN4EADAAAAAAAAX-AgIAAAABhAMCAAAAAYUDAgAAAAGGAwIAAAABhwMCAAAAAQH-AgAAAMMCAgUmAAD2BwAgJwAA_wcAIPsCAAD3BwAg_AIAAP4HACCBAwAAMQAgBSYAAPQHACAnAAD8BwAg-wIAAPUHACD8AgAA-wcAIIEDAACvAQAgBSYAAPIHACAnAAD5BwAg-wIAAPMHACD8AgAA-AcAIIEDAAABACADJgAA9gcAIPsCAAD3BwAggQMAADEAIAMmAAD0BwAg-wIAAPUHACCBAwAArwEAIAMmAADyBwAg-wIAAPMHACCBAwAAAQAgAAAAAAAB_gIAAADFAgIB_gIAAADHAgIF_gIIAAAAAYQDCAAAAAGFAwgAAAABhgMIAAAAAYcDCAAAAAEFJgAA5wcAICcAAPAHACD7AgAA6AcAIPwCAADvBwAggQMAAAEAIAUmAADlBwAgJwAA7QcAIPsCAADmBwAg_AIAAOwHACCBAwAArwEAIAUmAADjBwAgJwAA6gcAIPsCAADkBwAg_AIAAOkHACCBAwAADwAgByYAAIIFACAnAACFBQAg-wIAAIMFACD8AgAAhAUAIP8CAAAzACCAAwAAMwAggQMAADgAIAoGAAD0BAAgCgAA9QQAIJUCAQAAAAGbAgEAAAABnAJAAAAAAZ0CQAAAAAG1AgEAAAABugIAAADDAgLAAgIAAAABwQIBAAAAAQIAAAA4ACAmAACCBQAgAwAAADMAICYAAIIFACAnAACGBQAgDAAAADMAIAYAAPEEACAKAADyBAAgHwAAhgUAIJUCAQChBAAhmwIBAKEEACGcAkAAowQAIZ0CQACjBAAhtQIBAKEEACG6AgAA7wTDAiLAAgIA7gQAIcECAQCkBAAhCgYAAPEEACAKAADyBAAglQIBAKEEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACG1AgEAoQQAIboCAADvBMMCIsACAgDuBAAhwQIBAKQEACEDJgAA5wcAIPsCAADoBwAggQMAAAEAIAMmAADlBwAg-wIAAOYHACCBAwAArwEAIAMmAADjBwAg-wIAAOQHACCBAwAADwAgAyYAAIIFACD7AgAAgwUAIIEDAAA4ACAAAAAAAAH-AgAAANICAgUmAADaBwAgJwAA4QcAIPsCAADbBwAg_AIAAOAHACCBAwAArwEAIAUmAADYBwAgJwAA3gcAIPsCAADZBwAg_AIAAN0HACCBAwAAPAAgCyYAAJQFADAnAACZBQAw-wIAAJUFADD8AgAAlgUAMP0CAACXBQAg_gIAAJgFADD_AgAAmAUAMIADAACYBQAwgQMAAJgFADCCAwAAmgUAMIMDAACbBQAwDwYAAIgFACAKAACHBQAgFAAAigUAIJUCAQAAAAGbAgEAAAABnAJAAAAAAZ0CQAAAAAG1AgEAAAABvgIgAAAAAcUCAAAAxQICxwIAAADHAgLIAgEAAAAByQIBAAAAAcoCQAAAAAHLAggAAAABAgAAADEAICYAAJ8FACADAAAAMQAgJgAAnwUAICcAAJ4FACABHwAA3AcAMBQGAACCBAAgCgAA5QMAIBIAAIsEACAUAACMBAAgkgIAAIgEADCTAgAALwAQlAIAAIgEADCVAgEAAAABmwIBAN4DACGcAkAA5AMAIZ0CQADkAwAhtQIBAN4DACG-AiAA4QMAIcMCAQDeAwAhxQIAAIkExQIixwIAAIoExwIiyAIBAAAAAckCAQDiAwAhygJAAOMDACHLAggA3wMAIQIAAAAxACAfAACeBQAgAgAAAJwFACAfAACdBQAgEJICAACbBQAwkwIAAJwFABCUAgAAmwUAMJUCAQDeAwAhmwIBAN4DACGcAkAA5AMAIZ0CQADkAwAhtQIBAN4DACG-AiAA4QMAIcMCAQDeAwAhxQIAAIkExQIixwIAAIoExwIiyAIBAOIDACHJAgEA4gMAIcoCQADjAwAhywIIAN8DACEQkgIAAJsFADCTAgAAnAUAEJQCAACbBQAwlQIBAN4DACGbAgEA3gMAIZwCQADkAwAhnQJAAOQDACG1AgEA3gMAIb4CIADhAwAhwwIBAN4DACHFAgAAiQTFAiLHAgAAigTHAiLIAgEA4gMAIckCAQDiAwAhygJAAOMDACHLAggA3wMAIQyVAgEAoQQAIZsCAQChBAAhnAJAAKMEACGdAkAAowQAIbUCAQChBAAhvgIgAKIEACHFAgAA-wTFAiLHAgAA_ATHAiLIAgEApAQAIckCAQCkBAAhygJAANYEACHLAggA_QQAIQ8GAAD_BAAgCgAA_gQAIBQAAIEFACCVAgEAoQQAIZsCAQChBAAhnAJAAKMEACGdAkAAowQAIbUCAQChBAAhvgIgAKIEACHFAgAA-wTFAiLHAgAA_ATHAiLIAgEApAQAIckCAQCkBAAhygJAANYEACHLAggA_QQAIQ8GAACIBQAgCgAAhwUAIBQAAIoFACCVAgEAAAABmwIBAAAAAZwCQAAAAAGdAkAAAAABtQIBAAAAAb4CIAAAAAHFAgAAAMUCAscCAAAAxwICyAIBAAAAAckCAQAAAAHKAkAAAAABywIIAAAAAQMmAADaBwAg-wIAANsHACCBAwAArwEAIAMmAADYBwAg-wIAANkHACCBAwAAPAAgBCYAAJQFADD7AgAAlQUAMP0CAACXBQAggQMAAJgFADAAAAAB_gIAAADVAgIFJgAAzgcAICcAANYHACD7AgAAzwcAIPwCAADVBwAggQMAAK8BACALJgAA2gUAMCcAAN8FADD7AgAA2wUAMPwCAADcBQAw_QIAAN0FACD-AgAA3gUAMP8CAADeBQAwgAMAAN4FADCBAwAA3gUAMIIDAADgBQAwgwMAAOEFADALJgAAzgUAMCcAANMFADD7AgAAzwUAMPwCAADQBQAw_QIAANEFACD-AgAA0gUAMP8CAADSBQAwgAMAANIFADCBAwAA0gUAMIIDAADUBQAwgwMAANUFADALJgAAwgUAMCcAAMcFADD7AgAAwwUAMPwCAADEBQAw_QIAAMUFACD-AgAAxgUAMP8CAADGBQAwgAMAAMYFADCBAwAAxgUAMIIDAADIBQAwgwMAAMkFADALJgAAtgUAMCcAALsFADD7AgAAtwUAMPwCAAC4BQAw_QIAALkFACD-AgAAugUAMP8CAAC6BQAwgAMAALoFADCBAwAAugUAMIIDAAC8BQAwgwMAAL0FADALJgAArQUAMCcAALEFADD7AgAArgUAMPwCAACvBQAw_QIAALAFACD-AgAAvgQAMP8CAAC-BAAwgAMAAL4EADCBAwAAvgQAMIIDAACyBQAwgwMAAMEEADAKBgAAqgQAIA4AAKkEACCVAgEAAAABlgIBAAAAAZcCgAAAAAGYAiAAAAABmgIBAAAAAZsCAQAAAAGcAkAAAAABnQJAAAAAAQIAAAAhACAmAAC1BQAgAwAAACEAICYAALUFACAnAAC0BQAgAR8AANQHADACAAAAIQAgHwAAtAUAIAIAAADCBAAgHwAAswUAIAiVAgEAoQQAIZYCAQChBAAhlwKAAAAAAZgCIACiBAAhmgIBAKQEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACEKBgAApwQAIA4AAKYEACCVAgEAoQQAIZYCAQChBAAhlwKAAAAAAZgCIACiBAAhmgIBAKQEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACEKBgAAqgQAIA4AAKkEACCVAgEAAAABlgIBAAAAAZcCgAAAAAGYAiAAAAABmgIBAAAAAZsCAQAAAAGcAkAAAAABnQJAAAAAAQSVAgEAAAABmwIBAAAAAZwCQAAAAAGwAgEAAAABAgAAACcAICYAAMEFACADAAAAJwAgJgAAwQUAICcAAMAFACABHwAA0wcAMAkIAACOBAAgkgIAAI0EADCTAgAAJQAQlAIAAI0EADCVAgEAAAABmQIBAN4DACGbAgEA3gMAIZwCQADkAwAhsAIBAN4DACECAAAAJwAgHwAAwAUAIAIAAAC-BQAgHwAAvwUAIAiSAgAAvQUAMJMCAAC-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-wIAAM8HACCBAwAArwEAIAQmAADaBQAw-wIAANsFADD9AgAA3QUAIIEDAADeBQAwBCYAAM4FADD7AgAAzwUAMP0CAADRBQAggQMAANIFADAEJgAAwgUAMPsCAADDBQAw_QIAAMUFACCBAwAAxgUAMAQmAAC2BQAw-wIAALcFADD9AgAAuQUAIIEDAAC6BQAwBCYAAK0FADD7AgAArgUAMP0CAACwBQAggQMAAL4EADAAAAAAAAUmAADDBwAgJwAAzAcAIPsCAADEBwAg_AIAAMsHACCBAwAAAQAgCyYAAKsGADAnAACvBgAw-wIAAKwGADD8AgAArQYAMP0CAACuBgAg_gIAAN4FADD_AgAA3gUAMIADAADeBQAwgQMAAN4FADCCAwAAsAYAMIMDAADhBQAwCyYAAKIGADAnAACmBgAw-wIAAKMGADD8AgAApAYAMP0CAAClBgAg_gIAAJgFADD_AgAAmAUAMIADAACYBQAwgQMAAJgFADCCAwAApwYAMIMDAACbBQAwCyYAAJYGADAnAACbBgAw-wIAAJcGADD8AgAAmAYAMP0CAACZBgAg_gIAAJoGADD_AgAAmgYAMIADAACaBgAwgQMAAJoGADCCAwAAnAYAMIMDAACdBgAwCyYAAIoGADAnAACPBgAw-wIAAIsGADD8AgAAjAYAMP0CAACNBgAg_gIAAI4GADD_AgAAjgYAMIADAACOBgAwgQMAAI4GADCCAwAAkAYAMIMDAACRBgAwCyYAAIEGADAnAACFBgAw-wIAAIIGADD8AgAAgwYAMP0CAACEBgAg_gIAANIFADD_AgAA0gUAMIADAADSBQAwgQMAANIFADCCAwAAhgYAMIMDAADVBQAwCyYAAPgFADAnAAD8BQAw-wIAAPkFADD8AgAA-gUAMP0CAAD7BQAg_gIAAL4EADD_AgAAvgQAMIADAAC-BAAwgQMAAL4EADCCAwAA_QUAMIMDAADBBAAwCggAAKgEACAOAACpBAAglQIBAAAAAZYCAQAAAAGXAoAAAAABmAIgAAAAAZkCAQAAAAGaAgEAAAABnAJAAAAAAZ0CQAAAAAECAAAAIQAgJgAAgAYAIAMAAAAhACAmAACABgAgJwAA_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_AgEAoQQAIcACAgDuBAAhwQIBAKQEACEKCgAA9QQAIBMAAPMEACCVAgEAAAABnAJAAAAAAZ0CQAAAAAG1AgEAAAABugIAAADDAgK_AgEAAAABwAICAAAAAcECAQAAAAEPCgAAhwUAIBIAAIkFACAUAACKBQAglQIBAAAAAZwCQAAAAAGdAkAAAAABtQIBAAAAAb4CIAAAAAHDAgEAAAABxQIAAADFAgLHAgAAAMcCAsgCAQAAAAHJAgEAAAABygJAAAAAAcsCCAAAAAECAAAAMQAgJgAAqgYAIAMAAAAxACAmAACqBgAgJwAAqQYAIAEfAADGBwAwAgAAADEAIB8AAKkGACACAAAAnAUAIB8AAKgGACAMlQIBAKEEACGcAkAAowQAIZ0CQACjBAAhtQIBAKEEACG-AiAAogQAIcMCAQChBAAhxQIAAPsExQIixwIAAPwExwIiyAIBAKQEACHJAgEApAQAIcoCQADWBAAhywIIAP0EACEPCgAA_gQAIBIAAIAFACAUAACBBQAglQIBAKEEACGcAkAAowQAIZ0CQACjBAAhtQIBAKEEACG-AiAAogQAIcMCAQChBAAhxQIAAPsExQIixwIAAPwExwIiyAIBAKQEACHJAgEApAQAIcoCQADWBAAhywIIAP0EACEPCgAAhwUAIBIAAIkFACAUAACKBQAglQIBAAAAAZwCQAAAAAGdAkAAAAABtQIBAAAAAb4CIAAAAAHDAgEAAAABxQIAAADFAgLHAgAAAMcCAsgCAQAAAAHJAgEAAAABygJAAAAAAcsCCAAAAAEOCAAAoQUAIBUAAKIFACCVAgEAAAABmQIBAAAAAZwCQAAAAAGdAkAAAAABvAIBAAAAAcwCAQAAAAHNAkAAAAABzgJAAAAAAc8CQAAAAAHQAgEAAAAB0gIAAADSAgLTAgIAAAABAgAAAA8AICYAALMGACADAAAADwAgJgAAswYAICcAALIGACABHwAAxQcAMAIAAAAPACAfAACyBgAgAgAAAOIFACAfAACxBgAgDJUCAQChBAAhmQIBAKEEACGcAkAAowQAIZ0CQACjBAAhvAIBAKQEACHMAgEAoQQAIc0CQACjBAAhzgJAAKMEACHPAkAAowQAIdACAQCkBAAh0gIAAJAF0gIi0wICAO4EACEOCAAAkgUAIBUAAJMFACCVAgEAoQQAIZkCAQChBAAhnAJAAKMEACGdAkAAowQAIbwCAQCkBAAhzAIBAKEEACHNAkAAowQAIc4CQACjBAAhzwJAAKMEACHQAgEApAQAIdICAACQBdICItMCAgDuBAAhDggAAKEFACAVAACiBQAglQIBAAAAAZkCAQAAAAGcAkAAAAABnQJAAAAAAbwCAQAAAAHMAgEAAAABzQJAAAAAAc4CQAAAAAHPAkAAAAAB0AIBAAAAAdICAAAA0gIC0wICAAAAAQMmAADDBwAg-wIAAMQHACCBAwAAAQAgBCYAAKsGADD7AgAArAYAMP0CAACuBgAggQMAAN4FADAEJgAAogYAMPsCAACjBgAw_QIAAKUGACCBAwAAmAUAMAQmAACWBgAw-wIAAJcGADD9AgAAmQYAIIEDAACaBgAwBCYAAIoGADD7AgAAiwYAMP0CAACNBgAggQMAAI4GADAEJgAAgQYAMPsCAACCBgAw_QIAAIQGACCBAwAA0gUAMAQmAAD4BQAw-wIAAPkFADD9AgAA-wUAIIEDAAC-BAAwCQQAAKYHACAFAACnBwAgCwAAqQcAIBUAAL0GACAWAAC-BgAgGAAAqAcAIBkAAKoHACDuAgAAnQQAIPYCAACdBAAgAAAAAAAAAAAAAAAABSYAAL4HACAnAADBBwAg-wIAAL8HACD8AgAAwAcAIIEDAAABACADJgAAvgcAIPsCAAC_BwAggQMAAAEAIAAAAAUmAAC5BwAgJwAAvAcAIPsCAAC6BwAg_AIAALsHACCBAwAAAQAgAyYAALkHACD7AgAAugcAIIEDAAABACAAAAAB_gIAAADzAgIB_gIAAAD4AgILJgAAkwcAMCcAAJgHADD7AgAAlAcAMPwCAACVBwAw_QIAAJYHACD-AgAAlwcAMP8CAACXBwAwgAMAAJcHADCBAwAAlwcAMIIDAACZBwAwgwMAAJoHADALJgAAhwcAMCcAAIwHADD7AgAAiAcAMPwCAACJBwAw_QIAAIoHACD-AgAAiwcAMP8CAACLBwAwgAMAAIsHADCBAwAAiwcAMIIDAACNBwAwgwMAAI4HADAHJgAAggcAICcAAIUHACD7AgAAgwcAIPwCAACEBwAg_wIAAAsAIIADAAALACCBAwAArwEAIAsmAAD5BgAwJwAA_QYAMPsCAAD6BgAw_AIAAPsGADD9AgAA_AYAIP4CAACYBQAw_wIAAJgFADCAAwAAmAUAMIEDAACYBQAwggMAAP4GADCDAwAAmwUAMAsmAADwBgAwJwAA9AYAMPsCAADxBgAw_AIAAPIGADD9AgAA8wYAIP4CAACaBgAw_wIAAJoGADCAAwAAmgYAMIEDAACaBgAwggMAAPUGADCDAwAAnQYAMAsmAADnBgAwJwAA6wYAMPsCAADoBgAw_AIAAOkGADD9AgAA6gYAIP4CAADeBAAw_wIAAN4EADCAAwAA3gQAMIEDAADeBAAwggMAAOwGADCDAwAA4QQAMAsmAADbBgAwJwAA4AYAMPsCAADcBgAw_AIAAN0GADD9AgAA3gYAIP4CAADfBgAw_wIAAN8GADCAAwAA3wYAMIEDAADfBgAwggMAAOEGADCDAwAA4gYAMAWVAgEAAAABnAJAAAAAAbACAQAAAAGxAgEAAAABsgIgAAAAAQIAAABLACAmAADmBgAgAwAAAEsAICYAAOYGACAnAADlBgAgAR8AALgHADAKAwAA5QMAIJICAAD_AwAwkwIAAEkAEJQCAAD_AwAwlQIBAAAAAZwCQADkAwAhrwIBAN4DACGwAgEA3gMAIbECAQDiAwAhsgIgAOEDACECAAAASwAgHwAA5QYAIAIAAADjBgAgHwAA5AYAIAmSAgAA4gYAMJMCAADjBgAQlAIAAOIGADCVAgEA3gMAIZwCQADkAwAhrwIBAN4DACGwAgEA3gMAIbECAQDiAwAhsgIgAOEDACEJkgIAAOIGADCTAgAA4wYAEJQCAADiBgAwlQIBAN4DACGcAkAA5AMAIa8CAQDeAwAhsAIBAN4DACGxAgEA4gMAIbICIADhAwAhBZUCAQChBAAhnAJAAKMEACGwAgEAoQQAIbECAQCkBAAhsgIgAKIEACEFlQIBAKEEACGcAkAAowQAIbACAQChBAAhsQIBAKQEACGyAiAAogQAIQWVAgEAAAABnAJAAAAAAbACAQAAAAGxAgEAAAABsgIgAAAAAQoJAADRBAAglQIBAAAAAZ0CQAAAAAGzAgEAAAABtAIBAAAAAbYCAQAAAAG3AgIAAAABuAIBAAAAAboCAAAAugICuwJAAAAAAQIAAAAYACAmAADvBgAgAwAAABgAICYAAO8GACAnAADuBgAgAR8AALcHADACAAAAGAAgHwAA7gYAIAIAAADiBAAgHwAA7QYAIAmVAgEAoQQAIZ0CQACjBAAhswIBAKEEACG0AgEAoQQAIbYCAQCkBAAhtwICAM0EACG4AgEApAQAIboCAADOBLoCIrsCQACjBAAhCgkAAM8EACCVAgEAoQQAIZ0CQACjBAAhswIBAKEEACG0AgEAoQQAIbYCAQCkBAAhtwICAM0EACG4AgEApAQAIboCAADOBLoCIrsCQACjBAAhCgkAANEEACCVAgEAAAABnQJAAAAAAbMCAQAAAAG0AgEAAAABtgIBAAAAAbcCAgAAAAG4AgEAAAABugIAAAC6AgK7AkAAAAABCgYAAPQEACATAADzBAAglQIBAAAAAZsCAQAAAAGcAkAAAAABnQJAAAAAAboCAAAAwwICvwIBAAAAAcACAgAAAAHBAgEAAAABAgAAADgAICYAAPgGACADAAAAOAAgJgAA-AYAICcAAPcGACABHwAAtgcAMAIAAAA4ACAfAAD3BgAgAgAAAJ4GACAfAAD2BgAgCJUCAQChBAAhmwIBAKEEACGcAkAAowQAIZ0CQACjBAAhugIAAO8EwwIivwIBAKEEACHAAgIA7gQAIcECAQCkBAAhCgYAAPEEACATAADwBAAglQIBAKEEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACG6AgAA7wTDAiK_AgEAoQQAIcACAgDuBAAhwQIBAKQEACEKBgAA9AQAIBMAAPMEACCVAgEAAAABmwIBAAAAAZwCQAAAAAGdAkAAAAABugIAAADDAgK_AgEAAAABwAICAAAAAcECAQAAAAEPBgAAiAUAIBIAAIkFACAUAACKBQAglQIBAAAAAZsCAQAAAAGcAkAAAAABnQJAAAAAAb4CIAAAAAHDAgEAAAABxQIAAADFAgLHAgAAAMcCAsgCAQAAAAHJAgEAAAABygJAAAAAAcsCCAAAAAECAAAAMQAgJgAAgQcAIAMAAAAxACAmAACBBwAgJwAAgAcAIAEfAAC1BwAwAgAAADEAIB8AAIAHACACAAAAnAUAIB8AAP8GACAMlQIBAKEEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACG-AiAAogQAIcMCAQChBAAhxQIAAPsExQIixwIAAPwExwIiyAIBAKQEACHJAgEApAQAIcoCQADWBAAhywIIAP0EACEPBgAA_wQAIBIAAIAFACAUAACBBQAglQIBAKEEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACG-AiAAogQAIcMCAQChBAAhxQIAAPsExQIixwIAAPwExwIiyAIBAKQEACHJAgEApAQAIcoCQADWBAAhywIIAP0EACEPBgAAiAUAIBIAAIkFACAUAACKBQAglQIBAAAAAZsCAQAAAAGcAkAAAAABnQJAAAAAAb4CIAAAAAHDAgEAAAABxQIAAADFAgLHAgAAAMcCAsgCAQAAAAHJAgEAAAABygJAAAAAAcsCCAAAAAETBwAAtQYAIA0AALkGACAPAAC6BgAgFQAAtgYAIBYAALcGACAXAAC4BgAglQIBAAAAAZwCQAAAAAGdAkAAAAAB1QIBAAAAAdYCAQAAAAHXAgEAAAAB2AIIAAAAAdkCCAAAAAHaAgIAAAAB2wIgAAAAAdwCAQAAAAHdAgIAAAAB3gJAAAAAAQIAAACvAQAgJgAAggcAIAMAAAALACAmAACCBwAgJwAAhgcAIBUAAAALACAHAADyBQAgDQAA9gUAIA8AAPcFACAVAADzBQAgFgAA9AUAIBcAAPUFACAfAACGBwAglQIBAKEEACGcAkAAowQAIZ0CQACjBAAh1QIBAKEEACHWAgEAoQQAIdcCAQChBAAh2AIIAP0EACHZAggA_QQAIdoCAgDuBAAh2wIgAKIEACHcAgEApAQAId0CAgDuBAAh3gJAANYEACETBwAA8gUAIA0AAPYFACAPAAD3BQAgFQAA8wUAIBYAAPQFACAXAAD1BQAglQIBAKEEACGcAkAAowQAIZ0CQACjBAAh1QIBAKEEACHWAgEAoQQAIdcCAQChBAAh2AIIAP0EACHZAggA_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-QYAMPsCAAD6BgAw_QIAAPwGACCBAwAAmAUAMAQmAADwBgAw-wIAAPEGADD9AgAA8wYAIIEDAACaBgAwBCYAAOcGADD7AgAA6AYAMP0CAADqBgAggQMAAN4EADAEJgAA2wYAMPsCAADcBgAw_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_QQAIdkCCAD9BAAh2gICAO4EACHbAiAAogQAIdwCAQCkBAAh3QICAO4EACHeAkAA1gQAIRQDAADxBQAgBwAA8gUAIA0AAPYFACAPAAD3BQAgFQAA8wUAIBYAAPQFACCVAgEAoQQAIZwCQACjBAAhnQJAAKMEACGvAgEAoQQAIdUCAQChBAAh1gIBAKEEACHXAgEAoQQAIdgCCAD9BAAh2QIIAP0EACHaAgIA7gQAIdsCIACiBAAh3AIBAKQEACHdAgIA7gQAId4CQADWBAAhDAYAAOYFACANAADoBQAgDwAA6wUAIBAAAOkFACARAADqBQAglQIBAAAAAZsCAQAAAAGcAkAAAAABnQJAAAAAAboCAAAA1QICvAIBAAAAAcwCAQAAAAECAAAAPAAgJgAA2AcAIBQDAAC0BgAgDQAAuQYAIA8AALoGACAVAAC2BgAgFgAAtwYAIBcAALgGACCVAgEAAAABnAJAAAAAAZ0CQAAAAAGvAgEAAAAB1QIBAAAAAdYCAQAAAAHXAgEAAAAB2AIIAAAAAdkCCAAAAAHaAgIAAAAB2wIgAAAAAdwCAQAAAAHdAgIAAAAB3gJAAAAAAQIAAACvAQAgJgAA2gcAIAyVAgEAAAABmwIBAAAAAZwCQAAAAAGdAkAAAAABtQIBAAAAAb4CIAAAAAHFAgAAAMUCAscCAAAAxwICyAIBAAAAAckCAQAAAAHKAkAAAAABywIIAAAAAQMAAAA6ACAmAADYBwAgJwAA3wcAIA4AAAA6ACAGAACnBQAgDQAAqQUAIA8AAKwFACAQAACqBQAgEQAAqwUAIB8AAN8HACCVAgEAoQQAIZsCAQChBAAhnAJAAKMEACGdAkAAowQAIboCAACmBdUCIrwCAQChBAAhzAIBAKEEACEMBgAApwUAIA0AAKkFACAPAACsBQAgEAAAqgUAIBEAAKsFACCVAgEAoQQAIZsCAQChBAAhnAJAAKMEACGdAkAAowQAIboCAACmBdUCIrwCAQChBAAhzAIBAKEEACEDAAAACwAgJgAA2gcAICcAAOIHACAWAAAACwAgAwAA8QUAIA0AAPYFACAPAAD3BQAgFQAA8wUAIBYAAPQFACAXAAD1BQAgHwAA4gcAIJUCAQChBAAhnAJAAKMEACGdAkAAowQAIa8CAQChBAAh1QIBAKEEACHWAgEAoQQAIdcCAQChBAAh2AIIAP0EACHZAggA_QQAIdoCAgDuBAAh2wIgAKIEACHcAgEApAQAId0CAgDuBAAh3gJAANYEACEUAwAA8QUAIA0AAPYFACAPAAD3BQAgFQAA8wUAIBYAAPQFACAXAAD1BQAglQIBAKEEACGcAkAAowQAIZ0CQACjBAAhrwIBAKEEACHVAgEAoQQAIdYCAQChBAAh1wIBAKEEACHYAggA_QQAIdkCCAD9BAAh2gICAO4EACHbAiAAogQAIdwCAQCkBAAh3QICAO4EACHeAkAA1gQAIQ8GAACgBQAgCAAAoQUAIJUCAQAAAAGZAgEAAAABmwIBAAAAAZwCQAAAAAGdAkAAAAABvAIBAAAAAcwCAQAAAAHNAkAAAAABzgJAAAAAAc8CQAAAAAHQAgEAAAAB0gIAAADSAgLTAgIAAAABAgAAAA8AICYAAOMHACAUAwAAtAYAIAcAALUGACANAAC5BgAgDwAAugYAIBYAALcGACAXAAC4BgAglQIBAAAAAZwCQAAAAAGdAkAAAAABrwIBAAAAAdUCAQAAAAHWAgEAAAAB1wIBAAAAAdgCCAAAAAHZAggAAAAB2gICAAAAAdsCIAAAAAHcAgEAAAAB3QICAAAAAd4CQAAAAAECAAAArwEAICYAAOUHACAQBAAAnwcAIAUAAKAHACALAACkBwAgFgAAowcAIBgAAKEHACAZAAClBwAglQIBAAAAAZwCQAAAAAGdAkAAAAABugIAAAD4AgLMAgEAAAAB7gIBAAAAAfMCAAAA8wIC9AIBAAAAAfUCIAAAAAH2AgEAAAABAgAAAAEAICYAAOcHACADAAAADQAgJgAA4wcAICcAAOsHACARAAAADQAgBgAAkQUAIAgAAJIFACAfAADrBwAglQIBAKEEACGZAgEAoQQAIZsCAQChBAAhnAJAAKMEACGdAkAAowQAIbwCAQCkBAAhzAIBAKEEACHNAkAAowQAIc4CQACjBAAhzwJAAKMEACHQAgEApAQAIdICAACQBdICItMCAgDuBAAhDwYAAJEFACAIAACSBQAglQIBAKEEACGZAgEAoQQAIZsCAQChBAAhnAJAAKMEACGdAkAAowQAIbwCAQCkBAAhzAIBAKEEACHNAkAAowQAIc4CQACjBAAhzwJAAKMEACHQAgEApAQAIdICAACQBdICItMCAgDuBAAhAwAAAAsAICYAAOUHACAnAADuBwAgFgAAAAsAIAMAAPEFACAHAADyBQAgDQAA9gUAIA8AAPcFACAWAAD0BQAgFwAA9QUAIB8AAO4HACCVAgEAoQQAIZwCQACjBAAhnQJAAKMEACGvAgEAoQQAIdUCAQChBAAh1gIBAKEEACHXAgEAoQQAIdgCCAD9BAAh2QIIAP0EACHaAgIA7gQAIdsCIACiBAAh3AIBAKQEACHdAgIA7gQAId4CQADWBAAhFAMAAPEFACAHAADyBQAgDQAA9gUAIA8AAPcFACAWAAD0BQAgFwAA9QUAIJUCAQChBAAhnAJAAKMEACGdAkAAowQAIa8CAQChBAAh1QIBAKEEACHWAgEAoQQAIdcCAQChBAAh2AIIAP0EACHZAggA_QQAIdoCAgDuBAAh2wIgAKIEACHcAgEApAQAId0CAgDuBAAh3gJAANYEACEDAAAAVAAgJgAA5wcAICcAAPEHACASAAAAVAAgBAAA1AYAIAUAANUGACALAADZBgAgFgAA2AYAIBgAANYGACAZAADaBgAgHwAA8QcAIJUCAQChBAAhnAJAAKMEACGdAkAAowQAIboCAADTBvgCIswCAQChBAAh7gIBAKQEACHzAgAA0gbzAiL0AgEAoQQAIfUCIACiBAAh9gIBAKQEACEQBAAA1AYAIAUAANUGACALAADZBgAgFgAA2AYAIBgAANYGACAZAADaBgAglQIBAKEEACGcAkAAowQAIZ0CQACjBAAhugIAANMG-AIizAIBAKEEACHuAgEApAQAIfMCAADSBvMCIvQCAQChBAAh9QIgAKIEACH2AgEApAQAIRAEAACfBwAgBQAAoAcAIAsAAKQHACAVAACiBwAgGAAAoQcAIBkAAKUHACCVAgEAAAABnAJAAAAAAZ0CQAAAAAG6AgAAAPgCAswCAQAAAAHuAgEAAAAB8wIAAADzAgL0AgEAAAAB9QIgAAAAAfYCAQAAAAECAAAAAQAgJgAA8gcAIBQDAAC0BgAgBwAAtQYAIA0AALkGACAPAAC6BgAgFQAAtgYAIBcAALgGACCVAgEAAAABnAJAAAAAAZ0CQAAAAAGvAgEAAAAB1QIBAAAAAdYCAQAAAAHXAgEAAAAB2AIIAAAAAdkCCAAAAAHaAgIAAAAB2wIgAAAAAdwCAQAAAAHdAgIAAAAB3gJAAAAAAQIAAACvAQAgJgAA9AcAIBAGAACIBQAgCgAAhwUAIBIAAIkFACCVAgEAAAABmwIBAAAAAZwCQAAAAAGdAkAAAAABtQIBAAAAAb4CIAAAAAHDAgEAAAABxQIAAADFAgLHAgAAAMcCAsgCAQAAAAHJAgEAAAABygJAAAAAAcsCCAAAAAECAAAAMQAgJgAA9gcAIAMAAABUACAmAADyBwAgJwAA-gcAIBIAAABUACAEAADUBgAgBQAA1QYAIAsAANkGACAVAADXBgAgGAAA1gYAIBkAANoGACAfAAD6BwAglQIBAKEEACGcAkAAowQAIZ0CQACjBAAhugIAANMG-AIizAIBAKEEACHuAgEApAQAIfMCAADSBvMCIvQCAQChBAAh9QIgAKIEACH2AgEApAQAIRAEAADUBgAgBQAA1QYAIAsAANkGACAVAADXBgAgGAAA1gYAIBkAANoGACCVAgEAoQQAIZwCQACjBAAhnQJAAKMEACG6AgAA0wb4AiLMAgEAoQQAIe4CAQCkBAAh8wIAANIG8wIi9AIBAKEEACH1AiAAogQAIfYCAQCkBAAhAwAAAAsAICYAAPQHACAnAAD9BwAgFgAAAAsAIAMAAPEFACAHAADyBQAgDQAA9gUAIA8AAPcFACAVAADzBQAgFwAA9QUAIB8AAP0HACCVAgEAoQQAIZwCQACjBAAhnQJAAKMEACGvAgEAoQQAIdUCAQChBAAh1gIBAKEEACHXAgEAoQQAIdgCCAD9BAAh2QIIAP0EACHaAgIA7gQAIdsCIACiBAAh3AIBAKQEACHdAgIA7gQAId4CQADWBAAhFAMAAPEFACAHAADyBQAgDQAA9gUAIA8AAPcFACAVAADzBQAgFwAA9QUAIJUCAQChBAAhnAJAAKMEACGdAkAAowQAIa8CAQChBAAh1QIBAKEEACHWAgEAoQQAIdcCAQChBAAh2AIIAP0EACHZAggA_QQAIdoCAgDuBAAh2wIgAKIEACHcAgEApAQAId0CAgDuBAAh3gJAANYEACEDAAAALwAgJgAA9gcAICcAAIAIACASAAAALwAgBgAA_wQAIAoAAP4EACASAACABQAgHwAAgAgAIJUCAQChBAAhmwIBAKEEACGcAkAAowQAIZ0CQACjBAAhtQIBAKEEACG-AiAAogQAIcMCAQChBAAhxQIAAPsExQIixwIAAPwExwIiyAIBAKQEACHJAgEApAQAIcoCQADWBAAhywIIAP0EACEQBgAA_wQAIAoAAP4EACASAACABQAglQIBAKEEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACG1AgEAoQQAIb4CIACiBAAhwwIBAKEEACHFAgAA-wTFAiLHAgAA_ATHAiLIAgEApAQAIckCAQCkBAAhygJAANYEACHLAggA_QQAIRQDAAC0BgAgBwAAtQYAIA8AALoGACAVAAC2BgAgFgAAtwYAIBcAALgGACCVAgEAAAABnAJAAAAAAZ0CQAAAAAGvAgEAAAAB1QIBAAAAAdYCAQAAAAHXAgEAAAAB2AIIAAAAAdkCCAAAAAHaAgIAAAAB2wIgAAAAAdwCAQAAAAHdAgIAAAAB3gJAAAAAAQIAAACvAQAgJgAAgQgAIAwGAADmBQAgBwAA5wUAIA8AAOsFACAQAADpBQAgEQAA6gUAIJUCAQAAAAGbAgEAAAABnAJAAAAAAZ0CQAAAAAG6AgAAANUCArwCAQAAAAHMAgEAAAABAgAAADwAICYAAIMIACAJlQIBAAAAAZ0CQAAAAAGzAgEAAAABtQIBAAAAAbYCAQAAAAG3AgIAAAABuAIBAAAAAboCAAAAugICuwJAAAAAAQMAAAALACAmAACBCAAgJwAAiAgAIBYAAAALACADAADxBQAgBwAA8gUAIA8AAPcFACAVAADzBQAgFgAA9AUAIBcAAPUFACAfAACICAAglQIBAKEEACGcAkAAowQAIZ0CQACjBAAhrwIBAKEEACHVAgEAoQQAIdYCAQChBAAh1wIBAKEEACHYAggA_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_QQAIdoCAgDuBAAh2wIgAKIEACHcAgEApAQAId0CAgDuBAAh3gJAANYEACEDAAAAGwAgJgAAqAgAICcAALEIACAKAAAAGwAgCAAAuAQAIB8AALEIACCVAgEAoQQAIZYCAQChBAAhmQIBAKEEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACGzAgEAoQQAIQgIAAC4BAAglQIBAKEEACGWAgEAoQQAIZkCAQChBAAhmwIBAKEEACGcAkAAowQAIZ0CQACjBAAhswIBAKEEACEDAAAAOgAgJgAAqggAICcAALQIACAOAAAAOgAgBgAApwUAIAcAAKgFACANAACpBQAgEAAAqgUAIBEAAKsFACAfAAC0CAAglQIBAKEEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACG6AgAApgXVAiK8AgEAoQQAIcwCAQChBAAhDAYAAKcFACAHAACoBQAgDQAAqQUAIBAAAKoFACARAACrBQAglQIBAKEEACGbAgEAoQQAIZwCQACjBAAhnQJAAKMEACG6AgAApgXVAiK8AgEAoQQAIcwCAQChBAAhCAQGAgUKAwtICAwAFBVGDxZHEBgMBBlMEwEDAAEBAwABCAMAAQcQBQwAEg0-Bw8_CxU2DxY5EBc9BgQGAAQIAAYMABEVMg8HBgAEBxEFDAAODRUHDykLEB4KESgNBAYABAgABgsZCAwACQIJAAcKAAEBCxoAAwgABgwADA8iCwMGAAQIAAYOIwoBDyQAAQgABgUHKgANKwAPLgAQLAARLQAEBgAECgABEgAFFDQQAwYABAoAARMADwEVNQAGB0AADUQAD0UAFUEAFkIAF0MAAQMAAQYETQAFTgALUQAVTwAWUAAZUgAAAAADDAAZLAAaLQAbAAAAAwwAGSwAGi0AGwEDAAEBAwABAwwAICwAIS0AIgAAAAMMACAsACEtACIBAwABAQMAAQMMACcsACgtACkAAAADDAAnLAAoLQApAAAAAwwALywAMC0AMQAAAAMMAC8sADAtADEBAwABAQMAAQUMADYsADktADpuADdvADgAAAAAAAUMADYsADktADpuADdvADgBBgAEAQYABAMMAD8sAEAtAEEAAAADDAA_LABALQBBAgYABAgABgIGAAQIAAYFDABGLABJLQBKbgBHbwBIAAAAAAAFDABGLABJLQBKbgBHbwBIAwYABAoAARIABQMGAAQKAAESAAUFDABPLABSLQBTbgBQbwBRAAAAAAAFDABPLABSLQBTbgBQbwBRAwYABAoAARMADwMGAAQKAAETAA8FDABYLABbLQBcbgBZbwBaAAAAAAAFDABYLABbLQBcbgBZbwBaAgYABAgABgIGAAQIAAYDDABhLABiLQBjAAAAAwwAYSwAYi0AYwIJAAcKAAECCQAHCgABBQwAaCwAay0AbG4AaW8AagAAAAAABQwAaCwAay0AbG4AaW8AagEIAAYBCAAGAwwAcSwAci0AcwAAAAMMAHEsAHItAHMBCAAGAQgABgMMAHgsAHktAHoAAAADDAB4LAB5LQB6AQMAAQEDAAEDDAB_LACAAS0AgQEAAAADDAB_LACAAS0AgQEDBgAECAAGDpcDCgMGAAQIAAYOnQMKAwwAhgEsAIcBLQCIAQAAAAMMAIYBLACHAS0AiAEaAgEbUwEcVgEdVwEeWAEgWgEhXBUiXRYjXwEkYRUlYhcoYwEpZAEqZRUuaBgvaRwwagIxawIybAIzbQI0bgI1cAI2chU3cx04dQI5dxU6eB47eQI8egI9exU-fh8_fyNAgAEDQYEBA0KCAQNDgwEDRIQBA0WGAQNGiAEVR4kBJEiLAQNJjQEVSo4BJUuPAQNMkAEDTZEBFU6UASZPlQEqUJcBK1GYAStSmwErU5wBK1SdAStVnwErVqEBFVeiASxYpAErWaYBFVqnAS1bqAErXKkBK12qARVerQEuX64BMmCwAQRhsQEEYrMBBGO0AQRktQEEZbcBBGa5ARVnugEzaLwBBGm-ARVqvwE0a8ABBGzBAQRtwgEVcMUBNXHGATtyxwEGc8gBBnTJAQZ1ygEGdssBBnfNAQZ4zwEVedABPHrSAQZ71AEVfNUBPX3WAQZ-1wEGf9gBFYAB2wE-gQHcAUKCAd0BBYMB3gEFhAHfAQWFAeABBYYB4QEFhwHjAQWIAeUBFYkB5gFDigHoAQWLAeoBFYwB6wFEjQHsAQWOAe0BBY8B7gEVkAHxAUWRAfIBS5IB8wEPkwH0AQ-UAfUBD5UB9gEPlgH3AQ-XAfkBD5gB-wEVmQH8AUyaAf4BD5sBgAIVnAGBAk2dAYICD54BgwIPnwGEAhWgAYcCTqEBiAJUogGJAhCjAYoCEKQBiwIQpQGMAhCmAY0CEKcBjwIQqAGRAhWpAZICVaoBlAIQqwGWAhWsAZcCVq0BmAIQrgGZAhCvAZoCFbABnQJXsQGeAl2yAZ8CB7MBoAIHtAGhAge1AaICB7YBowIHtwGlAge4AacCFbkBqAJeugGqAge7AawCFbwBrQJfvQGuAge-Aa8CB78BsAIVwAGzAmDBAbQCZMIBtQIIwwG2AgjEAbcCCMUBuAIIxgG5AgjHAbsCCMgBvQIVyQG-AmXKAcACCMsBwgIVzAHDAmbNAcQCCM4BxQIIzwHGAhXQAckCZ9EBygJt0gHLAgrTAcwCCtQBzQIK1QHOAgrWAc8CCtcB0QIK2AHTAhXZAdQCbtoB1gIK2wHYAhXcAdkCb90B2gIK3gHbAgrfAdwCFeAB3wJw4QHgAnTiAeECDeMB4gIN5AHjAg3lAeQCDeYB5QIN5wHnAg3oAekCFekB6gJ16gHsAg3rAe4CFewB7wJ27QHwAg3uAfECDe8B8gIV8AH1AnfxAfYCe_IB9wIT8wH4AhP0AfkCE_UB-gIT9gH7AhP3Af0CE_gB_wIV-QGAA3z6AYIDE_sBhAMV_AGFA339AYYDE_4BhwMT_wGIAxWAAosDfoECjAOCAYICjQMLgwKOAwuEAo8DC4UCkAMLhgKRAwuHApMDC4gClQMViQKWA4MBigKZAwuLApsDFYwCnAOEAY0CngMLjgKfAwuPAqADFZACowOFAZECpAOJAQ"
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
  review_summary: "review_summary",
  review_summary_count: "review_summary_count",
  review_summary_at: "review_summary_at",
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
  "meeting_link",
  "session_type",
  "capacity",
  "course_id"
];
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
  if (data.capacity !== void 0 && (!Number.isInteger(data.capacity) || data.capacity < 1)) {
    throw new Error("Capacity must be a whole number of at least 1");
  }
  const result = await prisma.courseSlot.create({
    data: { ...data, tutor_id: tutorProfile.id },
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
  if (data.capacity !== void 0 && (!Number.isInteger(data.capacity) || data.capacity < 1)) {
    throw new Error("Capacity must be a whole number of at least 1");
  }
  const result = await prisma.courseSlot.update({
    where: {
      id: slotId
    },
    data,
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
    session_type: z3.enum(["ONE_ON_ONE", "GROUP"]).optional(),
    capacity: z3.number().int().min(1, "Capacity must be at least 1").optional(),
    meeting_link: z3.string().optional().nullable()
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
    session_type: z3.enum(["ONE_ON_ONE", "GROUP"]).optional(),
    capacity: z3.number().int().min(1, "Capacity must be at least 1").optional(),
    meeting_link: z3.string().optional().nullable()
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

// src/modules/review/reviewSummary.service.ts
import { z as z4 } from "zod/v4";

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

// src/modules/review/reviewSummary.service.ts
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
var MIN_REVIEWS = 3;
var MIN_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1e3;
var SummarySchema = z4.object({
  summary: z4.string().describe(
    "Two or three sentences describing what students report about this tutor, in neutral third person."
  ),
  themes: z4.array(z4.string()).describe(
    "Short phrases (2-4 words) for points raised in more than one review."
  )
});
var SYSTEM = `You summarise student reviews of a tutor for other students who are deciding whether to book them.

Rules:
- Every statement must be supported by the reviews given. Never add detail that is not there.
- Only report a theme if it appears in more than one review. A single opinion is not a pattern.
- Include criticism where the reviews contain it. A summary that reports only praise misleads the reader.
- Write in neutral third person about the tutor. Do not address the reader and do not recommend or discourage booking.
- Do not name individual students.
- If the reviews are too thin or contradictory to summarise fairly, say so plainly in the summary field.`;
var generateSummaryForTutor = async (tutorId) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    select: { id: true, display_name: true }
  });
  if (!tutor) throw new Error("Tutor not found");
  const reviews = await prisma.review.findMany({
    where: { tutor_id: tutorId, status: "APPROVED" },
    select: { rating: true, comment: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    // A cap keeps the prompt bounded as a tutor accumulates reviews. The most
    // recent are the most relevant to someone booking now.
    take: 100
  });
  const usable = reviews.filter((r) => r.comment && r.comment.trim().length > 0);
  if (usable.length < MIN_REVIEWS) return null;
  const rendered = usable.map((r, i) => `Review ${i + 1} (${r.rating}/5 stars): ${r.comment.trim()}`).join("\n\n");
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 2e3,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Summarise these ${usable.length} reviews of ${tutor.display_name}.

${rendered}`
      }
    ],
    output_config: { format: zodOutputFormat(SummarySchema) }
  });
  const parsed = response.parsed_output;
  if (!parsed) throw new Error("Could not summarise the reviews");
  const text = parsed.themes.length ? `${parsed.summary}

Recurring themes: ${parsed.themes.join(", ")}.` : parsed.summary;
  await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: {
      review_summary: text,
      // Counted against ALL approved reviews, not just the ones with comments,
      // so the staleness check below lines up with `total_reviews`.
      review_summary_count: reviews.length,
      review_summary_at: /* @__PURE__ */ new Date()
    }
  });
  return { summary: text, reviewCount: reviews.length };
};
var refreshStaleSummaries = async (limit = 10) => {
  const cutoff = new Date(Date.now() - MIN_REFRESH_INTERVAL_MS);
  const candidates = await prisma.tutorProfile.findMany({
    where: {
      total_reviews: { gte: MIN_REVIEWS },
      OR: [
        { review_summary: null },
        { review_summary_at: { lt: cutoff } }
      ]
    },
    select: { id: true, total_reviews: true, review_summary_count: true },
    take: limit
  });
  const stale = candidates.filter(
    (t) => t.review_summary_count !== t.total_reviews
  );
  let updated = 0;
  let failed = 0;
  for (const tutor of stale) {
    try {
      const result = await generateSummaryForTutor(tutor.id);
      if (result) updated++;
    } catch (error) {
      failed++;
      console.error(`Review summary failed for tutor ${tutor.id}:`, error);
    }
  }
  return { considered: stale.length, updated, failed };
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
var refreshReviewSummary = async (req, res, next) => {
  try {
    const result = await generateSummaryForTutor(req.params?.id);
    if (!result) {
      return res.status(200).json({
        status: "success",
        message: `Not enough reviews to summarise (needs at least ${MIN_REVIEWS} with comments)`,
        summary: null
      });
    }
    res.status(200).json({
      status: "success",
      message: "Review summary regenerated",
      ...result
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
  deleteReview: deleteReview2,
  refreshReviewSummary
};

// src/modules/review/review.validation.ts
import { z as z5 } from "zod";
var createReviewSchema = z5.object({
  body: z5.object({
    booking_id: z5.string().min(1, "A booking is required"),
    rating: z5.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    comment: z5.string().optional().nullable()
  })
});
var updateReviewSchema = z5.object({
  body: z5.object({
    rating: z5.number().int().min(1).max(5).optional(),
    comment: z5.string().optional().nullable(),
    // Moderation only — the service permits this for administrators alone.
    status: z5.enum(["APPROVED", "REJECTED"]).optional()
  })
});

// src/modules/review/review.router.ts
var router4 = express4.Router();
router4.post("/", auth_default("STUDENT" /* student */), validateRequest(createReviewSchema), reviewController.createReview);
router4.get("/", auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */), reviewController.getAllReviews);
router4.get("/:id", auth_default("STUDENT" /* student */, "TUTOR" /* tutor */, "ADMIN" /* admin */), reviewController.getTutorReviewsById);
router4.get("/tutor/:id/public", reviewController.getPublicTutorReviews);
router4.post("/tutor/:id/summary", auth_default("ADMIN" /* admin */), reviewController.refreshReviewSummary);
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
import { z as z6 } from "zod";
var createBookingSchema = z6.object({
  body: z6.object({
    course_slot_id: z6.string().min(1, "A session slot is required"),
    tutor_id: z6.string().min(1, "A tutor is required")
  })
});
var updateBookingSchema = z6.object({
  body: z6.object({
    booking_status: z6.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"])
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
import { z as z7 } from "zod";
var updateUserStatusSchema = z7.object({
  body: z7.object({
    status: z7.enum(["ACTIVE", "BANNED"])
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
import { z as z8 } from "zod";
var createCheckoutSessionSchema = z8.object({
  body: z8.object({
    bookingId: z8.string().min(1, "A booking is required")
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
import { z as z9 } from "zod";
var createAssignmentSchema = z9.object({
  body: z9.object({
    title: z9.string().min(1, "Title is required"),
    description: z9.string().min(1, "Description is required"),
    course_id: z9.string().min(1, "A course must be selected"),
    due_date: z9.string().optional().nullable()
  })
});
var submitAssignmentSchema = z9.object({
  body: z9.object({
    file_url: z9.string().min(1, "A file is required to submit"),
    note: z9.string().optional().nullable()
  })
});
var gradeSubmissionSchema = z9.object({
  body: z9.object({
    grade: z9.number().int("Grade must be a whole number").min(0, "Grade cannot be negative").max(100, "Grade cannot exceed 100"),
    feedback: z9.string().optional().nullable()
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
var MaterialController = {
  createMaterial: createMaterial2,
  getMaterials: getMaterials2,
  deleteMaterial: deleteMaterial2
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
  let reviewSummaries = null;
  if (aiConfigured()) {
    try {
      reviewSummaries = await refreshStaleSummaries();
    } catch (error) {
      console.error("Review summary refresh failed:", error);
    }
  }
  return { sessionReminders, assignmentReminders, reviewSummaries };
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
var MAX_FILE_BYTES = 10 * 1024 * 1024;
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
var SYSTEM2 = `You write practice questions from a tutor's own course material, for their students to revise with.

Rules:
- Every question must be answerable from the supplied material alone. Do not draw on outside knowledge.
- Cover different parts of the material rather than clustering on one section.
- Mix recall and application. Questions that only ask for a definition make weak practice.
- For "mcq", give exactly four options, with exactly one correct. Wrong options must be plausible, not filler.
- For "short_answer", leave options empty and make the expected answer specific enough to mark.
- The explanation says why the answer is right, in one or two sentences, grounded in the material.
- If the material is too short or too thin to support ${QUESTION_COUNT} good questions, return fewer rather than padding.`;
var getTutorProfileOrThrow4 = async (userId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userId }
  });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  return tutorProfile;
};
var buildSourceBlock = async (fileUrl, title) => {
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error("Could not download the material file");
  const contentType = (res.headers.get("content-type") || "").split(";")[0].trim();
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new Error(
      `This material is too large to generate from (limit ${MAX_FILE_BYTES / 1024 / 1024}MB)`
    );
  }
  if (contentType === "application/pdf" || fileUrl.toLowerCase().endsWith(".pdf")) {
    return {
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: buffer.toString("base64")
      },
      title
    };
  }
  const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
  if (IMAGE_TYPES.includes(contentType)) {
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: contentType,
        data: buffer.toString("base64")
      }
    };
  }
  if (contentType.startsWith("text/") || /\.(txt|md|csv)$/i.test(fileUrl)) {
    return { type: "text", text: buffer.toString("utf-8").slice(0, 2e5) };
  }
  throw new Error(
    "Practice questions can only be generated from a PDF, an image, or a text file"
  );
};
var generateFromMaterial = async (materialId, userId) => {
  const tutorProfile = await getTutorProfileOrThrow4(userId);
  const material = await prisma.courseMaterial.findUnique({
    where: { id: materialId },
    include: { course: { select: { id: true, tutor_id: true, name: true } } }
  });
  if (!material) throw new Error("Material not found");
  if (material.course.tutor_id !== tutorProfile.id) {
    throw new Error("Forbidden! You can only generate from your own materials");
  }
  if (!aiConfigured()) {
    throw new Error("AI features are not configured (missing ANTHROPIC_API_KEY)");
  }
  const recent = await prisma.practiceSet.count({
    where: {
      tutor_id: tutorProfile.id,
      createdAt: { gt: new Date(Date.now() - 60 * 60 * 1e3) }
    }
  });
  if (recent >= HOURLY_GENERATION_LIMIT) {
    throw new Error(
      `You have reached the limit of ${HOURLY_GENERATION_LIMIT} generations per hour. Try again later.`
    );
  }
  const sourceBlock = await buildSourceBlock(material.file_url, material.title);
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
      tutor_id: tutorProfile.id,
      is_published: false
    },
    include: { course: { select: { name: true } } }
  });
};
var getPracticeSets = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");
  if (user.role === "TUTOR") {
    const tutorProfile = await getTutorProfileOrThrow4(userId);
    return prisma.practiceSet.findMany({
      where: { tutor_id: tutorProfile.id },
      include: {
        course: { select: { name: true } },
        material: { select: { title: true } }
      },
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
      where: { course_id: { in: courseIds }, is_published: true },
      include: {
        course: { select: { name: true } },
        material: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  return prisma.practiceSet.findMany({
    include: {
      course: { select: { name: true } },
      material: { select: { title: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};
var ownedSetOrThrow = async (id, userId) => {
  const tutorProfile = await getTutorProfileOrThrow4(userId);
  const set = await prisma.practiceSet.findUnique({ where: { id } });
  if (!set) throw new Error("Practice set not found");
  if (set.tutor_id !== tutorProfile.id) {
    throw new Error("Forbidden! Not your practice set");
  }
  return set;
};
var updatePracticeSet = async (id, userId, payload) => {
  await ownedSetOrThrow(id, userId);
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
    include: { course: { select: { name: true } } }
  });
};
var deletePracticeSet = async (id, userId) => {
  await ownedSetOrThrow(id, userId);
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
      message: "Draft practice questions generated. Review them before publishing.",
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
  auth_default("TUTOR" /* tutor */),
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
router16.delete("/:id", auth_default("TUTOR" /* tutor */), PracticeController.deletePracticeSet);
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
