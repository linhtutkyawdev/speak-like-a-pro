/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as clerkActions from "../clerkActions.js";
import type * as courses from "../courses.js";
import type * as dev_seed from "../dev_seed.js";
import type * as dev_tools from "../dev_tools.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as lessons from "../lessons.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  clerkActions: typeof clerkActions;
  courses: typeof courses;
  dev_seed: typeof dev_seed;
  dev_tools: typeof dev_tools;
  files: typeof files;
  http: typeof http;
  lessons: typeof lessons;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
