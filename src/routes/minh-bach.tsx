import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseShell } from "@/components/shell/enterprise-shell";
import { TransparencyPage } from "@/components/ops/work-pages";

export const Route = createFileRoute("/minh-bach")({
  component: function MinhBach() {
    return (
      <EnterpriseShell>
        <TransparencyPage />
      </EnterpriseShell>
    );
  },
});
