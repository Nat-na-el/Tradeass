// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  BookOpen,
  LineChart,
  Zap,
  ArrowRight,
  TrendingUp,
  Target,
  ShieldCheck,
  Calendar,
  Brain,
  Trophy,
  Users,
  Globe,
  Lock,
  Sparkles,
  CheckCircle2,
  Star,
  DollarSign,
  Clock,
  Infinity,
  ChevronRight,
  ChartLine,
  NotebookPen,
  Lightbulb,
  Mail,
  MessageSquare,
  Twitter,
  Linkedin,
  Github,
  BarChart2,
  MessageCircle,
  Briefcase,
  Heart,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

export default function Landing() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    // Simulate loading for smooth entrance animation
    setTimeout(() => setIsLoaded(true), 300);
  
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
  
    // Initialize flipping counter logic (adapted from CodePen)
    function Counter(selector, settings) {
      this.settings = Object.assign({
        digits: 5,
        delay: 250,
        direction: ''
      }, settings || {});
  
      this.DOM = {};
      this.build(selector);
  
      this.DOM.scope.addEventListener('transitionend', e => {
        if (e.pseudoElement === "::before" && e.propertyName == 'margin-top') {
          e.target.classList.remove('blur');
        }
      });
  
      this.count();
    }

    Counter.prototype = {
      build: function(selector) {
        var scopeElm = typeof selector == 'string'
              ? document.querySelector(selector)
              : selector
                ? selector
                : this.DOM.scope;
    
        scopeElm.innerHTML = Array(this.settings.digits + 1)
            .join('<div><b data-value="0"></b></div>');
    
        this.DOM = {
          scope: scopeElm,
          digits: scopeElm.querySelectorAll('b')
        };
      },
  
      count: function(newVal) {
        var countTo, className,
            settings = this.settings,
            digitsElms = this.DOM.digits;
        this.value = newVal || this.DOM.scope.dataset.value | 0;
        if (!this.value) return;
        countTo = (this.value + '').split('');
        if (settings.direction == 'rtl') {
          countTo = countTo.reverse();
          digitsElms = [].slice.call(digitsElms).reverse();
        }
        digitsElms.forEach(function(item, i) {
          if (+item.dataset.value != countTo[i] && countTo[i] >= 0) {
            setTimeout(function(j) {
              var diff = Math.abs(countTo[j] - +item.dataset.value);
              item.dataset.value = countTo[j];
              if (diff > 3) item.className = 'blur';
            }, i * settings.delay, i);
          }
        });
      }
    };

    // Create counters for background
    new Counter('.stock-counter1', { digits: 6, direction: 'rtl', delay: 200 });
    new Counter('.stock-counter2', { digits: 5, direction: 'rtl', delay: 150 });
    new Counter('.stock-counter3', { digits: 7, direction: 'rtl', delay: 250 });

    // Randomly update counters every few seconds
    const randomCount = () => {
      document.querySelector('.stock-counter1').dataset.value = Math.floor(Math.random() * 1000000) + 100000;
      document.querySelector('.stock-counter2').dataset.value = Math.floor(Math.random() * 100000) + 10000;
      document.querySelector('.stock-counter3').dataset.value = Math.floor(Math.random() * 10000000) + 1000000;
    };
    randomCount();
    const counterInterval = setInterval(randomCount, 4000);
  
    return () => {
      clearInterval(counterInterval);
      clearInterval(interval);
    };
  }, []);

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600 dark:text-cyan-400" />,
      title: "Precision Trade Tracking",
      description: "Log trades in seconds: entry/exit, size, fees, tags, screenshots, broker sync or CSV import. Track multiple accounts, strategies, and instruments with zero hassle."
    },
    {
      icon: <LineChart className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />,
      title: "60+ Performance Reports",
      description: "Win rate by setup/time/day, expectancy, profit factor, R multiples distribution, Monte Carlo simulations, equity curves, correlation matrices – all interactive and exportable."
    },
    {
      icon: <NotebookPen className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      title: "AI-Powered Journaling",
      description: "Auto-generate post-trade analysis with AI. Get sentiment scoring, pattern detection, and personalized coaching. Journal templates for psychology, risk, and strategy reviews."
    },
    {
      icon: <ChartLine className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      title: "Advanced Backtesting",
      description: "Backtest strategies with walk-forward optimization, Monte Carlo robustness testing, multi-timeframe analysis, and portfolio correlation. Import custom data or use 20+ built-in datasets."
    },
    {
      icon: <Target className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
      title: "Goal Tracking System",
      description: "Set smart trading goals with progress tracking, milestone rewards, and AI reminders. Track drawdown limits, consistency streaks, and custom KPIs with visual dashboards."
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Community Challenges",
      description: "Join monthly trading challenges with leaderboards, peer reviews, and prizes. Compete in prop firm simulations, risk management marathons, or consistency streaks."
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Full-Time Forex Trader",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      content: "Forgex transformed my trading. The AI journal insights alone doubled my win rate in 3 months. It's like having a 24/7 mentor analyzing every move.",
      rating: 5
    },
    {
      name: "Sarah Thompson",
      role: "Crypto Swing Trader",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      content: "The backtesting suite is unreal. I optimized my strategy and went from breakeven to 28% monthly returns. Privacy focus is perfect for serious traders.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Stock Options Trader",
      image: "https://randomuser.me/api/portraits/men/75.jpg",
      content: "Multi-account tracking saved me hours every week. The performance reports are more detailed than my broker's platform. Absolute game-changer.",
      rating: 5
    },
    {
      name: "Emily Patel",
      role: "Futures Day Trader",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      content: "The psychology journaling with AI sentiment analysis helped me conquer emotional trading. Now I'm consistently profitable after years of struggle.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: 0,
      period: "forever",
      features: [
        "Basic trade logging",
        "5 performance reports",
        "Single account tracking",
        "Community challenges",
        "Standard journaling",
        "CSV export"
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline",
      buttonAction: () => navigate('/register')
    },
    {
      name: "Pro",
      price: 19,
      period: "month",
      features: [
        "Unlimited trade logging",
        "60+ advanced reports",
        "Multi-account tracking",
        "AI-powered insights",
        "Advanced backtesting",
        "Priority support",
        "Custom dashboards",
        "Broker integration"
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "default",
      popular: true,
      buttonAction: () => navigate('/register')
    },
    {
      name: "Elite",
      price: 49,
      period: "month",
      features: [
        "Everything in Pro",
        "Unlimited backtests",
        "AI strategy optimizer",
        "Personal AI coach",
        "Team collaboration",
        "Custom API access",
        "White-label reports",
        "Dedicated account manager"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "default",
      buttonAction: () => window.location.href = 'mailto:sales@forgex.com'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Log Your Trades",
      description: "Record every detail in seconds. Add screenshots, emotions, and market conditions.",
      icon: <BookOpen className="w-12 h-12 text-blue-500" />
    },
    {
      step: 2,
      title: "AI Analysis",
      description: "Get instant insights on patterns, mistakes, and optimization opportunities.",
      icon: <Brain className="w-12 h-12 text-purple-500" />
    },
    {
      step: 3,
      title: "Track Progress",
      description: "Watch your performance improve with detailed reports and goal tracking.",
      icon: <TrendingUp className="w-12 h-12 text-green-500" />
    },
    {
      step: 4,
      title: "Level Up",
      description: "Join challenges, get coaching, and become consistently profitable.",
      icon: <Trophy className="w-12 h-12 text-yellow-500" />
    }
  ];

  const faqs = [
    {
      question: "How secure is my trading data?",
      answer: "Forgex uses bank-grade encryption and never shares your data. All analysis happens on-device or in our secure cloud with zero human access."
    },
    {
      question: "Can I import my existing trades?",
      answer: "Yes! Import from CSV, MT4/5 reports, TradingView, or direct broker sync for supported platforms."
    },
    {
      question: "Is AI really useful for trading?",
      answer: "Absolutely. Our AI detects hidden patterns in your trades that humans often miss, like time-of-day biases or correlated mistakes."
    },
    {
      question: "What markets does Forgex support?",
      answer: "All markets: Forex, stocks, crypto, futures, options, CFDs, and custom instruments."
    },
    {
      question: "Can I use Forgex on mobile?",
      answer: "Yes! Fully responsive web app with PWA support. Native apps coming soon."
    },
    {
      question: "What's the cancellation policy?",
      answer: "Cancel anytime. No contracts. Get a pro-rated refund for annual plans."
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Stock Market Counters */}
        <div className="absolute top-1/4 left-1/4 opacity-20 scale-150 blur-md animate-pulse-slow">
          <div className="stock-counter stock-counter1" data-value="123456"></div>
        </div>
        <div className="absolute bottom-1/3 right-1/3 opacity-20 scale-125 blur-md animate-pulse-slow delay-500">
          <div className="stock-counter stock-counter2" data-value="78901"></div>
        </div>
        <div className="absolute top-2/3 left-2/3 opacity-20 scale-200 blur-md animate-pulse-slow delay-1000">
          <div className="stock-counter stock-counter3" data-value="2345678"></div>
        </div>
        
        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-500/10 blur-xl animate-float"
            style={{
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 20 + 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={staggerContainer}
        className="relative z-10 min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20"
      >
        <div className="max-w-6xl mx-auto text-center lg:text-left lg:flex lg:items-center lg:gap-12">
          <motion.div variants={fadeInUp} className="lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              Master Your Trades
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Become Profitable
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto lg:mx-0">
              The AI-powered trading journal that turns data into edge. Track, analyze, and optimize your performance like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={() => navigate('/register')}
                className="group h-14 px-8 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 transition-all duration-300 rounded-xl shadow-lg shadow-blue-900/30"
              >
                Start Free Trial
                <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="h-14 px-8 text-lg font-bold text-white border-white/20 hover:border-white/40 hover:bg-white/5 rounded-xl"
              >
                Log In
              </Button>
            </div>
            <div className="mt-10 flex justify-center lg:justify-start gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-400" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Infinity className="h-5 w-5 text-blue-400" />
                <span>Unlimited Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-400" />
                <span>Works Everywhere</span>
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="lg:w-1/2 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/30 border border-white/10 p-4 backdrop-blur-sm bg-black/30">
              {/* Mock Dashboard Preview */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-black/40 rounded-xl">
                    <div className="text-sm text-gray-400">Win Rate</div>
                    <div className="text-2xl font-bold text-green-400">68%</div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl">
                    <div className="text-sm text-gray-400">PnL</div>
                    <div className="text-2xl font-bold text-green-400">+$4,280</div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl">
                    <div className="text-sm text-gray-400">R:R Avg</div>
                    <div className="text-2xl font-bold text-purple-400">2.8</div>
                  </div>
                </div>
                <div className="h-40 bg-black/40 rounded-xl flex items-center justify-center text-gray-400">
                  <LineChart className="h-16 w-16" />
                  <span className="ml-2">Performance Chart</span>
                </div>
                <div className="p-3 bg-black/40 rounded-xl">
                  <div className="text-sm text-gray-400 mb-2">Recent Trade</div>
                  <div className="flex justify-between">
                    <span>EUR/USD Long</span>
                    <span className="text-green-400">+$420</span>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl opacity-50 animate-pulse-slow"></div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-center mb-6">
            Built for Winners
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-300 text-center mb-16 max-w-3xl mx-auto">
            Everything serious traders need. Nothing you don't. AI-powered tools that turn your data into real edge.
          </motion.p>
          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group p-8 rounded-2xl bg-black/30 border border-white/10 hover:border-blue-500/30 hover:bg-black/50 transition-all duration-300 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-blue-900/20"
              >
                <div className="mb-6 p-4 w-fit rounded-xl bg-gradient-to-br from-black/50 to-gray-900/50 border border-white/5 group-hover:border-blue-500/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 bg-gradient-to-b from-transparent to-black relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-center mb-16">
            From Trader to Master in 4 Steps
          </motion.h2>
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative p-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-4 py-1 rounded-full shadow-md">
                  Step {step.step}
                </div>
                <div className="text-center mb-4 mt-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-center mb-4">{step.title}</h3>
                <p className="text-gray-300 text-center">{step.description}</p>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 text-blue-500">
                    <ArrowRight size={32} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 relative z-10"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-16">
            Traders Love Forgex
          </motion.h2>
          <div className="relative max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: index === activeTestimonial ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-0 left-0 w-full"
              >
                <div className="p-8 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md shadow-2xl">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full shadow-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-1 shadow-md">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mb-4">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg text-gray-200 mb-6 italic">"{testimonial.content}"</p>
                  <div className="text-sm font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === activeTestimonial ? "bg-blue-500 w-6" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        id="pricing"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 relative z-10"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
            Simple Pricing. Powerful Value.
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto">
            Start free. Scale when ready. No hidden fees, no contracts – just pure trading power.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`p-8 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-b from-black/50 to-gray-900/50 border-blue-500/30 scale-105"
                    : "bg-black/30 border-white/10 hover:border-blue-500/20"
                }`}
              >
                {plan.popular && (
                  <div className="inline-block px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-sm font-bold mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-5xl font-black mb-2">
                  ${plan.price}
                </div>
                <div className="text-sm text-gray-400 mb-8">per {plan.period}</div>
                <ul className="space-y-4 text-left mb-8 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={plan.buttonAction}
                  variant={plan.buttonVariant}
                  className="w-full h-12 text-lg font-bold rounded-xl"
                >
                  {plan.buttonText}
                </Button>
              </motion.div>
            ))}
          </div>
          <p className="mt-12 text-sm text-gray-500">* 14-day money-back guarantee. Cancel anytime.</p>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-center mb-16">
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <details className="group">
                  <summary className="flex justify-between items-center py-4 px-6 bg-black/30 rounded-xl border border-white/10 cursor-pointer hover:bg-black/50 transition-all">
                    <span className="text-lg font-semibold">{faq.question}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-2 px-6 py-4 text-gray-300">
                    {faq.answer}
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-24 px-6 text-center relative z-10"
      >
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl rounded-full opacity-50"></div>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6 relative">
            Ready to Level Up Your Trading?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-gray-300 mb-12 relative">
            Join thousands of profitable traders. Start your free trial today.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex justify-center gap-4 relative">
            <Button
              onClick={() => navigate('/register')}
              className="group h-14 px-10 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 transition-all duration-300 rounded-xl shadow-lg shadow-blue-900/30"
            >
              Start Free Trial
              <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="h-14 px-10 text-lg font-bold text-white border-white/20 hover:border-white/40 hover:bg-white/5 rounded-xl"
            >
              Log In
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-24 px-6 relative z-10"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
            <p className="text-gray-300 mb-8">Have questions? We're here to help. Reach out anytime.</p>
            <div className="space-y-6 text-sm">
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-blue-400" />
                <a href="mailto:support@forgex.com" className="hover:text-white">support@forgex.com</a>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-4">
                <MessageCircle className="h-5 w-5 text-blue-400" />
                <a href="/discord" className="hover:text-white">Join our Discord</a>
              </div>
            </div>
          </div>
          <motion.form variants={fadeInUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                className="w-full p-4 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full p-4 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                rows={6}
                className="w-full p-4 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 outline-none resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-lg font-bold hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </motion.form>
        </div>
      </motion.section>

      {/* Professional Footer */}
      <footer className="py-16 px-6 bg-black text-gray-400 border-t border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-12 text-center md:text-left">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                F
              </div>
              <span className="text-2xl font-bold text-white">Forgex</span>
            </div>
            <p className="text-sm mb-6">The ultimate trading journal for serious traders. Private, powerful, and performance-driven.</p>
            <div className="flex justify-center md:justify-start gap-4">
              <a href="https://twitter.com/forgex" className="hover:text-white"><Twitter className="h-5 w-5" /></a>
              <a href="https://linkedin.com/company/forgex" className="hover:text-white"><Linkedin className="h-5 w-5" /></a>
              <a href="https://github.com/forgex" className="hover:text-white"><Github className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/changelog" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="/partners" className="hover:text-white transition-colors">Partners</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/status" className="hover:text-white transition-colors">Status</a></li>
              <li><a href="/academy" className="hover:text-white transition-colors">Trading Academy</a></li>
              <li><a href="/wall-of-love" className="hover:text-white transition-colors">Wall of Love</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-12 border-t border-gray-800 text-center text-sm">
          © {new Date().getFullYear()} Forgex. All rights reserved. Made with discipline and caffeine by traders, for traders.
        </div>
      </footer>
    </div>
  );
}
