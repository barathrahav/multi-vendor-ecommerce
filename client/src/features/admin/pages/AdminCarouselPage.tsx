import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  Save,
  X,
  Upload,
} from "lucide-react";
import { uploadImageToCloudinary } from "../../../lib/cloudinary";

import { GET_CAROUSEL_SLIDES } from "../graphql/carousel.queries";
import {
  CREATE_CAROUSEL_SLIDE,
  UPDATE_CAROUSEL_SLIDE,
  DELETE_CAROUSEL_SLIDE,
  REORDER_CAROUSEL_SLIDES,
} from "../graphql/carousel.mutations";
import type {
  CarouselSlide,
  CarouselSlidesResponse,
} from "../../products/types/product.types";

interface FormData {
  title: string;
  description: string;
  imageUrl: string;
  order?: number;
}

const AdminCarouselPage = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    imageUrl: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, loading } =
    useQuery<CarouselSlidesResponse>(GET_CAROUSEL_SLIDES);
  const slides: CarouselSlide[] = data?.carouselSlides ?? [];

  const [createSlide] = useMutation(CREATE_CAROUSEL_SLIDE, {
    refetchQueries: [{ query: GET_CAROUSEL_SLIDES }],
  });

  const [updateSlide] = useMutation(UPDATE_CAROUSEL_SLIDE, {
    refetchQueries: [{ query: GET_CAROUSEL_SLIDES }],
  });

  const [deleteSlide] = useMutation(DELETE_CAROUSEL_SLIDE, {
    refetchQueries: [{ query: GET_CAROUSEL_SLIDES }],
  });

  const [reorderSlides] = useMutation(REORDER_CAROUSEL_SLIDES, {
    refetchQueries: [{ query: GET_CAROUSEL_SLIDES }],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading image...");

    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData((prev) => ({
        ...prev,
        imageUrl,
      }));
      toast.success("Image uploaded successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to upload image", { id: toastId });
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.imageUrl) {
      toast.error("Please fill all fields and upload an image");
      return;
    }

    const toastId = toast.loading(
      editingId ? "Updating slide..." : "Creating slide..."
    );

    try {
      if (editingId) {
        await updateSlide({
          variables: {
            id: editingId,
            ...formData,
          },
        });
        toast.success("Slide updated successfully", { id: toastId });
      } else {
        await createSlide({
          variables: {
            ...formData,
            order: slides.length,
          },
        });
        toast.success("Slide created successfully", { id: toastId });
      }

      resetForm();
    } catch (error) {
      toast.error("Failed to save slide", { id: toastId });
      console.error(error);
    }
  };

  const handleEdit = (slide: CarouselSlide) => {
    setFormData({
      title: slide.title,
      description: slide.description,
      imageUrl: slide.imageUrl,
    });
    setEditingId(slide.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) {
      return;
    }

    const toastId = toast.loading("Deleting slide...");

    try {
      await deleteSlide({ variables: { id } });
      toast.success("Slide deleted successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete slide", { id: toastId });
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const updatedSlides = [...slides];
    [updatedSlides[index - 1].order, updatedSlides[index].order] = [
      updatedSlides[index].order,
      updatedSlides[index - 1].order,
    ];

    const reorderData = updatedSlides.map((slide) => ({
      id: slide.id,
      order: slide.order,
    }));

    const toastId = toast.loading("Reordering slides...");

    try {
      await reorderSlides({ variables: { slides: reorderData } });
      toast.success("Order updated", { id: toastId });
    } catch (error) {
      toast.error("Failed to reorder slides", { id: toastId });
      console.error(error);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;

    const updatedSlides = [...slides];
    [updatedSlides[index].order, updatedSlides[index + 1].order] = [
      updatedSlides[index + 1].order,
      updatedSlides[index].order,
    ];

    const reorderData = updatedSlides.map((slide) => ({
      id: slide.id,
      order: slide.order,
    }));

    const toastId = toast.loading("Reordering slides...");

    try {
      await reorderSlides({ variables: { slides: reorderData } });
      toast.success("Order updated", { id: toastId });
    } catch (error) {
      toast.error("Failed to reorder slides", { id: toastId });
      console.error(error);
    }
  };

  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Carousel Slides
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Slide
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingId ? "Edit Slide" : "Create New Slide"}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter slide title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter slide description"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Carousel Image
              </label>
              {formData.imageUrl && (
                <div className="mb-4 relative inline-block">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-32 w-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2">
                  <Upload size={20} />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {formData.imageUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        imageUrl: "",
                      }))
                    }
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex-1"
              >
                <Save size={20} />
                {editingId ? "Update Slide" : "Create Slide"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slides List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading slides...</p>
          </div>
        ) : sortedSlides.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No carousel slides yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedSlides.map((slide, index) => (
                  <tr
                    key={slide.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span>{index + 1}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-500 rounded transition-colors"
                            aria-label="Move slide up"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === sortedSlides.length - 1}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-500 rounded transition-colors"
                            aria-label="Move slide down"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="h-12 w-20 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {slide.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {slide.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(slide)}
                          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(slide.id)}
                          className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCarouselPage;

