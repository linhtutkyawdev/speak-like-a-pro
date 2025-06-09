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
  },
  handler: async (ctx, args) => {
    let courses;

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
    } else {
      courses = await ctx.db.query("courses").collect();
    }

    const filteredCourses = courses.filter((course) => {
      const matchesSearch = args.searchTerm
        ? course.title.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
          course.description
            .toLowerCase()
            .includes(args.searchTerm.toLowerCase())
        : true;
      return matchesSearch;
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
          lessonCount: lessons.length, // Add the lesson count
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
