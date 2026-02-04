// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart2, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  MessageCircle, 
  Briefcase, 
  Heart, 
  ArrowRight, 
  ChevronRight,
  Globe,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
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

const Landing = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading for smooth entrance animation
    setTimeout(() => setIsLoaded(true), 300);
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <BarChart2 className="w-10 h-10 text-cyan-400" />,
      title: "Advanced Trade Tracking",
      description: "Log every trade with detailed metrics: entry/exit, risk/reward, position size, emotional state, and more.",
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: <BookOpen className="w-10 h-10 text-emerald-400" />,
      title: "Daily Journaling",
      description: "Reflect on your trading day with structured prompts, mood tracking, and pattern recognition tools.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-purple-400" />,
      title: "Performance Analytics",
      description: "Visualize your edge with PnL curves, win rate, expectancy, R-multiples, and broker-specific reports.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-amber-400" />,
      title: "Risk Management Tools",
      description: "Position sizing calculator, max drawdown alerts, risk per trade limits, and equity curve protection.",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: <Users className="w-10 h-10 text-rose-400" />,
      title: "Community & Mentorship",
      description: "Connect with other traders, share journals (anonymously), and access mentor feedback.",
      color: "from-rose-500 to-pink-600"
    },
    {
      icon: <MessageCircle className="w-10 h-10 text-sky-400" />,
      title: "Trade Review System",
      description: "Tag trades with setups, mistakes, lessons learned. Filter and review to improve faster.",
      color: "from-sky-500 to-blue-600"
    }
  ];

  const brokers = [
    "Interactive Brokers", "TradeStation", "Thinkorswim (TD Ameritrade)", "NinjaTrader", 
    "MetaTrader 4/5", "TradingView", "eToro", "OANDA", "Forex.com", "IG", 
    "CMC Markets", "Saxo Bank", "Pepperstone", "IC Markets", "Eightcap"
  ];

  const testimonials = [
    {
      name: "Alex M.",
      role: "Full-time Futures Trader",
      text: "This journal changed how I review my sessions. I finally see my recurring mistakes instead of just staring at PnL numbers.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5
    },
    {
      name: "Sarah K.",
      role: "Swing Forex Trader",
      text: "The emotional tracking + setup tagging feature is gold. I cut my revenge trading by 70% in two months.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5
    },
    {
      name: "Michael R.",
      role: "Options & Stocks Day Trader",
      text: "Best analytics I've used. The expectancy calculator and R-multiple breakdown made me realize I was overtrading low-probability setups.",
      avatar: "https://randomuser.me/api/portraits/men/62.jpg",
      rating: 5
    },
    {
      name: "Elena V.",
      role: "Beginner Crypto Trader",
      text: "As a newbie, the daily prompts forced me to reflect properly. I went from -42% to +18% in 4 months.",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={staggerContainer}
        className="relative min-h-screen flex items-center justify-center px-6 py-24 md:py-0 overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.18),transparent_40%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.15),transparent_40%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div variants={fadeInUp}>
            <span className="inline-block px-5 py-2 mb-6 text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full text-cyan-400">
              Trading Journal & Analytics
            </span>
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
          >
            Master Your Trading Psychology
            <br />
            <span className="text-white">and Performance</span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            Professional-grade journal, analytics, risk tools and community — built for serious traders who want to improve consistently.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button
              onClick={() => navigate('/register')}
              className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-xl font-bold shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              Start Your Free Trial
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xl font-medium hover:bg-white/15 transition-all duration-300"
            >
              Log In
            </button>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>14-day full access</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              <span>Supports 15+ brokers</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500"
            >
              Everything You Need to Improve
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Professional tools combined with deep psychology tracking — designed for traders who are serious about long-term growth.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative bg-gray-900/60 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="mb-6 w-20 h-20 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700/50 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Supported Brokers */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Works With Your Broker
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              Import trades automatically or manually from 15+ popular platforms.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {brokers.map((broker, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-colors duration-300"
              >
                <p className="text-lg font-medium">{broker}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Become a Partner */}
      <section className="py-24 px-6 bg-gradient-to-br from-purple-950 via-indigo-950 to-black">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400"
            >
              Become a Partner
            </motion.h2>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              We are looking for trading coaches, educators, prop firm affiliates, and influencers who want to offer their community a professional journaling solution.
            </motion.p>

            <motion.button
              variants={fadeInUp}
              onClick={() => navigate('/contact')}
              className="group px-10 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-2xl font-bold shadow-2xl shadow-purple-900/30 hover:shadow-purple-600/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-4 mx-auto"
            >
              Apply as Partner
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Contact & Support */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-8"
            >
              Get in Touch
            </motion.h2>

            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-300 mb-10 leading-relaxed"
            >
              Have questions about features, pricing, integrations, or partnership opportunities? Our team usually replies within 24 hours.
            </motion.p>

            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="flex items-center gap-4 text-lg">
                <Mail className="w-7 h-7 text-cyan-400" />
                <span>support@myjournalapp.com</span>
              </div>
              <div className="flex items-center gap-4 text-lg">
                <MessageCircle className="w-7 h-7 text-purple-400" />
                <span>Live chat available 9 AM – 8 PM EST</span>
              </div>
              <div className="flex items-center gap-4 text-lg">
                <Phone className="w-7 h-7 text-emerald-400" />
                <span>+1 (555) 123-4567 (Mon–Fri)</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-10"
          >
            <h3 className="text-3xl font-bold mb-8 text-center">Quick Contact</h3>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-5 py-4 bg-gray-950 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-5 py-4 bg-gray-950 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-lg font-bold hover:opacity-90 transition-opacity"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Wall of Love / Testimonials */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 mb-6">
              <Heart className="w-10 h-10 text-red-500 animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-bold">Wall of Love</h2>
            </motion.div>
            <motion.p variants={fadeInUp} className="text-xl text-gray-400">
              Traders who are seeing real results
            </motion.p>
          </motion.div>

          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                animate={{ x: `-${activeTestimonial * 100}%` }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="flex"
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="min-w-full px-4">
                    <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-10 md:p-12 max-w-4xl mx-auto">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-24 h-24 rounded-full border-4 border-gray-700 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-xl md:text-2xl leading-relaxed mb-8 italic">
                            "{testimonial.text}"
                          </p>
                          <div>
                            <p className="font-bold text-lg">{testimonial.name}</p>
                            <p className="text-gray-400">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Dots navigation */}
            <div className="flex justify-center gap-3 mt-10">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    activeTestimonial === index 
                      ? 'bg-cyan-500 scale-125' 
                      : 'bg-gray-700 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Careers */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-950 via-purple-950 to-black">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400"
            >
              We're Hiring
            </motion.h2>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto"
            >
              Join a team that's helping thousands of traders become more consistent and profitable.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-6"
            >
              <button className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-lg font-medium transition-colors">
                View Open Positions
              </button>
              <button className="px-10 py-5 border border-indigo-500 text-indigo-400 hover:bg-indigo-900/30 rounded-xl text-lg font-medium transition-colors">
                Join Talent Network
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            {/* Logo & description */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-6">
                MyJournal
              </h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Professional trading journal & analytics platform helping traders improve discipline, consistency, and profitability.
              </p>
              <div className="flex gap-5">
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Product</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/features" className="hover:text-cyan-400 transition-colors">Features</Link></li>
                <li><Link to="/brokers" className="hover:text-cyan-400 transition-colors">Supported Brokers</Link></li>
                <li><Link to="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
                <li><Link to="/changelog" className="hover:text-cyan-400 transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-cyan-400 transition-colors">Careers</Link></li>
                <li><Link to="/partners" className="hover:text-cyan-400 transition-colors">Partners</Link></li>
                <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Resources</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
                <li><Link to="/help" className="hover:text-cyan-400 transition-colors">Help Center</Link></li>
                <li><Link to="/academy" className="hover:text-cyan-400 transition-colors">Trading Academy</Link></li>
                <li><Link to="/wall-of-love" className="hover:text-cyan-400 transition-colors">Wall of Love</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Legal</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/cookies" className="hover:text-cyan-400 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} MyJournal App. All rights reserved.</p>
            <p className="mt-2">Made with discipline and caffeine by traders, for traders.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
