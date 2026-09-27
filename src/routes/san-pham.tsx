import { createFileRoute } from "@tanstack/react-router";
import { ProductPage } from "@/components/intel/product-pages";
import { EnterpriseShell } from "@/components/shell/enterprise-shell";

export const Route = createFileRoute("/san-pham")({
  component: function SanPham() {
    return (
      <EnterpriseShell>
        <ProductPage />
      </EnterpriseShell>
    );
  },
});
