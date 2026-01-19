import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about RefTrends - referee statistics, data accuracy, betting information, and platform features.',
  openGraph: {
    title: 'FAQ - RefTrends',
    description: 'Find answers to common questions about RefTrends, our data, and how to use our platform.',
    url: 'https://reftrends.com/faq',
  },
  twitter: {
    title: 'FAQ - RefTrends',
    description: 'Find answers to common questions about RefTrends, our data, and how to use our platform.',
  },
  alternates: {
    canonical: 'https://reftrends.com/faq',
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
