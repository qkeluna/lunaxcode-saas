"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  FolderKanbanIcon,
  PlusCircleIcon,
  SettingsIcon,
  HelpCircleIcon,
  FileTextIcon,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

interface ClientSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function ClientSidebar({ user, ...props }: ClientSidebarProps) {
  const pathname = usePathname()

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: FolderKanbanIcon,
    },
  ]

  const navActions = [
    {
      title: "New Project",
      url: "/onboarding",
      icon: PlusCircleIcon,
    },
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
    {
      title: "Documentation",
      url: "#",
      icon: FileTextIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2"
            >
              <Link href="/dashboard" className="group">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <img
                    src="/android-chrome-192x192.png"
                    alt="Lunaxcode Logo"
                    className="size-8 rounded-lg"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Client Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        <item.icon className="transition-all duration-300 ease-in-out group-hover/menu-item:scale-110 group-hover/menu-item:rotate-3" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="text-sidebar-foreground/70"
                  >
                    <Link href={item.url}>
                      <item.icon className="transition-all duration-300 ease-in-out group-hover/menu-item:scale-125 group-hover/menu-item:rotate-90" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      size="sm"
                    >
                      <Link href={item.url}>
                        <item.icon className="transition-all duration-300 ease-in-out group-hover/menu-item:scale-110 group-hover/menu-item:-rotate-6" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-2 border-t border-sidebar-border">
          <span className="text-xs font-medium text-sidebar-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <NavUser
          user={{
            name: user.name || "User",
            email: user.email || "",
            avatar: user.image || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
