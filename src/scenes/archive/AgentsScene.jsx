import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { AnimatedArrow, DataParticle } from "../components/AnimatedArrow";

const AGENTS = [
  {
    id: "query",
    label: "Query Agent",
    icon: "🔍",
    task: "Answers NL questions using unified metrics",
    color: COLORS.blue,
    x: 180, y: 320,
  },
  {
    id: "forecast",
    label: "Forecast Agent",
    icon: "📈",
    task: "Predicts KPIs with consistent business logic",
    color: COLORS.green,
    x: 180, y: 520,
  },
  {
    id: "pipeline",
    label: "Pipeline Agent",
    icon: "🔄",
    task: "Automates ETL using semantic entity graph",
    color: COLORS.purple,
    x: 180, y: 720,
  },
  {
    id: "report",
    label: "Report Agent",
    icon: "📋",
    task: "Generates governed reports on-demand",
    color: COLORS.orange,
    x: 1740, y: 320,
  },
  {
    id: "alert",
    label: "Alert Agent",
    icon: "🚨",
    task: "Monitors anomalies in real-time streams",
    color: COLORS.pink,
    x: 1740, y: 520,
  },
  {
    id: "deploy",
    label: "Deploy Agent",
    icon: "🚀",
    task: "Provisions ML models with semantic context",
    color: COLORS.yellow,
    x: 1740, y: 720,
  },
];

const AgentCard = ({ agent, delay, side = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.9 },
  });
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const W = 290;
  const isProcessing = frame > delay + 80 && Math.sin(frame * 0.15) > 0.3;

  return (
    <div
      style={{
        position: "absolute",
        left: agent.x - W / 2,
        top: agent.y - 55,
        width: W,
        opacity,
        transform: `scale(${scale}) translateX(${interpolate(scale, [0, 1], [side === "left" ? -30 : 30, 0])}px)`,
        transformOrigin: side === "left" ? "left center" : "right center",
      }}
    >
      <div
        style={{
          borderRadius: 14,
          background: `${agent.color}08`,
          border: `1.5px solid ${agent.color}${isProcessing ? "80" : "40"}`,
          boxShadow: isProcessing ? `0 0 30px ${agent.color}30` : "none",
          padding: "14px 16px",
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${agent.color}20`,
              border: `1px solid ${agent.color}50`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            {agent.icon}
          </div>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: agent.color }}>
              {agent.label}
            </div>
            {isProcessing && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green, boxShadow: `0 0 6px ${COLORS.green}` }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: COLORS.green }}>Active</span>
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.5,
          }}
        >
          {agent.task}
        </div>

        {/* Activity bar */}
        {isProcessing && (
          <div
            style={{
              marginTop: 8,
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${60 + 30 * Math.sin(frame * 0.2)}%`,
                background: `linear-gradient(90deg, ${agent.color}, ${agent.color}60)`,
                borderRadius: 2,
                transition: "width 0.1s",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const SemanticCore = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.025 * Math.sin(frame * 0.08 * Math.PI);
  const W = 280;
  const H = 320;
  const CX = 960;
  const CY = 540;

  return (
    <div
      style={{
        position: "absolute",
        left: CX - W / 2,
        top: CY - H / 2,
        width: W,
        height: H,
        transform: `scale(${pulse})`,
        transformOrigin: "center",
      }}
    >
      {/* Outer rings */}
      {[200, 170, 140].map((r, i) => (
        <div
          key={r}
          style={{
            position: "absolute",
            left: W / 2 - r,
            top: H / 2 - r,
            width: r * 2,
            height: r * 2,
            borderRadius: "50%",
            border: `1px solid rgba(123,79,255,${0.08 + i * 0.06})`,
          }}
        />
      ))}

      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 20,
          background: `linear-gradient(135deg, rgba(123,79,255,0.2) 0%, rgba(0,212,255,0.12) 100%)`,
          border: `2px solid rgba(123,79,255,0.55)`,
          boxShadow: `0 0 80px rgba(123,79,255,0.35), 0 0 140px rgba(123,79,255,0.12)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: 20,
        }}
      >
        <div style={{ fontSize: 32 }}>🔮</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>
          Semantic Layer
        </div>

        {/* Internal stat-like rows */}
        {[
          { label: "Metrics defined", value: "1,240" },
          { label: "Entities mapped", value: "342" },
          { label: "Agents connected", value: "6" },
        ].map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              padding: "6px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              {row.label}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.green, fontWeight: 600 }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AgentsScene = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const CX = 960;
  const CY = 540;

  const headingOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const arrowProgress = interpolate(localFrame, [120, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.blue, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
          Agent Integration
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, fontWeight: 800, color: "#fff" }}>
          AI Agents Powered by Shared Semantic Context
        </div>
      </div>

      {/* Semantic core */}
      <SemanticCore />

      {/* Left agents */}
      {AGENTS.filter((a) => a.x < 500).map((agent, i) => (
        <AgentCard key={agent.id} agent={agent} delay={20 + i * 30} side="left" />
      ))}

      {/* Right agents */}
      {AGENTS.filter((a) => a.x > 500).map((agent, i) => (
        <AgentCard key={agent.id} agent={agent} delay={20 + i * 30} side="right" />
      ))}

      {/* Connection arrows */}
      {localFrame > 100 && AGENTS.map((agent, i) => {
        const fromLeft = agent.x < 500;
        const ax = fromLeft ? agent.x + 145 : agent.x - 145;
        const ay = agent.y;
        const bx = fromLeft ? CX - 140 : CX + 140;
        const by = CY + (ay - CY) * 0.3;
        return (
          <AnimatedArrow
            key={agent.id}
            x1={ax} y1={ay}
            x2={bx} y2={by}
            progress={interpolate(localFrame, [100 + i * 20, 180 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            color={agent.color}
            bidirectional={true}
            strokeWidth={1.5}
          />
        );
      })}

      {/* Data particles */}
      {localFrame > 200 && AGENTS.map((agent, i) => {
        const t = ((localFrame / 80 + i * 0.18) % 1);
        if (t > 0.95) return null;
        const fromLeft = agent.x < 500;
        const ax = fromLeft ? agent.x + 145 : agent.x - 145;
        const bx = fromLeft ? CX - 140 : CX + 140;
        return (
          <DataParticle
            key={`p-${agent.id}`}
            x1={ax} y1={agent.y}
            x2={bx} y2={CY + (agent.y - CY) * 0.3}
            progress={t}
            color={agent.color}
            size={5}
          />
        );
      })}
    </div>
  );
};
