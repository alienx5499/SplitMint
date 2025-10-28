"use client";
import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="w-full py-20 px-4 bg-black">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-down">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            How SplitMint Works
          </h2>
          <p className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto">
            Connect your Gmail, let our AI parse your bank emails, and get instant expense categorization with live budget tracking.
          </p>
        </div>

        {/* Comparison Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* The Traditional Way - Dull */}
          <Card className="group bg-neutral-900/50 border-neutral-800 transform hover:scale-[1.02] transition-all duration-300 hover:border-neutral-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-neutral-500">
                <XCircle />
                The Traditional Way
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-lg mb-4 h-64 w-full overflow-hidden">
                <Image
                  src="/trd.png"
                  alt="Stressed person with paperwork"
                  fill
                  className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    console.log('Image failed to load:', e);
                  }}
                />
              </div>
              <ul className="space-y-3 text-neutral-400">
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-neutral-600 mt-1 flex-shrink-0" />
                  <span>Send emails and wait for claim forms.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-neutral-600 mt-1 flex-shrink-0" />
                  <span>Submit tedious forms and proof of delay.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-neutral-600 mt-1 flex-shrink-0" />
                  <span>Wait days or weeks for manual claim approval.</span>
                </li>
                 <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-neutral-600 mt-1 flex-shrink-0" />
                  <span>Risk of claim denial or biased processing.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* The SplitMint Way - Bright */}
          <Card className="relative group bg-black border-green-500/40 transform hover:scale-[1.02] transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:border-green-500/70">
             <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-2xl text-green-400">
                <CheckCircle />
                The SplitMint Way
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="relative rounded-lg mb-4 h-64 w-full overflow-hidden">
                <Image
                  src="/zyura.png"
                  alt="People splitting expenses easily"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.log('Image failed to load:', e);
                  }}
                />
              </div>
              <ul className="space-y-3 text-neutral-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Create groups and invite friends instantly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Add expenses with automatic calculations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Track who owes what in real-time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Settle payments seamlessly and transparently.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
