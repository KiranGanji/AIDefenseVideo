import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const BENEFITS = [
  {
    icon: "🔗",
    title: "Unified Data Contract",
    desc: "Every agent shares the same metrics, entities, and business logic — no more definitions drift.",
    color: COLORS.blue,
  },
  {
    icon: "⚡",
    title: "10x Faster Deployment",
    desc: "Agents are pre-wired to the semantic layer. New agents inherit all existing knowledge instantly.",
    color: COLORS.green,
  },
  {
    icon: "🛡️",
    title: "Governed at Scale",
    desc: "Role-based access, versioning, and audit trails built into the semantic layer — not bolted on.",
    color: COLORS.purple,
  },
  {
    icon: "🧩",
    title: "Composable Agent Workflows",
    desc: "Agents from different teams collaborate using shared semantic context as common ground.",
    color: COLORS.orange,
  },
  {
    icon: "📊",
    title: "Consistent Insights",
    desc: "Revenue means the same to the Data Team, Product AI, and the CEO's dashboard — always.",
    color: COLORS.pink,
  },
  {
    icon: "🚀",
    title: "Infinitely Scalable",
    desc: "Add new teams, data sources, or agents without rebuilding shared understanding from scratch.",
    color: COLORS.yellow,
  },
];

const BenefitCard = ({ benefit, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.8 },
  });
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        borderRadius: 16,
        background: `${benefit.color}06`,
        border: `1.5px solid ${benefit.color}30`,
        padding: "20px 22px",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${benefit.color}15`,
          border: `1px solid ${benefit.color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {benefit.icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: benefit.color,
            marginBottom: 4,
          }}
        >
          {benefit.title}
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.5,
          }}
        >
          {benefit.desc}
        </div>
      </div>
    </div>
  );
};

export const SummaryScene = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const { fps } = useVideoConfig();

  const headingOpacity = interpolate(localFrame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headingY = interpolate(localFrame, [0, 25], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ctaOpacity = interpolate(localFrame, [240, 270], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaScale = spring({
    frame: localFrame - 240,
    fps,
    config: { damping: 12, stiffness: 90, mass: 1 },
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Heading */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            color: COLORS.purple,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Key Benefits
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 38,
            fontWeight: 800,
            color: "#fff",
          }}
        >
          Why the Semantic Layer Changes Everything
        </div>
      </div>

      {/* Benefits grid */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 60,
          right: 60,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
        }}
      >
        {BENEFITS.map((benefit, i) => (
          <BenefitCard key={benefit.title} benefit={benefit} delay={20 + i * 25} />
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 55,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
        }}
      >
        <div
          style={{
            padding: "18px 48px",
            borderRadius: 100,
            background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.purple})`,
            boxShadow: `0 0 40px rgba(123,79,255,0.5)`,
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: 0.5,
          }}
        >
          🔮 Build Your AI Semantic Layer Today
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: 0.5,
          }}
        >
          One layer. All agents. Infinite scale.
        </div>
      </div>
    </div>
  );
};
