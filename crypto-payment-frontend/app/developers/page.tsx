'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import TiltedCard from '@/components/TiltedCard';
import { useRef } from 'react';

const team = [
  {
    name: 'Ojo Rebecca',
    role: 'UI/UX Designer',
    avatar: 'OR',
    src: '/devImg/rebecca.jpeg',
    linkedin: 'https://linkedin.com/in/ojo-rebecca',
    x: 'https://x.com/ojorebecca'
  },
  {
    name: 'Oyebo Hasbiy',
    role: 'Backend Developer',
    avatar: 'OH',
    src: '/devImg/hasbiy.jpg',
    linkedin: 'https://linkedin.com/in/oyebo-hasbiy',
    x: 'https://x.com/oyebohasbiy'
  },
  {
    name: 'Abibi Daniella',
    role: 'Blockchain Developer',
    avatar: 'AD',
    src: '/devImg/daniella.jpeg',
    linkedin: 'https://linkedin.com/in/abibi-daniella',
    x: 'https://x.com/abibidaniella'
  },
  {
    name: 'Omilabu Elizabeth',
    role: 'Frontend Developer',
    avatar: 'OE',
    src: '/devImg/wura.webp',
    linkedin: 'https://linkedin.com/in/omilabu-elizabeth',
    x: 'https://x.com/omilabuelizabeth'
  },
];

const shapes = [
  {
    type: 'hexagon',
    className: 'top-[15%] left-[8%] text-emerald-300/40',
    width: 100,
    height: 100,
    points: '50,5 90,25 90,75 50,95 10,75 10,25',
    delay: 0
  },
  {
    type: 'triangle',
    className: 'top-[25%] right-[10%] text-yellow-300/40',
    width: 80,
    height: 80,
    points: '50,15 90,85 10,85',
    delay: 1.5
  },
  {
    type: 'pentagon',
    className: 'bottom-[20%] left-[10%] text-orange-400/40',
    width: 90,
    height: 90,
    points: '50,5 90,35 75,85 25,85 10,35',
    delay: 3
  },
  {
    type: 'diamond',
    className: 'bottom-[35%] right-[12%] text-teal-300/40',
    width: 85,
    height: 85,
    points: '50,10 90,50 50,90 10,50',
    delay: 4.5
  },
  {
    type: 'octagon',
    className: 'top-[50%] left-[2%] text-rose-300/30',
    width: 95,
    height: 95,
    points: '30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30',
    delay: 2
  }
];

export default function Developers() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  return (
    <main style={{ background: '#2D7A4F' }}>
      <Navbar theme="dark" />

      <section ref={constraintsRef} className="min-h-screen pt-25 px-16 pb-24 relative overflow-hidden">
        {/* Interactive Floating Polygons */}
        {shapes.map((shape, idx) => (
          <motion.div
            key={idx}
            className={`absolute z-[1] cursor-grab select-none ${shape.className}`}
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.15}
            dragMomentum={true}
            whileDrag={{ scale: 1.15, cursor: 'grabbing' }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{
              y: {
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: shape.delay,
              },
              rotate: {
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
                delay: shape.delay,
              }
            }}
          >
            <svg
              width={shape.width}
              height={shape.height}
              viewBox="0 0 100 100"
              className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.15)] filter blur-[0.5px]"
            >
              <polygon
                points={shape.points}
                fill="currentColor"
                fillOpacity="0.2"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                className="hover:fill-opacity-35 transition-all duration-300"
              />
            </svg>
          </motion.div>
        ))}

        <div className="max-w-6xl flex justify-center items-center mx-auto z-10 relative pointer-events-none">
            {/* Team */}
                  <div className="max-w-[548px] mx-auto pointer-events-auto">
                    <p className="font-candal text-center text-white text-LG tracking-[0.3em] pb-4 font-bold">MEET THE TEAM</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 md:gap-y-16 gap-y-7 justify-center justify-items-center">
                      {team.map((member, i) => (
                        <motion.div
                          key={member.name}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1, duration: 0.7 }}
                          className={`flex flex-col items-center gap-4 ${i % 2 === 1 ? ' translate-y-0 md:translate-y-12' : ''}`}
                        >
                          <TiltedCard
                            imageSrc={member.src}
                            altText={member.name}
                            captionText={member.name}
                            containerHeight="300px"
                            containerWidth="250px"
                            imageHeight="300px"
                            imageWidth="250px"
                            rotateAmplitude={12}
                            scaleOnHover={1.05}
                            showMobileWarning={false}
                            showTooltip={true}
                          />
                          <div className="flex flex-col items-center text-center">
                            <p className="font-candal text-white">{member.name}</p>
                            <p className="font-neue text-white/40 text-sm mb-3">{member.role}</p>
                            <div className="flex items-center justify-center gap-3">
                              <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/40 hover:text-white transition-all duration-300 hover:scale-110"
                                aria-label={`${member.name}'s LinkedIn`}
                              >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                              </a>
                              <a
                                href={member.x}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/40 hover:text-white transition-all duration-300 hover:scale-110"
                                aria-label={`${member.name}'s X profile`}
                              >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
               
        </div>
      </section>

    </main>
  );
}
