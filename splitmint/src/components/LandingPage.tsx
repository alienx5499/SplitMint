import React from "react";
import dynamic from "next/dynamic";
import { SparklesCore } from "@/components/ui/sparkles"
import { useDev } from "@/contexts/DevContext"
import { Footerdemo } from "@/components/ui/footer-section"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
import { GooeyText } from "@/components/ui/gooey-text-morphing"
import { Shield, Zap, Lock, Globe, Users } from "lucide-react"
import VisionMissionSection from "./VisionMissionSection"
import AboutUs1 from "./mvpblocks/about-us-1"
import PayoutsSection from "./PayoutsSection"
import HowItWorksSection from "./HowItWorksSection"
import BenefitsSection from "./BenefitsSection"
import BentoGrid1 from "./mvpblocks/bento-grid-1"
import Faq1 from "./mvpblocks/faq-1"
import ContactSection from "./ContactSection"
import ContactUs1 from "./mvpblocks/contact-us-1"
import { CreditCardHero } from "./ruixen/credit-card-hero"
import { SplitMintCardHero } from "./SplitMintCardHero"

// Dynamic imports to avoid SSR issues
const SplashCursor = dynamic(() => import("@/components/ui/splash-cursor").then(mod => ({ default: mod.SplashCursor })), {
  ssr: false,
  loading: () => null
});

const TestimonialsColumn = dynamic(() => import("@/components/blocks/testimonials-columns-1").then(mod => ({ default: mod.TestimonialsColumn })), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-900 rounded-lg animate-pulse"></div>
});

const testimonials = [
  {
    text: "SplitMint made our group trip planning so much easier! We could track all expenses and settle up instantly. No more awkward conversations about money.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    name: "Sarah Chen",
    role: "Traveler"
  },
  {
    text: "Finally, an app that handles shared expenses without the complexity. The automatic calculations and reminders are a game changer for our household.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    name: "Marcus Rodriguez",
    role: "Roommate"
  },
  {
    text: "SplitMint's interface is so intuitive. I can create groups, add expenses, and track who owes what in seconds. Perfect for our office lunch runs!",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    name: "Emily Johnson",
    role: "Office Worker"
  },
  {
    text: "The transparency and ease of use make SplitMint perfect for our family. Everyone can see what's been spent and who needs to pay what.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    name: "David Kim",
    role: "Family Organizer"
  },
  {
    text: "I love how SplitMint handles different currencies and payment methods. It's made international trips with friends so much simpler.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    name: "Lisa Wang",
    role: "Frequent Traveler"
  },
  {
    text: "The real-time updates and notifications keep everyone in the loop. No more confusion about who paid for what or how much is owed.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    name: "Alex Thompson",
    role: "Group Organizer"
  }
];

const LandingPage = () => {
  const { disableCursor } = useDev();
  return (
    <div className="min-h-screen w-full bg-black">
      {/* Single Splash Cursor for entire page */}
      {!disableCursor && (
        <div className="fixed inset-0 z-10 pointer-events-none">
          <SplashCursor />
        </div>
      )}
      
      {/* Hero Section */}
      <section className="h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden relative pt-20">
        
        <div className="relative z-20 mb-8">
          <GooeyText
            texts={[
              "SplitMint",
              "AI Expense Tracking",
              "Gmail Integration",
              "Smart Budgeting"
            ]}
            morphTime={3}
            cooldownTime={2}
            className="h-32 flex items-center justify-center"
            textClassName="text-white font-bold"
          />
        </div>
        <p className="text-neutral-300 cursor-default text-center text-xl md:text-2xl mt-4 relative z-20">
          AI-powered expense tracking from your Gmail
        </p>
        <div className="w-[40rem] h-40 relative mt-8">
          {/* Gradients */}
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

          {/* Core component - Reduced particle density */}
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={300}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />

          {/* Radial Gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
        </div>
      </section>
      
      {/* Payment Features Section */}
      <section className="w-full py-20 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              AI-Powered Tracking
            </h2>
            <p className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto">
              Connect your Gmail and let our AI automatically categorize your expenses in real-time
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Credit Card Hero */}
            <div className="relative">
              <SplitMintCardHero
                headline="Automatic Expense Tracking"
                subtext="Connect your Gmail account and our AI will automatically fetch, parse, and categorize your bank transactions. No manual entry required!"
                cta="Connect Gmail"
                onCtaClick={() => {
                  // Scroll to contact section
                  const contactSection = document.querySelector('section:last-of-type');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-gradient-to-br from-gray-900 via-black to-gray-800 border-gray-700/50"
              />
            </div>
            
            {/* Features List */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Gmail Integration</h3>
                    <p className="text-neutral-300">Securely connect your Gmail to automatically fetch bank transaction emails.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">AI Categorization</h3>
                    <p className="text-neutral-300">Advanced AI instantly categorizes expenses: food, shopping, transport, entertainment.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Live Dashboard</h3>
                    <p className="text-neutral-300">Real-time dashboard showing monthly spend, income, budget, and daily limits.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Smart Budgeting</h3>
                    <p className="text-neutral-300">AI-powered insights help you stay within budget with category-wise breakdowns.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-xl p-6 border border-purple-500/20">
                  <h4 className="text-lg font-semibold text-white mb-3">Why Choose SplitMint?</h4>
                  <ul className="space-y-2 text-neutral-300">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>No manual expense entry required</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Real-time AI categorization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Live budget tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="w-full bg-black">
        <AboutUs1 />
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Benefits Section */}
      <section className="w-full py-20 px-4 bg-black">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Why Choose SplitMint?
            </h2>
            <p className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto">
              Discover the advantages of our AI-powered expense tracking platform.
            </p>
          </div>
          <BentoGrid1 />
        </div>
      </section>

      {/* Payouts Section */}
      <PayoutsSection />

      {/* FAQ Section */}
      <section className="w-full py-20 px-4 bg-black">
        <div className="container mx-auto">
          <Faq1 />
        </div>
      </section>

      {/* Contact Section */}
      <ContactUs1 />
      
      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-20 px-4 bg-black relative">
        <div className="max-w-7xl mx-auto relative z-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Trusted by groups worldwide who have simplified their shared expenses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialsColumn
              className="h-96 overflow-hidden"
              testimonials={testimonials}
              duration={15}
            />
            <TestimonialsColumn
              className="h-96 overflow-hidden"
              testimonials={testimonials}
              duration={20}
            />
            <TestimonialsColumn
              className="h-96 overflow-hidden"
              testimonials={testimonials}
              duration={25}
            />
          </div>
        </div>
      </section>
      
      {/* Footer Section */}
      <section id="about" className="relative bg-black">
        <div className="relative z-20">
          <Footerdemo />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
