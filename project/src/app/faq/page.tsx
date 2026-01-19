'use client';

import { useState, useCallback, memo } from 'react';
import Script from 'next/script';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string | JSX.Element;
}

interface FAQSection {
  category: string;
  items: FAQItem[];
}

const faqData: FAQSection[] = [
  {
    category: 'General',
    items: [
      {
        question: 'What is RefTrends?',
        answer: 'RefTrends is a football referee statistics and analysis platform designed to help bettors, analysts, and fans understand referee tendencies and trends.',
      },
      {
        question: 'Is RefTrends free?',
        answer: 'Yes, basic access to RefTrends is completely free. We may offer premium features in the future.',
      },
      {
        question: 'Which leagues do you cover?',
        answer: 'We cover major European leagues including Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie, Liga Portugal, Turkish Super Lig, and more.',
      },
      {
        question: 'How often is data updated?',
        answer: 'Statistics are typically updated within 24 hours of match completion.',
      },
    ],
  },
  {
    category: 'Data & Statistics',
    items: [
      {
        question: 'Where does your data come from?',
        answer: 'We compile data from official league sources, verified match reports, and reputable data providers. See our Methodology page for details.',
      },
      {
        question: 'How accurate is your data?',
        answer: 'We strive for maximum accuracy but errors can occur. Statistics should be used as a guide, not absolute truth. Always verify critical information.',
      },
      {
        question: 'What does "Strictness Score" mean?',
        answer: 'Our proprietary 1-10 scale measuring how likely a referee is to issue cards. Higher scores indicate stricter referees.',
      },
      {
        question: 'Can I download data?',
        answer: (
          <>
            API access for data download will be available soon. Contact{' '}
            <a
              href="mailto:api@reftrends.com"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              api@reftrends.com
            </a>{' '}
            for enterprise inquiries.
          </>
        ),
      },
    ],
  },
  {
    category: 'Betting',
    items: [
      {
        question: 'Do you provide betting tips?',
        answer: 'No. RefTrends provides statistics and analysis only. We do not recommend specific bets or guarantee outcomes.',
      },
      {
        question: 'Should I bet based on referee statistics?',
        answer: 'Referee statistics are one factor among many. Never bet more than you can afford to lose, and always gamble responsibly.',
      },
      {
        question: 'Are referee statistics reliable predictors?',
        answer: 'Referee tendencies can be informative but are not guarantees. Past performance does not predict future results.',
      },
    ],
  },
  {
    category: 'Technical',
    items: [
      {
        question: "The site isn't loading properly. What should I do?",
        answer: (
          <>
            Try clearing your browser cache, disabling ad blockers, or using a different browser. Contact{' '}
            <a
              href="mailto:support@reftrends.com"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              support@reftrends.com
            </a>{' '}
            if issues persist.
          </>
        ),
      },
      {
        question: 'Can I suggest a feature?',
        answer: (
          <>
            Yes! We love feedback. Email{' '}
            <a
              href="mailto:suggestions@reftrends.com"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              suggestions@reftrends.com
            </a>{' '}
            with your ideas.
          </>
        ),
      },
      {
        question: 'Do you have an API?',
        answer: (
          <>
            API access is in development. Register interest at{' '}
            <a
              href="mailto:api@reftrends.com"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              api@reftrends.com
            </a>
            .
          </>
        ),
      },
    ],
  },
  {
    category: 'Legal',
    items: [
      {
        question: 'Is RefTrends legal?',
        answer: 'Yes. We provide publicly available statistics and analysis. We do not facilitate gambling.',
      },
      {
        question: 'What age do I need to be to use RefTrends?',
        answer: 'Users must be 18+ or the legal age in their jurisdiction.',
      },
    ],
  },
];

interface AccordionItemProps {
  question: string;
  answer: string | JSX.Element;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem = memo(function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: AccordionItemProps) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className={cn(
          'w-full text-left py-4 px-6 flex items-center justify-between gap-4',
          'hover:bg-muted/50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'group'
        )}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-base">{question}</span>
        <svg
          className={cn(
            'w-5 h-5 flex-shrink-0 transition-transform text-muted-foreground group-hover:text-primary',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 pb-4 text-muted-foreground leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
});

const getPlainTextAnswer = (answer: string | JSX.Element): string => {
  if (typeof answer === 'string') {
    return answer;
  }
  return 'Visit our FAQ page for detailed information.';
};

const generateFAQSchema = () => {
  const allQuestions = faqData.flatMap((section) =>
    section.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: getPlainTextAnswer(item.answer),
      },
    }))
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allQuestions,
  };
};

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = useCallback((key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema()) }}
      />
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions about RefTrends, our data, and how to use our platform.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-8">
        {faqData.map((section, sectionIndex) => (
          <section key={section.category} aria-labelledby={`section-${sectionIndex}`}>
            <h2
              id={`section-${sectionIndex}`}
              className="text-2xl font-bold mb-4 text-primary"
            >
              {section.category}
            </h2>
            <Card>
              <CardContent className="p-0">
                {section.items.map((item, itemIndex) => {
                  const key = `${sectionIndex}-${itemIndex}`;
                  return (
                    <AccordionItem
                      key={key}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openItems.has(key)}
                      onToggle={() => toggleItem(key)}
                    />
                  );
                })}
              </CardContent>
            </Card>
          </section>
        ))}
      </div>

      {/* Contact Section */}
      <section className="mt-12">
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6 pb-6 text-center">
            <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-muted-foreground mb-4">
              We're here to help. Get in touch with our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:support@reftrends.com"
                className={cn(
                  'inline-flex items-center justify-center px-6 py-3 rounded-md',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'transition-colors font-medium',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
              >
                Contact Support
              </a>
              <a
                href="mailto:suggestions@reftrends.com"
                className={cn(
                  'inline-flex items-center justify-center px-6 py-3 rounded-md',
                  'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                  'transition-colors font-medium',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
              >
                Suggest a Feature
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Responsible Gambling Notice */}
      <section className="mt-8">
        <Card className="bg-muted/50">
          <CardContent className="pt-6 pb-6">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Responsible Gambling:</strong> RefTrends provides statistical analysis for
              informational purposes only. We do not encourage betting. If you choose to bet,
              always gamble responsibly, set limits, and seek help if gambling becomes a problem.
              Visit{' '}
              <a
                href="https://www.begambleaware.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                BeGambleAware.org
              </a>{' '}
              for support.
            </p>
          </CardContent>
        </Card>
      </section>
      </div>
    </>
  );
}
