import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const seedCourses = mutation({
  args: {
    coursesData: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        imageUrl: v.union(v.string(), v.null()),
        category: v.string(),
        level: v.string(),
        duration: v.string(),
        rating: v.number(),
        skills: v.array(v.string()),
        featured: v.boolean(),
        lessons: v.array(
          v.object({
            title: v.string(),
            sentences: v.array(
              v.object({ text: v.string(), wordCount: v.number() })
            ),
            phrases: v.array(v.string()),
          })
        ),
      })
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

    if (userRole !== "admin") {
      throw new Error("Unauthorized: Only admins can seed data.");
    }

    for (const courseData of args.coursesData) {
      const courseId = await ctx.db.insert("courses", {
        title: courseData.title,
        description: courseData.description,
        imageUrl: courseData.imageUrl,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        rating: courseData.rating,
        skills: courseData.skills,
        featured: courseData.featured,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      for (const lessonData of courseData.lessons) {
        // Calculate wordCount for each sentence, excluding punctuation
        const sentencesWithWordCount = lessonData.sentences.map((s) => {
          const cleanedText = s.text
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .replace(/\s{2,}/g, " ");
          return {
            text: s.text,
            wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
          };
        });

        await ctx.db.insert("lessons", {
          courseId: courseId,
          title: lessonData.title,
          sentences: sentencesWithWordCount,
          phrases: lessonData.phrases,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
    return { success: true };
  },
});
