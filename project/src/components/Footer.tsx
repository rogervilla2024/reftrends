import Link from 'next/link';
import { cn } from '@/lib/utils';

const footerLinks = {
  leagues: [
    { href: '/leagues/39', label: 'Premier League' },
    { href: '/leagues/140', label: 'La Liga' },
    { href: '/leagues/135', label: 'Serie A' },
    { href: '/leagues/78', label: 'Bundesliga' },
    { href: '/leagues/61', label: 'Ligue 1' },
    { href: '/leagues/88', label: 'Eredivisie' },
    { href: '/leagues/94', label: 'Liga Portugal' },
    { href: '/leagues/203', label: 'Super Lig' },
  ],
  tools: [
    { href: '/referees', label: 'Referee Lookup' },
    { href: '/tools/referee-comparison', label: 'Compare Refs' },
    { href: '/tools/seasonal-trends', label: 'Trend Analyzer' },
    { href: '/tools/match-analyzer', label: 'Match Predictor' },
    { href: '/tools/penalty-stats', label: 'Penalty Stats' },
    { href: '/tools/card-calculator', label: 'Card Calculator' },
  ],
  resources: [
    { href: '/methodology', label: 'Methodology' },
    { href: '/faq', label: 'FAQ' },
    { href: '/glossary', label: 'Glossary' },
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
  company: [
    { href: '/press-kit', label: 'Press Kit' },
    { href: '/careers', label: 'Careers' },
    { href: '/advertise', label: 'Advertise' },
    { href: '/partners', label: 'Partners' },
  ],
} as const;


const legalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/cookies', label: 'Cookie Policy' },
] as const;

interface FooterLinkGroupProps {
  title: string;
  links: readonly { href: string; label: string }[];
}

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        {title}
      </h3>
      <ul className="mt-4 space-y-2" role="list">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "text-sm text-muted-foreground hover:text-foreground transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-card border-t border-border mt-auto"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <FooterLinkGroup title="Leagues" links={footerLinks.leagues} />
          <FooterLinkGroup title="Tools" links={footerLinks.tools} />
          <FooterLinkGroup title="Resources" links={footerLinks.resources} />
          <FooterLinkGroup title="Company" links={footerLinks.company} />
        </div>

        {/* Newsletter Section */}
        <div className="bg-muted/30 rounded-lg p-6 mb-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Get Weekly Referee Insights
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get weekly referee insights and betting edges delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3" action="#" method="post">
            <input
              type="email"
              placeholder="Enter your email"
              className={cn(
                "flex-1 px-4 py-2 rounded-md border border-input bg-background",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "transition-colors"
              )}
              aria-label="Email address for newsletter"
            />
            <button
              type="submit"
              className={cn(
                "px-6 py-2 rounded-md bg-primary text-primary-foreground",
                "text-sm font-medium hover:bg-primary/90 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            >
              Subscribe
            </button>
          </form>
          <label className="flex items-start gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              className={cn(
                "mt-0.5 rounded border-input text-primary",
                "focus:ring-2 focus:ring-ring focus:ring-offset-0"
              )}
              aria-label="Agree to receive marketing emails"
            />
            <span className="text-xs text-muted-foreground">
              I agree to receive marketing emails. Unsubscribe anytime.
            </span>
          </label>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} RefTrends. All rights reserved.
            </p>
            <nav className="flex flex-wrap justify-center gap-4" aria-label="Legal links">
              {legalLinks.map((link, index) => (
                <span key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm text-muted-foreground hover:text-foreground transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-ring rounded"
                    )}
                  >
                    {link.label}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="ml-4 text-muted-foreground" aria-hidden="true">|</span>
                  )}
                </span>
              ))}
            </nav>
          </div>

          {/* Responsible Gambling Disclaimer */}
          <div className="space-y-2 text-center">
            <p className="text-xs text-muted-foreground">
              Data provided for informational purposes only. RefTrends does not encourage or facilitate gambling. Please bet responsibly.
            </p>
            <p className="text-xs text-muted-foreground">
              If you have a gambling problem, visit{' '}
              <a
                href="https://www.begambleaware.org"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "underline hover:text-foreground transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-ring rounded"
                )}
              >
                BeGambleAware.org
              </a>
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              18+ - Gambling can be addictive. Play responsibly.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
