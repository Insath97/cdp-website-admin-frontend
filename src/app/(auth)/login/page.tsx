"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    clearErrors();

    const result = await login(data.email, data.password);

    if (result.success) {
      toast("Login successful! Welcome back.", "success");
      router.push("/dashboard");
    } else {
      const errorMessage = result.error || "Invalid email or password. Please try again.";
      toast(errorMessage, "error");

      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          if (field === "email" || field === "password") {
            setError(field as keyof LoginFormData, {
              type: "server",
              message: Array.isArray(messages) ? messages[0] : String(messages),
            });
          }
        });
      } else {
        const lower = errorMessage.toLowerCase();
        if (lower.includes("email") || lower.includes("account") || lower.includes("user")) {
          setError("email", {
            type: "server",
            message: errorMessage,
          });
        } else {
          setError("password", {
            type: "server",
            message: errorMessage,
          });
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-primary via-primary-dark to-primary-dark lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="mx-auto max-w-md px-8 text-center">
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            <Image
              src="/logo-cdp.png"
              alt="CDP Logo"
              width={112}
              height={112}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white">
            CDP Admin
          </h1>
          <h2 className="mb-6 text-2xl font-semibold text-white/90">
            Management Dashboard
          </h2>
          <p className="text-base leading-relaxed text-white/70">
            A comprehensive admin dashboard for managing content, users,
            and system settings.
          </p>

        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 dark:bg-gray-950 lg:w-1/2">
        {/* Mobile Header */}
        <div className="mb-8 text-center lg:hidden">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-primary p-2">
            <Image
              src="/logo-cdp.png"
              alt="CDP Logo"
              width={72}
              height={72}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-bold text-text-primary dark:text-white">
            CDP Admin
          </h1>
          <p className="text-xs text-text-muted dark:text-gray-400">
            Management Dashboard
          </p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-text-muted dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300"
              >
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-text-muted dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={cn(
                    "block w-full rounded-xl border bg-surface py-2.5 pl-10 pr-3.5 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
                    errors.email
                      ? "border-error focus:border-error"
                      : "border-border focus:border-primary dark:border-gray-700"
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-error">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-text-muted dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className={cn(
                    "block w-full rounded-xl border bg-surface py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
                    errors.password
                      ? "border-error focus:border-error"
                      : "border-border focus:border-primary dark:border-gray-700"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-muted transition-colors hover:text-text-primary dark:text-gray-500 dark:hover:text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-error">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
