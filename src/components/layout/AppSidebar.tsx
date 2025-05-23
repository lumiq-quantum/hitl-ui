"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RadioTower, Users, Link2, Settings } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"; // Ensure this path is correct
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/settings/channels", icon: RadioTower, label: "Channels" },
  { href: "/settings/users", icon: Users, label: "Users" },
  { href: "/settings/user-channels", icon: Link2, label: "User-Channels" },
];

export function AppSidebarContent() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <>
      <SidebarHeader className={cn("p-4", open ? "flex" : "justify-center")}>
        <Link href="/" className="flex items-center gap-2">
          <AppLogo className="h-8 w-8 text-primary" />
          {open && <span className="text-xl font-semibold text-foreground">AdminZen</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: "right", align: "center" }}
                  className="justify-start"
                >
                  <a> {/* This <a> tag is important for legacyBehavior with asChild */}
                    <item.icon className="h-5 w-5" />
                    {open && <span>{item.label}</span>}
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {/* <SidebarFooter className="p-4">
        {open && <p className="text-xs text-muted-foreground">&copy; 2024 AdminZen</p>}
      </SidebarFooter> */}
    </>
  );
}

export function AppSidebar() {
    const { isMobile, openMobile, setOpenMobile, state } = useSidebar();
    const sidebarProps = isMobile ? 
        { open: openMobile, onOpenChange: setOpenMobile, side: "left" as "left" | "right" | undefined } : 
        { side: "left" as "left" | "right" | undefined };

  return (
    <Sidebar {...sidebarProps} variant="sidebar" collapsible={isMobile ? "offcanvas" : "icon"}>
        <AppSidebarContent/>
    </Sidebar>
  );
}
