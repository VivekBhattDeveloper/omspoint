import type { FormEvent } from "react";
import { useState } from "react";
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
import { Clock, Mail, MapPin, Phone, Plus, Trash2, Users } from "lucide-react";
import type { CheckedState } from "@radix-ui/react-checkbox";
import type {
  AddressType,
  ChannelSla,
  EscalationContact,
  WarehouseAddress,
} from "@/data/channel-config";
import {
  cloneContacts,
  createChannelConfigSeed,
} from "@/data/channel-config";
import type { Route } from "./+types/_app.seller.settings._index";

interface AddressFormState {
  label: string;
  type: AddressType;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  pickupDays: string;
  pickupWindow: string;
  carrierCutoff: string;
  isDefault: boolean;
}

interface ContactFormState {
  name: string;
  role: string;
  email: string;
  phone: string;
  coverage: string;
  isPrimary: boolean;
}

const addressTypeLabels: Record<AddressType, string> = {
  fulfillment: "Fulfillment",
  returns: "Returns",
  pickup: "Pickup",
};

const loadSellerSettings = async (context: Route.LoaderArgs["context"]) => {
  void context;
  // TODO: Replace seed data with seller settings fetched from finance/SLA services once APIs are available.
  return createChannelConfigSeed();
};

export const loader = async ({ context }: Route.LoaderArgs) => loadSellerSettings(context);

export default function SellerSettingsPage({ loaderData }: Route.ComponentProps) {
  const [addresses, setAddresses] = useState<WarehouseAddress[]>(() => loaderData.addresses.map((address) => ({ ...address })));
  const [contacts, setContacts] = useState<EscalationContact[]>(() => cloneContacts(loaderData.contacts));
  const [channelSlas, setChannelSlas] = useState<ChannelSla[]>(() => loaderData.channelSlas.map((sla) => ({ ...sla })));

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const [newAddress, setNewAddress] = useState<AddressFormState>({
    label: "",
    type: "fulfillment",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    pickupDays: "Mon – Fri",
    pickupWindow: "09:00 – 18:00",
    carrierCutoff: "",
    isDefault: false,
  });

  const [newContact, setNewContact] = useState<ContactFormState>({
    name: "",
    role: "",
    email: "",
    phone: "",
    coverage: "",
    isPrimary: false,
  });
  const [newContactChannels, setNewContactChannels] = useState<string[]>([]);

  const resetAddressForm = () => {
    setNewAddress({
      label: "",
      type: "fulfillment",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      pickupDays: "Mon – Fri",
      pickupWindow: "09:00 – 18:00",
      carrierCutoff: "",
      isDefault: false,
    });
  };

  const resetContactForm = () => {
    setNewContact({
      name: "",
      role: "",
      email: "",
      phone: "",
      coverage: "",
      isPrimary: false,
    });
    setNewContactChannels([]);
  };

  const handleAddAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields: Array<[keyof AddressFormState, string]> = [
      ["label", "Label"],
      ["addressLine1", "Address line"],
      ["city", "City"],
      ["state", "State"],
      ["postalCode", "Postal code"],
      ["country", "Country"],
      ["contactName", "Contact name"],
      ["contactEmail", "Contact email"],
      ["contactPhone", "Contact phone"],
    ];

    for (const [field, label] of requiredFields) {
      const value = newAddress[field];
      if (typeof value === "string") {
        if (!value.trim()) {
          toast.error(`${label} is required`);
          return;
        }
      } else {
        if (!value) {
          toast.error(`${label} is required`);
          return;
        }
      }
    }

    const id = `addr-${Date.now()}`;
    const nextAddress: WarehouseAddress = {
      id,
      label: newAddress.label,
      type: newAddress.type,
      addressLine1: newAddress.addressLine1,
      addressLine2: newAddress.addressLine2.trim(),
      city: newAddress.city,
      state: newAddress.state,
      postalCode: newAddress.postalCode,
      country: newAddress.country,
      contactName: newAddress.contactName,
      contactEmail: newAddress.contactEmail,
      contactPhone: newAddress.contactPhone,
      pickupDays: newAddress.pickupDays,
      pickupWindow: newAddress.pickupWindow,
      carrierCutoff: newAddress.carrierCutoff,
      isDefault: newAddress.isDefault,
    };

    setAddresses((prev) => {
      const normalized = newAddress.isDefault
        ? prev.map((address) => ({ ...address, isDefault: false }))
        : [...prev];
      return [...normalized, nextAddress];
    });

    toast.success("Address added to seller profile");
    resetAddressForm();
    setAddressDialogOpen(false);
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((address) => ({
        ...address,
        isDefault: address.id === id,
      })),
    );
    toast.success("Default warehouse updated");
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((address) => address.id !== id);
      if (filtered.length === 0) {
        toast.error("At least one address is required");
        return prev;
      }

      const hasDefault = filtered.some((address) => address.isDefault);
      const fallbackList = hasDefault
        ? filtered
        : filtered.map((address, index) => (index === 0 ? { ...address, isDefault: true } : address));
      const fallbackDefaultId = fallbackList.find((address) => address.isDefault)?.id ?? filtered[0].id;

      setPreferences((prefs) =>
        prefs.map((pref) =>
          pref.defaultWarehouseId === id ? { ...pref, defaultWarehouseId: fallbackDefaultId } : pref,
        ),
      );

      toast.success("Address removed");
      return fallbackList;
    });
  };

  const handleAddressCheckbox = (checked: CheckedState) => {
    setNewAddress((prev) => ({
      ...prev,
      isDefault: Boolean(checked),
    }));
  };

  const handleContactChannelToggle = (channel: string, checked: CheckedState) => {
    setNewContactChannels((prev) => {
      if (checked) {
        return prev.includes(channel) ? prev : [...prev, channel];
      }
      return prev.filter((item) => item !== channel);
    });
  };

  const handleAddContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newContact.name.trim() || !newContact.role.trim() || !newContact.email.trim() || !newContact.phone.trim()) {
      toast.error("Name, role, email, and phone are required");
      return;
    }

    const id = `contact-${Date.now()}`;
    const nextContact: EscalationContact = {
      id,
      name: newContact.name,
      role: newContact.role,
      email: newContact.email,
      phone: newContact.phone,
      coverage: newContact.coverage || "",
      channels: newContactChannels,
      isPrimary: newContact.isPrimary,
    };

    setContacts((prev) => {
      const normalized = newContact.isPrimary
        ? prev.map((contact) => ({ ...contact, isPrimary: false }))
        : [...prev];
      return [...normalized, nextContact];
    });

    if (newContactChannels.length === 0) {
      setChannelSlas((prev) =>
        prev.map((sla) =>
          sla.escalationContactId
            ? sla
            : {
              ...sla,
              escalationContactId: id,
            },
        ),
      );
    }

    toast.success("Escalation contact added");
    resetContactForm();
    setContactDialogOpen(false);
  };

  const handleContactPrimaryToggle = (checked: CheckedState) => {
    setNewContact((prev) => ({
      ...prev,
      isPrimary: Boolean(checked),
    }));
  };

  const handleRemoveContact = (id: string) => {
    if (contacts.length === 1) {
      toast.error("At least one escalation contact is required");
      return;
    }

    const remainingContacts = contacts.filter((contact) => contact.id !== id);
    const nextPrimary = remainingContacts.find((contact) => contact.isPrimary) ?? remainingContacts[0];

    setContacts(remainingContacts.map((contact) => ({
      ...contact,
      isPrimary: contact.id === nextPrimary.id,
    })));

    setChannelSlas((prev) =>
      prev.map((sla) =>
        sla.escalationContactId === id ? { ...sla, escalationContactId: nextPrimary.id } : sla,
      ),
    );

    toast.success("Escalation contact removed");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seller Settings"
        description="Maintain addresses and escalation contacts for seller operations."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Warehouse addresses</CardTitle>
              <CardDescription>Control fulfillment, returns, and pickup locations used by sellers.</CardDescription>
            </div>
            <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add address
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Add warehouse address</DialogTitle>
                  <DialogDescription>Configure pickup window and escalation contact information.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleAddAddress}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address-label">Label</Label>
                      <Input
                        id="address-label"
                        value={newAddress.label}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            label: event.target.value,
                          }))
                        }
                        placeholder="e.g. Primary fulfillment center"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newAddress.type}
                        onValueChange={(value: AddressType) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            type: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fulfillment">Fulfillment</SelectItem>
                          <SelectItem value="returns">Returns</SelectItem>
                          <SelectItem value="pickup">Pickup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-line1">Address line 1</Label>
                      <Input
                        id="address-line1"
                        value={newAddress.addressLine1}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            addressLine1: event.target.value,
                          }))
                        }
                        placeholder="Street, number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-line2">Address line 2</Label>
                      <Input
                        id="address-line2"
                        value={newAddress.addressLine2}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            addressLine2: event.target.value,
                          }))
                        }
                        placeholder="Suite, floor (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-city">City</Label>
                      <Input
                        id="address-city"
                        value={newAddress.city}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            city: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-state">State / Province</Label>
                      <Input
                        id="address-state"
                        value={newAddress.state}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            state: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-postal">Postal code</Label>
                      <Input
                        id="address-postal"
                        value={newAddress.postalCode}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            postalCode: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-country">Country</Label>
                      <Input
                        id="address-country"
                        value={newAddress.country}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            country: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-contact-name">Contact name</Label>
                      <Input
                        id="address-contact-name"
                        value={newAddress.contactName}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            contactName: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-contact-email">Contact email</Label>
                      <Input
                        id="address-contact-email"
                        value={newAddress.contactEmail}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            contactEmail: event.target.value,
                          }))
                        }
                        type="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-contact-phone">Contact phone</Label>
                      <Input
                        id="address-contact-phone"
                        value={newAddress.contactPhone}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            contactPhone: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-pickup-days">Pickup days</Label>
                      <Input
                        id="address-pickup-days"
                        value={newAddress.pickupDays}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            pickupDays: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-pickup-window">Pickup window</Label>
                      <Input
                        id="address-pickup-window"
                        value={newAddress.pickupWindow}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            pickupWindow: event.target.value,
                          }))
                        }
                        placeholder="09:00 – 18:00"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address-carrier-cutoff">Carrier cutoff notes</Label>
                      <Textarea
                        id="address-carrier-cutoff"
                        value={newAddress.carrierCutoff}
                        onChange={(event) =>
                          setNewAddress((prev) => ({
                            ...prev,
                            carrierCutoff: event.target.value,
                          }))
                        }
                        placeholder="e.g. UPS picks up at 18:30 ET"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="address-default" checked={newAddress.isDefault} onCheckedChange={handleAddressCheckbox} />
                    <Label htmlFor="address-default">Set as default fulfillment location</Label>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAddressDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save address</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold tracking-tight">{address.label}</span>
                      <Badge variant="outline" className="uppercase">
                        {addressTypeLabels[address.type]}
                      </Badge>
                      {address.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4" />
                      <div>
                        <p>
                          {address.addressLine1}
                          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                        </p>
                        <p>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetDefaultAddress(address.id)}
                      disabled={address.isDefault}
                    >
                      Set default
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRemoveAddress(address.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4" />
                      {address.contactName}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {address.contactEmail}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.contactPhone}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Pickup window
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.pickupDays} · {address.pickupWindow}
                    </p>
                    {address.carrierCutoff && (
                      <p className="text-sm text-muted-foreground">{address.carrierCutoff}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Escalation contacts</CardTitle>
              <CardDescription>Route incident alerts and SLA breaches to the right team.</CardDescription>
            </div>
            <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add escalation contact</DialogTitle>
                  <DialogDescription>Assign coverage windows and channel responsibilities.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleAddContact}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="contact-name">Name</Label>
                      <Input
                        id="contact-name"
                        value={newContact.name}
                        onChange={(event) =>
                          setNewContact((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-role">Role / Team</Label>
                      <Input
                        id="contact-role"
                        value={newContact.role}
                        onChange={(event) =>
                          setNewContact((prev) => ({
                            ...prev,
                            role: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-coverage">Coverage window</Label>
                      <Input
                        id="contact-coverage"
                        value={newContact.coverage}
                        onChange={(event) =>
                          setNewContact((prev) => ({
                            ...prev,
                            coverage: event.target.value,
                          }))
                        }
                        placeholder="e.g. Weekdays 09:00 – 19:00 ET"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={newContact.email}
                        onChange={(event) =>
                          setNewContact((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Phone</Label>
                      <Input
                        id="contact-phone"
                        value={newContact.phone}
                        onChange={(event) =>
                          setNewContact((prev) => ({
                            ...prev,
                            phone: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Channels covered</Label>
                    <div className="space-y-3 rounded-md border p-3">
                      {channelSlas.map((sla) => {
                        const channelId = `contact-channel-${sla.channel}`;
                        return (
                          <div key={channelId} className="flex items-center space-x-2">
                            <Checkbox
                              id={channelId}
                              checked={newContactChannels.includes(sla.channel)}
                              onCheckedChange={(checked) => handleContactChannelToggle(sla.channel, checked)}
                            />
                            <Label htmlFor={channelId} className="text-sm font-normal">
                              {sla.channel}
                            </Label>
                          </div>
                        );
                      })}
                      {channelSlas.length === 0 && (
                        <p className="text-sm text-muted-foreground">SLA channels will show here.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="contact-primary" checked={newContact.isPrimary} onCheckedChange={handleContactPrimaryToggle} />
                    <Label htmlFor="contact-primary">Set as primary escalation owner</Label>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setContactDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save contact</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
                  {contact.coverage && <p className="text-sm text-muted-foreground">{contact.coverage}</p>}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {contact.channels.length > 0 ? (
                      contact.channels.map((channel) => (
                        <Badge key={channel} variant="outline">
                          {channel}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No channels assigned yet</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end">
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

    </div>
  );
}
