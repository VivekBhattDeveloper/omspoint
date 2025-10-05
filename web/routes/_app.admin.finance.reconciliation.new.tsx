import { useNavigate } from "react-router";
import {
  AutoBelongsToInput,
  AutoDateTimePicker,
  AutoEnumInput,
  AutoForm,
  AutoInput,
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";

export default function AdminFinanceReconciliationCreate() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New reconciliation run"
        description="Kick off a reconciliation batch or backfill a historical run."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Reconciliation details</CardTitle>
          <CardDescription>Set identifiers, status, and associated order context.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.financeReconciliation.create}
            include={["reconciliationId", "status", "reconciliationDate", "order"]}
            onSuccess={() => navigate("/admin/finance/reconciliation")}
          >
            <SubmitResultBanner />
            <div className="grid gap-4 md:grid-cols-2">
              <AutoInput field="reconciliationId" />
              <AutoEnumInput field="status" />
              <AutoDateTimePicker field="reconciliationDate" />
              <AutoBelongsToInput field="order" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <AutoSubmit>Create run</AutoSubmit>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </AutoForm>
        </CardContent>
      </Card>
    </div>
  );
}
