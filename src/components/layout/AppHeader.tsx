"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

// Helper function to generate title from path
function generateTitle(pathname: string): string {
  if (pathname.startsWith("/settings/channels")) return "Channel Management";
  if (pathname.startsWith("/settings/users")) return "User Management";
  if (pathname.startsWith("/settings/user-channels")) return "User Channel Mapping";
  return "Human In The Loop";
}

export function AppHeader() {
  const { isMobile, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const title = generateTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:h-16 sm:px-6">
      {isMobile && (
         <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
      )}
      {!isMobile && <div className="hidden md:block w-[52px]"></div>} {/* Placeholder for sidebar trigger space if sidebar is icon only and fixed */}
      <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
      {/* Add User Menu or other header items here if needed */}
    </header>
  );
}
