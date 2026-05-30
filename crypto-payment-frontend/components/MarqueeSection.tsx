'use client';

const row1 = ['BITCOIN', 'VOICE AUTOMATION', 'ANY LANGUAGE', 'WHATSAPP INTEGRATION', 'ACCESSIBILITY', 'LIGHTNING PAYMENTS'];
const row2 = ['USSD SUPPORT', 'AI PAYMENTS', 'SIMPLE UI', 'VOICE AI', 'INSTANT TRANSFERS', 'ZERO FRICTION'];

function MarqueeRow({ items, reverse = false, speed = 25 }: { items: string[], reverse?: boolean, speed?: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-2">
      <div
        className={reverse ? 'marquee-track-reverse' : 'marquee-track'}
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="shrink-0 px-6 py-3 rounded-full flex items-center gap-3"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#2D7A4F' }} />
            <span className="font-candal text-black text-sm tracking-wider whitespace-nowrap">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarqueeSection() {
  return (
    <div className="py-14 overflow-hidden" style={{ background: '#fafafa' }}>
     
      <div className="flex flex-col gap-3">
        <MarqueeRow items={row1} speed={30} />
        <MarqueeRow items={row2} reverse speed={35} />
      </div>
    </div>
  );
}
