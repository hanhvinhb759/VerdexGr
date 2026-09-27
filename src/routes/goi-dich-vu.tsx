import { createFileRoute } from "@tanstack/react-router";
import { PlanPage } from "@/components/account/account-pages";

export const Route = createFileRoute("/goi-dich-vu")({
  component: PlanPage,
});
