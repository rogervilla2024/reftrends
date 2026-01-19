'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, useEffect, memo, useRef } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/referees', label: 'Referees' },
  { href: '/leagues', label: 'Leagues' },
] as const;

const toolsMenuItems: Array<{ href: string; label: string; hasDivider?: boolean }> = [
  { href: '/tools/referee-comparison', label: 'Compare Referees' },
  { href: '/tools/card-calculator', label: 'Card Calculator' },
  { href: '/tools/match-analyzer', label: 'Match Analyzer' },
  { href: '/tools/penalty-stats', label: 'Penalty Stats' },
  { href: '/tools', label: 'All Tools', hasDivider: true },
];

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
          ? 'text-primary font-medium'
          : 'text-muted-foreground hover:text-primary',
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
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
        if (toolsDropdownOpen) {
          setToolsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen, toolsDropdownOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };

    if (toolsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [toolsDropdownOpen]);

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

  const toggleToolsDropdown = useCallback(() => {
    setToolsDropdownOpen((prev) => !prev);
  }, []);

  const isActiveLink = useCallback((href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  }, [pathname]);

  const isToolsActive = pathname.startsWith('/tools');

  return (
    <nav
      className="bg-card border-b border-border sticky top-0 z-50 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            aria-label="RefTrends - Home"
          >
            <span className="text-xl font-bold text-primary">RefTrends</span>
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

            {/* Tools Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleToolsDropdown}
                className={cn(
                  'px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md flex items-center gap-1',
                  isToolsActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-primary'
                )}
                aria-expanded={toolsDropdownOpen}
                aria-haspopup="true"
                aria-label="Tools menu"
              >
                Tools
                <svg
                  className={cn('w-4 h-4 transition-transform', toolsDropdownOpen && 'rotate-180')}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {toolsDropdownOpen && (
                <div className="absolute top-full mt-2 w-56 bg-card border border-border rounded-md shadow-lg py-1">
                  {toolsMenuItems.map((item) => (
                    <div key={item.href}>
                      {item.hasDivider && (
                        <div className="my-1 border-t border-border" role="separator" />
                      )}
                      <Link
                        href={item.href}
                        className={cn(
                          'block px-4 py-2 transition-colors',
                          isActiveLink(item.href)
                            ? 'text-primary font-medium bg-muted'
                            : 'text-muted-foreground hover:text-primary hover:bg-muted'
                        )}
                        onClick={() => setToolsDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              'md:hidden p-2 rounded-md transition-colors',
              'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
            mobileMenuOpen ? 'max-h-[32rem] pb-4' : 'max-h-0'
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
                  'hover:bg-muted',
                  'min-h-[44px] flex items-center'
                )}
              />
            ))}

            {/* Mobile Tools Section */}
            <div className="pt-2">
              <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">
                Tools
              </div>
              {toolsMenuItems.map((item) => (
                <div key={item.href}>
                  {item.hasDivider && (
                    <div className="my-2 border-t border-border" role="separator" />
                  )}
                  <NavLink
                    href={item.href}
                    label={item.label}
                    isActive={isActiveLink(item.href)}
                    onClick={closeMobileMenu}
                    className={cn(
                      'block px-4 py-3 rounded-md',
                      'hover:bg-muted',
                      'min-h-[44px] flex items-center'
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
