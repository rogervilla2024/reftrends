import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from '@/components/Navigation';

describe('Navigation', () => {
  it('renders the logo', () => {
    render(<Navigation />);
    expect(screen.getByText('RefTrends')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Referees' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leagues' })).toBeInTheDocument();
  });

  it('renders Tools dropdown button', () => {
    render(<Navigation />);
    expect(screen.getByRole('button', { name: 'Tools menu' })).toBeInTheDocument();
  });

  it('toggles mobile menu on button click', () => {
    render(<Navigation />);

    // Mobile menu should be hidden initially
    const mobileLinks = screen.queryAllByRole('link', { name: 'Home' });
    expect(mobileLinks.length).toBe(1); // Only desktop link

    // Click mobile menu button
    const menuButton = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(menuButton);

    // Now should have both desktop and mobile links
    const allLinks = screen.getAllByRole('link', { name: 'Home' });
    expect(allLinks.length).toBe(2);
  });

  it('closes mobile menu when a link is clicked', () => {
    render(<Navigation />);

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: 'Open menu' });
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

    expect(screen.getByRole('link', { name: /RefTrends/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Referees' })).toHaveAttribute('href', '/referees');
    expect(screen.getByRole('link', { name: 'Leagues' })).toHaveAttribute('href', '/leagues');
  });

  it('opens Tools dropdown when clicked', () => {
    render(<Navigation />);
    
    const toolsButton = screen.getByRole('button', { name: 'Tools menu' });
    fireEvent.click(toolsButton);
    
    // Check that dropdown items are visible
    expect(screen.getByRole('link', { name: 'Compare Referees' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Card Calculator' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All Tools' })).toBeInTheDocument();
  });
});
