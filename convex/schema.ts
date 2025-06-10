import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    clerkUserId: v.string(),
    role: v.string(), // e.g., "admin", "instructor", "student"
    totalPoints: v.number(), // New field for accumulated points
  }).index("by_clerk_user_id", ["clerkUserId"]),
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.union(v.string(), v.null())), // Allow string (storageId) or null
    category: v.string(),
    level: v.string(),
    duration: v.string(),
    rating: v.number(),
    skills: v.array(v.string()),
    featured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_level", ["level"])
    .index("by_category_level", ["category", "level"])
    .index("by_rating", ["rating"])
    .index("by_title", ["title"]),
  lessons: defineTable({
    courseId: v.id("courses"),
    title: v.string(), // Add a title for the lesson
    sentences: v.array(v.object({ text: v.string(), wordCount: v.number() })), // Store sentence text and its word count
    phrases: v.array(v.object({ text: v.string(), wordCount: v.number() })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course_id", ["courseId"])
    .index("by_title", ["title"])
    .index("by_course_id_and_title", ["courseId", "title"]),

  userProgress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    completedContentCount: v.number(),
    lastPracticedAt: v.number(),
    completedPhrases: v.array(v.number()), // Store indices of phrases for which points have been awarded
    completedSentences: v.array(v.number()), // Store indices of sentences for which points have been awarded
    practiceDurationSeconds: v.optional(v.number()), // Changed to seconds
  })
    .index("by_user_lesson", ["userId", "lessonId"])
    .index("by_user_course", ["userId", "courseId"]),
});

export default schema;
