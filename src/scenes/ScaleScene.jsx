import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const DEPLOY_WAVES = [
  { agents: ["ETL Agent", "Query Bot", "Forecast AI"], team: "Data Team", color: COLORS.blue, delay: 40 },
  { agents: ["Rec Engine", "Search AI", "NLP Bot"], team: "Product AI", color: COLORS.green, delay: 120 },
  { agents: ["KPI Monitor", "Report Gen", "Dash Bot"], team: "Analytics", color: COLORS.purple, delay: 200 },
  { agents: ["Train Agent", "Eval Bot", "Deploy AI"], team: "MLOps", color: COLORS.orange, delay: 280 },
];

const DeployCard = ({ wave, localFrame }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const scale = spring({
    frame: frame - wave.delay,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });
  const opacity = interpolate(frame, [wave.delay, wave.delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const deployedCount = Math.min(
    3,
    Math.floor(interpolate(localFrame, [wave.delay + 40, wave.delay + 120], [0, 3], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }))
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        borderRadius: 16,
        background: `${wave.color}08`,
        border: `1.5px solid ${wave.color}40`,
        padding: "20px 24px",
        width: 340,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: wave.color,
            boxShadow: `0 0 10px ${wave.color}`,
          }}
        />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: wave.color }}>
          {wave.team}
        </div>
        <div
          style={{
            marginLeft: "auto",
            padding: "2px 10px",
            borderRadius: 20,
            background: "rgba(0,255,148,0.1)",
            border: "1px solid rgba(0,255,148,0.3)",
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            color: COLORS.green,
          }}
        >
          {deployedCount}/3 deployed
        </div>
      </div>

      {wave.agents.map((agent, i) => {
        const isDeployed = i < deployedCount;
        return (
          <div
            key={agent}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background: isDeployed ? `${wave.color}10` : "rgba(255,255,255,0.03)",
              border: `1px solid ${isDeployed ? `${wave.color}40` : "rgba(255,255,255,0.07)"}`,
              marginBottom: i < 2 ? 8 : 0,
            }}
          >
            <span style={{ fontSize: 14 }}>{isDeployed ? "✅" : "⏳"}</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: isDeployed ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)",
              }}
            >
              {agent}
            </span>
            {isDeployed && (
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: COLORS.green,
                }}
              >
                v1.0 ↑
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const MetricCounter = ({ value, label, color, delay }) => {
  const frame = useCurrentFrame();
  const animatedValue = Math.floor(
    interpolate(frame, [delay, delay + 90], [0, value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        textAlign: "center",
        padding: "24px 32px",
        borderRadius: 16,
        background: `${color}08`,
        border: `1px solid ${color}30`,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 48,
          fontWeight: 800,
          color,
          letterSpacing: -1,
          lineHeight: 1,
        }}
      >
        {animatedValue.toLocaleString()}
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
          marginTop: 8,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const ScaleScene = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const headingOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const metricsOpacity = interpolate(localFrame, [320, 360], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.green, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
          Deployment at Scale
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, fontWeight: 800, color: "#fff" }}>
          Deploy Agents Across Every Team, Instantly
        </div>
      </div>

      {/* Deploy cards grid */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 28,
          flexWrap: "wrap",
          padding: "0 60px",
        }}
      >
        {DEPLOY_WAVES.map((wave) => (
          <DeployCard key={wave.team} wave={wave} localFrame={localFrame} />
        ))}
      </div>

      {/* Metrics bar */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 32,
          opacity: metricsOpacity,
        }}
      >
        <MetricCounter value={12} label="Teams Enabled" color={COLORS.blue} delay={320} />
        <MetricCounter value={48} label="Agents Deployed" color={COLORS.green} delay={340} />
        <MetricCounter value={1240} label="Shared Metrics" color={COLORS.purple} delay={360} />
        <MetricCounter value={98} label="% Consistency" color={COLORS.orange} delay={380} />
      </div>
    </div>
  );
};
