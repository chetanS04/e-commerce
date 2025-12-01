import axios from "./axios";

export type ThemePayload = {
    name: string;
    background_color?: string;
    text_color?: string;
    primary_color?: string;
    gradient_start?: string;
    gradient_end?: string;
    gradient_direction: string;
    status: boolean;
};

export const fetchThemes = async () => {
    const response = await axios.get("/api/themes");
    return response.data;
};

export const getThemeById = async (id: number | string) => {
    const response = await axios.get(`/api/themes/${id}`);
    return response.data;
};

export const createTheme = async (data: ThemePayload) => {
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("background_color", data.background_color ?? "");
    fd.append("text_color", data.text_color ?? "");
    fd.append("primary_color", data.primary_color ?? "");
    fd.append("gradient_start", data.gradient_start ?? "");
    fd.append("gradient_end", data.gradient_end ?? "");
    fd.append("gradient_direction", data.gradient_direction ?? "");
    fd.append("status", data.status ? "1" : "0");

    const response = await axios.post("/api/create-themes", fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const updateTheme = async (id: number | string, data: ThemePayload) => {
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("background_color", data.background_color ?? "");
    fd.append("text_color", data.text_color ?? "");
    fd.append("primary_color", data.primary_color ?? "");
    fd.append("gradient_start", data.gradient_start ?? "");
    fd.append("gradient_end", data.gradient_end ?? "");
    fd.append("gradient_direction", data.gradient_direction ?? "");
    fd.append("status", data.status ? "1" : "0");

    const response = await axios.post(`/api/themes/${id}?_method=PUT`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const deleteTheme = async (id: number | string) => {
    const response = await axios.delete(`/api/themes/${id}`);
    return response.data;
};
