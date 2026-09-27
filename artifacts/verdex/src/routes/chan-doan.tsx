import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseShell } from "@/components/shell/enterprise-shell";
import { DiagnosisPage } from "@/components/intel/intel-pages";

export const Route = createFileRoute("/chan-doan")({
  component: function ChanDoan() {
    return (
      <EnterpriseShell>
        <DiagnosisPage />
      </EnterpriseShell>
    );
  },
});
