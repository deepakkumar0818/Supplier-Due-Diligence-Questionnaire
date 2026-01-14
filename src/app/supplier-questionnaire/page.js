import SupplierDueDiligenceFormContent from "./SupplierDueDiligenceFormContent";
import { Suspense } from "react";
export default function SupplierDueDiligenceFormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SupplierDueDiligenceFormContent />
    </Suspense>
  );
}
