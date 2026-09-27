import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/components/account/account-pages";

export const Route = createFileRoute("/dang-ky")({
  component: RegisterPage,
});
