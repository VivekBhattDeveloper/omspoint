import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HelpCenterPage() {
  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <PageHeader
        title="Help Center"
        description="Find documentation, raise support requests, and view platform status."
      />
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>Jump into key destinations.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <a href="https://docs.gadget.dev" target="_blank" rel="noreferrer">
              Gadget documentation
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="https://status.gadget.dev" target="_blank" rel="noreferrer">
              Platform status
            </a>
          </Button>
          <Button asChild>
            <a href="mailto:support@merchx.com">Contact support</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
