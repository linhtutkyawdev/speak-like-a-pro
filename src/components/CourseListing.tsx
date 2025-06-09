import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Id } from "../../convex/_generated/dataModel";

interface CourseListingProps {
  courses: any[] | undefined;
  handleEditCourse: (course: any) => void;
  handleDeleteCourse: (courseId: Id<"courses">) => void;
}

const CourseListing: React.FC<CourseListingProps> = ({
  courses,
  handleEditCourse,
  handleDeleteCourse,
}) => {
  return (
    <Card className="shadow-xl border border-green-100 transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="bg-green-50 border-b border-green-100">
        <CardTitle className="text-2xl font-bold text-green-800">
          Course Listing
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-6 text-green-700">
          Existing Courses
        </h3>
        <Table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <TableHeader className="bg-green-50">
            <TableRow>
              <TableHead className="py-3 px-4 text-left text-green-800 font-bold">
                Title
              </TableHead>
              <TableHead className="py-3 px-4 text-left text-green-800 font-bold">
                Category
              </TableHead>
              <TableHead className="py-3 px-4 text-left text-green-800 font-bold">
                Level
              </TableHead>
              <TableHead className="py-3 px-4 text-left text-green-800 font-bold">
                Lessons
              </TableHead>
              <TableHead className="py-3 px-4 text-left text-green-800 font-bold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses?.map((course) => (
              <TableRow key={course._id} className="hover:bg-green-50">
                <TableCell className="py-3 px-4 font-medium text-gray-800">
                  {course.title}
                </TableCell>
                <TableCell className="py-3 px-4 text-gray-700">
                  {course.category}
                </TableCell>
                <TableCell className="py-3 px-4 text-gray-700">
                  {course.level}
                </TableCell>
                <TableCell className="py-3 px-4 text-gray-700">
                  {course.lessonCount || 0}
                </TableCell>
                <TableCell className="py-3 px-4 flex">
                  <Button
                    onClick={() => handleEditCourse(course)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm mr-2 transition-colors duration-200"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors duration-200"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!courses ||
              (courses.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    No courses found.
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CourseListing;
