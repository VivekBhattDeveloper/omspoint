import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Bell, Building2, ChevronDown, LifeBuoy, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type OrgId = "hq" | "print" | "marketplace";
export type Org = { id: OrgId; name: string; description: string };

export const organizations: Org[] = [
  { id: "hq", name: "MerchX HQ", description: "Global control plane" },
  { id: "print", name: "Print Ops", description: "Vendor execution" },
  { id: "marketplace", name: "Marketplace Ops", description: "Seller enablement" },
];

export const OrgSwitcher = ({
  user,
  activeOrgId,
  onChange,
}: {
  user: any;
  activeOrgId: OrgId;
  onChange: (orgId: OrgId) => void;
}) => {
  const roles: string[] = Array.isArray(user?.roles)
    ? user.roles.map((r: any) => (typeof r === "string" ? r : (r?.name ?? r?.key ?? "")))
    : [];
  const isSuperAdmin = roles.some((r) => typeof r === "string" && r.toLowerCase() === "super admin".toLowerCase());

  const activeOrg = organizations.find((o) => o.id === activeOrgId) ?? organizations[0];

  if (!isSuperAdmin) {
    // Vendors should see Print Ops, Sellers should see Marketplace Ops; no dropdown.
    return (
      <Button variant="ghost" className="h-9 px-3 gap-2 font-medium" disabled>
        <Building2 className="h-4 w-4" />
        {activeOrg.name}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 px-3 gap-2 font-medium">
          <Building2 className="h-4 w-4" />
          {activeOrg.name}
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            className="flex flex-col items-start gap-1 cursor-pointer"
            onClick={() => onChange(org.id)}
          >
            <span className="text-sm font-medium">{org.name}</span>
            <span className="text-xs text-muted-foreground">{org.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const GlobalSearch = () => {
  const [value, setValue] = useState("");
  const placeholder = useMemo(
    () => (value ? "Press Enter to search" : "Search orders, sellers, print jobs…"),
    [value]
  );

  return (
    <div className="relative hidden lg:block w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-10"
      />
      {value && (
        <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
          <Sparkles className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export const NotificationBell = () => {
  const unread = 3;

  return (
    <Button variant="ghost" size="icon" className="relative h-9 w-9">
      <Bell className="h-4 w-4" />
      {unread > 0 && (
        <Badge className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 text-[0.625rem]" variant="destructive">
          {unread}
        </Badge>
      )}
    </Button>
  );
};

export const HelpMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <LifeBuoy className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Help & resources</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/help">Workspace help desk</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href="https://docs.gadget.dev" target="_blank" rel="noreferrer">Gadget documentation</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href="https://status.gadget.dev" target="_blank" rel="noreferrer">Platform status</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
