import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, Banknote, CheckCircle, FileText, Mail, Phone, Plus, Shield, Trash2 } from "lucide-react";
import type { CheckedState } from "@radix-ui/react-checkbox";
import type { Route } from "./+types/_app.vendor.settings._index";

interface PayoutAccount {
  id: string;
  bankName: string;
  accountNickname: string;
  accountLast4: string;
  routingNumber: string;
  currency: string;
  country: string;
  status: "Active" | "Pending" | "Suspended";
  primary: boolean;
  autoPayout: boolean;
  sameDayEnabled: boolean;
  lastReconciled: string;
}

interface ComplianceDocument {
  id: string;
  type: string;
  version: string;
  status: "Approved" | "Pending" | "Expired";
  uploadedBy: string;
  uploadedAt: string;
  expiresAt?: string;
  notes?: string;
}

interface EscalationContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  responsibility: string;
  isPrimary: boolean;
}

interface NotificationPreference {
  id: string;
  role: string;
  email: boolean;
  sms: boolean;
  slack: boolean;
  pagerDuty: boolean;
  businessHoursOnly: boolean;
  escalationContactId: string;
}

type NextActionStatus = "Todo" | "In progress" | "Complete";

interface NextActionItem {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: NextActionStatus;
}

interface PayoutFormState {
  bankName: string;
  accountNickname: string;
  accountNumber: string;
  routingNumber: string;
  currency: string;
  country: string;
  autoPayout: boolean;
  sameDayEnabled: boolean;
  primary: boolean;
}

interface DocumentFormState {
  type: string;
  version: string;
  expiresAt: string;
  notes: string;
}

const seedVendorPayoutAccounts: PayoutAccount[] = [
  {
    id: "acct-primary",
    bankName: "First National Bank",
    accountNickname: "Operating Checking",
    accountLast4: "1023",
    routingNumber: "026009593",
    currency: "USD",
    country: "US",
    status: "Active",
    primary: true,
    autoPayout: true,
    sameDayEnabled: true,
    lastReconciled: "2025-02-01",
  },
  {
    id: "acct-alt",
    bankName: "Coastal Credit Union",
    accountNickname: "Reserve Account",
    accountLast4: "8841",
    routingNumber: "053112482",
    currency: "USD",
    country: "US",
    status: "Pending",
    primary: false,
    autoPayout: false,
    sameDayEnabled: false,
    lastReconciled: "2025-01-22",
  },
];

const seedVendorComplianceDocuments: ComplianceDocument[] = [
  {
    id: "doc-w9",
    type: "IRS W-9",
    version: "2025",
    status: "Approved",
    uploadedBy: "Finance Ops",
    uploadedAt: "2024-12-15",
    notes: "Validated against EIN 82-9941205",
  },
  {
    id: "doc-nda",
    type: "Vendor NDA",
    version: "v2.3",
    status: "Pending",
    uploadedBy: "Legal",
    uploadedAt: "2025-01-11",
    notes: "Waiting on counter-signature",
  },
  {
    id: "doc-gdpr",
    type: "GDPR DPA",
    version: "2024",
    status: "Expired",
    uploadedBy: "Compliance",
    uploadedAt: "2023-10-04",
    expiresAt: "2024-10-04",
    notes: "Renewal kicked off with counsel",
  },
];

const seedVendorContacts: EscalationContact[] = [
  {
    id: "contact-ops",
    name: "Maya Hernandez",
    role: "Production Duty Manager",
    email: "maya.hernandez@merchx.com",
    phone: "+1 646-555-4821",
    responsibility: "Line stops, print capacity, urgent rebuilds",
    isPrimary: true,
  },
  {
    id: "contact-fin",
    name: "Chris Delaney",
    role: "Vendor Finance Lead",
    email: "chris.delaney@merchx.com",
    phone: "+1 312-555-1176",
    responsibility: "Payout exceptions, reconciliation",
    isPrimary: false,
  },
  {
    id: "contact-compliance",
    name: "Ishita Rao",
    role: "Compliance Manager",
    email: "ishita.rao@merchx.com",
    phone: "+1 415-555-9923",
    responsibility: "KYC refresh, audit responses",
    isPrimary: false,
  },
];

const seedVendorNotifications: NotificationPreference[] = [
  {
    id: "notif-ops",
    role: "Operations",
    email: true,
    sms: true,
    slack: true,
    pagerDuty: true,
    businessHoursOnly: false,
    escalationContactId: "contact-ops",
  },
  {
    id: "notif-fin",
    role: "Finance",
    email: true,
    sms: false,
    slack: true,
    pagerDuty: false,
    businessHoursOnly: true,
    escalationContactId: "contact-fin",
  },
  {
    id: "notif-compliance",
    role: "Compliance",
    email: true,
    sms: false,
    slack: false,
    pagerDuty: false,
    businessHoursOnly: true,
    escalationContactId: "contact-compliance",
  },
];

const seedVendorNextActions: NextActionItem[] = [
  {
    id: "action-compliance",
    title: "Keep the vendor account compliant and ready to transact",
    description: "Review outstanding compliance requirements for the current quarter.",
    owner: "Operations",
    status: "Todo",
  },
  {
    id: "action-payouts",
    title: "Sync verified payout accounts",
    description: "Push approved banking details to the finance service once credentials are stored.",
    owner: "Finance",
    status: "In progress",
  },
  {
    id: "action-docs",
    title: "Attach signed compliance documents",
    description: "Upload latest signed documents and schedule expirations for audit.",
    owner: "Compliance",
    status: "Todo",
  },
  {
    id: "action-notifications",
    title: "Push notification preferences",
    description: "Send updated routing rules to the vendor comms service for alert delivery.",
    owner: "Operations",
    status: "Todo",
  },
  {
    id: "action-kyc",
    title: "Backfill KYC refresh reminders",
    description: "Schedule follow-ups based on the oldest approved document on file.",
    owner: "Compliance",
    status: "Todo",
  },
];

const cloneContacts = (contacts: EscalationContact[]) => contacts.map((contact) => ({ ...contact }));

const cloneNotifications = (notifications: NotificationPreference[]) =>
  notifications.map((pref) => ({ ...pref }));

const createSeedVendorSettings = () => ({
  payoutAccounts: seedVendorPayoutAccounts.map((account) => ({ ...account })),
  documents: seedVendorComplianceDocuments.map((document) => ({ ...document })),
  contacts: cloneContacts(seedVendorContacts),
  notifications: cloneNotifications(seedVendorNotifications),
  nextActions: seedVendorNextActions.map((action) => ({ ...action })),
});

const loadVendorSettings = async (context: Route.LoaderArgs["context"]) => {
  void context;
  // TODO: Source vendor payout/compliance configuration from Gadget actions once services are online.
  return createSeedVendorSettings();
};

export const loader = async ({ context }: Route.LoaderArgs) => loadVendorSettings(context);

export default function VendorSettingsPage({ loaderData }: Route.ComponentProps) {
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccount[]>(() => loaderData.payoutAccounts.map((account) => ({ ...account })));
  const [documents, setDocuments] = useState<ComplianceDocument[]>(() => loaderData.documents.map((document) => ({ ...document })));
  const [contacts, setContacts] = useState<EscalationContact[]>(() => cloneContacts(loaderData.contacts));
  const [notifications, setNotifications] = useState<NotificationPreference[]>(() => cloneNotifications(loaderData.notifications));
  const [nextActions, setNextActions] = useState<NextActionItem[]>(() => loaderData.nextActions.map((action) => ({ ...action })));

  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  const [newAccount, setNewAccount] = useState<PayoutFormState>({
    bankName: "",
    accountNickname: "",
    accountNumber: "",
    routingNumber: "",
    currency: "USD",
    country: "US",
    autoPayout: true,
    sameDayEnabled: false,
    primary: false,
  });

  const [newDocument, setNewDocument] = useState<DocumentFormState>({
    type: "",
    version: "",
    expiresAt: "",
    notes: "",
  });

  const contactsById = useMemo(() => {
    return contacts.reduce<Record<string, EscalationContact>>((acc, contact) => {
      acc[contact.id] = contact;
      return acc;
    }, {});
  }, [contacts]);

  const resetAccountForm = useCallback(() => {
    setNewAccount({
      bankName: "",
      accountNickname: "",
      accountNumber: "",
      routingNumber: "",
      currency: "USD",
      country: "US",
      autoPayout: true,
      sameDayEnabled: false,
      primary: false,
    });
  }, []);

  const resetDocumentForm = useCallback(() => {
    setNewDocument({
      type: "",
      version: "",
      expiresAt: "",
      notes: "",
    });
  }, []);

  const handleAddPayoutAccount = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields: Array<[keyof PayoutFormState, string]> = [
      ["bankName", "Bank name"],
      ["accountNickname", "Account nickname"],
      ["accountNumber", "Account number"],
      ["routingNumber", "Routing number"],
      ["currency", "Currency"],
      ["country", "Country"],
    ];

    for (const [field, label] of requiredFields) {
      const value = newAccount[field as keyof PayoutFormState];
      if (typeof value === "string" && !value.trim()) {
        toast.error(`${label} is required`);
        return;
      }
    }

    const id = `acct-${Date.now()}`;
    const maskedLast4 = newAccount.accountNumber.slice(-4) || "0000";

    const nextAccount: PayoutAccount = {
      id,
      bankName: newAccount.bankName,
      accountNickname: newAccount.accountNickname,
      accountLast4: maskedLast4,
      routingNumber: newAccount.routingNumber,
      currency: newAccount.currency,
      country: newAccount.country,
      status: "Pending",
      primary: newAccount.primary,
      autoPayout: newAccount.autoPayout,
      sameDayEnabled: newAccount.sameDayEnabled,
      lastReconciled: "—",
    };

    setPayoutAccounts((previous) => {
      const normalized = newAccount.primary
        ? previous.map((account) => ({ ...account, primary: false }))
        : [...previous];
      return [...normalized, nextAccount];
    });

    toast.success("Payout account submitted for verification");
    resetAccountForm();
    setPayoutDialogOpen(false);
  }, [newAccount, resetAccountForm]);

  const handleRemoveAccount = useCallback((id: string) => {
    setPayoutAccounts((previous) => {
      const filtered = previous.filter((account) => account.id !== id);

      if (filtered.length === 0) {
        toast.error("At least one payout account is required");
        return previous;
      }

      if (!filtered.some((account) => account.primary)) {
        const updatedFirst = { ...filtered[0], primary: true };
        const updatedFiltered = [updatedFirst, ...filtered.slice(1)];
        toast.success("Payout account removed");
        return updatedFiltered;
      }

      toast.success("Payout account removed");
      return filtered;
    });
  }, []);

  const handleSetPrimaryAccount = useCallback((id: string) => {
    setPayoutAccounts((previous) =>
      previous.map((account) => ({
        ...account,
        primary: account.id === id,
      })),
    );
    toast.success("Primary payout account updated");
  }, []);

  const handleToggleAccountFlag = useCallback((id: string, key: "autoPayout" | "sameDayEnabled") => {
    setPayoutAccounts((previous) =>
      previous.map((account) =>
        account.id === id
          ? {
              ...account,
              [key]: !account[key],
            }
          : account,
      ),
    );
  }, []);

  const handleAddDocument = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newDocument.type.trim() || !newDocument.version.trim()) {
      toast.error("Document type and version are required");
      return;
    }

    const id = `doc-${Date.now()}`;
    const nextDocument: ComplianceDocument = {
      id,
      type: newDocument.type,
      version: newDocument.version,
      status: "Pending",
      uploadedBy: "Vendor Admin",
      uploadedAt: new Date().toISOString().slice(0, 10),
      expiresAt: newDocument.expiresAt || undefined,
      notes: newDocument.notes || undefined,
    };

    setDocuments((previous) => [...previous, nextDocument]);
    toast.success("Compliance document uploaded");
    resetDocumentForm();
    setDocumentDialogOpen(false);
  }, [newDocument, resetDocumentForm]);

  const handleDocumentStatusChange = useCallback((id: string, status: ComplianceDocument["status"]) => {
    setDocuments((previous) =>
      previous.map((document) =>
        document.id === id
          ? {
              ...document,
              status,
            }
          : document,
      ),
    );
  }, []);

  const handleRemoveDocument = useCallback((id: string) => {
    setDocuments((previous) => previous.filter((document) => document.id !== id));
    toast.success("Document removed from record");
  }, []);

  const handleContactPrimaryToggle = useCallback((id: string) => {
    setContacts((previous) =>
      previous.map((contact) => ({
        ...contact,
        isPrimary: contact.id === id,
      })),
    );
    toast.success("Primary escalation owner set");
  }, []);

  const handleRemoveContact = useCallback((id: string) => {
    if (contacts.length === 1) {
      toast.error("At least one escalation contact must remain");
      return;
    }

    const remaining = contacts.filter((contact) => contact.id !== id);
    const nextPrimary = remaining.find((contact) => contact.isPrimary) ?? remaining[0];

    setContacts(
      remaining.map((contact) => ({
        ...contact,
        isPrimary: contact.id === nextPrimary.id,
      })),
    );

    setNotifications((previous) =>
      previous.map((pref) =>
        pref.escalationContactId === id
          ? {
              ...pref,
              escalationContactId: nextPrimary.id,
            }
          : pref,
      ),
    );

    toast.success("Escalation contact removed");
  }, [contacts]);

  const toggleNotificationChannel = useCallback((
    id: string,
    key: keyof Pick<NotificationPreference, "email" | "sms" | "slack" | "pagerDuty">,
    checked: CheckedState,
  ) => {
    setNotifications((previous) =>
      previous.map((pref) =>
        pref.id === id
          ? {
              ...pref,
              [key]: Boolean(checked),
            }
          : pref,
      ),
    );
  }, []);

  const updateNotificationContact = useCallback((id: string, contactId: string) => {
    setNotifications((previous) =>
      previous.map((pref) =>
        pref.id === id
          ? {
              ...pref,
              escalationContactId: contactId,
            }
          : pref,
      ),
    );
  }, []);

  const toggleBusinessHoursOnly = useCallback((id: string, checked: CheckedState) => {
    setNotifications((previous) =>
      previous.map((pref) =>
        pref.id === id
          ? {
              ...pref,
              businessHoursOnly: Boolean(checked),
            }
          : pref,
      ),
    );
  }, []);

  const updateNextActionStatus = useCallback((id: string, status: NextActionStatus) => {
    setNextActions((previous) =>
      previous.map((action) =>
        action.id === id
          ? {
              ...action,
              status,
            }
          : action,
      ),
    );
    toast.success("Next action status updated");
  }, []);

  const nextActionStatusOptions: NextActionStatus[] = ["Todo", "In progress", "Complete"];

  // Memoized form handlers
  const handleNewAccountChange = useCallback((field: keyof PayoutFormState) => 
    (value: string | boolean) => {
      setNewAccount((previous) => ({
        ...previous,
        [field]: value,
      }));
    }, []);

  const handleNewDocumentChange = useCallback((field: keyof DocumentFormState) => 
    (value: string) => {
      setNewDocument((previous) => ({
        ...previous,
        [field]: value,
      }));
    }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Settings"
        description="Configure banking, notifications, escalation contacts, and compliance documents."
      />

      <div className="grid gap-6 xl:grid-cols-[3fr,2fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-muted-foreground" />
                Payout accounts
              </CardTitle>
              <CardDescription>Control where settlements are deposited and monitor banking status.</CardDescription>
            </div>
            <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Link payout destination</DialogTitle>
                  <DialogDescription>New accounts require verification before enabling payouts.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleAddPayoutAccount}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="bank-name">Bank name</Label>
                      <Input
                        id="bank-name"
                        value={newAccount.bankName}
                        onChange={(event) => handleNewAccountChange("bankName")(event.target.value)}
                        placeholder="e.g. First National Bank"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="account-nickname">Account nickname</Label>
                      <Input
                        id="account-nickname"
                        value={newAccount.accountNickname}
                        onChange={(event) => handleNewAccountChange("accountNickname")(event.target.value)}
                        placeholder="Operating checking"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-number">Account number</Label>
                      <Input
                        id="account-number"
                        value={newAccount.accountNumber}
                        onChange={(event) => handleNewAccountChange("accountNumber")(event.target.value)}
                        type="text"
                        inputMode="numeric"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routing-number">Routing number</Label>
                      <Input
                        id="routing-number"
                        value={newAccount.routingNumber}
                        onChange={(event) => handleNewAccountChange("routingNumber")(event.target.value)}
                        type="text"
                        inputMode="numeric"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={newAccount.currency}
                        onValueChange={handleNewAccountChange("currency")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={newAccount.country}
                        onChange={(event) => handleNewAccountChange("country")(event.target.value)}
                        placeholder="US"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={newAccount.autoPayout}
                        onCheckedChange={(checked) => handleNewAccountChange("autoPayout")(Boolean(checked))}
                      />
                      Enable automatic payout runs
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={newAccount.sameDayEnabled}
                        onCheckedChange={(checked) => handleNewAccountChange("sameDayEnabled")(Boolean(checked))}
                      />
                      Allow same-day disbursements
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={newAccount.primary}
                        onCheckedChange={(checked) => handleNewAccountChange("primary")(Boolean(checked))}
                      />
                      Set as primary payout route
                    </label>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setPayoutDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit for review</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {payoutAccounts.map((account) => (
              <div key={account.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold tracking-tight">{account.accountNickname}</span>
                      <Badge variant="outline">{account.bankName}</Badge>
                      {account.primary && <Badge variant="secondary">Primary</Badge>}
                      <Badge variant={account.status === "Active" ? "default" : account.status === "Pending" ? "secondary" : "destructive"}>
                        {account.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Account ••••{account.accountLast4} · Routing {account.routingNumber}
                    </div>
                    <p className="text-sm text-muted-foreground">Currency {account.currency} · {account.country}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="secondary" disabled={account.primary} onClick={() => handleSetPrimaryAccount(account.id)}>
                      Make primary
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleAccountFlag(account.id, "autoPayout")}>
                      {account.autoPayout ? "Disable auto payouts" : "Enable auto payouts"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleAccountFlag(account.id, "sameDayEnabled")}>
                      {account.sameDayEnabled ? "Disable same-day" : "Enable same-day"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveAccount(account.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>Last reconciled {account.lastReconciled}</span>
                  {account.autoPayout && <Badge variant="outline">Auto payout</Badge>}
                  {account.sameDayEnabled && <Badge variant="outline">Same-day enabled</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              Escalation contacts
            </CardTitle>
            <CardDescription>Ensure incidents reach the right vendor stakeholders quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight">{contact.name}</span>
                    <Badge variant="outline">{contact.role}</Badge>
                    {contact.isPrimary && <Badge variant="secondary">Primary</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {contact.phone}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.responsibility}</p>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button variant="secondary" size="sm" disabled={contact.isPrimary} onClick={() => handleContactPrimaryToggle(contact.id)}>
                    Set primary
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveContact(contact.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Compliance documents
              </CardTitle>
              <CardDescription>Track KYC packs, tax forms, and audit requirements.</CardDescription>
            </div>
            <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Log compliance document</DialogTitle>
                  <DialogDescription>Metadata syncs to your document vault.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleAddDocument}>
                  <div className="space-y-2">
                    <Label htmlFor="doc-type">Document type</Label>
                    <Input
                      id="doc-type"
                      value={newDocument.type}
                      onChange={(event) => handleNewDocumentChange("type")(event.target.value)}
                      placeholder="e.g. W-9, GDPR DPA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-version">Version / Reference</Label>
                    <Input
                      id="doc-version"
                      value={newDocument.version}
                      onChange={(event) => handleNewDocumentChange("version")(event.target.value)}
                      placeholder="2025"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-expiry">Expiry date (optional)</Label>
                    <Input
                      id="doc-expiry"
                      value={newDocument.expiresAt}
                      onChange={(event) => handleNewDocumentChange("expiresAt")(event.target.value)}
                      type="date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-notes">Notes</Label>
                    <Textarea
                      id="doc-notes"
                      value={newDocument.notes}
                      onChange={(event) => handleNewDocumentChange("notes")(event.target.value)}
                      placeholder="Add context or follow-up actions"
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDocumentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save metadata</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{document.type}</span>
                          <Badge variant="outline">{document.version}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{document.notes ?? "No notes"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={document.status}
                        onValueChange={(value) => handleDocumentStatusChange(document.id, value as ComplianceDocument["status"])}
                      >
                        <SelectTrigger className="h-9 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{document.uploadedAt}</span>
                        <span className="text-xs text-muted-foreground">{document.uploadedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {document.expiresAt ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveDocument(document.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              Notification routing
            </CardTitle>
            <CardDescription>Decide how each vendor team receives incidents, payouts, and compliance alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>SMS</TableHead>
                  <TableHead>Slack</TableHead>
                  <TableHead>PagerDuty</TableHead>
                  <TableHead>Escalation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((pref) => {
                  const assignedContact = contactsById[pref.escalationContactId];
                  return (
                    <TableRow key={pref.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="font-medium">{pref.role}</span>
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Checkbox
                              checked={pref.businessHoursOnly}
                              onCheckedChange={(checked) => toggleBusinessHoursOnly(pref.id, checked)}
                            />
                            Business hours only
                          </label>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={pref.email} onCheckedChange={(checked) => toggleNotificationChannel(pref.id, "email", checked)} />
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={pref.sms} onCheckedChange={(checked) => toggleNotificationChannel(pref.id, "sms", checked)} />
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={pref.slack} onCheckedChange={(checked) => toggleNotificationChannel(pref.id, "slack", checked)} />
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={pref.pagerDuty} onCheckedChange={(checked) => toggleNotificationChannel(pref.id, "pagerDuty", checked)} />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={pref.escalationContactId}
                          onValueChange={(value) => updateNotificationContact(pref.id, value)}
                        >
                          <SelectTrigger className="h-9 w-[200px]">
                            <SelectValue placeholder="Select contact" />
                          </SelectTrigger>
                          <SelectContent>
                            {contacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {contact.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {assignedContact && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Routes to {assignedContact.email}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
            Next actions
          </CardTitle>
          <CardDescription>Keep the vendor account compliant and ready to transact.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nextActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <span className="font-medium leading-none">{action.title}</span>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{action.owner}</TableCell>
                  <TableCell>
                    <Select
                      value={action.status}
                      onValueChange={(value) => updateNextActionStatus(action.id, value as NextActionStatus)}
                    >
                      <SelectTrigger className="h-9 w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {nextActionStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
