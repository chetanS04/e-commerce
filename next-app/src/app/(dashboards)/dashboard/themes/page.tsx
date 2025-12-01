"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLoader } from "@/context/LoaderContext";
import Modal from "@/components/(sheared)/Modal";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import ProtectedRoute from "@/components/(sheared)/ProtectedRoute";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
    createTheme,
    fetchThemes,
    updateTheme,
    deleteTheme,
} from "../../../../../utils/theme";

type FormData = {
    name: string;
    background_color?: string | null;
    text_color?: string | null;
    primary_color?: string | null;
    gradient_start?: string | null;
    gradient_end?: string | null;
    gradient_direction: string;
    status: boolean;
};

function ThemesManagement() {
    const [themes, setThemes] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTheme, setEditingTheme] = useState<any | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { showLoader, hideLoader } = useLoader();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            gradient_direction: "to right",
            status: true,
        },
    });

    useEffect(() => {
        loadThemes();
    }, []);

    const loadThemes = async () => {
        showLoader();
        try {
            const data = await fetchThemes();
            setThemes(data);
        } catch {
            setErrorMessage("Failed to fetch themes. Please try again.");
        } finally {
            hideLoader();
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!data.name || data.name.trim() === "") {
            setErrorMessage("Theme name is required.");
            return;
        }

        showLoader();
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            if (editingTheme) {
                // Update
                await updateTheme(editingTheme.id, {
                    ...data,
                    background_color: data.background_color ?? "",
                    text_color: data.text_color ?? "",
                    primary_color: data.primary_color ?? "",
                    gradient_start: data.gradient_start ?? "",
                    gradient_end: data.gradient_end ?? "",
                });
                setSuccessMessage("Theme updated successfully!");
            } else {
                // Create
                await createTheme({
                    ...data,
                    background_color: data.background_color ?? "",
                    text_color: data.text_color ?? "",
                    primary_color: data.primary_color ?? "",
                    gradient_start: data.gradient_start ?? "",
                    gradient_end: data.gradient_end ?? "",
                });
                setSuccessMessage("Theme created successfully!");
            }

            await loadThemes();
            handleCloseModal();
        } catch {
            setErrorMessage("Failed to save theme. Please try again.");
        } finally {
            hideLoader();
        }
    };

    const handleEdit = (theme: any) => {
        setEditingTheme(theme);
        setIsModalOpen(true);
        reset({
            name: theme.name,
            background_color: theme.background_color,
            text_color: theme.text_color,
            primary_color: theme.primary_color,
            gradient_start: theme.gradient_start,
            gradient_end: theme.gradient_end,
            gradient_direction: theme.gradient_direction,
            status: !!theme.status,
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this theme?")) return;
        showLoader();
        try {
            await deleteTheme(id);
            setSuccessMessage("Theme deleted successfully!");
            await loadThemes();
        } catch {
            setErrorMessage("Failed to delete theme. Please try again.");
        } finally {
            hideLoader();
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTheme(null);
        reset({ gradient_direction: "to right", status: true });
    };

    return (
        <ProtectedRoute role="Admin">
            <div className="z-[999]">
                {errorMessage && (
                    <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
                )}
                {successMessage && (
                    <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />
                )}

                {/* Header */}
                <div className="p-2 border border-gray-300/30 rounded-3xl shadow flex items-center justify-between mb-3 bg-white/60 backdrop-blur-lg">
                    <h2 className="lg:text-2xl text-lg px-5 font-semibold text-gray-700">Themes</h2>
                    <button
                        className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-full font-semibold text-white transition"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="w-5 h-5" /> Add Theme
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto scrollbar rounded-2xl shadow border border-gray-300/30 bg-white/70 backdrop-blur">
                    <table className="w-full min-w-[800px] text-sm text-left">
                        <thead className="uppercase text-xs font-semibold text-gray-700 bg-gray-100">
                            <tr>
                                <th className="px-6 py-4">S.No.</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Primary Color</th>
                                <th className="px-6 py-4">Gradient</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-700">
                            {themes.length ? (
                                themes.map((theme, index) => (
                                    <tr key={theme.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4 font-semibold">{theme.name}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="px-4 py-1 rounded-full text-xs font-medium text-white"
                                                style={{ backgroundColor: theme.primary_color }}
                                            >
                                                {theme.primary_color}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {theme.gradient_start && theme.gradient_end ? (
                                                <div
                                                    className="w-32 h-6 rounded-full border border-gray-300"
                                                    style={{
                                                        backgroundImage: `linear-gradient(${theme.gradient_direction}, ${theme.gradient_start}, ${theme.gradient_end})`,
                                                    }}
                                                ></div>
                                            ) : (
                                                <span className="text-gray-400 italic">No gradient</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${theme.status
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {theme.status ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleEdit(theme)}
                                                className="size-10 bg-gc-300/30 hover:bg-orange-400 flex justify-center items-center rounded-full"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(theme.id)}
                                                className="size-10 bg-gc-300/30 hover:bg-orange-400 flex justify-center items-center rounded-full"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center text-zinc-400 py-8 italic">
                                        No Themes Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingTheme ? "Edit Theme" : "Add New Theme"}
                    width="max-w-4xl"
                >
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="grid gap-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Theme Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("name")}
                                    type="text"
                                    placeholder="Enter theme name"
                                    className="w-full border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 mt-1">Theme name is required.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Primary Color
                                </label>
                                <input
                                    {...register("primary_color")}
                                    type="color"
                                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Background Color
                                </label>
                                <input
                                    {...register("background_color")}
                                    type="color"
                                    className="w-full h-10 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Text Color
                                </label>
                                <input
                                    {...register("text_color")}
                                    type="color"
                                    className="w-full h-10 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Gradient Direction
                                </label>
                                <select
                                    {...register("gradient_direction")}
                                    className="w-full text-black border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400"
                                >
                                    <option value="to right">To Right</option>
                                    <option value="to left">To Left</option>
                                    <option value="to bottom">To Bottom</option>
                                    <option value="to top">To Top</option>
                                </select>
                            </div>
                        </div>

                        {/* Gradient Colors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Gradient Start
                                </label>
                                <input
                                    {...register("gradient_start")}
                                    type="color"
                                    className="w-full h-10 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Gradient End
                                </label>
                                <input
                                    {...register("gradient_end")}
                                    type="color"
                                    className="w-full h-10 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center justify-between mt-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <span className="text-sm font-medium text-gray-900">Status</span>
                                <div
                                    className={`flex items-center h-6 w-12 rounded-full transition-all duration-300 ${watch("status") ? "bg-green-500" : "bg-zinc-500"
                                        }`}
                                >
                                    <input type="checkbox" {...register("status")} hidden />
                                    <div
                                        className={`h-6 w-6 rounded-full bg-white shadow-md transform transition-all duration-300 ${watch("status") ? "translate-x-6" : "translate-x-0"
                                            }`}
                                    ></div>
                                </div>
                            </label>

                            <button
                                type="submit"
                                className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full shadow-md"
                            >
                                {editingTheme ? "Update Theme" : "Save Theme"}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </ProtectedRoute>
    );
}

export default ThemesManagement;
