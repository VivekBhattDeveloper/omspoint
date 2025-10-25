import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../api";

export default function AdminInviteCreate() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: "", inviteToken: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: "email" | "inviteToken") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.invite.create({
        email: formValues.email,
        inviteToken: formValues.inviteToken || undefined,
      });
      navigate("/admin/invites");
    } catch (err) {
      console.error("Failed to create invite", err);
      setError(
        err instanceof Error ? err.message : "Unable to create invite. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create invite"
        description="Issue a new invitation link for platform access."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Invite details</CardTitle>
          <CardDescription>Provide recipient information and optional token overrides.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange("email")}
                  required
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteToken">Invite token (optional)</Label>
                <Input
                  id="inviteToken"
                  value={formValues.inviteToken}
                  onChange={handleChange("inviteToken")}
                  placeholder="Auto-generated if left blank"
                />
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to send invite</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center gap-2 pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send invite"}
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
