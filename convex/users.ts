import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    clerkUserId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const newUser = await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      role: args.role,
      totalPoints: 0, // Initialize totalPoints for new users
    });
    return newUser;
  },
});

export const getUserRole = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .first();
    return user ? user.role : null;
  },
});

export const listUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getClerkUserById = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .first();
    return user;
  },
});

export const updateUserRole = mutation({
  args: {
    clerkUserId: v.string(),
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .first();

    if (user) {
      await ctx.db.patch(user._id, { role: args.newRole });
      return true;
    }
    return false;
  },
});

export const deleteUser = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .first();

    if (user) {
      await ctx.db.delete(user._id);
      return true;
    }
    return false;
  },
});

export const getUserProfile = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .first();
    return user;
  },
});

export const getUserProgress = query({
  args: {
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", user._id).eq("lessonId", args.lessonId)
      )
      .first();

    return userProgress
      ? {
          ...userProgress,
          completedPhrases: userProgress.completedPhrases || [],
          completedSentences: userProgress.completedSentences || [],
        }
      : null;
  },
});

export const listUserProgressForCourse = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // Not authenticated, no progress to show
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .first();

    if (!user) {
      return null; // User not found, no progress to show
    }

    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId)
      )
      .collect();

    return userProgress;
  },
});

export const listAllUserProgress = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Not authenticated, no progress to show
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .first();

    if (!user) {
      return []; // User not found, no progress to show
    }

    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_lesson", (q) => q.eq("userId", user._id))
      .order("desc") // Order by _creationTime or lastPracticedAt if available
      .collect();

    return userProgress;
  },
});

export const updateUserProgress = mutation({
  args: {
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    completedContentCount: v.number(),
    pointsEarned: v.number(), // New field for points earned in this session
    contentIndex: v.number(), // New field to track which content item was completed
    contentType: v.union(v.literal("phrase"), v.literal("sentence")), // New field to specify content type
    practiceDurationSeconds: v.optional(v.number()), // Changed to seconds
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const existingProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", user._id).eq("lessonId", args.lessonId)
      )
      .first();

    const currentTime = Date.now();

    if (existingProgress) {
      let updatedCompletedPhrases = existingProgress.completedPhrases || [];
      let updatedCompletedSentences = existingProgress.completedSentences || [];
      let pointsAdded = false;

      if (args.contentType === "phrase") {
        if (!updatedCompletedPhrases.includes(args.contentIndex)) {
          updatedCompletedPhrases.push(args.contentIndex);
          pointsAdded = true;
        }
      } else if (args.contentType === "sentence") {
        if (!updatedCompletedSentences.includes(args.contentIndex)) {
          updatedCompletedSentences.push(args.contentIndex);
          pointsAdded = true;
        }
      }

      if (pointsAdded) {
        await ctx.db.patch(user._id, {
          totalPoints: user.totalPoints + args.pointsEarned,
        });
      }

      await ctx.db.patch(existingProgress._id, {
        completedContentCount: args.completedContentCount,
        lastPracticedAt: currentTime,
        completedPhrases: updatedCompletedPhrases,
        completedSentences: updatedCompletedSentences,
        practiceDurationSeconds:
          (existingProgress.practiceDurationSeconds || 0) +
          (args.practiceDurationSeconds || 0),
      });
      return existingProgress._id;
    } else {
      await ctx.db.patch(user._id, {
        totalPoints: user.totalPoints + args.pointsEarned,
      });
      const newProgress = await ctx.db.insert("userProgress", {
        userId: user._id,
        lessonId: args.lessonId,
        courseId: args.courseId,
        completedContentCount: args.completedContentCount,
        lastPracticedAt: currentTime,
        completedPhrases:
          args.contentType === "phrase" ? [args.contentIndex] : [],
        completedSentences:
          args.contentType === "sentence" ? [args.contentIndex] : [],
        practiceDurationSeconds: args.practiceDurationSeconds || 0,
      });
      return newProgress;
    }
  },
});
