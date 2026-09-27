import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseShell } from "@/components/shell/enterprise-shell";
import { RecommendPage } from "@/components/intel/intel-pages";

export const Route = createFileRoute("/khuyen-nghi")({
  component: function KhuyenNghi() {
    return (
      <EnterpriseShell>
        <RecommendPage />
      </EnterpriseShell>
    );
  },
});
