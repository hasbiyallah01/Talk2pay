'use client';
import { motion } from 'framer-motion';

type HighlightFeature = 'voice' | 'scan' | 'whatsapp' | 'language' | 'accessibility' | 'payment' | 'ussd' | 'none';

interface Props {
  highlight?: HighlightFeature;
  scale?: number;
  rotateY?: number;
  rotateX?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function PhoneMockup({ 
  highlight = 'none', 
  scale = 1, 
  rotateY = 0,
  rotateX = 0,
  style,
  className = ''
}: Props) {

  const isBlurred = (feature: HighlightFeature) => 
    highlight !== 'none' && highlight !== feature;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: '280px',
        height: '580px',
        perspective: '1200px',
        ...style
      }}
    >
      <motion.div
        animate={{ rotateY, rotateX, scale }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '280px',
          height: '580px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Phone Shell */}
        <div
          className="relative w-full h-full rounded-[44px]  overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 40%, #111 100%)',
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.12),
              0 0 0 2px rgba(0,0,0,0.8),
              8px 24px 60px rgba(0,0,0,0.7),
              -2px -2px 8px rgba(255,255,255,0.04),
              inset 0 1px 0 rgba(255,255,255,0.1)
            `,
          }}
        >
          {/* Side reflection */}
          <div className="absolute inset-0 rounded-[44px] pointer-events-none" style={{
            background: 'linear-gradient(105deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.03) 100%)',
            zIndex: 20
          }} />

          {/* Screen bezel */}
          <div className="absolute inset-[3px] rounded-[41px] overflow-hidden bg-black">
            
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-30 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-[#1a1a1a] rounded-full border border-[#2a2a2a]" />
              <div className="w-8 h-1.5 bg-[#1a1a1a] rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="absolute   inset-0 rounded-[41px] overflow-hidden" style={{ background: '#0f1115' }}>
              
              {/* Status Bar */}
              <div className="flex items-center justify-between px-6 pt-14 pb-2">
                <span className="text-white text-[10px] font-semibold">9:42</span>
                <div className="flex items-center gap-1">
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="white">
                    <rect x="0" y="3" width="2" height="6" rx="0.5" opacity="0.4"/>
                    <rect x="3" y="2" width="2" height="7" rx="0.5" opacity="0.6"/>
                    <rect x="6" y="1" width="2" height="8" rx="0.5" opacity="0.8"/>
                    <rect x="9" y="0" width="2" height="9" rx="0.5"/>
                  </svg>
                  <svg width="10" height="9" viewBox="0 0 10 9" fill="white">
                    <rect x="1" y="3" width="8" height="5" rx="1" stroke="white" strokeWidth="1" fill="none"/>
                    <rect x="0" y="4" width="1" height="3" rx="0.3" fill="white" opacity="0.6"/>
                    <rect x="2" y="4" width="5" height="3" rx="0.5" fill="white"/>
                  </svg>
                </div>
              </div>

              {/* App Header */}
              <div className="px-5 py-2 flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-[9px] font-medium">TRUST2PAY</p>
                  <p className="text-white  text-sm font-bold">Good morning, David</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#2D7A4F] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">D</span>
                </div>
              </div>

              {/* Balance Card */}
              <motion.div
                className="mx-4 my-2 rounded-2xl p-4"
                style={{
                  background: 'linear-gradient(135deg, #2D7A4F 0%, #1f5c3a 100%)',
                  boxShadow: '0 4px 20px rgba(45,122,79,0.3)'
                }}
                animate={{
                  opacity: isBlurred('payment') ? 0.4 : 1,
                  filter: isBlurred('payment') ? 'blur(2px)' : 'blur(0px)'
                }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-white/70 text-[9px] font-medium mb-1">WALLET BALANCE</p>
                <p className="text-white text-xl font-bold">₦ 247,850.00</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-white/60 text-[9px]">**** **** **** 4821</span>
                  <span className="text-green-300 text-[9px]">● Active</span>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <div className="px-4 py-2">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: '↑', label: 'Send' },
                    { icon: '↓', label: 'Receive' },
                    { icon: '⊞', label: 'Scan' },
                    { icon: '⋯', label: 'More' }
                  ].map((action, i) => (
                    <motion.div
                      key={action.label}
                      className="flex flex-col items-center gap-1"
                      animate={{
                        opacity: (highlight === 'scan' && action.label === 'Scan') ? 1 : 
                                 highlight !== 'none' && !(highlight === 'scan' && action.label === 'Scan') ? 0.35 : 1,
                        filter: (highlight === 'scan' && action.label === 'Scan') ? 'blur(0px)' :
                                highlight !== 'none' ? 'blur(1px)' : 'blur(0px)',
                        scale: (highlight === 'scan' && action.label === 'Scan') ? 1.1 : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" 
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-white text-sm">{action.icon}</span>
                      </div>
                      <span className="text-white/50 text-[8px]">{action.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Voice Feature */}
              <motion.div
                className="mx-4 my-1.5 rounded-2xl p-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                animate={{
                  opacity: isBlurred('voice') ? 0.35 : 1,
                  filter: isBlurred('voice') ? 'blur(2px)' : 'blur(0px)',
                  scale: highlight === 'voice' ? 1.02 : 1,
                  borderColor: highlight === 'voice' ? 'rgba(45,122,79,0.6)' : 'rgba(255,255,255,0.07)'
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#2D7A4F' }}>
                    <span className="text-white text-xs">🎙</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-[11px] font-semibold">Voice Command</p>
                    <p className="text-white/40 text-[9px]">Tap to speak</p>
                  </div>
                  <div className="flex gap-0.5 items-end h-4">
                    {[3,5,4,6,3,5,4].map((h,i) => (
                      <motion.div key={i} 
                        className="w-0.5 rounded-full bg-[#2D7A4F]"
                        animate={{ height: highlight === 'voice' ? [h*2, h*3, h*2] : h*2 }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* WhatsApp integration */}
              <motion.div
                className="mx-4 my-1.5 rounded-2xl p-3"
                style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.15)' }}
                animate={{
                  opacity: isBlurred('whatsapp') ? 0.35 : 1,
                  filter: isBlurred('whatsapp') ? 'blur(2px)' : 'blur(0px)',
                  scale: highlight === 'whatsapp' ? 1.02 : 1,
                  borderColor: highlight === 'whatsapp' ? 'rgba(37,211,102,0.5)' : 'rgba(37,211,102,0.15)'
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#25D366]">
                    <span className="text-white text-xs">💬</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-[11px] font-semibold">WhatsApp Pay</p>
                    <p className="text-white/40 text-[9px]">Send ₦500 to David</p>
                  </div>
                  <span className="text-[#25D366] text-[8px] font-semibold">SENT</span>
                </div>
              </motion.div>

              {/* Language / Accessibility / USSD */}
              <motion.div
                className="mx-4 my-1.5 rounded-2xl p-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                animate={{
                  opacity: isBlurred('language') && isBlurred('accessibility') && isBlurred('ussd') ? 0.35 : 1,
                  filter: isBlurred('language') && isBlurred('accessibility') && isBlurred('ussd') ? 'blur(2px)' : 'blur(0px)',
                  scale: (highlight === 'language' || highlight === 'accessibility' || highlight === 'ussd') ? 1.02 : 1,
                  borderColor: (highlight === 'language' || highlight === 'accessibility' || highlight === 'ussd') ? 'rgba(45,122,79,0.5)' : 'rgba(255,255,255,0.07)'
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  {highlight === 'language' && (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-lg">🌍</span>
                      <div>
                        <p className="text-white text-[11px] font-semibold">Any Language</p>
                        <div className="flex gap-1 mt-0.5">
                          {['EN', 'HA', 'YO', 'IG'].map(l => (
                            <span key={l} className="text-[8px] px-1.5 py-0.5 rounded-full text-white" 
                              style={{ background: 'rgba(45,122,79,0.4)' }}>{l}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {highlight === 'accessibility' && (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-lg">♿</span>
                      <div>
                        <p className="text-white text-[11px] font-semibold">Accessibility</p>
                        <p className="text-white/40 text-[9px]">Screen reader • Voice nav</p>
                      </div>
                    </div>
                  )}
                  {highlight === 'ussd' && (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-lg">📱</span>
                      <div>
                        <p className="text-white text-[11px] font-semibold">USSD</p>
                        <p className="text-white/40 text-[9px]">*347# • Feature phones</p>
                      </div>
                    </div>
                  )}
                  {highlight === 'none' && (
                    <>
                      <div className="flex gap-3">
                        <span className="text-white/40 text-xs">🌍</span>
                        <span className="text-white/40 text-xs">♿</span>
                        <span className="text-white/40 text-xs">📱</span>
                      </div>
                      <span className="text-white/30 text-[9px]">More features</span>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Payment Success */}
              <motion.div
                className="mx-4 my-1.5 rounded-2xl p-3"
                style={{ background: 'rgba(45,122,79,0.1)', border: '1px solid rgba(45,122,79,0.2)' }}
                animate={{
                  opacity: isBlurred('payment') ? 0.35 : 1,
                  filter: isBlurred('payment') ? 'blur(2px)' : 'blur(0px)',
                  scale: highlight === 'payment' ? 1.02 : 1
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#2D7A4F] flex items-center justify-center">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                    <div>
                      <p className="text-white text-[11px] font-semibold">Payment Sent</p>
                      <p className="text-white/40 text-[9px]">₦500 → David</p>
                    </div>
                  </div>
                  <span className="text-[#2D7A4F] text-[9px] font-semibold">INSTANT</span>
                </div>
              </motion.div>

              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full" />
            </div>
          </div>

          {/* Power button */}
          <div className="absolute right-0 top-[30%] w-1 h-10 rounded-l-sm" style={{ background: '#1a1a1a', marginRight: '-1px', boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.05)' }} />
          {/* Volume buttons */}
          <div className="absolute left-0 top-[22%] w-1 h-8 rounded-r-sm" style={{ background: '#1a1a1a', marginLeft: '-1px' }} />
          <div className="absolute left-0 top-[34%] w-1 h-8 rounded-r-sm" style={{ background: '#1a1a1a', marginLeft: '-1px' }} />
        </div>

        {/* Shadow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full" 
          style={{ background: 'rgba(0,0,0,0.4)', filter: 'blur(16px)', transform: 'translateX(-50%) scaleX(0.7)' }} />
      </motion.div>
    </div>
  );
}
