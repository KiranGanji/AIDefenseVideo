import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const TEAMS = [
  { id: "data", label: "Data Team", icon: "🗄️", color: COLORS.blue, agents: ["ETL Agent", "Query Agent", "Pipeline Bot"], x: 240, y: 420 },
  { id: "ml", label: "ML Platform", icon: "🧠", color: COLORS.purple, agents: ["Train Agent", "Deploy Agent", "Monitor Bot"], x: 960, y: 260 },
  { id: "analytics", label: "Analytics Team", icon: "📊", color: COLORS.green, agents: ["Report Agent", "Forecast Bot", "KPI Agent"], x: 1680, y: 420 },
  { id: "product", label: "Product AI", icon: "🚀", color: COLORS.orange, agents: ["Rec Agent", "Search Bot", "NLP Agent"], x: 960, y: 700 },
];

const SiloBox = ({ team, appearDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - appearDelay,
    fps,
    config: { damping: 14, stiffness: 100, mass: 1 },
  });

  const opacity = interpolate(frame, [appearDelay, appearDelay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const boxW = 280;
  const boxH = 220;

  return (
    <div
      style={{
        position: "absolute",
        left: team.x - boxW / 2,
        top: team.y - boxH / 2,
        width: boxW,
        height: boxH,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        borderRadius: 16,
        background: `${team.color}08`,
        border: `1.5px solid ${team.color}40`,
        boxShadow: `0 0 40px ${team.color}15, inset 0 0 30px ${team.color}05`,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${team.color}20`,
            border: `1px solid ${team.color}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          {team.icon}
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: team.color,
              letterSpacing: 0.3,
            }}
          >
            {team.label}
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Isolated Knowledge Silo
          </div>
        </div>
      </div>

      {/* Lock icon - indicating siloed */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          fontSize: 14,
          opacity: 0.5,
        }}
      >
        🔒
      </div>

      {/* Agent list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {team.agents.map((agent) => (
          <div
            key={agent}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ color: team.color, opacity: 0.7 }}>▸</span>
            {agent}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProblemScene = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const headingOpacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headingY = interpolate(localFrame, [0, 20], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // X marks connecting teams (showing lack of communication)
  const xMarkOpacity = interpolate(localFrame, [220, 250], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const painTextOpacity = interpolate(localFrame, [260, 290], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Heading */}
      <div
        style={{
          position: "absolute",
          top: 60,
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
            fontSize: 18,
            fontWeight: 600,
            color: COLORS.orange,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          The Challenge
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 42,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: -1,
          }}
        >
          Siloed AI Teams, Fragmented Knowledge
        </div>
      </div>

      {/* Silo boxes */}
      {TEAMS.map((team, i) => (
        <SiloBox key={team.id} team={team} appearDelay={30 + i * 40} />
      ))}

      {/* Broken connection lines between teams */}
      <svg
        style={{ position: "absolute", inset: 0, opacity: xMarkOpacity, pointerEvents: "none" }}
        width="1920"
        height="1080"
      >
        {/* Crossed-out lines indicating no sharing */}
        {[
          [TEAMS[0].x + 140, TEAMS[0].y, TEAMS[1].x - 140, TEAMS[1].y],
          [TEAMS[1].x + 140, TEAMS[1].y, TEAMS[2].x - 140, TEAMS[2].y],
          [TEAMS[0].x + 140, TEAMS[0].y, TEAMS[3].x - 140, TEAMS[3].y],
          [TEAMS[2].x - 140, TEAMS[2].y, TEAMS[3].x + 140, TEAMS[3].y],
        ].map(([x1, y1, x2, y2], i) => (
          <g key={i} opacity={0.3}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,100,100,0.6)"
              strokeWidth={1.5}
              strokeDasharray="8 6"
            />
            {/* X mark in middle */}
            <text
              x={(x1 + x2) / 2}
              y={(y1 + y2) / 2 + 6}
              textAnchor="middle"
              fill="rgba(255,100,100,0.8)"
              fontSize="18"
            >
              ✕
            </text>
          </g>
        ))}
      </svg>

      {/* Pain points */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 32,
          opacity: painTextOpacity,
        }}
      >
        {[
          { icon: "⚡", text: "Duplicated work across teams" },
          { icon: "🔄", text: "Inconsistent definitions" },
          { icon: "🐢", text: "Slow agent deployment" },
          { icon: "🧩", text: "No shared context" },
        ].map((item) => (
          <div
            key={item.text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              background: "rgba(255,107,53,0.08)",
              border: "1px solid rgba(255,107,53,0.25)",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
