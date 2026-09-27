import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/public/public-pages";

export const Route = createFileRoute("/doanh-nghiep/$code")({
  component: ProfilePage,
});
