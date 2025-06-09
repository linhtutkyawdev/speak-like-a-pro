import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api"; // Import api

export const devTools = mutation({
  args: {
    action: v.string(),
    payload: v.any(),
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
      throw new Error("Unauthorized: Only admins can use dev tools.");
    }

    switch (args.action) {
      case "clearAllTables":
        // This is a dangerous operation, only enable in development
        if (process.env.NODE_ENV === "development") {
          const tables = ["courses", "lessons", "userProgress"]; // Manually list tables to clear
          for (const table of tables) {
            const records = await ctx.db.query(table as any).collect();
            for (const record of records) {
              await ctx.db.delete(record._id);
            }
          }
          return {
            success: true,
            message: "All tables cleared (except users).",
          };
        } else {
          throw new Error(
            "This action is only allowed in development environment."
          );
        }
      case "seedCourses":
        if (process.env.NODE_ENV === "development") {
          await ctx.runMutation(api.dev_seed.seedCourses, {
            coursesData: args.payload.coursesData,
          });
          return { success: true, message: "Courses seeded successfully." };
        } else {
          throw new Error(
            "This action is only allowed in development environment."
          );
        }
      default:
        throw new Error(`Unknown action: ${args.action}`);
    }
  },
});
