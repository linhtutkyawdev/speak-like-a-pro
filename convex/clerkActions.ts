import { action } from "./_generated/server";

export const listClerkUsers = action({
  handler: async (ctx) => {
    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

    if (!CLERK_SECRET_KEY) {
      throw new Error("CLERK_SECRET_KEY environment variable not set.");
    }

    const response = await fetch("https://api.clerk.com/v1/users", {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch Clerk users: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const users = await response.json();
    // Extract relevant user data, including the profile_image_url for the avatar
    const usersWithAvatar = users.map((user: any) => ({
      id: user.id,
      emailAddresses: user.email_addresses,
      firstName: user.first_name,
      lastName: user.last_name,
      profileImageUrl: user.profile_image_url, // Include avatar URL
      // Add other fields as needed
    }));
    return usersWithAvatar;
  },
});

export const deleteClerkUser = action({
  handler: async (ctx, args) => {
    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

    if (!CLERK_SECRET_KEY) {
      throw new Error("CLERK_SECRET_KEY environment variable not set.");
    }

    const { userId } = args;

    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to delete Clerk user: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return { success: true };
  },
});
