"use client";
import React from "react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Zap, FileText, Layers, ShieldCheck, GaugeCircle, Globe, CreditCard, Users, DollarSign } from "lucide-react";
import { CreditCardHero } from "./ruixen/credit-card-hero";

const features = [
  {
    Icon: Users,
    name: "Group Management",
    description: "Create groups, invite friends, and manage shared expenses effortlessly. Track who owes what in real-time.",
    href: "#",
    cta: "Learn More",
    className: "md:col-span-1",
    background: <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-black opacity-30 group-hover:opacity-50 transition-opacity" />,
  },
  {
    Icon: CreditCard,
    name: "Multiple Payment Methods",
    description: "Support for credit cards, debit cards, bank transfers, and digital wallets. Choose what works best for your group.",
    href: "#",
    cta: "Learn More",
    className: "md:col-span-2",
    background: <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 to-black opacity-30 group-hover:opacity-50 transition-opacity" />,
  },
  {
    Icon: Zap,
    name: "Instant Splitting",
    description: "Automatically calculate and split expenses based on your preferences. Equal split, percentage-based, or custom amounts.",
    href: "#",
    cta: "Learn More",
    className: "md:col-span-2",
    background: <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 to-black opacity-30 group-hover:opacity-50 transition-opacity" />,
  },
  {
    Icon: ShieldCheck,
    name: "Secure Transactions",
    description: "Bank-level security with encrypted transactions and fraud protection. Your financial data is always safe.",
    href: "#",
    cta: "Learn More",
    className: "md:col-span-1",
    background: <div className="absolute inset-0 bg-gradient-to-br from-orange-900/50 to-black opacity-30 group-hover:opacity-50 transition-opacity" />,
  },
  {
    Icon: Globe,
    name: "Multi-Currency Support",
    description: "Split expenses in different currencies with real-time exchange rates. Perfect for international travel and groups.",
    href: "#",
    cta: "Learn More",
    className: "md:col-span-1",
    background: <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-black opacity-30 group-hover:opacity-50 transition-opacity" />,
  },
  {
    Icon: DollarSign,
    name: "Transparent Pricing",
    description: "No hidden fees or surprise charges. See exactly what you're paying upfront with our transparent pricing model.",
    href: "#",
    cta: "Learn More",
    className: "md:col-span-2",
    background: <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-black opacity-30 group-hover:opacity-50 transition-opacity" />,
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="w-full py-20 px-4 bg-black">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Why Choose SplitMint?
          </h2>
          <p className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto">
            Discover the advantages of our comprehensive expense splitting platform.
          </p>
        </div>

        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>

        {/* Payment Showcase */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              See SplitMint in Action
            </h3>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Experience how easy it is to split expenses with our interactive payment interface
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <CreditCardHero
              headline="Split Any Expense"
              subtext="From dinner bills to vacation costs, SplitMint handles all your shared expenses with ease and transparency."
              cta="Try It Now"
              onCtaClick={() => {
                const contactSection = document.querySelector('section:last-of-type');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              primaryCardImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop&crop=center"
              secondaryCardImage="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop&crop=center"
              className="bg-gradient-to-br from-gray-900 via-black to-gray-800 border-gray-700/50"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;