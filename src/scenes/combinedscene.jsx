import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const interp = (frame, input, output) =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const RADAR_PEERS = [
  [0.12, 0.74], [0.16, 0.66], [0.20, 0.71], [0.24, 0.62],
  [0.29, 0.68], [0.33, 0.60], [0.38, 0.65], [0.42, 0.58],
  [0.48, 0.63], [0.54, 0.57], [0.58, 0.66], [0.63, 0.61],
  [0.67, 0.70], [0.72, 0.64], [0.77, 0.69], [0.82, 0.60],
  [0.18, 0.52], [0.26, 0.55], [0.34, 0.49], [0.44, 0.52],
  [0.56, 0.48], [0.66, 0.53], [0.76, 0.50], [0.84, 0.55],
];

const RADAR_OUTLIERS = [
  { start: [0.24, 0.64], end: [0.24, 0.18] },
  { start: [0.35, 0.61], end: [0.35, 0.13] },
  { start: [0.46, 0.62], end: [0.46, 0.20] },
  { start: [0.58, 0.60], end: [0.58, 0.10] },
  { start: [0.70, 0.58], end: [0.70, 0.16] },
];

const SIM_ROWS = [
  { label: "Lab A", rate: 89 },
  { label: "Lab B", rate: 83 },
  { label: "Lab C", rate: 76 },
  { label: "Lab D", rate: 71 },
  { label: "Lab E", rate: 65 },
];

const RETRO_RULES = [
  "Eligible primary",
  "Same provider",
  "Same date",
];

const RETRO_ROWS = [
  { id: "CLM-4821", primary: "Denied", addon: "Paid" },
  { id: "CLM-4956", primary: "Denied", addon: "Paid" },
  { id: "CLM-5102", primary: "Denied", addon: "Paid" },
  { id: "CLM-5287", primary: "Denied", addon: "Paid" },
];

const GRAPH_NODES = [
  { x: 0.50, y: 0.52, r: 18, type: "hub", risk: false },
  { x: 0.24, y: 0.24, r: 12, type: "provider", risk: true },
  { x: 0.35, y: 0.18, r: 10, type: "cpt", risk: true },
  { x: 0.72, y: 0.22, r: 12, type: "provider", risk: false },
  { x: 0.80, y: 0.38, r: 10, type: "vendor", risk: false },
  { x: 0.74, y: 0.68, r: 11, type: "provider", risk: true },
  { x: 0.55, y: 0.80, r: 10, type: "cpt", risk: false },
  { x: 0.28, y: 0.74, r: 10, type: "vendor", risk: false },
  { x: 0.16, y: 0.50, r: 11, type: "provider", risk: false },
  { x: 0.62, y: 0.36, r: 10, type: "cpt", risk: true },
];

const GRAPH_EDGES = [
  [0, 1], [0, 3], [0, 5], [0, 7], [0, 8], [0, 9],
  [1, 2], [2, 9], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
];

const PANEL_THEMES = {
  radar: {
    accent: COLORS.green,
    surface: "linear-gradient(160deg, #F4FFE7 0%, #E7F7CB 58%, #D9EEB5 100%)",
    shadow: "rgba(74, 143, 42, 0.18)",
  },
  simulator: {
    accent: COLORS.amber,
    surface: "linear-gradient(160deg, #FFF4D8 0%, #FFEAB7 58%, #FDDD93 100%)",
    shadow: "rgba(217, 119, 6, 0.18)",
  },
  retro: {
    accent: COLORS.purple,
    surface: "linear-gradient(160deg, #F5F0FF 0%, #E9DFFF 58%, #D9CBFF 100%)",
    shadow: "rgba(91, 79, 207, 0.18)",
  },
  graph: {
    accent: COLORS.teal,
    surface: "linear-gradient(160deg, #E8FFF7 0%, #D4F8EB 58%, #BDEFD9 100%)",
    shadow: "rgba(13, 148, 112, 0.18)",
  },
};

const panelShell = ({ accent, surface, shadow }) => ({
  position: "absolute",
  borderRadius: 28,
  border: `2px solid ${accent}44`,
  background: surface,
  boxShadow: `0 24px 60px rgba(15, 23, 42, 0.10), 0 10px 28px ${shadow}, inset 0 1px 0 rgba(255,255,255,0.55)`,
  overflow: "hidden",
});

const chipStyle = (surface) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  borderRadius: 999,
  background: surface,
  fontSize: 14,
  fontWeight: 700,
});

const nodeColor = (type) => {
  if (type === "hub") return COLORS.blueDark;
  if (type === "provider") return COLORS.blue;
  if (type === "cpt") return COLORS.amber;
  return COLORS.teal;
};

export const CombinedScene = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  const titleOpacity = interp(localFrame, [0, 18], [0, 1]);
  const titleY = interp(localFrame, [0, 24], [22, 0]);
  const subtitleOpacity = interp(localFrame, [12, 36], [0, 1]);
  const footerOpacity = interp(localFrame, [220, 260], [0, 1]);
  const footerY = interp(localFrame, [220, 260], [16, 0]);

  const getPanelMotion = (index) => {
    const panelFrame = localFrame - (18 + index * 16);
    const entry = clamp(
      spring({
        frame: panelFrame,
        fps,
        config: { damping: 16, stiffness: 170, mass: 0.8 },
      }),
      0,
      1,
    );

    return {
      opacity: interp(panelFrame, [0, 18], [0, 1]),
      translateY: interp(panelFrame, [0, 18], [42, 0]),
      scale: 0.96 + entry * 0.04,
    };
  };

  const radarPeerCount = Math.floor(interp(localFrame, [28, 88], [0, RADAR_PEERS.length]));
  const radarOutlierProgress = clamp(
    spring({
      frame: localFrame - 78,
      fps,
      config: { damping: 14, stiffness: 90, mass: 0.85 },
    }),
    0,
    1,
  );
  const radarCalloutOpacity = interp(localFrame, [96, 124], [0, 1]);

  const simBars = SIM_ROWS.map((row, index) => {
    const progress = clamp(
      spring({
        frame: localFrame - (52 + index * 8),
        fps,
        config: { damping: 13, stiffness: 150, mass: 0.72 },
      }),
      0,
      1,
    );

    return {
      ...row,
      width: progress * row.rate,
      opacity: interp(localFrame, [44 + index * 8, 60 + index * 8], [0, 1]),
    };
  });

  const retroRuleOpacity = (index) =>
    interp(localFrame, [44 + index * 10, 62 + index * 10], [0, 1]);
  const retroRowOpacity = (index) =>
    interp(localFrame, [84 + index * 10, 102 + index * 10], [0, 1]);
  const retroRowX = (index) =>
    interp(localFrame, [84 + index * 10, 102 + index * 10], [24, 0]);

  const graphProgress = interp(localFrame, [54, 130], [0, 1]);
  const riskPulse = 0.45 + 0.55 * Math.sin(localFrame * 0.12);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#F5F8FC", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at top right, rgba(55,138,221,0.14), transparent 34%), radial-gradient(circle at bottom left, rgba(13,148,112,0.12), transparent 32%)",
        }}
      />

      <svg style={{ position: "absolute", inset: 0, opacity: 0.05 }} width="1920" height="1080">
        <defs>
          <pattern id="combined-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <circle cx="22" cy="22" r="1.5" fill={COLORS.blueDark} />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#combined-grid)" />
      </svg>

      <div style={{ position: "absolute", top: 40, left: 60, opacity: titleOpacity }}>
        <div
          style={{
            ...chipStyle(COLORS.blueLight),
            color: COLORS.blueDark,
            border: `1.5px solid ${COLORS.blueDark}22`,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.blueDark }} />
          Signal Matrix
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 36,
          left: "50%",
          transform: `translateX(-50%) translateY(${titleY}px)`,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 900, color: COLORS.textDark, letterSpacing: -0.7 }}>
          Four initiatives. One coordinated defense layer.
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 18,
            color: "rgba(0,0,0,0.55)",
            opacity: subtitleOpacity,
          }}
        >
          A fast matrix view of the signal agents working in parallel.
        </div>
      </div>

      <div style={{ position: "absolute", left: 60, top: 170, width: 1800, height: 760 }}>
        {(() => {
          const motion = getPanelMotion(0);
          return (
            <div
              style={{
                ...panelShell(PANEL_THEMES.radar),
                left: 0,
                top: 0,
                width: 886,
                height: 366,
                opacity: motion.opacity,
                transform: `translateY(${motion.translateY}px) scale(${motion.scale})`,
              }}
            >
              <div style={{ position: "absolute", inset: 0, padding: "28px 30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.textDark }}>Impact Radar</div>
                    <div style={{ marginTop: 6, fontSize: 16, color: "rgba(0,0,0,0.58)" }}>
                      Peer benchmarking reveals provider outliers early.
                    </div>
                  </div>
                  <div style={{ ...chipStyle("#FFFFFF"), color: COLORS.green, border: `1px solid ${COLORS.green}22` }}>
                    9 entities flagged
                  </div>
                </div>

                <div style={{ position: "absolute", left: 30, right: 30, top: 104, bottom: 28, display: "flex", gap: 24 }}>
                  <div style={{ flex: 1.15, position: "relative", borderRadius: 24, background: "rgba(255,255,255,0.88)", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <svg width="100%" height="100%" viewBox="0 0 460 220">
                      {[50, 105, 160].map((y) => (
                        <line
                          key={y}
                          x1="32"
                          y1={y}
                          x2="432"
                          y2={y}
                          stroke="rgba(0,0,0,0.12)"
                          strokeWidth="1.2"
                          strokeDasharray="4 4"
                        />
                      ))}

                      {RADAR_PEERS.slice(0, radarPeerCount).map(([x, y], index) => (
                        <circle
                          key={index}
                          cx={32 + x * 400}
                          cy={18 + y * 170}
                          r="5.5"
                          fill="rgba(0,0,0,0.14)"
                        />
                      ))}

                      {RADAR_OUTLIERS.map((dot, index) => {
                        const x = dot.start[0] + (dot.end[0] - dot.start[0]) * radarOutlierProgress;
                        const y = dot.start[1] + (dot.end[1] - dot.start[1]) * radarOutlierProgress;
                        const cx = 32 + x * 400;
                        const cy = 18 + y * 170;
                        return (
                          <g key={index} opacity={radarCalloutOpacity}>
                            <circle cx={cx} cy={cy} r="12" fill={COLORS.red} opacity="0.16" />
                            <circle cx={cx} cy={cy} r="7.5" fill={COLORS.red} />
                          </g>
                        );
                      })}
                    </svg>
                    <div style={{ position: "absolute", left: 24, bottom: 16, fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.46)", letterSpacing: 1.3, textTransform: "uppercase" }}>
                      ER to inpatient conversion
                    </div>
                  </div>

                  <div style={{ width: 250, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ padding: "18px 20px", borderRadius: 22, background: COLORS.redLight, border: `1.5px solid ${COLORS.red}22`, opacity: radarCalloutOpacity }}>
                      <div style={{ fontSize: 42, fontWeight: 900, color: COLORS.red, letterSpacing: -1 }}>3.5x - 6x</div>
                      <div style={{ marginTop: 6, fontSize: 15, color: "rgba(0,0,0,0.55)", lineHeight: 1.45 }}>
                        Above peer conversion behavior.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {(() => {
          const motion = getPanelMotion(1);
          return (
            <div
              style={{
                ...panelShell(PANEL_THEMES.simulator),
                left: 914,
                top: 0,
                width: 886,
                height: 366,
                opacity: motion.opacity,
                transform: `translateY(${motion.translateY}px) scale(${motion.scale})`,
              }}
            >
              <div style={{ position: "absolute", inset: 0, padding: "28px 30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.textDark }}>Adversarial Claim Simulator</div>
                    <div style={{ marginTop: 6, fontSize: 16, color: "rgba(0,0,0,0.58)" }}>
                      Modifier patterns are simulated before they scale.
                    </div>
                  </div>
                  <div style={{ ...chipStyle("#FFFFFF"), color: COLORS.amber, border: `1px solid ${COLORS.amber}22` }}>
                    Peer median &lt;5%
                  </div>
                </div>

                <div style={{ position: "absolute", left: 30, right: 30, top: 110, bottom: 28, display: "flex", gap: 24 }}>
                  <div style={{ flex: 1.1, display: "flex", flexDirection: "column", gap: 18 }}>
                    {simBars.map((row) => (
                      <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 14, opacity: row.opacity }}>
                        <div style={{ width: 62, fontSize: 15, fontWeight: 700, color: COLORS.textDark }}>{row.label}</div>
                        <div style={{ flex: 1, position: "relative", height: 26, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ position: "absolute", left: "5%", top: -2, bottom: -2, width: 2, background: COLORS.green, opacity: 0.85 }} />
                          <div style={{ width: `${row.width}%`, height: "100%", borderRadius: 999, background: COLORS.red, boxShadow: `0 8px 22px ${COLORS.red}33` }} />
                        </div>
                        <div style={{ width: 50, textAlign: "right", fontSize: 20, fontWeight: 900, color: COLORS.red }}>{row.rate}%</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ width: 260, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ padding: "18px 20px", borderRadius: 22, background: COLORS.redLight, border: `1.5px solid ${COLORS.red}22` }}>
                      <div style={{ fontSize: 42, fontWeight: 900, color: COLORS.red, letterSpacing: -1 }}>99th %ile</div>
                      <div style={{ marginTop: 6, fontSize: 15, color: "rgba(0,0,0,0.55)", lineHeight: 1.45 }}>
                        Five labs cluster in the highest risk band.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {(() => {
          const motion = getPanelMotion(2);
          return (
            <div
              style={{
                ...panelShell(PANEL_THEMES.retro),
                left: 0,
                top: 394,
                width: 886,
                height: 366,
                opacity: motion.opacity,
                transform: `translateY(${motion.translateY}px) scale(${motion.scale})`,
              }}
            >
              <div style={{ position: "absolute", inset: 0, padding: "28px 30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.textDark }}>Retro AI Editing</div>
                    <div style={{ marginTop: 6, fontSize: 16, color: "rgba(0,0,0,0.58)" }}>
                      Policy rules become machine-executable payment checks.
                    </div>
                  </div>
                  <div style={{ ...chipStyle("#FFFFFF"), color: COLORS.purple, border: `1px solid ${COLORS.purple}22` }}>
                    Add-on code leakage
                  </div>
                </div>

                <div style={{ position: "absolute", left: 30, right: 30, top: 110, bottom: 28, display: "flex", gap: 22 }}>
                  <div style={{ width: 268, display: "flex", flexDirection: "column", gap: 12 }}>
                    {RETRO_RULES.map((rule, index) => (
                      <div
                        key={rule}
                        style={{
                          opacity: retroRuleOpacity(index),
                          transform: `translateY(${interp(localFrame, [44 + index * 10, 62 + index * 10], [16, 0])}px)`,
                          padding: "14px 16px",
                          borderRadius: 18,
                          background: "#FFFFFF",
                          border: `1px solid ${COLORS.purple}22`,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: COLORS.purpleLight, border: `1px solid ${COLORS.purple}33`, color: COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 }}>
                          {index + 1}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.textDark }}>{rule}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 10, padding: "0 6px", fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.42)", letterSpacing: 1.3, textTransform: "uppercase" }}>
                      <div>Claim</div>
                      <div style={{ textAlign: "center" }}>99291</div>
                      <div style={{ textAlign: "center" }}>99292</div>
                    </div>

                    {RETRO_ROWS.map((row, index) => (
                      <div
                        key={row.id}
                        style={{
                          opacity: retroRowOpacity(index),
                          transform: `translateX(${retroRowX(index)}px)`,
                          display: "grid",
                          gridTemplateColumns: "1.2fr 1fr 1fr",
                          gap: 10,
                          alignItems: "center",
                          padding: "14px 16px",
                          borderRadius: 18,
                          background: "#FFFFFF",
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <div style={{ fontFamily: "monospace", fontSize: 14, color: "rgba(0,0,0,0.58)" }}>{row.id}</div>
                        <div style={{ justifySelf: "center", padding: "6px 12px", borderRadius: 999, background: COLORS.redLight, color: COLORS.red, fontSize: 13, fontWeight: 800 }}>
                          {row.primary}
                        </div>
                        <div style={{ justifySelf: "center", padding: "6px 12px", borderRadius: 999, background: COLORS.purpleLight, color: COLORS.purple, fontSize: 13, fontWeight: 800 }}>
                          {row.addon}
                        </div>
                      </div>
                    ))}

                    <div style={{ display: "flex", gap: 14, marginTop: "auto" }}>
                      <div style={{ flex: 1, padding: "14px 16px", borderRadius: 18, background: COLORS.purpleLight }}>
                        <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.purple, letterSpacing: -0.7 }}>344</div>
                        <div style={{ fontSize: 14, color: "rgba(0,0,0,0.56)" }}>claim lines flagged</div>
                      </div>
                      <div style={{ flex: 1, padding: "14px 16px", borderRadius: 18, background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
                        <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.purple, letterSpacing: -0.7 }}>$2.0M</div>
                        <div style={{ fontSize: 14, color: "rgba(0,0,0,0.56)" }}>payment drift exposure</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {(() => {
          const motion = getPanelMotion(3);
          return (
            <div
              style={{
                ...panelShell(PANEL_THEMES.graph),
                left: 914,
                top: 394,
                width: 886,
                height: 366,
                opacity: motion.opacity,
                transform: `translateY(${motion.translateY}px) scale(${motion.scale})`,
              }}
            >
              <div style={{ position: "absolute", inset: 0, padding: "28px 30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.textDark }}>Third Party Graph</div>
                    <div style={{ marginTop: 6, fontSize: 16, color: "rgba(0,0,0,0.58)" }}>
                      Connected intelligence surfaces hidden provider and vendor patterns.
                    </div>
                  </div>
                  <div style={{ ...chipStyle("#FFFFFF"), color: COLORS.teal, border: `1px solid ${COLORS.teal}22` }}>
                    Emerging risk links
                  </div>
                </div>

                <div style={{ position: "absolute", left: 30, right: 30, top: 106, bottom: 28, display: "flex", gap: 22 }}>
                  <div style={{ flex: 1, position: "relative", borderRadius: 24, background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <svg width="100%" height="100%" viewBox="0 0 460 220">
                      {GRAPH_EDGES.map(([fromIndex, toIndex], index) => {
                        const edgeProgress = clamp(graphProgress * GRAPH_EDGES.length - index * 0.75, 0, 1);
                        const from = GRAPH_NODES[fromIndex];
                        const to = GRAPH_NODES[toIndex];
                        const x1 = from.x * 420 + 20;
                        const y1 = from.y * 184 + 18;
                        const x2 = x1 + (to.x * 420 + 20 - x1) * edgeProgress;
                        const y2 = y1 + (to.y * 184 + 18 - y1) * edgeProgress;
                        return (
                          <line
                            key={index}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={to.risk || from.risk ? COLORS.amber : COLORS.blueDark}
                            strokeWidth={to.risk || from.risk ? 2.2 : 1.4}
                            opacity={to.risk || from.risk ? 0.52 : 0.24}
                            strokeLinecap="round"
                          />
                        );
                      })}

                      {GRAPH_NODES.map((node, index) => {
                        const nodeProgress = clamp(graphProgress * GRAPH_NODES.length - index * 0.8, 0, 1);
                        const scale = 0.4 + nodeProgress * 0.6;
                        const radius = node.r * scale;
                        const x = node.x * 420 + 20;
                        const y = node.y * 184 + 18;
                        const pulse = node.risk ? 0.2 + 0.24 * riskPulse : 0;
                        return (
                          <g key={index}>
                            {node.risk && nodeProgress > 0 && (
                              <circle cx={x} cy={y} r={radius + 10 + riskPulse * 8} fill={COLORS.amber} opacity={pulse} />
                            )}
                            <circle cx={x} cy={y} r={radius} fill={nodeColor(node.type)} opacity="0.94" />
                          </g>
                        );
                      })}
                    </svg>
                    <div style={{ position: "absolute", left: 24, bottom: 16, fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.46)", letterSpacing: 1.3, textTransform: "uppercase" }}>
                      Claims, providers, RCM, and FWA signals
                    </div>
                  </div>

                  <div style={{ width: 250, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ padding: "18px 20px", borderRadius: 22, background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.42)", letterSpacing: 1.5, textTransform: "uppercase" }}>
                        Graph outputs
                      </div>
                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                        {["Provider risk profiles", "CPT-provider links", "Vendor pattern clusters"].map((item, index) => (
                          <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, opacity: interp(localFrame, [88 + index * 10, 108 + index * 10], [0, 1]) }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: index === 1 ? COLORS.amber : COLORS.teal }} />
                            <div style={{ fontSize: 15, color: COLORS.textDark }}>{item}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: "18px 20px", borderRadius: 22, background: COLORS.tealLight, border: `1px solid ${COLORS.teal}22` }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.teal, letterSpacing: -0.8 }}>Hidden relationships</div>
                      <div style={{ marginTop: 6, fontSize: 15, color: "rgba(0,0,0,0.56)", lineHeight: 1.45 }}>
                        Signals consolidate into actionable network risk.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 48,
          transform: `translateX(-50%) translateY(${footerY}px)`,
          opacity: footerOpacity,
          padding: "18px 28px",
          borderRadius: 999,
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 16px 34px rgba(15, 23, 42, 0.08)",
          fontSize: 20,
          fontWeight: 700,
          color: COLORS.textDark,
          letterSpacing: -0.2,
        }}
      >
        Detect earlier. Reason deeper. Act faster.
      </div>
    </div>
  );
};
