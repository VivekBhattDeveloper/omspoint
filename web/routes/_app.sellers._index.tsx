import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAction } from "@gadgetinc/react";
import { AutoTable } from "@/components/auto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";

export default function SellersIndex() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [{ fetching: deleting }, deleteSeller] = useAction(api.seller.delete);

  const handleDelete = async (sellerId: string) => {
    if (window.confirm("Are you sure you want to delete this seller?")) {
      try {
        await deleteSeller({ id: sellerId });
        toast.success("Seller deleted successfully");
      } catch (error) {
        toast.error("Failed to delete seller");
      }
    }
  };

  const handleEdit = (sellerId: string) => {
    navigate(`/sellers/${sellerId}`);
  };

  const handleRowClick = (seller: any) => {
    navigate(`/sellers/${seller.id}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sellers</h1>
        <p className="text-muted-foreground">
          Manage all sellers across vendors
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sellers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button asChild>
          <Link to="/sellers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Seller
          </Link>
        </Button>
      </div>

      {/* Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sellers</CardTitle>
          <CardDescription>
            View and manage seller information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutoTable
            model={api.seller}
            search={search}
            onClick={handleRowClick}
            columns={[
              {
                header: "Name",
                field: "name"
              },
              {
                header: "Email",
                field: "email"
              },
              {
                header: "Phone",
                field: "phoneNumber"
              },
              {
                header: "Location",
                render: ({ record }) => (
                  <span>
                    {record.city}, {record.state}
                  </span>
                )
              },
              {
                header: "Vendor",
                field: "vendor.name"
              },
              {
                header: "Actions",
                render: ({ record }) => (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(record.id);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(record.id);
                      }}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              }
            ]}
            select={{
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              city: true,
              state: true,
              vendor: {
                id: true,
                name: true,
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}