// --------------------------------------------------------------------------------------
// App Navigation System (Primary Left Nav + Secondary Header Dropdown)
// --------------------------------------------------------------------------------------
// This file defines the navigation system for the logged-in section of the app.
// There are two main navigation components:
//
//   - Navigation: The primary navigation, rendered as a vertical sidebar on the left.
//     - To extend: add new items to the `navigationItems` array.
//     - Each item should have a title, path, and icon.
//
//   - SecondaryNavigation: The secondary navigation, rendered as a dropdown menu in the header.
//     - To extend: add new items to the `secondaryNavigationItems` array.
//     - Each item should have a title, path, and icon.
//     - The dropdown also includes a "Sign out" action.
//
// Icons are imported from lucide-react. Navigation uses react-router's <Link> for routing.
//
// --------------------------------------------------------------------------------------
// To extend: add to navigationItems or secondaryNavigationItems. For custom rendering,
// edit the Navigation or SecondaryNavigation components.
// --------------------------------------------------------------------------------------

import type { ExoticComponent, ReactNode } from "react";
import { Fragment, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { NavDrawer } from "@/components/shared/NavDrawer";
import { api } from "@/api";
import {
  Home,
  User,
  LogOut,
  Users,
  Mail,
  MailPlus,
  Building2,
  Gauge,
  Layers,
  Boxes,
  ShieldCheck,
  Network,
  Key,
  FolderCog,
  Printer,
  Route,
  Landmark,
  Activity,
  ClipboardList,
  PackageSearch,
  Settings,
  FileStack,
  Paintbrush2,
  Truck,
  ClipboardCheck,
  Coins,
  BarChart3,
  ShoppingCart,
  LifeBuoy,
  CreditCard,
  Scale,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavIcon = ExoticComponent<{ className: string }>;

interface NavItem {
  title: string;
  path: string;
  icon: NavIcon;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Home", path: "/signed-in", icon: Home },
    ],
  },
  {
    title: "Admin Console",
    items: [
      { title: "Dashboard", path: "/admin", icon: Gauge },
      { title: "Organizations", path: "/admin/orgs", icon: Building2 },
      { title: "Users & Teams", path: "/admin/users", icon: Users },
      { title: "Roles & Permissions", path: "/admin/rbac", icon: ShieldCheck },
      { title: "Integrations", path: "/admin/integrations", icon: Network },
      { title: "Secrets Vault", path: "/admin/secrets", icon: Key },
      { title: "Catalog Schema", path: "/admin/catalog/schema", icon: Layers },
      { title: "Products", path: "/admin/products", icon: Boxes },
      { title: "Print Profiles", path: "/admin/print/profiles", icon: Printer },
      { title: "Print Jobs", path: "/admin/print-jobs", icon: Printer },
      { title: "Routing Policies", path: "/admin/routing", icon: Route },
      { title: "Payments", path: "/admin/payments", icon: CreditCard },
      { title: "Shipments", path: "/admin/shipments", icon: Truck },
      { title: "Finance Config", path: "/admin/finance/config", icon: Landmark },
      { title: "Finance Reconciliation", path: "/admin/finance/reconciliation", icon: Scale },
      { title: "Invites", path: "/admin/invites", icon: MailPlus },
      { title: "Observability", path: "/admin/observability", icon: Activity },
      { title: "Audit & Reports", path: "/admin/audit", icon: ClipboardList },
      { title: "Vendor Directory", path: "/admin/vendors", icon: Building2 },
      { title: "Seller Directory", path: "/admin/sellers", icon: Users },
    ],
  },
  {
    title: "Vendor Console",
    items: [
      { title: "Vendor Dashboard", path: "/vendor", icon: Gauge },
      { title: "Products", path: "/vendor/products", icon: Boxes },
      { title: "Orders", path: "/vendor/orders", icon: ClipboardCheck },
      { title: "Print Jobs", path: "/vendor/print-jobs", icon: Printer },
      { title: "QA", path: "/vendor/qa", icon: ClipboardList },
      { title: "Shipping", path: "/vendor/shipping", icon: Truck },
      { title: "Returns", path: "/vendor/returns", icon: PackageSearch },
      { title: "Catalog", path: "/vendor/catalog", icon: FolderCog },
      { title: "Printers & Jigs", path: "/vendor/printers", icon: Printer },
      { title: "Finance", path: "/vendor/finance", icon: Coins },
      { title: "Reports", path: "/vendor/reports", icon: BarChart3 },
      { title: "Settings", path: "/vendor/settings", icon: Settings },
    ],
  },
  {
    title: "Seller Console",
    items: [
      { title: "Seller Dashboard", path: "/seller", icon: Gauge },
      { title: "Products", path: "/seller/products", icon: Boxes },
      { title: "Channels", path: "/seller/channels", icon: Network },
      { title: "Catalog", path: "/seller/catalog", icon: FolderCog },
      { title: "Assortments", path: "/seller/assortments", icon: Layers },
      { title: "Listings", path: "/seller/listings", icon: FileStack },
      { title: "Orders", path: "/seller/orders", icon: ShoppingCart },
      { title: "Designs", path: "/seller/designs", icon: Paintbrush2 },
      { title: "Returns & RMA", path: "/seller/returns", icon: PackageSearch },
      { title: "Customer Service", path: "/seller/cs", icon: LifeBuoy },
      { title: "Finance", path: "/seller/finance", icon: Coins },
      { title: "Reports", path: "/seller/reports", icon: BarChart3 },
      { title: "Settings", path: "/seller/settings", icon: Settings },
    ],
  },
  {
    title: "Global",
    items: [
      { title: "My Profile", path: "/profile", icon: User },
      { title: "Team", path: "/team", icon: Users },
      { title: "Invite", path: "/invite", icon: Mail },
      { title: "Help Center", path: "/help", icon: LifeBuoy },
    ],
  },
];

// Determine which nav sections are visible for the current user.
// - Super Admin: Overview, Admin Console, Global
// - Vendor: Overview, Vendor Console, Global
// - Seller: Overview, Seller Console, Global
// If multiple roles are present, sections are the union unless Super Admin is present,
// in which case Admin-only set takes precedence.
const getVisibleSectionTitles = (user: any | undefined, activeOrgId?: "hq" | "print" | "marketplace"): Set<string> => {
  const titles = new Set<string>();

  const roles: string[] = Array.isArray(user?.roles)
    ? user.roles.map((r: any) =>
      typeof r === "string" ? r : (r?.name ?? r?.key ?? "")
    )
    : [];

  const hasRole = (name: string) => roles.some((r) => typeof r === "string" && r.toLowerCase() === name.toLowerCase());

  // Super Admin: show sections based on selected org
  if (hasRole("Super Admin")) {
    if (activeOrgId === "print") return new Set(["Overview", "Vendor Console", "Global"]);
    if (activeOrgId === "marketplace") return new Set(["Overview", "Seller Console", "Global"]);
    return new Set(["Overview", "Admin Console", "Global"]);
  }

  // Vendor & Seller accumulate
  if (hasRole("Vendor")) {
    ["Overview", "Vendor Console", "Global"].forEach((t) => titles.add(t));
  }
  if (hasRole("Seller")) {
    ["Overview", "Seller Console", "Global"].forEach((t) => titles.add(t));
  }

  // Fallback for generic signed-in users: show Overview + Global only
  if (titles.size === 0) {
    ["Overview", "Global"].forEach((t) => titles.add(t));
  }

  return titles;
};

// Mobile hamburger menu, uses Sheet for slide-out drawer
export const MobileNav = ({ user, activeOrgId }: { user?: any; activeOrgId?: "hq" | "print" | "marketplace" }) => {
  return (
    <div className="flex md:hidden">
      <NavDrawer>{({ close }) => <Navigation user={user} activeOrgId={activeOrgId} onLinkClick={close} />}</NavDrawer>
    </div>
  );
};

// Desktop left nav bar
export const DesktopNav = ({ user, activeOrgId }: { user?: any; activeOrgId?: "hq" | "print" | "marketplace" }) => {
  return (
    <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30">
      <div className="flex flex-col flex-grow bg-background border-r h-full">
        <Navigation user={user} activeOrgId={activeOrgId} />
      </div>
    </div>
  );
};

/**
 * The secondary navigation items for the header dropdown menu.
 * To add a new link, add an object with title, path, and icon.
 */

const secondaryNavigationItems: NavItem[] = [
  {
    title: "Profile",
    path: "/profile",
    icon: User,
  },

  {
    title: "Team",
    path: "/team",
    icon: Users,
  },
  {
    title: "Invite",
    path: "/invite",
    icon: Mail,
  },
];

/**
 * Primary navigation sidebar for logged-in users.
 * Renders navigationItems as vertical links with icons.
 */

export const Navigation = ({ user, activeOrgId, onLinkClick }: { user?: any; activeOrgId?: "hq" | "print" | "marketplace"; onLinkClick?: () => void }) => {
  const location = useLocation();
  const visible = getVisibleSectionTitles(user, activeOrgId);
  const visibleSections = navigationSections.filter((section) => visible.has(section.title));
  const normalizedPathname = location.pathname.replace(/\/+$/, "") || "/";

  const matchesPath = (pathname: string, target: string) => {
    const normalizedTarget = target.replace(/\/+$/, "") || "/";
    if (pathname === normalizedTarget) {
      return { matches: true, exact: true };
    }

    if (pathname.startsWith(normalizedTarget) && pathname.length > normalizedTarget.length && pathname[normalizedTarget.length] === "/") {
      return { matches: true, exact: false };
    }

    return { matches: false, exact: false };
  };

  const activeItemPath = visibleSections
    .flatMap((section) => section.items)
    .reduce<string | undefined>((bestMatch, item) => {
      const { matches, exact } = matchesPath(normalizedPathname, item.path);
      if (!matches) {
        return bestMatch;
      }

      if (!bestMatch) {
        return item.path;
      }

      const currentBestExact = matchesPath(normalizedPathname, bestMatch).exact;
      if (exact && !currentBestExact) {
        return item.path;
      }

      if (exact === currentBestExact && item.path.length > bestMatch.length) {
        return item.path;
      }

      return bestMatch;
    }, undefined);

  return (
    <>
      <div className="h-16 flex items-center px-6 border-b">
        <Link to="/signed-in" className="flex items-center" onClick={onLinkClick}>
          <img src="/api/assets/autologo?background=light" alt="App logo" className="h-8 w-auto" />
        </Link>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {visibleSections
          .map((section) => (
            <Fragment key={section.title}>
              <p className="px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = item.path === activeItemPath;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={onLinkClick}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </Fragment>
          ))}
      </nav>
    </>
  );
};

/**
 * Secondary navigation dropdown for user/account actions.
 * Renders secondaryNavigationItems as dropdown links with icons.
 * Includes a "Sign out" action at the bottom.
 *
 * @param icon - The icon to display as the dropdown trigger (usually a user avatar or icon).
 */

export const SecondaryNavigation = ({ icon, userId }: { icon: ReactNode; userId?: string }) => {
  const [userMenuActive, setUserMenuActive] = useState(false);

  return (
    <DropdownMenu open={userMenuActive} onOpenChange={setUserMenuActive}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className={`p-2 rounded-full focus-visible:ring-0 ${userMenuActive ? "bg-muted hover:bg-muted" : ""}`}
        >
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <>
          {secondaryNavigationItems.map((item) => (
            <DropdownMenuItem key={item.path} asChild className="cursor-pointer">
              <Link to={item.path} className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </DropdownMenuItem>
          ))}
          <SignOutOption userId={userId} />
        </>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SignOutOption = ({ userId }: { userId?: string }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      if (userId) {
        await api.user.signOut(userId);
      } else {
        const response = await fetch("/sign-out", { method: "POST", credentials: "include" });
        if (!response.ok && response.status !== 401) {
          throw new Error(`Sign-out request failed with status ${response.status}`);
        }
      }
    } catch (error: any) {
      console.error("Sign out error:", error);
    } finally {
      navigate("/");
    }
  };

  return (
    <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-600 focus:text-red-600 cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </DropdownMenuItem>
  );
};

// --------------------------------------------------------------------------------------
// To extend: add to navigationItems or secondaryNavigationItems. For custom rendering,
// edit the Navigation or SecondaryNavigation components.
// --------------------------------------------------------------------------------------
