import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { PlusIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';

const items = [
  {
    id: '1',
    title: 'How does SplitMint connect to my Gmail?',
    content:
      'SplitMint uses secure OAuth2 authentication to connect to your Gmail account. We only read bank transaction emails and never access your personal messages. Your data is encrypted and stored securely in our MongoDB database.',
  },
  {
    id: '2',
    title: 'What banks and credit cards are supported?',
    content:
      'SplitMint works with all major banks and credit card companies that send transaction notifications via email. This includes Chase, Bank of America, Wells Fargo, Capital One, American Express, and many others.',
  },
  {
    id: '3',
    title: 'How accurate is the AI categorization?',
    content:
      'Our AI achieves 95%+ accuracy in expense categorization. It learns from your spending patterns and improves over time. You can always manually adjust categories if needed, and the AI will learn from your corrections.',
  },
  {
    id: '4',
    title: 'Is my financial data secure?',
    content:
      'Yes, we use bank-level encryption and security measures. Your Gmail connection is read-only, and we never store your Gmail password. All transaction data is encrypted and stored securely in our MongoDB database.',
  },
  {
    id: '5',
    title: 'Can I use SplitMint for budgeting?',
    content:
      'Absolutely! SplitMint provides real-time budget tracking with category-wise breakdowns, daily spending limits, and monthly budget insights. Perfect for young adults who want to manage their finances better.',
  },
];

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
      duration: 0.4,
    },
  }),
};

export default function Faq1() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <motion.h2
            className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked{' '}
            <span className="from-purple-500 bg-gradient-to-r to-cyan-500 bg-clip-text text-transparent">
              Questions
            </span>
          </motion.h2>
          <motion.p
            className="text-gray-300 mx-auto max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to know about SplitMint and how our AI-powered expense tracking works.
          </motion.p>
        </div>

        <motion.div
          className="relative mx-auto max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Decorative gradient */}
          <div className="bg-purple-500/10 absolute -top-4 -left-4 -z-10 h-72 w-72 rounded-full blur-3xl" />
          <div className="bg-cyan-500/10 absolute -right-4 -bottom-4 -z-10 h-72 w-72 rounded-full blur-3xl" />

          <Accordion
            type="single"
            collapsible
            className="border-gray-700/40 bg-gray-900/20 w-full rounded-xl border p-2 backdrop-blur-sm"
            defaultValue="1"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={fadeInAnimationVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={item.id}
                  className={cn(
                    'bg-gray-800/50 my-1 overflow-hidden rounded-lg border-none px-2 shadow-sm transition-all',
                    'data-[state=open]:bg-gray-800/80 data-[state=open]:shadow-md',
                  )}
                >
                  <AccordionPrimitive.Header className="flex">
                    <AccordionPrimitive.Trigger
                      className={cn(
                        'group flex flex-1 items-center justify-between gap-4 py-4 text-left text-base font-medium text-white',
                        'hover:text-purple-500 transition-all duration-300 outline-none',
                        'focus-visible:ring-purple-500/50 focus-visible:ring-2',
                        'data-[state=open]:text-purple-500',
                      )}
                    >
                      {item.title}
                      <PlusIcon
                        size={18}
                        className={cn(
                          'text-purple-500/70 shrink-0 transition-transform duration-300 ease-out',
                          'group-data-[state=open]:rotate-45',
                        )}
                        aria-hidden="true"
                      />
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionContent
                    className={cn(
                      'text-gray-300 overflow-hidden pt-0 pb-4',
                      'data-[state=open]:animate-accordion-down',
                      'data-[state=closed]:animate-accordion-up',
                    )}
                  >
                    <div className="border-gray-600/30 border-t pt-3">
                      {item.content}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
