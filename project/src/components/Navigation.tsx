'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, useEffect, memo } from 'react';
import UserMenu from '@/components/UserMenu';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/referees', label: 'Referees' },
  { href: '/leagues', label: 'Leagues' },
  { href: '/tools', label: 'Tools' },
] as const;

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}

const NavLink = memo(function NavLink({ href, label, isActive, onClick, className }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md',
        isActive
          ? 'text-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </Link>
  );
});

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const isActiveLink = useCallback((href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  }, [pathname]);

  return (
    <nav
      className="bg-card border-b border-border sticky top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            aria-label="RefStats - Home"
          >
            <span className="text-xl font-bold text-primary">RefStats</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1" role="menubar">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={isActiveLink(item.href)}
                className="px-3 py-2"
              />
            ))}
            <div className="ml-4">
              <UserMenu />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              'md:hidden p-2 rounded-md transition-colors',
              'hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'min-w-[44px] min-h-[44px] flex items-center justify-center'
            )}
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            mobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
          )}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="space-y-1 pt-2" role="menu">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={isActiveLink(item.href)}
                onClick={closeMobileMenu}
                className={cn(
                  'block px-4 py-3 rounded-md',
                  'hover:bg-secondary',
                  'min-h-[44px] flex items-center'
                )}
              />
            ))}
            <div className="px-4 pt-3 border-t border-border mt-2">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
