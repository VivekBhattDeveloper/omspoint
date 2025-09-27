// --------------------------------------------------------------------------------------
// App Layout (Logged In Pages)
// --------------------------------------------------------------------------------------
// This file defines the layout for all application routes that require the user to be authenticated (logged in).
// Typical pages using this layout include dashboards, user profile, app content, and any protected resources.
// Structure:
//   - Persistent navigation sidebar (with responsive drawer for mobile)
//   - Header with user avatar and secondary navigation
//   - Main content area for app routes (via <Outlet />)
//   - Handles redirecting logged out users to the sign-in page
// To extend: update the navigation, header, or main content area as needed for your app's logged-in experience.

import { UserIcon } from "@/components/shared/UserIcon";
import { DesktopNav, MobileNav, SecondaryNavigation } from "@/components/app/nav";
import { GlobalSearch, HelpMenu, NotificationBell, OrgSwitcher } from "@/components/app/topbar";
import { Outlet, redirect, useOutletContext } from "react-router";
import { ErrorBoundary } from "react-error-boundary";
import type { RootOutletContext } from "../root";
import type { Route } from "./+types/_app";

export const loader = async ({ context }: Route.LoaderArgs) => {
  const { session, gadgetConfig } = context;

  const userId = session?.get("user");
  const user = userId ? await context.api.user.findOne(userId) : undefined;

  if (!user) {
    return redirect(gadgetConfig.authentication!.signInPath);
  }

  return {
    user,
  };
};

export type AuthOutletContext = RootOutletContext & {
  user: any;
};

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">
        An error occurred while loading this page. Please try again.
      </p>
      <details className="mb-4 max-w-md">
        <summary className="cursor-pointer text-sm text-gray-500">
          Error details
        </summary>
        <pre className="mt-2 text-xs text-left bg-gray-100 p-2 rounded overflow-auto">
          {error.message}
        </pre>
      </details>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}

export default function ({ loaderData }: Route.ComponentProps) {
  const rootOutletContext = useOutletContext<RootOutletContext>();

  const { user } = loaderData;

  return (
    <div className="h-screen flex overflow-hidden">
      <DesktopNav />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <header className="h-16 flex items-center gap-4 px-6 border-b bg-background z-10 w-full">
          <MobileNav />
          <OrgSwitcher />
          <GlobalSearch />
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <NotificationBell />
            <HelpMenu />
          </div>
          <div className="ml-auto md:ml-0">
            <SecondaryNavigation
              icon={
                <>
                  <UserIcon user={user} />
                  <span className="text-sm font-medium">{user.firstName ?? user.email}</span>
                </>
              }
            />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-auto">
          <div className="container mx-auto px-6 py-8 min-w-max">
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onError={(error, errorInfo) => {
                console.error("Page rendering error:", error);
                console.error("Error info:", errorInfo);
              }}
            >
              <Outlet context={{ ...rootOutletContext, user } as AuthOutletContext} />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
