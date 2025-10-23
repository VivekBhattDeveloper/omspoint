export type AddressType = "fulfillment" | "returns" | "pickup";

export type DispatchCommitment = "Same-day" | "24 hours" | "48 hours";

export type ReturnWindow = "30 days" | "45 days" | "60 days";

export interface WarehouseAddress {
  id: string;
  label: string;
  type: AddressType;
  addressLine1: string;
  addressLine2?: string;
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

export interface EscalationContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  coverage: string;
  channels: string[];
  isPrimary: boolean;
}

export interface ChannelSla {
  id: string;
  channel: string;
  region: string;
  orderCutoff: string;
  dispatchCommitment: DispatchCommitment;
  carrierPickup: string;
  returnWindow: ReturnWindow;
  escalationContactId: string;
  active: boolean;
}

export interface ChannelPreference {
  id: string;
  channel: string;
  region: string;
  orderSync: boolean;
  inventorySync: boolean;
  priceSync: boolean;
  notificationOps: boolean;
  notificationFinance: boolean;
  defaultWarehouseId: string;
  slaId: string;
}

export const dispatchOptions: DispatchCommitment[] = ["Same-day", "24 hours", "48 hours"];

export const returnWindowOptions: ReturnWindow[] = ["30 days", "45 days", "60 days"];

export const seedSellerAddresses: WarehouseAddress[] = [
  {
    id: "addr-nj",
    label: "Primary Fulfillment Center",
    type: "fulfillment",
    addressLine1: "1200 Industrial Way",
    addressLine2: "Suite 400",
    city: "Newark",
    state: "NJ",
    postalCode: "07114",
    country: "USA",
    contactName: "Priya Desai",
    contactEmail: "operations@merchx.com",
    contactPhone: "+1 973-555-0110",
    pickupDays: "Mon – Fri",
    pickupWindow: "09:00 – 18:00 ET",
    carrierCutoff: "UPS final pickup 18:30 ET",
    isDefault: true,
  },
  {
    id: "addr-ca",
    label: "West Coast Returns Hub",
    type: "returns",
    addressLine1: "4550 Harbor Blvd",
    addressLine2: "",
    city: "Los Angeles",
    state: "CA",
    postalCode: "90021",
    country: "USA",
    contactName: "Miguel Alvarez",
    contactEmail: "returns@merchx.com",
    contactPhone: "+1 213-555-0174",
    pickupDays: "Mon – Sat",
    pickupWindow: "10:00 – 16:00 PT",
    carrierCutoff: "FedEx Ground 15:30 PT",
    isDefault: false,
  },
  {
    id: "addr-il",
    label: "Chicago Pickup Locker",
    type: "pickup",
    addressLine1: "233 W Ontario St",
    addressLine2: "",
    city: "Chicago",
    state: "IL",
    postalCode: "60654",
    country: "USA",
    contactName: "Locker Team",
    contactEmail: "pickup@merchx.com",
    contactPhone: "+1 312-555-0198",
    pickupDays: "Wed – Sat",
    pickupWindow: "12:00 – 20:00 CT",
    carrierCutoff: "Self-serve drop before 19:45 CT",
    isDefault: false,
  },
];

export const seedSellerContacts: EscalationContact[] = [
  {
    id: "contact-ops",
    name: "Jordan Blake",
    role: "Ops Duty Manager",
    email: "jordan.blake@merchx.com",
    phone: "+1 917-555-0129",
    coverage: "Weekdays 07:00 – 22:00 ET",
    channels: ["Shopify US", "Amazon Marketplace"],
    isPrimary: true,
  },
  {
    id: "contact-cs",
    name: "Samira Patel",
    role: "Customer Service Lead",
    email: "samira.patel@merchx.com",
    phone: "+1 415-555-0182",
    coverage: "Weekends + Holidays",
    channels: ["Etsy", "Amazon Marketplace"],
    isPrimary: false,
  },
  {
    id: "contact-fin",
    name: "Emily Chen",
    role: "Finance & Settlements",
    email: "emily.chen@merchx.com",
    phone: "+1 646-555-0156",
    coverage: "Weekdays 09:00 – 17:00 ET",
    channels: ["Shopify US"],
    isPrimary: false,
  },
];

export const seedSellerSlas: ChannelSla[] = [
  {
    id: "sla-shopify",
    channel: "Shopify US",
    region: "North America",
    orderCutoff: "Order by 17:00 ET",
    dispatchCommitment: "24 hours",
    carrierPickup: "UPS Ground",
    returnWindow: "45 days",
    escalationContactId: "contact-ops",
    active: true,
  },
  {
    id: "sla-amazon",
    channel: "Amazon Marketplace",
    region: "North America",
    orderCutoff: "Order by 16:00 ET",
    dispatchCommitment: "Same-day",
    carrierPickup: "Amazon Buy Shipping",
    returnWindow: "30 days",
    escalationContactId: "contact-ops",
    active: true,
  },
  {
    id: "sla-etsy",
    channel: "Etsy",
    region: "North America",
    orderCutoff: "Order by 14:00 ET",
    dispatchCommitment: "48 hours",
    carrierPickup: "USPS Priority",
    returnWindow: "60 days",
    escalationContactId: "contact-cs",
    active: false,
  },
];

export const seedSellerPreferences: ChannelPreference[] = [
  {
    id: "pref-shopify",
    channel: "Shopify US",
    region: "United States",
    orderSync: true,
    inventorySync: true,
    priceSync: false,
    notificationOps: true,
    notificationFinance: true,
    defaultWarehouseId: "addr-nj",
    slaId: "sla-shopify",
  },
  {
    id: "pref-amazon",
    channel: "Amazon Marketplace",
    region: "United States",
    orderSync: true,
    inventorySync: true,
    priceSync: true,
    notificationOps: true,
    notificationFinance: false,
    defaultWarehouseId: "addr-nj",
    slaId: "sla-amazon",
  },
  {
    id: "pref-etsy",
    channel: "Etsy",
    region: "United States",
    orderSync: true,
    inventorySync: false,
    priceSync: false,
    notificationOps: false,
    notificationFinance: false,
    defaultWarehouseId: "addr-ca",
    slaId: "sla-etsy",
  },
];

export const cloneContacts = (contacts: EscalationContact[]) =>
  contacts.map((contact) => ({ ...contact, channels: [...contact.channels] }));

export const createChannelConfigSeed = () => ({
  addresses: seedSellerAddresses.map((address) => ({ ...address })),
  contacts: cloneContacts(seedSellerContacts),
  channelSlas: seedSellerSlas.map((sla) => ({ ...sla })),
  preferences: seedSellerPreferences.map((pref) => ({ ...pref })),
});

