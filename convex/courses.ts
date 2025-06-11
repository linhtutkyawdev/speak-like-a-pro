import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api"; // Import the api object

export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    category: v.string(),
    level: v.string(),
    duration: v.string(),
    rating: v.number(),
    skills: v.array(v.string()),
    featured: v.boolean(),
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
        "Unauthorized: Only admins and instructors can create courses."
      );
    }

    const newCourseId = await ctx.db.insert("courses", {
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl, // This will now be the storageId or null
      category: args.category,
      level: args.level,
      duration: args.duration,
      rating: args.rating,
      skills: args.skills,
      featured: args.featured,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return newCourseId;
  },
});

export const getCourses = query({
  args: {
    level: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
    category: v.optional(v.string()),
    skills: v.optional(v.array(v.string())), // New: Optional array of skills
    minRating: v.optional(v.number()), // New: Optional minimum rating
  },
  handler: async (ctx, args) => {
    let courses;

    // Prioritize indexed queries
    if (args.category && args.level) {
      courses = await ctx.db
        .query("courses")
        .withIndex("by_category_level", (q) =>
          q.eq("category", args.category!).eq("level", args.level!)
        )
        .collect();
    } else if (args.category) {
      courses = await ctx.db
        .query("courses")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.level) {
      courses = await ctx.db
        .query("courses")
        .withIndex("by_level", (q) => q.eq("level", args.level!))
        .collect();
    } else if (args.minRating !== undefined) {
      // If only minRating is provided, use its index
      courses = await ctx.db
        .query("courses")
        .withIndex("by_rating", (q) => q.gte("rating", args.minRating!))
        .collect();
    } else {
      // Fallback to full table scan if no specific indexed filters are applied
      courses = await ctx.db.query("courses").collect();
    }

    const filteredCourses = courses.filter((course) => {
      const matchesSearch = args.searchTerm
        ? course.title.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
          course.description
            .toLowerCase()
            .includes(args.searchTerm.toLowerCase())
        : true;

      const matchesSkills =
        args.skills && args.skills.length > 0
          ? args.skills.some((skill) => course.skills.includes(skill))
          : true;

      // This condition ensures that if minRating was already used as the primary index,
      // we don't re-filter it here. Otherwise, we apply the filter.
      const minRatingAlreadyAppliedByIndex =
        args.minRating !== undefined && !args.category && !args.level; // This means minRating was the *only* filter used for the initial query

      const matchesRating = minRatingAlreadyAppliedByIndex
        ? true // Already filtered by index
        : args.minRating !== undefined
          ? course.rating >= args.minRating
          : true;

      return matchesSearch && matchesSkills && matchesRating;
    });

    return Promise.all(
      filteredCourses.map(async (course) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_course_id", (q) => q.eq("courseId", course._id))
          .collect();
        return {
          ...course,
          imageUrl:
            course.imageUrl && course.imageUrl !== ""
              ? await ctx.storage.getUrl(course.imageUrl)
              : null,
          lessonCount: lessons.length,
          totalCourseContent: lessons.reduce(
            (sum, lesson) =>
              sum +
              (lesson.phrases?.length || 0) +
              (lesson.sentences?.length || 0),
            0
          ),
        };
      })
    );
  },
});

export const listAllCourses = query({
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();
    return Promise.all(
      courses.map(async (course) => ({
        ...course,
        imageUrl:
          course.imageUrl && course.imageUrl !== ""
            ? await ctx.storage.getUrl(course.imageUrl)
            : null,
      }))
    );
  },
});

export const getCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return null;
    }
    return {
      ...course,
      imageUrl:
        course.imageUrl && course.imageUrl !== ""
          ? await ctx.storage.getUrl(course.imageUrl)
          : null,
    };
  },
});

export const getTotalCourses = query({
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();
    return courses.length;
  },
});

export const getTotalCoursesByLevel = query({
  args: { level: v.string() },
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_level", (q) => q.eq("level", args.level))
      .collect();
    return courses.length;
  },
});

export const getTotalDurationByLevel = query({
  args: { level: v.string() },
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_level", (q) => q.eq("level", args.level))
      .collect();

    let totalMonths = 0;
    for (const course of courses) {
      const durationMatch = course.duration.match(/(\d+)\s*months?/i);
      if (durationMatch && durationMatch[1]) {
        totalMonths += parseInt(durationMatch[1], 10);
      }
    }
    return totalMonths;
  },
});

export const getCourseByTitle = query({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_title", (q) => q.eq("title", args.title))
      .unique();
  },
});

export const updateCourse = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.union(v.string(), v.null())), // Allow string (storageId) or null
    category: v.optional(v.string()),
    level: v.optional(v.string()),
    duration: v.optional(v.string()),
    rating: v.optional(v.number()),
    skills: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
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
        "Unauthorized: Only admins and instructors can update courses."
      );
    }

    const { courseId, imageUrl, ...rest } = args;
    await ctx.db.patch(courseId, {
      ...rest,
      imageUrl: imageUrl,
      updatedAt: Date.now(),
    });
  },
});

export const deleteCourse = mutation({
  args: { courseId: v.id("courses") },
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
        "Unauthorized: Only admins and instructors can delete courses."
      );
    }

    await ctx.db.delete(args.courseId);
  },
});
