import { createFileRoute } from "@tanstack/react-router";
import { AuthCallbackPage } from "./-components/AuthCallbackPage";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string | undefined,
    refreshToken: search.refreshToken as string | undefined,
  }),
  component: AuthCallbackPage,
});
