import { ApiResponse, Product } from "@/common/interface";
import axios from "./axios";

export type ProductPayload = {
    name: string;
    description?: string;
    item_code?: string;
    category_id: number;
    brand_id?: number | null;
    status: boolean;
    feature_json?: string | null;
    image_url?: File | string | null;
    image_json?: string | null;
};

export const fetchProducts = async () => {
    const response = await axios.get("/api/products");
    return response.data;
};

export const createProduct = async (data: any): Promise<ApiResponse<string>> => {
    const response = await axios.post(`/api/create-product`, data);
    const res = response.data;

    return {
        success: res.res === "success",
        message: res.message || "",
        result: res.product || null,
        errors: res.errors || [],
    };
};

export const updateProduct = async (id: string, data: FormData): Promise<ApiResponse<string>> => {
    const response = await axios.put(`/api/update-product/${id}`, data);
    const res = response.data;

    return {
        success: res.res === "success",
        message: res.message || "",
        result: res.product || null,
        errors: res.errors || [],
    };
};

export const deleteProduct = async (id: number) => {
    const response = await axios.delete(`/api/delete-product/${id}`);
    return response.data;
};

export const getSubcategoryProducts = async (categoryId: number) => {
    const response = await axios.get(`/api/get-products-by-category/${categoryId}`);
    return response.data;
};

export const getProductById = async (id: number | string): Promise<ApiResponse<Product>> => {
    try {
        const response = await axios.get(`/api/get-product/${id}`);
        const res = response.data;

        return {
            success: res.res === "success",
            message: res.message || "",
            result: res.product || null,
            errors: res.errors || [],
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch product",
            errors: [],
        };
    }
};

export const getMostOrderedProducts = async (limit?: number): Promise<ApiResponse<any>> => {
    try {
        const params = limit ? { limit: limit.toString() } : {};
        const response = await axios.get('/api/most-ordered-products', { params });
        const res = response.data;

        return {
            success: res.res === "success",
            message: res.message || "",
            result: res.data || null,
            errors: res.errors || [],
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch most ordered products",
            errors: [],
        };
    }
};

export const getTopSellingProducts = async (limit?: number): Promise<ApiResponse<any>> => {
    try {
        const params = limit ? { limit: limit.toString() } : {};
        const response = await axios.get('/api/top-selling-products', { params });
        const res = response.data;

        return {
            success: res.res === "success",
            message: res.message || "",
            result: res.data || null,
            errors: res.errors || [],
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch top selling products",
            errors: [],
        };
    }
};