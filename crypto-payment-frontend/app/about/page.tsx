'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Cpu, 
  Coins, 
  Lock, 
  Shield, 
  Globe, 
  Accessibility, 
  Check
} from 'lucide-react';

const team = [
  { name: 'Ojo Rebecca', role: 'UI/UX Designer', avatar: 'OR', gradient: 'from-[#2D7A4F] to-[#1f5c3a]' },
  { name: 'Oyebo Hasbiy', role: 'Backend Developer', avatar: 'OH', gradient: 'from-[#128C7E] to-[#075E54]' },
  { name: 'Abibi Daniella', role: 'Blockchain Developer', avatar: 'AD', gradient: 'from-[#3a9b63] to-[#1f5c3a]' },
  { name: 'Omilabu Elizabeth', role: 'Frontend Developer', avatar: 'OE', gradient: 'from-[#1DB954] to-[#0A8C3A]' },
];

const stats = [
  { value: '2M+', label: 'Transactions Processed' },
  { value: '50ms', label: 'Average Settlement Time' },
  { value: '12+', label: 'Languages Supported' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const steps = [
  {
    number: '01',
    title: 'Natural Input',
    description: 'Speak or type naturally in your local language (Yoruba, Hausa, Igbo, Pidgin, or English). Just say what you want, e.g., "Send ₦500 to Rebecca".',
    icon: Mic,
  },
  {
    number: '02',
    title: 'AI Translation & Parsing',
    description: 'Our proprietary AI parses the spoken audio, translates the dialect, verifies contact details, detects potential fraud, and prepares the payout details.',
    icon: Cpu,
  },
  {
    number: '03',
    title: 'Instant Settlement',
    description: 'The transaction is executed over high-speed Bitcoin Lightning or fiat rails, finalizing payments in milliseconds with zero intermediaries.',
    icon: Coins,
  },
];

const pillars = [
  {
    title: 'Language Independence',
    description: 'Financial services should speak your language. We translate and parse dialects seamlessly, giving indigenous communities equal economic voice.',
    icon: Globe,
  },
  {
    title: 'Accessibility First',
    description: 'Complete integration with screen readers, high-contrast layouts, custom font scaling, and pure voice-driven navigation for visually or motor-impaired users.',
    icon: Accessibility,
  },
];

const securityCards = [
  {
    title: 'Voice Signature Biometrics',
    description: 'Your voice print is completely unique. Our neural verification systems map acoustic profiles to prevent unauthorized transactions.',
    icon: Lock,
  },
  {
    title: 'Zero-Knowledge Privacy',
    description: 'We prioritize user privacy. Sensitive financial data and transaction payloads are hashed and verified with state-of-the-art cryptographic proofs.',
    icon: Shield,
  },
];

export default function About() {
  return (
    <main className="w-full" style={{ background: '#fafafa', color: '#111827' }}>
      <Navbar theme="light" />

      {/* Hero Section */}
      <section className="min-h-[85vh] flex items-center justify-center px-6 md:px-16 pt-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(45,122,79,0.06) 0%, transparent 70%)'
        }} />
        <div className="text-center z-10 max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-neue text-[#2D7A4F] text-xs md:text-sm tracking-[0.3em] uppercase mb-6"
          >
            OUR MISSION & VISION
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-candal text-black leading-[0.95] mb-8"
            style={{ fontSize: 'clamp(44px, 7vw, 110px)' }}
          >
            FINANCE FOR<br />
            <span style={{ WebkitTextStroke: '2px rgba(0,0,0,0.15)', color: 'transparent' }}>EVERYONE</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-neue text-black/50 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
          >
            Access to financial services is a fundamental human right. Talk2Pay removes every technical, structural, and language barrier — enabling instant payments for anyone, anywhere, using only their voice.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 md:px-16 border-t border-b border-black/5 bg-black/[0.01]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <p className="font-candal text-black mb-1 text-4xl md:text-5xl font-bold">{stat.value}</p>
              <p className="font-neue text-black/40 text-xs md:text-sm tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-neue text-[#2D7A4F] text-xs tracking-[0.3em] uppercase mb-4">THE TRANSACTION LOOP</p>
          <h2 className="font-candal text-black text-3xl md:text-5xl mb-6">How Talk2Pay Works</h2>
          <p className="font-neue text-black/50 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            We translate the complexity of decentralized finance into intuitive voice interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                className="bg-white border border-black/5 hover:border-black/10 hover:shadow-lg rounded-2xl p-6 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#2D7A4F]/10 flex items-center justify-center border border-[#2D7A4F]/20 text-[#2D7A4F]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-candal text-black/5 text-4xl font-bold">{step.number}</span>
                </div>
                <h3 className="font-candal text-black text-xl mb-3">{step.title}</h3>
                <p className="font-neue text-black/55 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Multi-Channel Previews (WhatsApp & USSD) */}
      <section className="py-24 px-6 md:px-16 bg-black/[0.01] border-t border-b border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-neue text-[#2D7A4F] text-xs tracking-[0.3em] uppercase mb-4">MULTIPLE PATHWAYS</p>
            <h2 className="font-candal text-black text-3xl md:text-5xl mb-6">Any App. Any Device.</h2>
            <p className="font-neue text-black/50 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              We leverage existing platforms and protocols so users never have to learn a complex new wallet interface.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* WhatsApp Chat Preview */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="w-full flex flex-col"
            >
              <div className="mb-6">
                <span className="text-[#2D7A4F] font-candal text-xs tracking-wider uppercase block mb-2">WHATSAPP AGENT</span>
                <h3 className="text-2xl md:text-3xl font-candal text-black mb-4">Social Chat Transactions</h3>
                <p className="text-black/50 text-sm leading-relaxed mb-4">
                  Send funds, settle checks, and convert currencies instantly on your favorite chat app. Simply trigger our verified Talk2Pay AI bot, state your instruction, confirm, and verify the successful transaction response.
                </p>
              </div>

              {/* Chat box container */}
              <div className="rounded-2xl overflow-hidden border border-black/10 shadow-xl flex flex-col bg-white w-full" style={{ maxWidth: '480px' }}>
                <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54]">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-xs font-bold font-candal">T2</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Talk2Pay AI Agent</p>
                    <p className="text-white/60 text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full inline-block"></span> Online
                    </p>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3 bg-[#ECE5DD] min-h-[220px]">
                  {/* Msg 1 */}
                  <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] px-4 py-2 rounded-2xl rounded-tr-none text-xs text-black max-w-[80%] shadow-sm">
                      <p className="font-semibold flex items-center gap-1 text-[10px] text-black/50 mb-0.5"><Mic className="w-3 h-3 text-[#2D7A4F] inline" /> Voice Note (0:04)</p>
                      <p className="text-[#111]">"Send ₦500 to Rebecca Ojo"</p>
                      <p className="text-[9px] text-right text-black/40 mt-1">9:41 AM ✓✓</p>
                    </div>
                  </div>

                  {/* Msg 2 */}
                  <div className="flex justify-start">
                    <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none text-xs text-black max-w-[80%] shadow-sm">
                      <p className="text-[#222]">Got it. Confirm payment of <strong>₦500.00</strong> to <strong>Rebecca Ojo</strong>?</p>
                      <p className="text-[9px] text-right text-black/30 mt-1">9:41 AM</p>
                    </div>
                  </div>

                  {/* Msg 3 */}
                  <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] px-4 py-2 rounded-2xl rounded-tr-none text-xs text-black max-w-[40%] shadow-sm">
                      <p className="text-[#111]">Yes, proceed</p>
                      <p className="text-[9px] text-right text-black/40 mt-1">9:42 AM ✓✓</p>
                    </div>
                  </div>

                  {/* Msg 4 */}
                  <div className="flex justify-start">
                    <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none text-xs text-black max-w-[80%] shadow-sm border-l-4 border-[#2D7A4F]">
                      <p className="text-[#111] flex items-center gap-1 font-semibold text-[#2D7A4F] mb-1">
                        <Check className="w-4 h-4" /> Transaction Successful
                      </p>
                      <p className="text-[#222]">₦500.00 has been sent to Rebecca. Wallet reference: <code>t2p_rec_982x</code></p>
                      <p className="text-[9px] text-right text-black/30 mt-1">9:42 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* USSD / 2G Screen Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="w-full flex flex-col"
            >
              <div className="mb-6">
                <span className="text-[#2D7A4F] font-candal text-xs tracking-wider uppercase block mb-2">OFFLINE ACCESS</span>
                <h3 className="text-2xl md:text-3xl font-candal text-black mb-4">No Internet? Dial *347#</h3>
                <p className="text-black/50 text-sm leading-relaxed mb-4">
                  We believe no user should be left behind due to network connectivity. By dialling the code on any 2G phone, users access full wallet balances, quick transfers, utility billing, and settings. Simple menus, lightning fast performance.
                </p>
              </div>

              {/* Retro phone interface container */}
              <div className="w-full max-w-[380px] bg-[#1a1a1a] rounded-3xl p-4 border border-white/10 shadow-xl flex flex-col items-center">
                {/* Screen */}
                <div className="w-full bg-[#f0f4f0] rounded-xl border-4 border-[#222] p-4 flex flex-col min-h-[220px]" style={{ fontFamily: 'monospace' }}>
                  <div className="text-[11px] text-[#2b3e34] font-bold border-b border-[#2b3e34]/20 pb-1 mb-2">
                    TALK2PAY MOBILE v2.1
                  </div>
                  <div className="text-xs text-[#2b3e34] font-medium leading-relaxed mb-4 flex-1">
                    Welcome back David.<br />
                    Select Action:<br />
                    1. Send Money<br />
                    2. Check Wallet Bal<br />
                    3. Manage Voice ID<br />
                    4. Choose Dialect (EN/HA/YO/IG)
                  </div>
                  <div className="bg-[#cdd8cd] p-1 px-2 text-xs text-[#2b3e34] flex justify-between rounded">
                    <span>1</span>
                    <span>Input Action</span>
                  </div>
                  <div className="flex justify-between mt-3 text-[10px] text-[#2b3e34]/60 font-semibold border-t border-[#2b3e34]/20 pt-2">
                    <span className="hover:text-black cursor-pointer">[ Send ]</span>
                    <span className="hover:text-black cursor-pointer">[ Cancel ]</span>
                  </div>
                </div>

                {/* Dial pad buttons mock */}
                <div className="grid grid-cols-3 gap-2 mt-4 w-full px-4 text-xs font-semibold text-white/60">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(num => (
                    <div key={num} className="w-full h-8 rounded bg-[#2c2c2c] border border-white/5 flex items-center justify-center select-none shadow">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#2D7A4F] font-candal text-xs tracking-wider uppercase block mb-2">OUR VALUES</span>
            <h2 className="font-candal text-black text-3xl md:text-5xl mb-6">Designed For Every Human</h2>
            <p className="font-neue text-black/50 text-sm md:text-base leading-relaxed mb-8">
              We built our software around real human barriers. Talk2Pay adapts to your conditions, rather than forcing you to learn complex technology.
            </p>
            
            <div className="flex flex-col gap-6">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#2D7A4F]/10 flex items-center justify-center shrink-0 border border-[#2D7A4F]/20 text-[#2D7A4F]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-candal text-black text-lg mb-1">{pillar.title}</h4>
                      <p className="font-neue text-black/55 text-sm leading-relaxed">{pillar.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative aspect-square max-w-[480px] w-full mx-auto hidden lg:flex items-center justify-center">
            {/* Visual gradient backdrop */}
            <div className="absolute inset-0 bg-[#2D7A4F]/5 rounded-full blur-3xl" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute w-72 h-72 border border-black/5 rounded-full border-dashed"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="absolute w-96 h-96 border border-[#2D7A4F]/10 rounded-full"
            />
            <div className="z-10 text-center bg-white border border-black/5 rounded-3xl p-8 backdrop-blur-xl shadow-xl max-w-sm">
              <Accessibility className="w-12 h-12 text-[#2D7A4F] mx-auto mb-4" />
              <p className="font-candal text-black text-lg mb-2">Universal Access</p>
              <p className="font-neue text-black/50 text-xs leading-relaxed">
                Whether you utilize a high-end smartphone on 5G or an old keypad device in rural zones, you have complete equity of access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 px-6 md:px-16 bg-black/[0.01] border-t border-b border-black/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:pr-6">
            <span className="text-[#2D7A4F] font-candal text-xs tracking-wider uppercase block mb-2">TRUST & SAFETY</span>
            <h2 className="font-candal text-black text-3xl md:text-4xl mb-4">Ironclad Security</h2>
            <p className="font-neue text-black/50 text-sm leading-relaxed">
              We understand that safety is paramount. That's why every transaction is backed by multiple overlapping layers of encryption, biometric signature matching, and blockchain finality.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-white border border-black/5 hover:border-black/10 hover:shadow-md rounded-2xl p-6 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-[#2D7A4F]/10 flex items-center justify-center border border-[#2D7A4F]/20 text-[#2D7A4F] mb-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-candal text-black text-lg mb-2">{card.title}</h3>
                  <p className="font-neue text-black/55 text-xs md:text-sm leading-relaxed">{card.description}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Team Roster Section */}
     
      <Footer />
    </main>
  );
}
