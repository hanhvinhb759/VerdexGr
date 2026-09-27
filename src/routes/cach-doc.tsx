import { createFileRoute } from "@tanstack/react-router";
import { GuidePage } from "@/components/public/public-pages";

export const Route = createFileRoute("/cach-doc")({
  component: GuidePage,
});
