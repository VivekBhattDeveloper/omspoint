import { useState } from "react";
import { AutoTable } from "@/components/auto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router";
import { useAction } from "@gadgetinc/react";
import { Edit, Trash2, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";

export default function VendorsIndex() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [{ fetching: deleting }, deleteVendor] = useAction(api.vendor.delete);

  const handleRowClick = (record: any) => {
    navigate(`/vendors/${record.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, vendorId: string, vendorName: string) => {
    e.stopPropagation(); // Prevent row click when clicking delete button
    
    if (window.confirm(`Are you sure you want to delete vendor "${vendorName}"? This action cannot be undone.`)) {
      try {
        await deleteVendor({ id: vendorId });
        toast.success(`Vendor "${vendorName}" has been deleted successfully.`);
      } catch (error) {
        toast.error("Failed to delete vendor. Please try again.");
        console.error("Delete error:", error);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, vendorId: string) => {
    e.stopPropagation(); // Prevent row click when clicking edit button
    navigate(`/vendors/${vendorId}`);
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
          <Link to="/vendors/new">
            <Plus className="h-4 w-4" />
            Add New Vendor
          </Link>
        </Button>
      </div>

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
          <AutoTable
            model={api.vendor}
            search={search}
            onClick={handleRowClick}
            columns={[
              "name",
              "email", 
              "phoneNumber",
              {
                header: "Location",
                render: ({ record }) => (
                  <span className="text-gray-600">
                    {record.city}, {record.state}, {record.country}
                  </span>
                )
              },
              {
                header: "Actions",
                render: ({ record }) => (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(e, record.id)}
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, record.id, record.name)}
                      disabled={deleting}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}