import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const sendImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Here you can store the storageId in your database alongside other data
    // For example, if you have a 'messages' table:
    // await ctx.db.insert("messages", { body: args.storageId });
    console.log("Image uploaded with storageId:", args.storageId);
  },
});
