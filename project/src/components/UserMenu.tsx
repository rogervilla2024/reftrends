'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MenuItemProps {
  href: string;
  label: string;
  onClick: () => void;
  className?: string;
}

function MenuItem({ href, label, onClick, className }: MenuItemProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      className={cn(
        'block px-4 py-2 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:bg-secondary',
        'hover:bg-secondary',
        className
      )}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }

      // Handle arrow key navigation within menu
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]');
        if (!menuItems?.length) return;

        const currentFocus = document.activeElement;
        const currentIndex = Array.from(menuItems).indexOf(currentFocus as Element);

        let nextIndex: number;
        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        }

        (menuItems[nextIndex] as HTMLElement).focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus first menu item when menu opens
  useEffect(() => {
    if (isOpen) {
      const firstMenuItem = menuRef.current?.querySelector('[role="menuitem"]');
      (firstMenuItem as HTMLElement)?.focus();
    }
  }, [isOpen]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/' });
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2" aria-label="Loading user menu">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-20 h-4 hidden sm:block" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/signin">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Sign In
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button className="bg-primary hover:bg-primary/90">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  const isPremium = session.user?.role === 'premium';
  const isAdmin = session.user?.role === 'admin';
  const userInitial = session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U';
  const displayName = session.user?.name || session.user?.email?.split('@')[0] || 'User';

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={cn(
          'flex items-center gap-2 rounded-md p-1',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'transition-colors hover:bg-secondary',
          'min-h-[44px]'
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={`User menu for ${displayName}`}
      >
        <div
          className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold"
          aria-hidden="true"
        >
          {userInitial}
        </div>
        <span className="text-muted-foreground hidden sm:block max-w-[120px] truncate">
          {displayName}
        </span>
        {isPremium && (
          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
            PRO
          </span>
        )}
        <svg
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label="User account menu"
        className={cn(
          'absolute right-0 mt-2 w-56 rounded-lg shadow-lg border bg-card',
          'transition-all duration-200 origin-top-right',
          isOpen
            ? 'opacity-100 scale-100 visible'
            : 'opacity-0 scale-95 invisible'
        )}
      >
        {/* User Info Header */}
        <div className="px-4 py-3 border-b" role="none">
          <p className="text-sm font-medium truncate">
            {session.user?.name || 'User'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {session.user?.email}
          </p>
        </div>

        {/* Menu Items */}
        <div className="py-1" role="none">
          <MenuItem href="/profile" label="Profile" onClick={closeMenu} />
          <MenuItem href="/favorites" label="Favorite Referees" onClick={closeMenu} />
          <MenuItem href="/alerts" label="Alerts" onClick={closeMenu} />

          {!isPremium && (
            <MenuItem
              href="/pricing"
              label="Upgrade to Premium"
              onClick={closeMenu}
              className="text-primary font-medium"
            />
          )}

          {isAdmin && (
            <MenuItem
              href="/admin"
              label="Admin Panel"
              onClick={closeMenu}
              className="text-blue-500"
            />
          )}
        </div>

        {/* Sign Out */}
        <div className="border-t py-1" role="none">
          <button
            role="menuitem"
            onClick={handleSignOut}
            className={cn(
              'block w-full text-left px-4 py-2 text-sm',
              'text-destructive hover:bg-secondary',
              'focus-visible:outline-none focus-visible:bg-secondary',
              'transition-colors'
            )}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
