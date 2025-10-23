import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "../api";

const statusOptions = ["pending", "printing", "complete", "failed"] as const;

type FormState = {
  printJobId: string;
  status: (typeof statusOptions)[number];
  printDate: string;
  orderId: string;
};

export default function AdminPrintJobCreate() {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>({
    printJobId: "",
    status: "pending",
    printDate: new Date().toISOString().slice(0, 16),
    orderId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isoHint = useMemo(() => new Date().toISOString().replace("T", " "), []);

  const handleChange = (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleStatusChange = (value: string) => {
    setValues((current) => ({ ...current, status: value as FormState["status"] }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.printJob.create({
        printJobId: values.printJobId,
        status: values.status,
        printDate: values.printDate ? new Date(values.printDate).toISOString() : undefined,
        order: values.orderId ? { _link: values.orderId } : undefined,
      });
      navigate("/admin/print-jobs");
    } catch (err) {
      console.error("Failed to create print job", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create print job. Please verify the values and try again."
      );
      setIsSubmitting(false);
    }
  };

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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="printJobId">
                  Print job ID
                </label>
                <Input
                  id="printJobId"
                  value={values.printJobId}
                  onChange={handleChange("printJobId")}
                  placeholder="PJ-2024-0001"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="status">
                  Status
                </label>
                <Select value={values.status} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option} value={option} className="capitalize">
                        {option.replace(/-/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="printDate">
                  Print date
                </label>
                <Input
                  id="printDate"
                  type="datetime-local"
                  value={values.printDate}
                  onChange={handleChange("printDate")}
                />
                <p className="text-xs text-muted-foreground">ISO timestamp hint: {isoHint}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="orderId">
                  Order ID (optional)
                </label>
                <Input
                  id="orderId"
                  value={values.orderId}
                  onChange={handleChange("orderId")}
                  placeholder="Order identifier"
                />
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to create print job</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create job"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
