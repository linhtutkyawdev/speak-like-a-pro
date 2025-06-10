import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const createLesson = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    sentences: v.array(v.object({ text: v.string(), wordCount: v.number() })),
    phrases: v.array(v.object({ text: v.string(), wordCount: v.number() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userRole = await ctx.runQuery(api.users.getUserRole, {
      clerkUserId: identity.subject,
    });

    if (userRole !== "admin" && userRole !== "instructor") {
      throw new Error(
        "Unauthorized: Only admins and instructors can create lessons."
      );
    }

    // Calculate wordCount for each sentence, excluding punctuation
    const sentencesWithWordCount = args.sentences.map((s) => {
      const cleanedText = s.text
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ");
      return {
        text: s.text,
        wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
      };
    });

    const phrasesWithWordCount = args.phrases.map((p) => {
      const cleanedText = p.text
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ");
      return {
        text: p.text,
        wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
      };
    });

    const newLessonId = await ctx.db.insert("lessons", {
      courseId: args.courseId,
      title: args.title,
      sentences: sentencesWithWordCount,
      phrases: phrasesWithWordCount,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return newLessonId;
  },
});

export const getLessonsByCourseId = query({
  args: { courseId: v.optional(v.id("courses")) },
  handler: async (ctx, args) => {
    if (!args.courseId) {
      return [];
    }
    return await ctx.db
      .query("lessons")
      .withIndex("by_course_id", (q) => q.eq("courseId", args.courseId!))
      .order("asc") // Order by _creationTime by default, which is equivalent to createdAt for new documents
      .collect();
  },
});

export const getLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
});

export const listAllLessons = query({
  handler: async (ctx) => {
    return await ctx.db.query("lessons").collect();
  },
});

export const updateLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    sentences: v.optional(
      v.array(v.object({ text: v.string(), wordCount: v.number() }))
    ),
    phrases: v.optional(
      v.array(v.object({ text: v.string(), wordCount: v.number() }))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userRole = await ctx.runQuery(api.users.getUserRole, {
      clerkUserId: identity.subject,
    });

    if (userRole !== "admin" && userRole !== "instructor") {
      throw new Error(
        "Unauthorized: Only admins and instructors can update lessons."
      );
    }

    const { lessonId, sentences, phrases, ...rest } = args;
    let updates: any = { ...rest, updatedAt: Date.now() };

    if (sentences) {
      updates.sentences = sentences.map((s) => {
        const cleanedText = s.text
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
          .replace(/\s{2,}/g, " ");
        return {
          text: s.text,
          wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
        };
      });
    }

    if (phrases) {
      updates.phrases = phrases.map((p) => {
        const cleanedText = p.text
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
          .replace(/\s{2,}/g, " ");
        return {
          text: p.text,
          wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
        };
      });
    }

    await ctx.db.patch(lessonId, updates);
  },
});

export const deleteLesson = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userRole = await ctx.runQuery(api.users.getUserRole, {
      clerkUserId: identity.subject,
    });

    if (userRole !== "admin" && userRole !== "instructor") {
      throw new Error(
        "Unauthorized: Only admins and instructors can delete lessons."
      );
    }

    await ctx.db.delete(args.lessonId);
  },
});
