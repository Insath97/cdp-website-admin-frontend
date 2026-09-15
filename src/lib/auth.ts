"use client";

import { create } from "zustand";
import apiClient from "@/lib/api-client";
import type { User, Role } from "@/types";

interface AuthState {
  user: User | null;
  role: Role | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    errors?: Record<string, string[]>;
  }>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/login", { email, password });
      const result = response.data;

      if (result.status === "success" && result.data?.auth_token) {
        localStorage.setItem("auth_token", result.data.auth_token);

        const user = result.data.user;
        const roles = user.roles || [];
        const role = roles[0] || null;
        const permissions = role?.permissions?.map((p: { name: string }) => p.name) || [];

        set({
          user,
          role,
          permissions,
          isAuthenticated: true,
        });

        return { success: true };
      }

      return { success: false, error: result.message || "Login failed" };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        };
      };
      const message =
        axiosError.response?.data?.message || "Login failed. Please try again.";
      const errors = axiosError.response?.data?.errors;
      return { success: false, error: message, errors };
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/logout");
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("auth_token");
      set({
        user: null,
        role: null,
        permissions: [],
        isAuthenticated: false,
      });
    }
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const response = await apiClient.get("/me");
      const result = response.data;

      if (result.status === "success" && result.data) {
        const user = result.data.user || result.data;
        const roles = user.roles || [];
        const role = roles[0] || null;
        const permissions = role?.permissions?.map((p: { name: string }) => p.name) || [];

        set({
          user,
          role,
          permissions,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem("auth_token");
        set({ isLoading: false });
      }
    } catch {
      localStorage.removeItem("auth_token");
      set({
        user: null,
        role: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  hasPermission: (permission: string) => {
    const { permissions } = get();
    return permissions.includes(permission);
  },

  hasAnyPermission: (perms: string[]) => {
    const { permissions } = get();
    return perms.some((p) => permissions.includes(p));
  },
}));

export function initializeAuth() {
  if (typeof window === "undefined") return;
  useAuthStore.getState().fetchUser();
}
