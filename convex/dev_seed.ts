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
      let course = await ctx.db
        .query("courses")
        .withIndex("by_title", (q) => q.eq("title", courseData.title))
        .unique();

      let courseId;
      if (course) {
        // Update existing course
        await ctx.db.patch(course._id, {
          description: courseData.description,
          imageUrl: courseData.imageUrl,
          category: courseData.category,
          level: courseData.level,
          duration: courseData.duration,
          rating: courseData.rating,
          skills: courseData.skills,
          featured: courseData.featured,
          updatedAt: Date.now(),
        });
        courseId = course._id;
      } else {
        // Insert new course
        courseId = await ctx.db.insert("courses", {
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
      }

      for (const lessonData of courseData.lessons) {
        let lesson = await ctx.db
          .query("lessons")
          .withIndex("by_course_id_and_title", (q) =>
            q.eq("courseId", courseId).eq("title", lessonData.title)
          )
          .unique();

        const sentencesWithWordCount = lessonData.sentences.map((s) => {
          const cleanedText = s.text
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .replace(/\s{2,}/g, " ");
          return {
            text: s.text,
            wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
          };
        });

        if (lesson) {
          // Update existing lesson
          await ctx.db.patch(lesson._id, {
            sentences: sentencesWithWordCount,
            phrases: lessonData.phrases,
            updatedAt: Date.now(),
          });
        } else {
          // Insert new lesson
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
    }
    return { success: true };
  },
});
