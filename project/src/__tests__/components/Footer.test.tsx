import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('renders copyright with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear} RefTrends`))).toBeInTheDocument();
  });

  it('renders all league links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Premier League' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'La Liga' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Serie A' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bundesliga' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ligue 1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Eredivisie' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Liga Portugal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Super Lig' })).toBeInTheDocument();
  });

  it('renders tools links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Referee Lookup' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compare Refs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Card Calculator' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trend Analyzer' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Match Predictor' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Penalty Stats' })).toBeInTheDocument();
  });

  it('renders company links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Press Kit' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Careers' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Advertise' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Partners' })).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Disclaimer' })).toBeInTheDocument();
  });

  it('has correct link hrefs for leagues', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Premier League' })).toHaveAttribute('href', '/leagues/39');
    expect(screen.getByRole('link', { name: 'La Liga' })).toHaveAttribute('href', '/leagues/140');
    expect(screen.getByRole('link', { name: 'Serie A' })).toHaveAttribute('href', '/leagues/135');
    expect(screen.getByRole('link', { name: 'Bundesliga' })).toHaveAttribute('href', '/leagues/78');
    expect(screen.getByRole('link', { name: 'Ligue 1' })).toHaveAttribute('href', '/leagues/61');
  });

  it('renders newsletter section', () => {
    render(<Footer />);
    expect(screen.getByText('Get Weekly Referee Insights')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
  });

  it('renders responsible gambling disclaimer', () => {
    render(<Footer />);
    expect(screen.getByText(/bet responsibly/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'BeGambleAware.org' })).toBeInTheDocument();
  });

  it('renders resource links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Methodology' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'FAQ' })).toBeInTheDocument();
  });
});
