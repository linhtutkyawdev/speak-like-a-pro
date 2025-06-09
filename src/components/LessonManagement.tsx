import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Id } from "../../convex/_generated/dataModel";

interface LessonManagementProps {
  editingCourse: any;
  getLessonsByCourseId: any[] | undefined;
  newLesson: {
    title: string;
    sentences: { text: string; wordCount: number }[];
    phrases: string[];
  };
  editingLesson: any;
  setNewLesson: React.Dispatch<
    React.SetStateAction<{
      title: string;
      sentences: { text: string; wordCount: number }[];
      phrases: string[];
    }>
  >;
  setEditingLesson: React.Dispatch<React.SetStateAction<any>>;
  createLesson: (args: {
    courseId: Id<"courses">;
    title: string;
    sentences: { text: string; wordCount: number }[];
    phrases: string[];
  }) => Promise<Id<"lessons">>;
  updateLesson: (args: {
    lessonId: Id<"lessons">;
    title?: string;
    sentences?: { text: string; wordCount: number }[];
    phrases?: string[];
  }) => Promise<void>;
  deleteLesson: (args: { lessonId: Id<"lessons"> }) => Promise<void>;
}

const LessonManagement: React.FC<LessonManagementProps> = ({
  editingCourse,
  getLessonsByCourseId,
  newLesson,
  editingLesson,
  setNewLesson,
  setEditingLesson,
  createLesson,
  updateLesson,
  deleteLesson,
}) => {
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) {
      alert("Please select a course to add lessons to.");
      return;
    }
    try {
      const sentencesForConvex = newLesson.sentences.map((s) => ({
        text: s.text,
        wordCount: s.wordCount,
      }));
      const phrasesArray = newLesson.phrases
        .map((p) => p.trim())
        .filter(Boolean);

      await createLesson({
        courseId: editingCourse._id,
        title: newLesson.title,
        sentences: sentencesForConvex,
        phrases: phrasesArray,
      });
      alert("Lesson created successfully!");
      setNewLesson({ title: "", sentences: [], phrases: [] }); // Keep this as string[] for the UI input
    } catch (error) {
      alert("Failed to create lesson: " + error.message);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    try {
      const sentencesForConvex = editingLesson.sentences.map((s) => ({
        text: s.text,
        wordCount: s.wordCount,
      }));
      const phrasesArray = editingLesson.phrases
        .map((p) => p.trim())
        .filter(Boolean);

      await updateLesson({
        lessonId: editingLesson._id,
        title: editingLesson.title,
        sentences: sentencesForConvex,
        phrases: phrasesArray,
      });
      alert("Lesson updated successfully!");
      setEditingLesson(null);
    } catch (error) {
      alert("Failed to update lesson: " + error.message);
    }
  };

  const handleDeleteLesson = async (lessonId: Id<"lessons">) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await deleteLesson({ lessonId });
        alert("Lesson deleted successfully!");
      } catch (error) {
        alert("Failed to delete lesson: " + error.message);
      }
    }
  };

  return (
    <Card className="shadow-xl border border-green-100 transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="bg-green-50 border-b border-green-100">
        <CardTitle className="text-2xl font-bold text-green-800">
          Lesson Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-6 text-green-700">
          Lessons for {editingCourse?.title}
        </h3>
        <Table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <TableHeader className="bg-green-50">
            <TableRow>
              <TableHead className="py-3 px-4 text-left text-green-800 font-bold">
                Title
              </TableHead>
              <TableHead className="py-3 px-4 text-left text-green-800 font-bold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getLessonsByCourseId?.map((lesson) => (
              <TableRow key={lesson._id} className="hover:bg-green-50">
                <TableCell className="py-3 px-4 font-medium text-gray-800">
                  {lesson.title}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Button
                    onClick={() => {
                      setEditingLesson({ ...lesson });
                      setNewLesson({ title: "", sentences: [], phrases: [] });
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm mr-2 transition-colors duration-200"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={async () => handleDeleteLesson(lesson._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors duration-200"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!getLessonsByCourseId ||
              (getLessonsByCourseId.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center py-4 text-gray-500"
                  >
                    No lessons found for this course.
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <h3 className="text-xl font-semibold mt-8 mb-6 text-green-700">
          {editingLesson ? "Edit Lesson" : "Create New Lesson"}
        </h3>
        <form
          onSubmit={editingLesson ? handleUpdateLesson : handleCreateLesson}
          className="space-y-6"
        >
          <div>
            <Label htmlFor="lessonTitle" className="text-gray-700 font-medium">
              Lesson Title
            </Label>
            <Input
              id="lessonTitle"
              name="title"
              value={editingLesson ? editingLesson.title : newLesson.title}
              onChange={(e) =>
                editingLesson
                  ? setEditingLesson((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  : setNewLesson((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
              }
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div>
            <Label htmlFor="sentences" className="text-gray-700 font-medium">
              Sentences (one per line)
            </Label>
            <Textarea
              id="sentences"
              name="sentences"
              value={
                editingLesson
                  ? editingLesson.sentences.map((s) => s.text).join("\n")
                  : newLesson.sentences.map((s) => s.text).join("\n")
              }
              onChange={(e) => {
                const sentencesArray = e.target.value
                  .split("\n")
                  .map((s) => ({ text: s, wordCount: 0 })); // wordCount will be recalculated by Convex
                editingLesson
                  ? setEditingLesson((prev) => ({
                      ...prev,
                      sentences: sentencesArray,
                    }))
                  : setNewLesson((prev) => ({
                      ...prev,
                      sentences: sentencesArray,
                    }));
              }}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div>
            <Label htmlFor="phrases" className="text-gray-700 font-medium">
              Phrases (one per line)
            </Label>
            <Textarea
              id="phrases"
              name="phrases"
              value={
                editingLesson
                  ? editingLesson.phrases.join("\n")
                  : newLesson.phrases.join("\n")
              }
              onChange={(e) => {
                const phrasesArray = e.target.value.split("\n");
                editingLesson
                  ? setEditingLesson((prev) => ({
                      ...prev,
                      phrases: phrasesArray,
                    }))
                  : setNewLesson((prev) => ({
                      ...prev,
                      phrases: phrasesArray,
                    }));
              }}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {editingLesson ? "Update Lesson" : "Create Lesson"}
          </Button>
          {editingLesson && (
            <Button
              type="button"
              onClick={() => {
                setEditingLesson(null);
                setNewLesson({ title: "", sentences: [], phrases: [] });
              }}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Cancel Edit
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default LessonManagement;
