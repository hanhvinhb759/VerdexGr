import { createFileRoute } from "@tanstack/react-router";
import { ProductReviewPage } from "@/components/public/public-pages";

export const Route = createFileRoute("/nhom-hang/$id")({
  component: ProductReviewPage,
});
