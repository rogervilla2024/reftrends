import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('renders the RefStats logo', () => {
    render(<Footer />);
    expect(screen.getByText('RefStats')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<Footer />);
    expect(
      screen.getByText(/ultimate referee statistics platform/i)
    ).toBeInTheDocument();
  });

  it('renders all product links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Referees' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leagues' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Betting Tools' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Match Analyzer' })).toBeInTheDocument();
  });

  it('renders all league links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Premier League' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'La Liga' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Serie A' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bundesliga' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ligue 1' })).toBeInTheDocument();
  });

  it('renders all company links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'API Access' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear} RefStats`))).toBeInTheDocument();
  });

  it('renders API attribution', () => {
    render(<Footer />);
    expect(screen.getByText(/Data provided by API-Football/i)).toBeInTheDocument();
  });

  it('has correct link hrefs for leagues', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Premier League' })).toHaveAttribute('href', '/leagues/39');
    expect(screen.getByRole('link', { name: 'La Liga' })).toHaveAttribute('href', '/leagues/140');
    expect(screen.getByRole('link', { name: 'Serie A' })).toHaveAttribute('href', '/leagues/135');
    expect(screen.getByRole('link', { name: 'Bundesliga' })).toHaveAttribute('href', '/leagues/78');
    expect(screen.getByRole('link', { name: 'Ligue 1' })).toHaveAttribute('href', '/leagues/61');
  });
});
