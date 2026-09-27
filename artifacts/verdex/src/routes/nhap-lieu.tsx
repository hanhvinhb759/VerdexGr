import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseShell } from "@/components/shell/enterprise-shell";
import { DataPage } from "@/components/ops/work-pages";

export const Route = createFileRoute("/nhap-lieu")({
  component: function NhapLieu() {
    return (
      <EnterpriseShell>
        <DataPage />
      </EnterpriseShell>
    );
  },
});
