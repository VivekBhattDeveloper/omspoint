import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAction } from "@gadgetinc/react";
import { Edit, Trash2, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "../api";
import type { Route } from "./+types/_app.admin.vendors._index";

type LoaderVendor = {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

type LoaderResult = {
  vendors: LoaderVendor[];
  isSample: boolean;
  errorMessage?: string;
};

const sampleVendors: LoaderVendor[] = [
  {
    id: "vendor-sample-1",
    name: "Northwind Print Co",
    email: "production@northwindprint.example",
    phoneNumber: "+1 415 555 0198",
    city: "San Francisco",
    state: "CA",
    country: "USA",
  },
  {
    id: "vendor-sample-2",
    name: "Atlas Fulfillment",
    email: "ops@atlasfulfillment.example",
    phoneNumber: "+1 206 555 0142",
    city: "Seattle",
    state: "WA",
    country: "USA",
  },
  {
    id: "vendor-sample-3",
    name: "SolarPrint Partners",
    email: "hello@solarprint.example",
    phoneNumber: "+44 20 7946 0958",
    city: "London",
    state: null,
    country: "United Kingdom",
  },
];

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const vendors = await context.api.vendor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        state: true,
        country: true,
      },
      sort: { createdAt: "Descending" },
      first: 250,
    });

    const records: LoaderVendor[] = vendors.map((vendor, index) => ({
      id: vendor.id ?? `vendor-${index}`,
      name: vendor.name ?? "Untitled vendor",
      email: vendor.email ?? null,
      phoneNumber: vendor.phoneNumber ?? null,
      city: vendor.city ?? null,
      state: vendor.state ?? null,
      country: vendor.country ?? null,
    }));

    return {
      vendors: records,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load vendors", error);

    return {
      vendors: sampleVendors,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function VendorsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [{ fetching: deleting }, deleteVendor] = useAction(api.vendor.delete);
  const [search, setSearch] = useState("");
  const { vendors, isSample, errorMessage } = loaderData;
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vendors;
    return vendors.filter((vendor) => {
      return (
        vendor.name.toLowerCase().includes(term) ||
        vendor.email?.toLowerCase().includes(term) ||
        vendor.city?.toLowerCase().includes(term) ||
        vendor.state?.toLowerCase().includes(term) ||
        vendor.country?.toLowerCase().includes(term)
      );
    });
  }, [vendors, search]);

  const handleRowClick = (record: LoaderVendor) => {
    navigate(`/admin/vendors/${record.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, vendorId: string, vendorName: string) => {
    e.stopPropagation(); // Prevent row click when clicking delete button
    
    if (window.confirm(`Are you sure you want to delete vendor "${vendorName}"? This action cannot be undone.`)) {
      try {
        await deleteVendor({ id: vendorId });
        toast.success(`Vendor "${vendorName}" has been deleted successfully.`);
        window.location.reload();
      } catch (error) {
        toast.error("Failed to delete vendor. Please try again.");
        console.error("Delete error:", error);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, vendorId: string) => {
    e.stopPropagation(); // Prevent row click when clicking edit button
    navigate(`/admin/vendors/${vendorId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Vendors</h1>
          <p className="text-gray-600">
            Manage your vendor network and partnerships
          </p>
        </div>
        <Button asChild className="flex items-center gap-2">
          <Link to="/admin/vendors/new">
            <Plus className="h-4 w-4" />
            Add New Vendor
          </Link>
        </Button>
      </div>

      {isSample && (
        <Alert>
          <AlertTitle>Sample dataset</AlertTitle>
          <AlertDescription>
            Unable to load vendor records from the API. Displaying sample data instead.
            {errorMessage ? ` Error: ${errorMessage}` : ""}
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters Section */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search vendors by name, email, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-6">
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((vendor) => {
                  const location = [vendor.city, vendor.state, vendor.country].filter(Boolean).join(", ");
                  return (
                    <TableRow
                      key={vendor.id}
                      tabIndex={0}
                      className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      onClick={() => handleRowClick(vendor)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleRowClick(vendor);
                        }
                      }}
                    >
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>{vendor.email ?? "—"}</TableCell>
                      <TableCell>{vendor.phoneNumber ?? "—"}</TableCell>
                      <TableCell className="text-gray-600">{location || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(event) => handleEdit(event, vendor.id)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(event) => handleDelete(event, vendor.id, vendor.name)}
                            disabled={deleting}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No vendors match your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
