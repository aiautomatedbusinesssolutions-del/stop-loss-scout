"use client";

import { GraduationCap, ArrowLeftRight, Zap, PieChart, TrendingUp } from "lucide-react";
import AccordionCard from "./AccordionCard";
import AccountSizeCalc from "./AccountSizeCalc";
import { EDUCATION_UI } from "@/constants/content";

export default function EducationSection() {
  return (
    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 animate-fade-in">
      <div className="flex items-center gap-2.5">
        <GraduationCap className="h-5 w-5 text-sky-400" />
        <h2 className="text-lg font-semibold text-slate-100">{EDUCATION_UI.sectionTitle}</h2>
      </div>

      {/* Featured card - What is a Stop Loss? */}
      <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-5 md:p-6 space-y-4">
        <h3 className="text-base font-semibold text-amber-400">What is a Stop Loss?</h3>
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Think of a stop loss like a <span className="text-amber-400 font-medium">safety net</span> for your
            investment. When you buy a coin, you set a price below your entry where you&rsquo;ll automatically sell -
            limiting how much you can lose.
          </p>
          <p>
            Imagine buying a concert ticket for $100. You tell your friend: &ldquo;If someone offers me less than $95,
            sell it for me - I&rsquo;d rather take a small loss than risk it becoming worthless.&rdquo; That&rsquo;s exactly what
            a stop loss does for your crypto.
          </p>
          <p>
            Without a stop loss, a sudden crash could wipe out your entire position. With one, you{" "}
            <span className="text-emerald-400 font-medium">decide in advance</span>{" "}
            the maximum you&rsquo;re willing to lose.
          </p>
        </div>
      </div>

      {/* Accordion topics */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          {EDUCATION_UI.keyConceptsTitle}
        </h3>

        <div className="space-y-2">
          <AccordionCard icon={<ArrowLeftRight className="h-4 w-4 text-sky-400 shrink-0" />} title="Stop Loss vs Stop Limit">
            <p>
              A <span className="text-sky-400 font-medium">stop loss</span> (also called a &ldquo;stop market&rdquo;) sells at
              the best available price once your stop price is hit. It guarantees execution but not the exact price.
            </p>
            <p className="mt-2">
              A <span className="text-sky-400 font-medium">stop limit</span> only sells at your specified price or
              better. It guarantees the price but not execution - in a fast crash, your order might not fill at all,
              leaving you holding a falling asset.
            </p>
            <p className="mt-2">
              For beginners, stop loss orders are generally safer because they prioritize getting you out of a bad
              trade.
            </p>
          </AccordionCard>

          <AccordionCard icon={<Zap className="h-4 w-4 text-sky-400 shrink-0" />} title="What is Slippage?">
            <p>
              Slippage is the difference between the price you expected and the price you actually got. It happens
              because markets move fast - especially crypto, which trades 24/7.
            </p>
            <p className="mt-2">
              If your stop loss is at $95 but the price drops quickly from $96 to $94, your order might fill at $94.50
              instead of $95. That $0.50 difference is slippage.
            </p>
            <p className="mt-2">
              Slippage is usually small in popular coins like BTC and ETH, but can be significant in low-volume
              altcoins.
            </p>
          </AccordionCard>

          <AccordionCard icon={<PieChart className="h-4 w-4 text-sky-400 shrink-0" />} title="Risk Sizing 101 - The 1-2% Rule">
            <p>
              Professional traders rarely risk more than <span className="text-emerald-400 font-medium">1-2%</span> of
              their total account on a single trade. This means if you have a $10,000 account, you&rsquo;d risk at most
              $100-$200 per trade.
            </p>
            <p className="mt-2">
              Why so little? Because even great traders are wrong 40-50% of the time. Small, consistent risk means a
              losing streak won&rsquo;t wipe you out - you live to trade another day.
            </p>
            <p className="mt-2">Use the calculator below to find your ideal risk amount based on your account size.</p>

            <div className="mt-4">
              <AccountSizeCalc />
            </div>
          </AccordionCard>

          <AccordionCard icon={<TrendingUp className="h-4 w-4 text-sky-400 shrink-0" />} title="Why Crypto Needs Wider Stops">
            <p>
              Crypto is significantly more volatile than stocks. Bitcoin can easily move 3-5% in a single day, while a
              stock might move 1-2%. Altcoins can swing 10-20% in hours.
            </p>
            <p className="mt-2">
              If you set your stop too tight (say 1-2%), normal price fluctuations will trigger it - you&rsquo;ll get
              <span className="text-rose-400 font-medium">&ldquo;stopped out&rdquo;</span> before the real move happens. This is
              why this app offers a <span className="text-emerald-400 font-medium">Wide (8%)</span> option for swing
              traders.
            </p>
            <p className="mt-2">
              The tradeoff: wider stops mean larger potential losses per trade, so you&rsquo;ll need a smaller position size
              to keep your dollar risk the same.
            </p>
          </AccordionCard>
        </div>
      </div>

      <p className="text-xs text-slate-600 italic">{EDUCATION_UI.disclaimer}</p>
    </section>
  );
}
