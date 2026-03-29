import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interp = (f, i, o) =>
  interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ─── Data source icons ───────────────────────────────────────────────────────
// Initial scattered positions on 1920×1080 canvas, hub at (790, 510)
const HUB_X = 790, HUB_Y = 510;

const DATA_SOURCES = [
  { id: "claims",   label: "Claims Analytics",       ix: 220,  iy: 310 },
  { id: "provider", label: "Provider Data",           ix: 1480, iy: 210 },
  { id: "rcm",      label: "RCM External Data",       ix: 1600, iy: 540 },
  { id: "fwa",      label: "FWA Proceedings",         ix: 260,  iy: 820 },
  { id: "pe",       label: "Private Equity Funding",  ix: 920,  iy: 900 },
];

// SVG icon shapes (flat, navy + orange)
const ICONS = {
  claims: (c) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <rect x="4"  y="26" width="10" height="14" rx="2" fill={c} />
      <rect x="17" y="16" width="10" height="24" rx="2" fill={c} />
      <rect x="30" y="8"  width="10" height="32" rx="2" fill={c} />
      <line x1="4" y1="42" x2="40" y2="42" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  provider: (c) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="13" r="8" fill={c} />
      <path d="M6 42 C6 28 38 28 38 42 Z" fill={c} />
      <line x1="18" y1="22" x2="26" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  rcm: (c) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="17" fill="none" stroke={c} strokeWidth="3" />
      <ellipse cx="22" cy="22" rx="7" ry="17" fill="none" stroke={c} strokeWidth="2.2" />
      <line x1="5"  y1="22" x2="39" y2="22" stroke={c} strokeWidth="2" />
      <line x1="7"  y1="13" x2="37" y2="13" stroke={c} strokeWidth="1.5" />
      <line x1="7"  y1="31" x2="37" y2="31" stroke={c} strokeWidth="1.5" />
    </svg>
  ),
  fwa: (c) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <line x1="22" y1="4"  x2="22" y2="40" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <line x1="8"  y1="13" x2="36" y2="13" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 13 L5 24 Q8 29 11 24 L8 13"  fill={c} opacity={0.85} />
      <path d="M36 13 L33 24 Q36 29 39 24 L36 13" fill={c} opacity={0.85} />
      <rect x="14" y="38" width="16" height="4" rx="2" fill={c} />
    </svg>
  ),
  pe: (c) => (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="18" fill="none" stroke={c} strokeWidth="3" />
      <text x="22" y="30" textAnchor="middle" fontFamily="'Inter',sans-serif"
        fontSize="22" fontWeight="900" fill={c}>$</text>
    </svg>
  ),
};

// ─── Graph network nodes ──────────────────────────────────────────────────────
// Offsets from hub center (HUB_X, HUB_Y)
const NODE_DEFS = [
  // providers (navy)
  { id: "p1", dx: -200, dy: -110, type: "provider", r: 16 },
  { id: "p2", dx: -250, dy:  70,  type: "provider", r: 16 },
  { id: "p3", dx: -140, dy:  195, type: "provider", r: 17 },
  { id: "p4", dx:  55,  dy: -205, type: "provider", r: 14 },
  { id: "p5", dx:  210, dy: -155, type: "provider", r: 16 },
  { id: "p6", dx: -295, dy:  -20, type: "provider", r: 14 },
  { id: "p7", dx:  30,  dy:  230, type: "provider", r: 16 },
  { id: "p8", dx:  215, dy:  115, type: "provider", r: 14 },
  // CPT codes (orange)
  { id: "c1", dx:  -85, dy: -180, type: "cpt", r: 12 },
  { id: "c2", dx:  155, dy: -275, type: "cpt", r: 12 },
  { id: "c3", dx: -315, dy:  130, type: "cpt", r: 12 },
  { id: "c4", dx:  105, dy:  225, type: "cpt", r: 12 },
  { id: "c5", dx:  295, dy:    5, type: "cpt", r: 12 },
  { id: "c6", dx: -155, dy:  280, type: "cpt", r: 12 },
  // Vendors (teal)
  { id: "v1", dx: -250, dy: -190, type: "vendor", r: 11 },
  { id: "v2", dx:  325, dy: -105, type: "vendor", r: 11 },
  { id: "v3", dx:  335, dy:  160, type: "vendor", r: 11 },
  { id: "v4", dx:  -45, dy:  325, type: "vendor", r: 11 },
  { id: "v5", dx: -380, dy:    5, type: "vendor", r: 11 },
];

// Resolve absolute coords
const NODES = NODE_DEFS.map(n => ({
  ...n, x: HUB_X + n.dx, y: HUB_Y + n.dy,
}));
const NODE_MAP = {};
NODES.forEach(n => { NODE_MAP[n.id] = n; });

// Edges [fromId, toId]
const EDGES = [
  // Hub → providers
  ["hub","p1"],["hub","p2"],["hub","p3"],["hub","p4"],
  ["hub","p5"],["hub","p6"],["hub","p7"],["hub","p8"],
  // Hub → CPT (anchor)
  ["hub","c1"],["hub","c5"],
  // Provider ↔ CPT
  ["p1","c1"],["p4","c1"],["p4","c2"],["p5","c2"],
  ["p2","c3"],["p3","c3"],["p3","c6"],["p6","c3"],
  ["p7","c4"],["p7","c6"],["p8","c5"],["p8","c4"],
  // CPT ↔ Vendor
  ["c1","v1"],["c2","v2"],["c5","v3"],["c4","v4"],["c3","v5"],
  // Provider ↔ Vendor
  ["p1","v1"],["p5","v2"],["p2","v5"],["p6","v5"],["p7","v4"],["p8","v3"],
  // Cross-cluster risk links
  ["p1","p4"],["p2","p3"],["p5","p8"],["p6","p2"],["c2","v1"],
];

// Risk node IDs (pulse orange)
const RISK_IDS = new Set(["p1","p4","c1","v1","p5","c2","v2","p8","c5","v3"]);

// Node color by type
const nodeColor = (type) => {
  if (type === "provider") return COLORS.blueDark;
  if (type === "cpt")      return COLORS.amber;
  if (type === "vendor")   return COLORS.teal;
  return COLORS.blueDark;
};

// ─── Output cards ─────────────────────────────────────────────────────────────
const OUTPUT_CARDS = [
  { title: "Provider Risk Profile",     sub: "Composite risk score per provider" },
  { title: "Peer Provider Groups",      sub: "Behavioral clustering by billing pattern" },
  { title: "CPT-Provider Connections",  sub: "Cross-entity code-level linkages" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export const Scene6DataGraph = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startFrame;

  // --- Phase timings ---
  const labelOp   = interp(lf, [0, 28], [0, 1]);

  // Icons: staggered fade-in (0-80), idle float (80-150), snap (145-200)
  const snapSpring = spring({
    frame: Math.max(0, lf - 145),
    fps,
    config: { damping: 15, stiffness: 200, mass: 0.75 },
  });
  const snapT = clamp(snapSpring, 0, 1);

  // Morph phase: boxes → circles → merge into hub (183-240)
  const morphT = clamp(interp(lf, [183, 240], [0, 1]), 0, 1);

  // Hub materialise (195-230)
  const hubScale = spring({
    frame: Math.max(0, lf - 195),
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.6 },
  });

  // Graph growth (225-500)
  const graphProg = interp(lf, [225, 500], [0, 1]);

  // Risk pulse (continuous after 350)
  const riskPhase  = interp(lf, [350, 420], [0, 1]);
  const riskPulse  = 0.45 + 0.55 * Math.sin(lf * 0.09);   // 0..1

  // Zoom out (480-620): scale from 1.12 → 1
  const zoom = interp(lf, [480, 620], [1.12, 1.0]);

  // Cards slide in from right
  const cardSlides = OUTPUT_CARDS.map((_, i) => {
    const s = 555 + i * 30;
    return interp(lf, [s, s + 50], [240, 0]);
  });

  // Final text
  const finalOp = interp(lf, [760, 830], [0, 1]);

  // Icon-level helpers
  const iconOps = DATA_SOURCES.map((_, i) =>
    interp(lf, [10 + i * 12, 35 + i * 12], [0, 1])
  );
  const floatY = (i) =>
    lf < 210 ? Math.sin(lf * 0.05 + i * 1.3) * 7 : 0;

  // ── GRAPH SVG ELEMENTS ──────────────────────────────────────────────────────
  const hubNode = { id: "hub", x: HUB_X, y: HUB_Y, r: 24 };

  // Animated edges
  const edgeEls = EDGES.map(([aId, bId], i) => {
    const a = aId === "hub" ? hubNode : NODE_MAP[aId];
    const b = bId === "hub" ? hubNode : NODE_MAP[bId];
    if (!a || !b) return null;
    const localP = clamp(graphProg * EDGES.length - i * 0.65, 0, 1);
    const ex = a.x + (b.x - a.x) * localP;
    const ey = a.y + (b.y - a.y) * localP;
    const isRisk =
      (aId !== "hub" && RISK_IDS.has(aId)) ||
      (bId !== "hub" && RISK_IDS.has(bId));
    const edgeOpacity = isRisk
      ? 0.28 + riskPhase * 0.22
      : 0.22;
    return (
      <line
        key={i}
        x1={a.x} y1={a.y} x2={ex} y2={ey}
        stroke={isRisk ? COLORS.amber : COLORS.blueDark}
        strokeWidth={isRisk ? 1.8 : 1.4}
        opacity={edgeOpacity}
        strokeLinecap="round"
      />
    );
  });

  // Animated nodes
  const nodeEls = NODES.map((n, i) => {
    const appear = clamp(graphProg * NODES.length - i * 0.72, 0, 1);
    if (appear <= 0) return null;
    const color = nodeColor(n.type);
    const isRisk = RISK_IDS.has(n.id);
    const glowR  = n.r + 10 + riskPulse * 14;
    const glowOp = isRisk ? riskPhase * riskPulse * 0.38 : 0;
    const scale  = spring({ frame: Math.max(0, Math.round(graphProg * NODES.length - i * 0.72) * 3), fps,
      config: { damping: 12, stiffness: 260, mass: 0.5 } });
    const sc = clamp(scale, 0, 1);
    return (
      <g key={n.id} style={{ transformOrigin: `${n.x}px ${n.y}px`, transform: `scale(${sc})` }}>
        {/* Risk glow ring */}
        {isRisk && (
          <circle cx={n.x} cy={n.y} r={glowR}
            fill={COLORS.amber} opacity={glowOp} />
        )}
        {/* Node shadow */}
        <circle cx={n.x} cy={n.y} r={n.r + 4} fill={color} opacity={0.12} />
        {/* Node fill */}
        <circle cx={n.x} cy={n.y} r={n.r} fill={color} opacity={0.95} />
      </g>
    );
  });

  // ── HUB NODE ─────────────────────────────────────────────────────────────────
  const hubSc = clamp(hubScale, 0, 1.08);

  return (
    <div
      style={{
        position: "absolute", inset: 0,
        background: "#FFFFFF",
        overflow: "hidden",
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Subtle dot grid */}
      <svg style={{ position: "absolute", inset: 0, opacity: 0.04 }} width="1920" height="1080">
        <defs>
          <pattern id="dg6dg" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="24" cy="24" r="1.5" fill={COLORS.blueDark} />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#dg6dg)" />
      </svg>

      {/* Module pill */}
      <div style={{ position: "absolute", top: 38, left: 60, opacity: labelOp }}>
        <div style={{
          display: "inline-flex", gap: 12, alignItems: "center",
          background: COLORS.blueLight, borderRadius: 100,
          padding: "12px 28px", border: `2px solid ${COLORS.blueDark}55`,
          boxShadow: `0 4px 16px ${COLORS.blueDark}22`,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: COLORS.blueDark }} />
          <span style={{ fontSize: 25, fontWeight: 800, color: COLORS.blueDark, letterSpacing: 0.4 }}>
            3rd Party Graph
          </span>
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 40, left: "50%",
        transform: "translateX(-50%)", opacity: labelOp, textAlign: "center",
        pointerEvents: "none",
      }}>
        <div style={{ fontSize: 44, fontWeight: 800, color: COLORS.textDark, letterSpacing: -0.5 }}>
          Graph Intelligence
        </div>
      </div>

      {/* ── Graph + icon SVG layer ─────────────────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `scale(${zoom})`,
        transformOrigin: "40% 50%",
      }}>
        <svg
          width="1920" height="1080"
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {/* Connection edges: hub → each icon during snap/morph */}
          {DATA_SOURCES.map((src, i) => {
            const cx = src.ix + (HUB_X - src.ix) * snapT;
            const cy = src.iy + (HUB_Y - src.iy) * snapT;
            // Appear as icons approach hub, fade out as circles merge
            const edgeOp = clamp(
              interp(snapT, [0.2, 0.6], [0, 0.65]) *
              interp(morphT, [0.5, 1.0], [1, 0]),
              0, 1
            );
            const iconColor = i % 2 === 0 ? COLORS.blueDark : COLORS.amber;
            return (
              <line key={src.id}
                x1={HUB_X} y1={HUB_Y} x2={cx} y2={cy}
                stroke={iconColor} strokeWidth={2}
                strokeDasharray="7 5" opacity={edgeOp}
                strokeLinecap="round"
              />
            );
          })}

          {/* Edges */}
          {edgeEls}

          {/* Nodes */}
          {nodeEls}

          {/* Hub node */}
          {hubSc > 0.05 && (
            <g style={{ transformOrigin: `${HUB_X}px ${HUB_Y}px`, transform: `scale(${hubSc})` }}>
              {/* Outer glow ring */}
              <circle cx={HUB_X} cy={HUB_Y} r={48}
                fill={COLORS.blueDark} opacity={0.08} />
              <circle cx={HUB_X} cy={HUB_Y} r={38}
                fill={COLORS.blueDark} opacity={0.12} />
              {/* Hub body */}
              <circle cx={HUB_X} cy={HUB_Y} r={24}
                fill={COLORS.blueDark} />
              {/* Hub inner ring */}
              <circle cx={HUB_X} cy={HUB_Y} r={16}
                fill="none" stroke="white" strokeWidth="2.5" opacity={0.7} />
              {/* Hub dot */}
              <circle cx={HUB_X} cy={HUB_Y} r={5}
                fill="white" opacity={0.9} />
            </g>
          )}

        </svg>

        {/* ── Floating data source icons ─────────────────────────────────── */}
        {DATA_SOURCES.map((src, i) => {
          const op = iconOps[i];
          const cx = src.ix + (HUB_X - src.ix) * snapT;
          const cy = src.iy + (HUB_Y - src.iy) * snapT + (snapT < 0.95 ? floatY(i) : 0);

          const iconColor = i % 2 === 0 ? COLORS.blueDark : COLORS.amber;
          const IconFn = Object.values(ICONS)[i];

          // Box → circle morph: borderRadius goes from 18 → 46 (fully round on 92px box)
          const boxRadius  = interp(morphT, [0, 0.55], [18, 46]);
          // Inner icon + label fade out in first half of morph
          const innerOp    = interp(morphT, [0, 0.35], [1, 0]);
          const lblOp      = interp(morphT, [0, 0.22], [1, 0]);
          // Circle shrinks into hub in second half
          const mergeScale = interp(morphT, [0.6, 1.0], [1, 0]);
          // Overall: fade in normally, then drive by mergeScale
          const iconVisible = op * mergeScale;

          if (iconVisible <= 0.01) return null;
          return (
            <div
              key={src.id}
              style={{
                position: "absolute",
                left: cx - 46, top: cy - 46,
                width: 92, height: 92,
                opacity: iconVisible,
                pointerEvents: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column",
              }}
            >
              {/* Icon card — morphs into a circle */}
              <div style={{
                width: 92, height: 92,
                background: "white",
                borderRadius: boxRadius,
                border: `2.5px solid ${iconColor}55`,
                boxShadow: `0 6px 24px ${iconColor}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                <div style={{ opacity: innerOp }}>
                  {IconFn(iconColor)}
                </div>
              </div>
              {/* Label fades out before morph */}
              <div style={{
                marginTop: 8,
                opacity: lblOp,
                background: "white",
                borderRadius: 8,
                padding: "5px 12px",
                border: `1.5px solid ${iconColor}33`,
                fontSize: 13, fontWeight: 700,
                color: iconColor,
                whiteSpace: "nowrap",
                textAlign: "center", lineHeight: 1.3,
                position: "absolute",
                top: 96,
              }}>
                {src.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Output cards ─────────────────────────────────────────────────────── */}
      {OUTPUT_CARDS.map((card, i) => {
        const cardX = cardSlides[i];
        const cardOp = interp(lf, [555 + i * 30, 580 + i * 30], [0, 1]);
        return (
          <div
            key={card.title}
            style={{
              position: "absolute",
              right: 46 + cardX,
              top: 260 + i * 170,
              width: 410,
              opacity: cardOp,
              background: "white",
              borderRadius: 18,
              border: `2px solid ${COLORS.blueDark}28`,
              boxShadow: `0 8px 36px rgba(24,95,165,0.14)`,
              padding: "26px 32px",
              display: "flex", flexDirection: "column", gap: 8,
            }}
          >
            {/* Left accent bar */}
            <div style={{
              position: "absolute", left: 0, top: 18, bottom: 18,
              width: 5, borderRadius: "0 4px 4px 0",
              background: i === 0 ? COLORS.blueDark : i === 1 ? COLORS.amber : COLORS.teal,
            }} />
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.blueDark, letterSpacing: -0.2 }}>
              {card.title}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: COLORS.textMid, lineHeight: 1.5 }}>
              {card.sub}
            </div>
          </div>
        );
      })}

      {/* ── Final text ───────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        bottom: 68,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: finalOp,
        textAlign: "center",
        pointerEvents: "none",
      }}>
        <div style={{
          fontSize: 48,
          fontWeight: 900,
          color: COLORS.blueDark,
          letterSpacing: -0.8,
          whiteSpace: "nowrap",
        }}>
          Hidden relationships.&nbsp;&nbsp;Visible risk.
        </div>
      </div>
    </div>
  );
};
