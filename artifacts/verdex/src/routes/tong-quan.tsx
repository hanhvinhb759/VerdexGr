import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseShell } from "@/components/shell/enterprise-shell";
import { OverviewDashboard } from "@/components/dashboard/overview-dashboard";

export const Route = createFileRoute("/tong-quan")({
  component: function TongQuan() {
    return (
      <EnterpriseShell>
        <OverviewDashboard />
      </EnterpriseShell>
    );
  },
});
