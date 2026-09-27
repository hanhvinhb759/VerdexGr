import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseShell } from "@/components/shell/enterprise-shell";
import { MatrixPage } from "@/components/ops/work-pages";

export const Route = createFileRoute("/ma-tran")({
  component: function MaTran() {
    return (
      <EnterpriseShell>
        <MatrixPage />
      </EnterpriseShell>
    );
  },
});
