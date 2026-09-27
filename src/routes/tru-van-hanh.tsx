import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseShell } from "@/components/shell/enterprise-shell";
import { PillarsPage } from "@/components/ops/work-pages";

export const Route = createFileRoute("/tru-van-hanh")({
  component: function Tru() {
    return (
      <EnterpriseShell>
        <PillarsPage />
      </EnterpriseShell>
    );
  },
});
