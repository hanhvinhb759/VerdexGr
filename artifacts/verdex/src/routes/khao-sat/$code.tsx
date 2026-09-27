import { createFileRoute } from "@tanstack/react-router";
import { SurveyPage } from "@/components/public/public-pages";

export const Route = createFileRoute("/khao-sat/$code")({
  component: SurveyPage,
});
