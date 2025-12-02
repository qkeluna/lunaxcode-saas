"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  UsersIcon,
  FolderKanbanIcon,
  CreditCardIcon,
  SettingsIcon,
  FileTextIcon,
  ShoppingBagIcon,
  HelpCircleIcon,
  ShieldIcon,
  ListIcon,
  ImageIcon,
  GripIcon,
  DollarSignIcon,
  PackageIcon,
  ClipboardListIcon,
  HomeIcon,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function AdminSidebar({ user, ...props }: AdminSidebarProps) {
  const pathname = usePathname()

  const navMain = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Clients",
      url: "/admin/clients",
      icon: UsersIcon,
    },
    {
      title: "Projects",
      url: "/admin/projects",
      icon: FolderKanbanIcon,
    },
    {
      title: "Payments",
      url: "/admin/payments",
      icon: CreditCardIcon,
    },
  ]

  const navCMS = [
    {
      title: "Content Management",
      icon: FileTextIcon,
      items: [
        {
          title: "Services",
          url: "/admin/cms/services",
          icon: ShoppingBagIcon,
        },
        {
          title: "Features",
          url: "/admin/cms/features",
          icon: GripIcon,
        },
        {
          title: "Questions",
          url: "/admin/cms/questions",
          icon: ClipboardListIcon,
        },
        {
          title: "Add-ons",
          url: "/admin/cms/add-ons",
          icon: PackageIcon,
        },
        {
          title: "Portfolio",
          url: "/admin/cms/portfolio",
          icon: ImageIcon,
        },
        {
          title: "Process Steps",
          url: "/admin/cms/process",
          icon: ListIcon,
        },
        {
          title: "FAQs",
          url: "/admin/cms/faqs",
          icon: HelpCircleIcon,
        },
      ],
    },
  ]

  const navSettings = [
    {
      title: "Settings",
      icon: SettingsIcon,
      items: [
        {
          title: "Profile",
          url: "/admin/settings",
          icon: UsersIcon,
        },
        {
          title: "AI Settings",
          url: "/admin/settings/ai-settings",
          icon: ShieldIcon,
        },
        {
          title: "Payment Accounts",
          url: "/admin/settings/payment-accounts",
          icon: DollarSignIcon,
        },
      ],
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
              <Link href="/admin" className="group">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <img
                    src="/android-chrome-192x192.png"
                    alt="Lunaxcode Logo"
                    className="size-8 rounded-lg"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Back to Home"
              className="mt-1"
            >
              <Link href="/" className="group">
                <HomeIcon className="transition-all duration-300 ease-in-out group-hover/menu-item:scale-110" />
                <span>Back to Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
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

        {/* CMS Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navCMS.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.items?.some((subItem) =>
                    pathname.startsWith(subItem.url)
                  )}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon className="transition-all duration-300 ease-in-out group-hover/menu-item:scale-110 group-hover/menu-item:rotate-6" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-all duration-300 ease-out group-data-[state=open]/collapsible:rotate-90 group-hover/menu-item:scale-125" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isActive = pathname === subItem.url
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive}
                              >
                                <Link href={subItem.url} className="group/link">
                                  <subItem.icon className="!size-4 transition-all duration-300 ease-in-out group-hover/link:scale-125 group-hover/link:-rotate-12" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSettings.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.items?.some((subItem) =>
                    pathname.startsWith(subItem.url)
                  )}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} size="sm">
                        <item.icon className="transition-all duration-300 ease-in-out group-hover/menu-item:scale-110 group-hover/menu-item:rotate-12" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-all duration-300 ease-out group-data-[state=open]/collapsible:rotate-90 group-hover/menu-item:scale-125" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isActive = pathname === subItem.url
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive}
                              >
                                <Link href={subItem.url} className="group/link">
                                  <subItem.icon className="!size-4 transition-all duration-300 ease-in-out group-hover/link:scale-125 group-hover/link:-rotate-12" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user.name || "Admin",
            email: user.email || "",
            avatar: user.image || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
