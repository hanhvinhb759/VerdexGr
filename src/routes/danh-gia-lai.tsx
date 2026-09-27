import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseShell } from "@/components/shell/enterprise-shell";
import { ReassessPage } from "@/components/intel/intel-pages";

export const Route = createFileRoute("/danh-gia-lai")({
  component: function DanhGiaLai() {
    return (
      <EnterpriseShell>
        <ReassessPage />
      </EnterpriseShell>
    );
  },
});
