import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUploadFile } from "@/hooks/use-upload-file";
import { Star, Globe, Briefcase, Coffee, BookOpen } from "lucide-react";
import CourseListing from "@/components/CourseListing";
import CourseManagement from "@/components/CourseManagement";
import LessonManagement from "@/components/LessonManagement";
import AppHeaderRightContent from "@/components/AppHeaderRightContent";

const categories = [
  {
    id: "all",
    name: "All Courses",
    icon: Globe,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "business",
    name: "Business",
    icon: Briefcase,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "daily",
    name: "Daily Life",
    icon: Coffee,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "academic",
    name: "Academic",
    icon: BookOpen,
    color: "from-green-500 to-teal-500",
  },
  {
    id: "travel",
    name: "Travel",
    icon: Globe,
    color: "from-green-500 to-emerald-500",
  },
];

const levels = [
  { id: "all", name: "All Levels", color: "from-green-500 to-emerald-500" },
  { id: "beginner", name: "Beginner", color: "from-green-500 to-blue-500" },
  {
    id: "intermediate",
    name: "Intermediate",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "advanced",
    name: "Advanced",
    color: "from-green-500 to-emerald-500",
  },
];

const AdminDashboard = () => {
  const courses = useQuery(api.courses.getCourses, {});
  const createCourse = useMutation(api.courses.createCourse);
  const updateCourse = useMutation(api.courses.updateCourse);
  const deleteCourse = useMutation(api.courses.deleteCourse);

  const createLesson = useMutation(api.lessons.createLesson);
  const updateLesson = useMutation(api.lessons.updateLesson);
  const deleteLesson = useMutation(api.lessons.deleteLesson);

  const devTools = useMutation(api.dev_tools.devTools); // Add this line

  const handleClearAllTables = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all tables? This cannot be undone."
      )
    ) {
      try {
        await devTools({ action: "clearAllTables", payload: {} });
        toast.success("All tables cleared successfully!");
      } catch (error) {
        toast.error("Failed to clear tables: " + error.message);
      }
    }
  };

  const handleSeedCourses = async () => {
    if (
      window.confirm(
        "Are you sure you want to seed courses? This will add new data."
      )
    ) {
      try {
        const coursesData = await fetch("/data/courses_data.json").then((res) =>
          res.json()
        );
        await devTools({ action: "seedCourses", payload: { coursesData } });
        toast.success("Courses seeded successfully!");
      } catch (error) {
        toast.error("Failed to seed courses: " + error.message);
      }
    }
  };

  const [editingCourse, setEditingCourse] = useState<any>(null);
  const getLessonsByCourseId = useQuery(
    api.lessons.getLessonsByCourseId,
    editingCourse?._id ? { courseId: editingCourse._id } : undefined
  );

  const { uploadFile, uploading } = useUploadFile();
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    imageUrl: null as string | null,
    category: "",
    level: "",
    duration: "",
    rating: 0,
    skills: [],
    featured: false,
  });

  const renderStars = (
    currentRating: number,
    setRating: (rating: number) => void
  ) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 cursor-pointer ${
            i <= currentRating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
          onClick={() => setRating(i)}
        />
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  const [selectedNewImageFile, setSelectedNewImageFile] = useState<File | null>(
    null
  );
  const [selectedEditingImageFile, setSelectedEditingImageFile] =
    useState<File | null>(null);

  const [newLesson, setNewLesson] = useState<{
    title: string;
    sentences: { text: string; wordCount: number }[];
    phrases: string[];
  }>({
    title: "",
    sentences: [],
    phrases: [],
  });
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const handleCourseChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setNewCourse((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseFloat(value)
            : value,
    }));
  };

  const handleNewImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedNewImageFile(e.target.files[0]);
    } else {
      setSelectedNewImageFile(null);
    }
  };

  const handleEditingImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedEditingImageFile(e.target.files[0]);
    } else {
      setSelectedEditingImageFile(null);
    }
  };

  const handleResetImage = () => {
    if (editingCourse) {
      setEditingCourse((prev) => ({ ...prev, imageUrl: null }));
      setSelectedEditingImageFile(null);
    } else {
      setNewCourse((prev) => ({ ...prev, imageUrl: null }));
      setSelectedNewImageFile(null);
    }
    // Reset the file input element itself to clear the displayed file name
    const fileInput = document.getElementById("imageUrl") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl: string | undefined = newCourse.imageUrl || undefined;
      if (selectedNewImageFile) {
        const storageId = await uploadFile(selectedNewImageFile);
        if (!storageId) {
          throw new Error("Failed to upload image.");
        }
        finalImageUrl = storageId;
      }

      const newCourseId = await createCourse({
        ...newCourse,
        imageUrl: finalImageUrl === null ? undefined : finalImageUrl,
      });
      toast.success("Course created successfully!");
      setEditingCourse({
        ...newCourse,
        _id: newCourseId,
        imageUrl: finalImageUrl,
        lessonCount: 0,
      });
      setNewCourse({
        title: "",
        description: "",
        imageUrl: null,
        category: "",
        level: "",
        duration: "",
        rating: 0,
        skills: [],
        featured: false,
      });
      setSelectedNewImageFile(null);
    } catch (error) {
      toast.error("Failed to create course: " + error.message);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse({ ...course });
    setSelectedEditingImageFile(null);
    setEditingLesson(null);
    setNewLesson({
      title: "",
      sentences: [],
      phrases: [],
    });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = editingCourse.imageUrl;
      if (selectedEditingImageFile) {
        const storageId = await uploadFile(selectedEditingImageFile);
        if (!storageId) {
          throw new Error("Failed to upload image.");
        }
        finalImageUrl = storageId;
      }

      const {
        _id,
        _creationTime,
        createdAt,
        updatedAt,
        lessonCount,
        ...courseUpdates
      } = editingCourse;

      await updateCourse({
        courseId: _id,
        ...courseUpdates,
        imageUrl: finalImageUrl === null ? undefined : finalImageUrl,
      });
      toast.success("Course updated successfully!");
      setEditingCourse(null);
      setSelectedEditingImageFile(null);
    } catch (error) {
      toast.error("Failed to update course: " + error.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse({ courseId });
        toast.success("Course deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete course: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <AppHeader fullWidth rightContent={<AppHeaderRightContent />} />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h1>
        <div className="mb-6 flex justify-end space-x-4">
          <Button
            onClick={handleClearAllTables}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Clear All Tables (Dev Only)
          </Button>
          <Button
            onClick={handleSeedCourses}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Seed Courses (Dev Only)
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {!editingCourse && (
            <CourseListing
              courses={courses}
              handleEditCourse={handleEditCourse}
              handleDeleteCourse={handleDeleteCourse}
            />
          )}

          <CourseManagement
            editingCourse={editingCourse}
            newCourse={newCourse}
            handleCourseChange={handleCourseChange}
            handleNewImageFileChange={handleNewImageFileChange}
            handleEditingImageFileChange={handleEditingImageFileChange}
            handleCreateCourse={handleCreateCourse}
            handleUpdateCourse={handleUpdateCourse}
            selectedNewImageFile={selectedNewImageFile}
            selectedEditingImageFile={selectedEditingImageFile}
            uploading={uploading}
            setNewCourse={setNewCourse}
            setEditingCourse={setEditingCourse}
            categories={categories}
            levels={levels}
            handleResetImage={handleResetImage}
          />

          {editingCourse && (
            <LessonManagement
              editingCourse={editingCourse}
              getLessonsByCourseId={getLessonsByCourseId}
              newLesson={newLesson}
              editingLesson={editingLesson}
              setNewLesson={setNewLesson}
              setEditingLesson={setEditingLesson}
              createLesson={createLesson}
              updateLesson={updateLesson}
              deleteLesson={deleteLesson}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
