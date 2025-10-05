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

export default function AdminPrintJobCreate() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create print job"
        description="Inject a new production job or reroute an existing order."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
          <CardDescription>Set identifiers, status, schedule, and order linkage.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.printJob.create}
            include={["printJobId", "status", "printDate", "order"]}
            onSuccess={() => navigate("/admin/print-jobs")}
          >
            <SubmitResultBanner />
            <div className="grid gap-4 md:grid-cols-2">
              <AutoInput field="printJobId" />
              <AutoEnumInput field="status" />
              <AutoDateTimePicker field="printDate" />
              <AutoBelongsToInput field="order" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <AutoSubmit>Create job</AutoSubmit>
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
