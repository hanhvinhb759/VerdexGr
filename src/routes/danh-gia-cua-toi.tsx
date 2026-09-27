import { createFileRoute } from "@tanstack/react-router";
import { MyReviewsPage } from "@/components/public/public-pages";

export const Route = createFileRoute("/danh-gia-cua-toi")({
  component: MyReviewsPage,
});
