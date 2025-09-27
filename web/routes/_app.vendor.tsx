import { Outlet } from "react-router";
import type { Route } from "./+types/_app.vendor";

export const loader = async ({ context }: Route.LoaderArgs) => {
  return {
    gadgetConfig: context.gadgetConfig,
  };
};

export default function VendorLayout() {
  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <Outlet />
    </div>
  );
}
