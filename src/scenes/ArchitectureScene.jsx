import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { AnimatedArrow, DataParticle } from "../components/AnimatedArrow";

// Layout: center = semantic layer, data sources top, teams bottom
const CX = 960;
const CY = 540;

const DATA_SOURCES = [
  { id: "dw", label: "Data Warehouse", icon: "🗄️", x: 260, y: 200, color: COLORS.blue },
  { id: "api", label: "APIs & Events", icon: "🌐", x: 560, y: 140, color: COLORS.green },
  { id: "db", label: "Databases", icon: "💾", x: 860, y: 160, color: COLORS.purple },
  { id: "stream", label: "Streams", icon: "⚡", x: 1160, y: 140, color: COLORS.yellow },
  { id: "ml", label: "ML Models", icon: "🧠", x: 1460, y: 200, color: COLORS.orange },
];

const TEAMS = [
  { id: "data", label: "Data Team", icon: "📊", x: 260, y: 860, color: COLORS.blue },
  { id: "product", label: "Product AI", icon: "🚀", x: 560, y: 920, color: COLORS.green },
  { id: "analytics", label: "Analytics", icon: "📈", x: 860, y: 880, color: COLORS.purple },
  { id: "ops", label: "MLOps Team", icon: "⚙️", x: 1160, y: 920, color: COLORS.yellow },
  { id: "biz", label: "Business AI", icon: "💼", x: 1460, y: 860, color: COLORS.orange },
];

const Node = ({ item, delay, size = 52 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });
  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: item.x - size / 2 - 40,
        top: item.y - size / 2 - 30,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        width: size + 80,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 14,
          background: `${item.color}15`,
          border: `1.5px solid ${item.color}50`,
          boxShadow: `0 0 20px ${item.color}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        {item.icon}
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          color: item.color,
          textAlign: "center",
          letterSpacing: 0.3,
        }}
      >
        {item.label}
      </div>
    </div>
  );
};

const SemanticCore = ({ showDelay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - showDelay,
    fps,
    config: { damping: 10, stiffness: 70, mass: 1.5 },
  });

  const pulse = 1 + 0.03 * Math.sin(frame * 0.08 * Math.PI);
  const ringPulse = 1 + 0.06 * Math.sin(frame * 0.06 * Math.PI);
  const opacity = interpolate(frame, [showDelay, showDelay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const W = 320;
  const H = 140;

  return (
    <div
      style={{
        position: "absolute",
        left: CX - W / 2,
        top: CY - H / 2,
        width: W,
        height: H,
        opacity,
        transform: `scale(${scale * pulse})`,
        transformOrigin: "center",
      }}
    >
      {/* Outer ring */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          borderRadius: "50%",
          border: `1px solid rgba(123,79,255,0.25)`,
          transform: `scale(${ringPulse})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -70,
          borderRadius: "50%",
          border: `1px solid rgba(0,212,255,0.12)`,
          transform: `scale(${1 + 0.04 * Math.sin(frame * 0.04 * Math.PI)})`,
        }}
      />

      {/* Core card */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 20,
          background: `linear-gradient(135deg, rgba(123,79,255,0.25) 0%, rgba(0,212,255,0.15) 100%)`,
          border: `2px solid rgba(123,79,255,0.6)`,
          boxShadow: `0 0 60px rgba(123,79,255,0.4), 0 0 120px rgba(123,79,255,0.15), inset 0 1px 0 rgba(255,255,255,0.15)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <div style={{ fontSize: 28 }}>🔮</div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: 0.5,
          }}
        >
          Semantic Layer
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 1,
          }}
        >
          Universal Knowledge Plane
        </div>

        {/* Internal attributes */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 4,
          }}
        >
          {["Metrics", "Entities", "Logic", "Access"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(255,255,255,0.08)",
                fontFamily: "'Inter', sans-serif",
                fontSize: 9,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: 0.5,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ArchitectureScene = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  // Phase timing
  const headingOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sourcesVisible = localFrame > 20;
  const coreVisible = localFrame > 100;
  const teamsVisible = localFrame > 200;
  const arrowsVisible = localFrame > 300;

  const arrowProgress = interpolate(localFrame, [300, 420], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Data particles - multiple particles cycling
  const particleCount = 6;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const t = ((localFrame / 30 + i / particleCount) % 1);
    return { t, sourceIdx: i % DATA_SOURCES.length };
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
        }}
      >
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.purple, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
          Architecture
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, fontWeight: 800, color: "#fff" }}>
          Semantic Layer as the Central Knowledge Hub
        </div>
      </div>

      {/* Data Source Nodes */}
      {sourcesVisible && DATA_SOURCES.map((src, i) => (
        <Node key={src.id} item={src} delay={20 + i * 15} size={52} />
      ))}

      {/* Team Nodes */}
      {teamsVisible && TEAMS.map((team, i) => (
        <Node key={team.id} item={team} delay={200 + i * 15} size={52} />
      ))}

      {/* Arrows: Data Sources → Semantic Layer */}
      {arrowsVisible && DATA_SOURCES.map((src, i) => (
        <AnimatedArrow
          key={`src-${src.id}`}
          x1={src.x} y1={src.y + 26}
          x2={CX} y2={CY - 50}
          progress={interpolate(localFrame, [300 + i * 15, 380 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          color={src.color}
          strokeWidth={1.5}
        />
      ))}

      {/* Arrows: Semantic Layer → Teams */}
      {arrowsVisible && TEAMS.map((team, i) => (
        <AnimatedArrow
          key={`team-${team.id}`}
          x1={CX} y1={CY + 70}
          x2={team.x} y2={team.y - 30}
          progress={interpolate(localFrame, [360 + i * 15, 450 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          color={team.color}
          strokeWidth={1.5}
        />
      ))}

      {/* Semantic Layer Core */}
      {coreVisible && <SemanticCore showDelay={100} />}

      {/* Data particles flowing up to semantic layer */}
      {arrowsVisible && localFrame > 400 && DATA_SOURCES.map((src, i) => {
        const t = ((localFrame / 60 + i * 0.2) % 1);
        if (t > 0.95) return null;
        return (
          <DataParticle
            key={`particle-${src.id}`}
            x1={src.x} y1={src.y}
            x2={CX} y2={CY}
            progress={t}
            color={src.color}
            size={6}
          />
        );
      })}

      {/* Sidebar legend */}
      <div
        style={{
          position: "absolute",
          right: 40,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          opacity: interpolate(localFrame, [380, 420], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {[
          { color: COLORS.blue, label: "Ingest" },
          { color: COLORS.purple, label: "Transform" },
          { color: COLORS.green, label: "Serve" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 2, background: item.color, borderRadius: 2 }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
