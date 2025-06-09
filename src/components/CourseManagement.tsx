import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StarRatingInput from "@/components/ui/StarRatingInput"; // Import the new component

interface CourseManagementProps {
  editingCourse: any;
  newCourse: any;
  handleCourseChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleNewImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEditingImageFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleCreateCourse: (e: React.FormEvent) => Promise<void>;
  handleUpdateCourse: (e: React.FormEvent) => Promise<void>;
  selectedNewImageFile: File | null;
  selectedEditingImageFile: File | null;
  uploading: boolean;
  setNewCourse: React.Dispatch<React.SetStateAction<any>>;
  setEditingCourse: React.Dispatch<React.SetStateAction<any>>;
  categories: { id: string; name: string; icon: any; color: string }[];
  levels: { id: string; name: string; color: string }[];
  handleResetImage: () => void;
}

const CourseManagement: React.FC<CourseManagementProps> = ({
  editingCourse,
  newCourse,
  handleCourseChange,
  handleNewImageFileChange,
  handleEditingImageFileChange,
  handleCreateCourse,
  handleUpdateCourse,
  selectedNewImageFile,
  selectedEditingImageFile,
  uploading,
  setNewCourse,
  setEditingCourse,
  categories,
  levels,
  handleResetImage,
}) => {
  return (
    <Card className="shadow-xl border border-green-100 transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="bg-green-50 border-b border-green-100">
        <CardTitle className="text-2xl font-bold text-green-800">
          Course Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-6 text-green-700">
          {editingCourse ? "Edit Course" : "Create New Course"}
        </h3>
        <form
          onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
          className="space-y-6"
        >
          <div>
            <Label htmlFor="title" className="text-gray-700 font-medium">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={editingCourse ? editingCourse.title : newCourse.title}
              onChange={(e) =>
                editingCourse
                  ? setEditingCourse((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  : handleCourseChange(e)
              }
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-700 font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={
                editingCourse
                  ? editingCourse.description
                  : newCourse.description
              }
              onChange={(e) =>
                editingCourse
                  ? setEditingCourse((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  : handleCourseChange(e)
              }
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="imageUrl" className="text-gray-700 font-medium">
              Course Image
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="imageUrl"
                name="imageUrl"
                type="file"
                accept="image/*"
                onChange={
                  editingCourse
                    ? handleEditingImageFileChange
                    : handleNewImageFileChange
                }
                className="hidden" // Hide the default file input
              />
              <Label
                htmlFor="imageUrl"
                className={`cursor-pointer py-2 px-4 rounded-md border transition-colors duration-200 ${
                  (editingCourse &&
                    (selectedEditingImageFile || editingCourse.imageUrl)) ||
                  (newCourse && (selectedNewImageFile || newCourse.imageUrl))
                    ? "bg-green-500 text-white border-green-600 hover:bg-green-600"
                    : "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                }`}
              >
                {(editingCourse &&
                  (selectedEditingImageFile || editingCourse.imageUrl)) ||
                (newCourse && (selectedNewImageFile || newCourse.imageUrl))
                  ? "Change Image"
                  : "Choose Image"}
              </Label>
              {(editingCourse &&
                (selectedEditingImageFile || editingCourse.imageUrl)) ||
              (newCourse && (selectedNewImageFile || newCourse.imageUrl)) ? (
                <Button
                  type="button"
                  onClick={handleResetImage}
                  className="bg-red-100 text-red-800 py-2 px-4 rounded-md border border-red-300 hover:bg-red-200 transition-colors duration-200"
                >
                  Reset Image
                </Button>
              ) : null}
            </div>

            {uploading ? (
              <p className="text-green-600 font-semibold mt-2">
                Uploading image...
              </p>
            ) : (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 flex items-center justify-center h-64 w-full overflow-hidden">
                {(editingCourse && selectedEditingImageFile) ||
                (newCourse && selectedNewImageFile) ? (
                  <img
                    src={
                      editingCourse
                        ? URL.createObjectURL(selectedEditingImageFile)
                        : URL.createObjectURL(selectedNewImageFile)
                    }
                    alt="Course Preview"
                    className="max-h-full max-w-full object-contain rounded-md shadow-md"
                  />
                ) : editingCourse?.imageUrl || newCourse?.imageUrl ? (
                  <img
                    src={editingCourse?.imageUrl || newCourse?.imageUrl}
                    alt="Current Course Image"
                    className="max-h-full max-w-full object-contain rounded-md shadow-md"
                  />
                ) : (
                  <p className="text-gray-500">No image preview available</p>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="category" className="text-gray-700 font-medium">
                Category
              </Label>
              <Select
                value={
                  editingCourse ? editingCourse.category : newCourse.category
                }
                onValueChange={(value) =>
                  editingCourse
                    ? setEditingCourse((prev) => ({
                        ...prev,
                        category: value,
                      }))
                    : setNewCourse((prev) => ({
                        ...prev,
                        category: value,
                      }))
                }
                required
              >
                <SelectTrigger className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((cat) => cat.id !== "all")
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="level" className="text-gray-700 font-medium">
                Level
              </Label>
              <Select
                value={editingCourse ? editingCourse.level : newCourse.level}
                onValueChange={(value) =>
                  editingCourse
                    ? setEditingCourse((prev) => ({
                        ...prev,
                        level: value,
                      }))
                    : setNewCourse((prev) => ({
                        ...prev,
                        level: value,
                      }))
                }
                required
              >
                <SelectTrigger className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  {levels
                    .filter((lvl) => lvl.id !== "all")
                    .map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="duration" className="text-gray-700 font-medium">
                Duration
              </Label>
              <Input
                id="duration"
                name="duration"
                value={
                  editingCourse ? editingCourse.duration : newCourse.duration
                }
                onChange={(e) =>
                  editingCourse
                    ? setEditingCourse((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    : handleCourseChange(e)
                }
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <Label
                htmlFor="rating"
                className="text-gray-700 font-medium flex items-center"
              >
                Rating{" : "}
                <span className="ml-2 text-green-600 font-semibold">
                  {editingCourse ? editingCourse.rating : newCourse.rating}
                </span>
              </Label>
              <StarRatingInput
                value={editingCourse ? editingCourse.rating : newCourse.rating}
                onChange={(rating) =>
                  editingCourse
                    ? setEditingCourse((prev) => ({ ...prev, rating }))
                    : setNewCourse((prev) => ({ ...prev, rating }))
                }
                className="mt-4"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="skills" className="text-gray-700 font-medium">
              Skills (comma-separated)
            </Label>
            <Input
              id="skills"
              name="skills"
              value={
                editingCourse
                  ? editingCourse.skills?.join(", ")
                  : newCourse.skills?.join(", ")
              }
              onChange={(e) =>
                editingCourse
                  ? setEditingCourse((prev) => ({
                      ...prev,
                      skills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  : setNewCourse((prev) => ({
                      ...prev,
                      skills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Input
              id="featured"
              name="featured"
              type="checkbox"
              checked={
                editingCourse ? editingCourse.featured : newCourse.featured
              }
              onChange={(e) =>
                editingCourse
                  ? setEditingCourse((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  : setNewCourse((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
              }
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <Label htmlFor="featured" className="text-gray-700 font-medium">
              Featured Course
            </Label>
          </div>
          <Button
            type="submit"
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {uploading
              ? "Uploading..."
              : editingCourse
                ? "Update Course"
                : "Create Course"}
          </Button>
          {editingCourse && (
            <Button
              type="button"
              onClick={() => setEditingCourse(null)}
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

export default CourseManagement;
