import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import AppHeader from "@/components/AppHeader";
import AppHeaderRightContent from "@/components/AppHeaderRightContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ClerkUser {
  id: string;
  firstName: string;
  lastName: string;
  emailAddresses: { email_address: string }[];
  profileImageUrl: string;
}

import { Input } from "@/components/ui/input";
import { deleteUser } from "convex/users";

const UserManagement = () => {
  const navigate = useNavigate();
  const convexUsers = useQuery(api.users.listUsers);
  const listClerkUsers = useAction(api.clerkActions.listClerkUsers);
  const updateUserRole = useMutation(api.users.updateUserRole);
  const deleteClerkUser = useAction(api.clerkActions.deleteClerkUser);
  const deleteUser = useMutation(api.users.deleteUser);
  // const getClerkUserById = useQuery(api.users.getClerkUserById); // Not directly used here

  const [clerkUsers, setClerkUsers] = useState<ClerkUser[]>([]);
  const [loadingClerkUsers, setLoadingClerkUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClerkUsers = async () => {
      try {
        setLoadingClerkUsers(true);
        const users = await listClerkUsers();
        setClerkUsers(users);
      } catch (error: any) {
        toast.error("Failed to fetch Clerk users: " + error.message);
      } finally {
        setLoadingClerkUsers(false);
      }
    };
    fetchClerkUsers();
  }, [listClerkUsers]);

  const handleUserRoleChange = async (clerkUserId: string, newRole: string) => {
    try {
      await updateUserRole({ clerkUserId, newRole });
      toast.success("User role updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update user role: " + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteClerkUser({ userId });
      await deleteUser({ clerkUserId: userId });
      toast.success("User deleted successfully!");
      // Refresh the user list
      const users = await listClerkUsers();
      setClerkUsers(users);
    } catch (error: any) {
      toast.error("Failed to delete user: " + error.message);
    }
  };

  if (loadingClerkUsers || convexUsers === undefined) {
    return <LoadingSpinner />;
  }

  const combinedUsers = convexUsers
    .map((convexUser) => {
      const clerkUser = clerkUsers?.find(
        (u) => u.id === convexUser.clerkUserId
      );
      return {
        clerkId: clerkUser?.id,
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
        email:
          clerkUser?.emailAddresses && clerkUser?.emailAddresses.length > 0
            ? clerkUser?.emailAddresses[0].email_address
            : "N/A",
        profileImageUrl: clerkUser?.profileImageUrl,
        role: convexUser?.role || "student", // Default to 'student' if no role in Convex
      };
    })
    .filter((user) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
      if (lowerCaseSearchTerm === "") return true; // Show all users if search term is empty

      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();

      // Split the search term by spaces and check if all parts are included in the full name or email
      const searchTerms = lowerCaseSearchTerm
        .split(" ")
        .filter((term) => term !== "");

      return searchTerms.every(
        (term) => fullName.includes(term) || email.includes(term)
      );
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <AppHeader fullWidth rightContent={<AppHeaderRightContent />} />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        </div>

        <Card className="shadow-xl border border-green-100 transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="bg-green-50 border-b border-green-100 flex flex-row justify-between items-center">
            <CardTitle className="text-2xl font-bold text-green-800 flex w-full justify-between">
              User Roles
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
              <TableHeader className="bg-green-50">
                <TableRow>
                  <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Avatar
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Role
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedUsers.map((user) => (
                  <TableRow key={user.clerkId}>
                    <TableCell className="py-3 px-4">
                      <Avatar>
                        <AvatarImage src={user.profileImageUrl} />
                      </Avatar>
                    </TableCell>
                    <TableCell className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </TableCell>
                    <TableCell className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                      <Select
                        value={user.role}
                        onValueChange={(newRole) =>
                          handleUserRoleChange(user.clerkId, newRole)
                        }
                      >
                        <SelectTrigger className="w-[180px] bg-white border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="instructor">Instructor</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteUser(user.clerkId)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
