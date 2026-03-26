'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { UserProfile } from './user-profile'
import { ThemeToggle } from './theme-toggle'

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface SidebarLayoutProps {
  children: React.ReactNode
  title: string
  navItems: NavItem[]
  userRole: 'admin' | 'teacher' | 'student'
  userName: string
  onLogout?: () => void
}

export function SidebarLayout({
  children,
  title,
  navItems,
  userRole,
  userName,
  onLogout,
}: SidebarLayoutProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-sidebar to-sidebar/95">
      {/* Header */}
      <div className="border-b border-sidebar-border/50 p-4 md:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-accent flex items-center justify-center text-white font-bold shadow-glow">
            E
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-text">Langoer</h1>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 md:px-4 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl transition-all text-sm md:text-base font-medium',
                    isActive
                      ? 'bg-gradient-to-r from-sidebar-primary/80 to-sidebar-accent/60 text-sidebar-primary-foreground shadow-glow scale-105'
                      : 'text-sidebar-foreground hover:bg-sidebar-primary/10 hover:text-sidebar-primary'
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-sidebar-border/50 p-4 md:p-6 space-y-4 bg-gradient-to-t from-sidebar/50 to-transparent">
        <UserProfile name={userName} role={userRole} />
        <div className="flex gap-2">
          <ThemeToggle />
          {onLogout && (
            <Button
              variant="ghost"
              className="flex-1 justify-start text-destructive hover:text-white hover:bg-destructive/80 transition-all"
              onClick={() => {
                setIsOpen(false)
                onLogout()
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-sidebar border-r border-sidebar-border/50 flex-shrink-0 shadow-lg">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-border/50 bg-card/50 backdrop-blur-md">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                L
              </div>
              <h1 className="text-lg font-bold bg-gradient-text">Langoer</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    {isOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
