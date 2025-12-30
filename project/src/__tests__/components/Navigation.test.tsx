import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from '@/components/Navigation';

describe('Navigation', () => {
  it('renders the logo', () => {
    render(<Navigation />);
    expect(screen.getByText('RefStats')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Referees' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leagues' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tools' })).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<Navigation />);
    const signInButtons = screen.getAllByRole('button', { name: /sign in/i });
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  it('toggles mobile menu on button click', () => {
    render(<Navigation />);

    // Mobile menu should be hidden initially
    const mobileLinks = screen.queryAllByRole('link', { name: 'Home' });
    expect(mobileLinks.length).toBe(1); // Only desktop link

    // Click mobile menu button
    const menuButton = screen.getByRole('button', { name: '' });
    fireEvent.click(menuButton);

    // Now should have both desktop and mobile links
    const allLinks = screen.getAllByRole('link', { name: 'Home' });
    expect(allLinks.length).toBe(2);
  });

  it('closes mobile menu when a link is clicked', () => {
    render(<Navigation />);

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: '' });
    fireEvent.click(menuButton);

    // Get mobile links (second set)
    const mobileLinks = screen.getAllByRole('link', { name: 'Referees' });

    // Click the mobile link
    fireEvent.click(mobileLinks[1]);

    // Menu should close - should be back to just desktop links
    const allLinks = screen.getAllByRole('link', { name: 'Referees' });
    expect(allLinks.length).toBe(1);
  });

  it('has correct link hrefs', () => {
    render(<Navigation />);

    expect(screen.getByRole('link', { name: 'RefStats' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Referees' })).toHaveAttribute('href', '/referees');
    expect(screen.getByRole('link', { name: 'Leagues' })).toHaveAttribute('href', '/leagues');
    expect(screen.getByRole('link', { name: 'Tools' })).toHaveAttribute('href', '/tools');
  });
});
