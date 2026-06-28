import { useState } from "react";

const LINKEDIN = "https://uk.linkedin.com/company/brain-innovation-house";

function NeuralBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep space gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(139,60,225,0.16) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(60,180,200,0.10) 0%, transparent 55%), radial-gradient(ellipse 100% 80% at 50% 50%, #080a12 40%, #0a0c18 100%)",
        }}
      />
      {/* Neural wave SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="ng1" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#8b3ce1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b3ce1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ng2" cx="70%" cy="70%">
            <stop offset="0%" stopColor="#7c5ae8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7c5ae8" stopOpacity="0" />
          </radialGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        {/* Light field nodes */}
        {[
          [15, 20], [40, 8], [65, 25], [85, 15], [10, 55], [30, 70],
          [55, 60], [75, 80], [90, 45], [20, 85], [50, 90], [70, 40],
        ].map(([cx, cy], i) => (
          <g key={i} filter="url(#blur1)">
            <circle
              cx={`${cx}%`}
              cy={`${cy}%`}
              r="1.5"
              fill={i % 2 === 0 ? "#6b8ef5" : "#7c5ae8"}
              opacity="0.7"
            />
          </g>
        ))}
        {/* Subtle connectors */}
        {[
          [15, 20, 40, 8],
          [40, 8, 65, 25],
          [65, 25, 85, 15],
          [10, 55, 30, 70],
          [30, 70, 55, 60],
          [55, 60, 75, 80],
          [15, 20, 10, 55],
          [40, 8, 55, 60],
          [65, 25, 75, 80],
          [85, 15, 90, 45],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={`${x1}%`}
            y1={`${y1}%`}
            x2={`${x2}%`}
            y2={`${y2}%`}
            stroke={i % 2 === 0 ? "#8b3ce1" : "#7c5ae8"}
            strokeWidth="0.4"
            strokeOpacity="0.35"
          />
        ))}
      </svg>
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />
    </div>
  );
}

function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
      style={{
        background: "rgba(5,6,15,0.75)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center gap-4">
        <img src="/sansara-icon.png" alt="Sansara" style={{ height: "32px", width: "32px", borderRadius: "8px", objectFit: "cover" }} />
        <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "1rem" }}>×</span>
        <img src="/bih-logo-transparent.png" alt="Brain Innovation House" style={{ height: "40px", objectFit: "contain", opacity: 0.9 }} />
        <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "1rem" }}>×</span>
        <img src="/bc-studios-logo.png" alt="BC Studios" style={{ height: "44px", objectFit: "contain", opacity: 0.9 }} />
      </div>
      <div className="flex items-center gap-6">
        <a
          href="#what-we-do"
          className="text-xs tracking-widest uppercase transition-colors"
          style={{ color: "#8a8fa8", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e8e9f0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8a8fa8")}
        >
          What We Do
        </a>
        <a
          href="#state-design"
          className="text-xs tracking-widest uppercase transition-colors"
          style={{ color: "#8a8fa8", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e8e9f0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8a8fa8")}
        >
          State Design
        </a>
        <a
          href="/research/"
          className="text-xs tracking-widest uppercase transition-colors"
          style={{ color: "#8a8fa8", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e8e9f0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8a8fa8")}
        >
          Research
        </a>
        <a
          href="/training/"
          className="text-xs tracking-widest uppercase transition-colors"
          style={{ color: "#8a8fa8", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e8e9f0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8a8fa8")}
        >
          Training
        </a>
        <a
          href="/interactive-flow/"
          className="text-xs tracking-widest uppercase transition-colors"
          style={{ color: "#8a8fa8", fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e8e9f0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8a8fa8")}
        >
          Flow Builder
        </a>
        <a
          href="#contact"
          className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
          style={{
            color: "#080a12",
            background: "#3cb4c8",
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: "2px",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#52c8de")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#3cb4c8")
          }
        >
          Contact
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ paddingTop: "120px" }}
    >
      {/* Glow orbs */}
      <div
        className="absolute"
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,60,225,0.15) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          pointerEvents: "none",
        }}
      />
      {/* Sansara icon */}
      <div className="mb-8 flex items-center justify-center">
        <img src="/sansara-icon.png" alt="Sansara" style={{ height: "80px", width: "80px", borderRadius: "20px", objectFit: "cover", boxShadow: "0 0 40px rgba(139,60,225,0.4)" }} />
      </div>
      {/* Logo row */}
      <div className="mb-8 flex items-center gap-4 justify-center">
        <img src="/bih-logo-transparent.png" alt="Brain Innovation House" style={{ height: "36px", objectFit: "contain", opacity: 0.85 }} />
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "1rem" }}>×</span>
        <img src="/bc-studios-logo.png" alt="BC Studios" style={{ height: "40px", objectFit: "contain", opacity: 0.7 }} />
      </div>
      {/* Headline */}
      <h1
        className="mb-2 leading-none"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(4rem, 10vw, 9rem)",
          fontWeight: 600,
          color: "#e8e9f0",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        Sansara
      </h1>
      <p
        className="mb-3"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(1rem, 2.2vw, 1.5rem)",
          fontWeight: 400,
          color: "#6b7094",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        by Brain Innovation House &amp; BC Studios
      </p>
      {/* Subheadline */}
      <p
        className="mb-10 max-w-xl mx-auto leading-relaxed"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "1.05rem",
          color: "#8a8fa8",
        }}
      >
        Brain Innovation House and BC Studios combining their expertise in neuroscience, software engineering, music, light, and AI media technology — to bring you something exceptional.
      </p>
      {/* CTAs */}
      <div className="flex flex-wrap gap-4 justify-center">
        <a
          href="#contact"
          className="px-7 py-3.5 text-sm font-medium tracking-wide transition-all"
          style={{
            background: "#3cb4c8",
            color: "#080a12",
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: "2px",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#52c8de")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#3cb4c8")
          }
        >
          Contact Us
        </a>
        <a
          href="#what-this-is"
          className="px-7 py-3.5 text-sm font-medium tracking-wide transition-all"
          style={{
            color: "#e8e9f0",
            border: "1px solid rgba(255,255,255,0.15)",
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: "2px",
            background: "rgba(255,255,255,0.03)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          }}
        >
          Explore Collaboration
        </a>
      </div>
      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "#8a8fa8" }}
      >
        <div
          className="w-px"
          style={{
            height: "40px",
            background:
              "linear-gradient(to bottom, rgba(60,180,200,0.7), transparent)",
          }}
        />
      </div>
    </section>
  );
}

function WhatThisIs() {
  return (
    <section id="what-this-is" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className="text-xs tracking-widest uppercase mb-8"
          style={{ color: "#3cb4c8", fontFamily: "'DM Mono', monospace" }}
        >
          The Collaboration
        </div>

        {/* Intro statement */}
        <h2
          className="mb-20 leading-tight max-w-3xl"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            color: "#e8e9f0",
            fontWeight: 500,
          }}
        >
          Two founders. Two cities. One platform designed to change how people experience wellness.
        </h2>

        {/* Two founder cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Anastasia */}
          <div
            className="p-8"
            style={{
              background: "#0c0e1a",
              border: "1px solid rgba(255,255,255,0.07)",
              borderTop: "3px solid #8b3ce1",
              borderRadius: "4px",
            }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <div
                  className="text-base font-medium mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "#e8e9f0" }}
                >
                  Anastasia Smirnova
                </div>
                <div
                  className="text-xs tracking-widest uppercase"
                  style={{ fontFamily: "'DM Mono', monospace", color: "#8b3ce1" }}
                >
                  Brain Innovation House · London
                </div>
              </div>
              <img src="/bih-logo-transparent.png" alt="Brain Innovation House" style={{ height: "52px", objectFit: "contain", opacity: 0.85, flexShrink: 0 }} />
            </div>
            <p
              className="mb-5 leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem", color: "#8a8fa8" }}
            >
              Neuroscientist, software engineer, and yoga teacher. Founder of Brain Innovation House — a London-based platform supporting the next generation of neuroscience innovators through events, mentorship, and research culture.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Software Engineering", "Neuroscience", "Yoga"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs tracking-wide"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    color: "#8b3ce1",
                    border: "1px solid rgba(139,60,225,0.25)",
                    background: "rgba(139,60,225,0.06)",
                    borderRadius: "2px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Alexandre */}
          <div
            className="p-8"
            style={{
              background: "#0c0e1a",
              border: "1px solid rgba(255,255,255,0.07)",
              borderTop: "3px solid #3cb4c8",
              borderRadius: "4px",
            }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <div
                  className="text-base font-medium mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "#e8e9f0" }}
                >
                  Alexandre Khoury
                </div>
                <div
                  className="text-xs tracking-widest uppercase"
                  style={{ fontFamily: "'DM Mono', monospace", color: "#3cb4c8" }}
                >
                  BC Studios · Beirut
                </div>
              </div>
              <img src="/bc-studios-logo.png" alt="BC Studios" style={{ height: "52px", objectFit: "contain", opacity: 0.55, flexShrink: 0 }} />
            </div>
            <p
              className="mb-5 leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem", color: "#8a8fa8" }}
            >
              Creative technologist and media innovator. Founder of BC Studios — a Beirut-based studio at the intersection of music, light, AI, and media technology, building immersive sensory environments and tools.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Music", "Light", "AI", "Media Technology"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs tracking-wide"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    color: "#3cb4c8",
                    border: "1px solid rgba(60,180,200,0.25)",
                    background: "rgba(60,180,200,0.06)",
                    borderRadius: "2px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sansara — the outcome */}
        <div
          className="p-8"
          style={{
            background: "linear-gradient(135deg, rgba(124,90,232,0.06) 0%, rgba(139,60,225,0.06) 100%)",
            border: "1px solid rgba(124,90,232,0.2)",
            borderRadius: "4px",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div
                className="text-xs tracking-widest uppercase mb-3"
                style={{ fontFamily: "'DM Mono', monospace", color: "#7c5ae8" }}
              >
                Present
              </div>
              <h3
                className="mb-3"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                  color: "#e8e9f0",
                  fontWeight: 500,
                }}
              >
                Sansara
              </h3>
              <p
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", color: "#8a8fa8", lineHeight: "1.8" }}
              >
                An immersive wellness platform for yoga, movement, breath, music, and light — built on the combined expertise of neuroscience, software engineering, and media technology. Designed to give teachers better tools and students deeper experiences.
              </p>
            </div>
            <div
              className="flex-shrink-0 text-center px-8 py-6"
              style={{
                border: "1px solid rgba(124,90,232,0.15)",
                borderRadius: "4px",
                background: "rgba(124,90,232,0.04)",
              }}
            >
              <div
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "#8a8fa8", marginBottom: "4px" }}
              >
                London · Beirut
              </div>
              <div
                style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#7c5ae8", letterSpacing: "0.12em", textTransform: "uppercase" }}
              >
                International
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

const SERVICES = [
  {
    title: "Neuroscience-Informed Experience Design",
    desc: "Evidence-based frameworks for designing human states through environment, movement, and sensory inputs.",
    icon: "⬡",
  },
  {
    title: "Immersive Wellness Prototyping",
    desc: "Developing and testing new formats — classes, rituals, retreats, and installations that move science into lived experience.",
    icon: "◎",
  },
  {
    title: "Workshops & Education",
    desc: "Accessible, rigorous sessions for teachers, studios, and organisations bridging body science and practice.",
    icon: "▲",
  },
  {
    title: "Panels, Pitch Nights & Innovation Events",
    desc: "Curated gatherings where researchers, practitioners, and investors meet and move ideas forward.",
    icon: "◇",
  },
  {
    title: "Studio & Festival Activations",
    desc: "Multi-sensory experiences designed for stage, studio, festival, and hotel environments.",
    icon: "◈",
  },
  {
    title: "Teacher & Studio Tools",
    desc: "Practical resources and curriculum for yoga teachers and wellness studios to bring nervous-system science into their work.",
    icon: "□",
  },
];

function WhatWeDo() {
  return (
    <section id="what-we-do" className="relative py-32 px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,90,232,0.04) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-6xl mx-auto relative">
        <div className="mb-16">
          <div
            className="text-xs tracking-widest uppercase mb-4"
            style={{ color: "#3cb4c8", fontFamily: "'DM Mono', monospace" }}
          >
            What We Do
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#e8e9f0",
              fontWeight: 500,
            }}
          >
            From research to felt experience.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="p-6 group transition-all duration-300"
              style={{
                background: "#0c0e1a",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.border =
                  "1px solid rgba(107,142,245,0.3)";
                (e.currentTarget as HTMLDivElement).style.background =
                  "#101228";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.border =
                  "1px solid rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLDivElement).style.background =
                  "#0c0e1a";
              }}
            >
              <div
                className="mb-4 text-xl"
                style={{ color: "#6b8ef5", fontFamily: "monospace" }}
              >
                {s.icon}
              </div>
              <h3
                className="mb-3 text-base font-medium"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#e8e9f0",
                }}
              >
                {s.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#8a8fa8",
                }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const AUDIENCES = [
  "Yoga & Movement Teachers",
  "Wellness Studios",
  "Festivals",
  "Hotels & Retreat Spaces",
  "Neuroscientists",
  "Creative Technologists",
  "Investors & Innovation Partners",
];

function WhoItIsFor() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div
              className="text-xs tracking-widest uppercase mb-4"
              style={{ color: "#3cb4c8", fontFamily: "'DM Mono', monospace" }}
            >
              Who It's For
            </div>
            <h2
              className="mb-6 leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#e8e9f0",
                fontWeight: 500,
              }}
            >
              Built for the people at the edge of both worlds.
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.95rem",
                color: "#8a8fa8",
                lineHeight: "1.8",
              }}
            >
              Whether you move bodies, fund ideas, build experiences, or study the brain — this is a space for people who believe science and sensation belong together.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {AUDIENCES.map((a, i) => (
              <div
                key={a}
                className="flex items-center gap-4 px-5 py-4"
                style={{
                  background: "#0c0e1a",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "4px",
                }}
              >
                <div
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{
                    background:
                      i % 3 === 0
                        ? "#3cb4c8"
                        : i % 3 === 1
                        ? "#8b3ce1"
                        : "#7c5ae8",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.9rem",
                    color: "#c8cce0",
                  }}
                >
                  {a}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StateDesign() {
  return (
    <section id="state-design" className="relative py-32 px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(139,60,225,0.07) 0%, transparent 65%)",
        }}
      />
      <div className="max-w-4xl mx-auto relative text-center">
        <div
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: "#3cb4c8", fontFamily: "'DM Mono', monospace" }}
        >
          Featured Concept
        </div>
        <h2
          className="mb-6"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            color: "#e8e9f0",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          State Design
        </h2>
        <div
          className="mx-auto mb-10 px-8 py-8"
          style={{
            maxWidth: "720px",
            background: "#0c0e1a",
            border: "1px solid rgba(107,142,245,0.15)",
            borderRadius: "6px",
          }}
        >
          <p
            className="leading-relaxed mb-6"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1.1rem",
              color: "#c8cce0",
            }}
          >
            <strong style={{ color: "#8b3ce1" }}>State design</strong> is the intentional shaping of rhythm, movement, breath, music, light, and space to support how people feel, focus, connect, and recover.
          </p>
          <p
            className="text-sm"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#8a8fa8",
              lineHeight: "1.8",
            }}
          >
            It does not replace the teacher. It gives teachers better tools.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {["Rhythm", "Movement", "Breath", "Music", "Light", "Space"].map(
            (tag) => (
              <span
                key={tag}
                className="px-4 py-2 text-xs tracking-widest uppercase"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  color: "#6b8ef5",
                  border: "1px solid rgba(107,142,245,0.2)",
                  background: "rgba(107,142,245,0.05)",
                  borderRadius: "2px",
                }}
              >
                {tag}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organisation: "",
    interest: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="relative py-32 px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(124,90,232,0.05) 0%, transparent 60%)",
        }}
      />
      <div className="max-w-6xl mx-auto relative">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Left */}
          <div>
            <div
              className="text-xs tracking-widest uppercase mb-4"
              style={{ color: "#3cb4c8", fontFamily: "'DM Mono', monospace" }}
            >
              Get In Touch
            </div>
            <h2
              className="mb-6 leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#e8e9f0",
                fontWeight: 500,
              }}
            >
              Sansara
            </h2>
            <p
              className="mb-10 leading-relaxed"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.95rem",
                color: "#8a8fa8",
              }}
            >
              For workshops, studio pilots, festival activations, research collaborations, talks, or investment conversations — we'd love to hear from you.
            </p>
            <div className="flex flex-col gap-4">
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{
                    background: "rgba(124,90,232,0.1)",
                    border: "1px solid rgba(124,90,232,0.2)",
                    borderRadius: "4px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c5ae8">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.9rem",
                    color: "#c8cce0",
                  }}
                >
                  Brain Innovation House
                </span>
              </a>
              <a
                href="mailto:hello@braininnovation.club"
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{
                    background: "rgba(60,180,200,0.1)",
                    border: "1px solid rgba(60,180,200,0.2)",
                    borderRadius: "4px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3cb4c8" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.9rem",
                    color: "#c8cce0",
                  }}
                >
                  hello@braininnovation.club
                </span>
              </a>
              <a
                href="https://www.instagram.com/sansara.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{
                    background: "rgba(139,60,225,0.1)",
                    border: "1px solid rgba(139,60,225,0.2)",
                    borderRadius: "4px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b3ce1" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.9rem",
                    color: "#c8cce0",
                  }}
                >
                  @sansara.app
                </span>
              </a>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{
                    background: "rgba(60,180,200,0.1)",
                    border: "1px solid rgba(60,180,200,0.2)",
                    borderRadius: "4px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3cb4c8" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.9rem",
                    color: "#c8cce0",
                  }}
                >
                  Beirut / London / International
                </span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{
                    background: "rgba(167,139,250,0.1)",
                    border: "1px solid rgba(107,142,245,0.2)",
                    borderRadius: "4px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b8ef5" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.9rem",
                    color: "#c8cce0",
                  }}
                >
                  Anastasia Smirnova & Alexandre Khoury
                </span>
              </div>
            </div>
          </div>
          {/* Form */}
          <div
            className="p-8"
            style={{
              background: "#0c0e1a",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "6px",
            }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div
                  className="text-4xl mb-4"
                  style={{ color: "#3cb4c8" }}
                >
                  ◎
                </div>
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.8rem",
                    color: "#e8e9f0",
                  }}
                >
                  Message received.
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.9rem",
                    color: "#8a8fa8",
                  }}
                >
                  We'll be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs tracking-widest uppercase"
                      style={{
                        color: "#8a8fa8",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        background: "#101320",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "3px",
                        color: "#e8e9f0",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(107,142,245,0.4)")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.08)")
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs tracking-widest uppercase"
                      style={{
                        color: "#8a8fa8",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        background: "#101320",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "3px",
                        color: "#e8e9f0",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(107,142,245,0.4)")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.08)")
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs tracking-widest uppercase"
                    style={{
                      color: "#8a8fa8",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    Organisation
                  </label>
                  <input
                    type="text"
                    value={formData.organisation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organisation: e.target.value,
                      })
                    }
                    className="px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      background: "#101320",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "3px",
                      color: "#e8e9f0",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(107,142,245,0.4)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)")
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs tracking-widest uppercase"
                    style={{
                      color: "#8a8fa8",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    I'm interested in
                  </label>
                  <select
                    value={formData.interest}
                    onChange={(e) =>
                      setFormData({ ...formData, interest: e.target.value })
                    }
                    className="px-4 py-3 text-sm outline-none transition-all appearance-none"
                    style={{
                      background: "#101320",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "3px",
                      color: formData.interest ? "#e8e9f0" : "#8a8fa8",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <option value="">Select an option</option>
                    <option value="workshop">Workshop</option>
                    <option value="studio-pilot">Studio Pilot</option>
                    <option value="festival">Festival</option>
                    <option value="research">Research Collaboration</option>
                    <option value="investment">Investment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs tracking-widest uppercase"
                    style={{
                      color: "#8a8fa8",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="px-4 py-3 text-sm outline-none transition-all resize-none"
                    style={{
                      background: "#101320",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "3px",
                      color: "#e8e9f0",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(107,142,245,0.4)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)")
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 py-3.5 text-sm font-medium tracking-wide transition-all"
                  style={{
                    background: "#3cb4c8",
                    color: "#080a12",
                    fontFamily: "'DM Sans', sans-serif",
                    borderRadius: "3px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#52c8de")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#3cb4c8")
                  }
                >
                  Start the Conversation
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="relative py-10 px-6"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/sansara-icon.png" alt="Sansara" style={{ height: "24px", width: "24px", borderRadius: "6px", objectFit: "cover", opacity: 0.7 }} />
          <span style={{ color: "rgba(255,255,255,0.1)" }}>×</span>
          <img src="/bih-logo-transparent.png" alt="Brain Innovation House" style={{ height: "26px", objectFit: "contain", opacity: 0.6 }} />
          <span style={{ color: "rgba(255,255,255,0.1)" }}>×</span>
          <img src="/bc-studios-logo.png" alt="BC Studios" style={{ height: "28px", objectFit: "contain", opacity: 0.4 }} />
        </div>
        <span
          className="text-xs"
          style={{ color: "#8a8fa8", fontFamily: "'DM Sans', sans-serif" }}
        >
          Beirut / London / International · {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}

export default function Index() {
  return (
    <div
      className="relative min-h-screen"
      style={{ background: "#080a12", color: "#e8e9f0" }}
    >
      <NeuralBackground />
      <Nav />
      <Hero />
      <WhatThisIs />
      <WhatWeDo />
      <WhoItIsFor />
      <StateDesign />
      <Contact />
      <Footer />
    </div>
  );
}
