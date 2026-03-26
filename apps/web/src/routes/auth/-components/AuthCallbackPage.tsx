import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { UserRole } from "@rezz/shared";
import { Route } from "../callback";
import { AuthUser, useAuthStore } from "@/store/auth.store";
import { ROLE_REDIRECT } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export function AuthCallbackPage() {
  const { t } = useTranslation();
  const { token, refreshToken } = Route.useSearch();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      if (!token || !refreshToken) {
        toast.error(t("auth.google_error"));
        navigate({ to: "/" });
        return;
      }

      try {
        const { data: user } = await api.get<AuthUser>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAuth(user, token, refreshToken);
        toast.success(t("auth.login_success", { name: user.firstName }));

        const redirect = ROLE_REDIRECT[user.role as UserRole] ?? "/";
        navigate({ to: redirect });
      } catch {
        toast.error(t("auth.google_error"));
        navigate({ to: "/" });
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-tertiary-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
        <p className="text-sm text-tertiary-600">{t("common.loading")}</p>
      </div>
    </div>
  );
}
