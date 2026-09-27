import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseShell } from "@/components/shell/enterprise-shell";
import { GapPage } from "@/components/intel/intel-pages";

export const Route = createFileRoute("/khoang-cach")({
  component: function KhoangCach() {
    return (
      <EnterpriseShell>
        <GapPage />
      </EnterpriseShell>
    );
  },
});
