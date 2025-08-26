// 📂 Frontend/src/services/fetchWrapper.ts
import { useAuth } from "../context/AuthContext";

// ⬅️ Use Vite env var (defined in .env file)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to access context outside React components
let authRef: any = null;
export const setAuthRef = (authContext: any) => {
    authRef = authContext;
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    if (!authRef) {
        throw new Error("AuthContext not initialized in fetchWrapper");
    }

    const { auth, updateAccessToken, logout } = authRef;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(auth?.accessToken
            ? { Authorization: `Bearer ${auth.accessToken}` }
            : {}),
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: "include", // cookies if backend sets them
    });

    if (response.status === 401 && auth?.refreshToken) {
        try {
            const refreshResponse = await fetch(
                `${API_BASE_URL}/auth/refresh`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken: auth.refreshToken }),
                    credentials: "include",
                }
            );

            if (!refreshResponse.ok) {
                logout();
                throw new Error("Refresh token invalid, logged out");
            }

            const data = await refreshResponse.json();
            updateAccessToken(data.accessToken);

            // Retry original request
            const retryHeaders: HeadersInit = {
                ...headers,
                Authorization: `Bearer ${data.accessToken}`,
            };

            return fetch(`${API_BASE_URL}${url}`, {
                ...options,
                headers: retryHeaders,
                credentials: "include",
            }).then((r) => r.json());
        } catch (err) {
            logout();
            throw err;
        }
    }

    return response.json();
}

// ⬅️ Export an object with helpers
export const fetchWrapper = {
    get: <T>(url: string, options?: RequestInit) =>
        request<T>(url, { ...options, method: "GET" }),

    post: <T>(url: string, body?: any, options?: RequestInit) =>
        request<T>(url, {
            ...options,
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T>(url: string, body?: any, options?: RequestInit) =>
        request<T>(url, {
            ...options,
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(url: string, options?: RequestInit) =>
        request<T>(url, { ...options, method: "DELETE" }),
};
