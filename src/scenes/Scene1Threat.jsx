import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const W = 1920, H = 1080;

// 28 nodes — mix of normal (blue) and anomalous (red)
const NODES = [
  { rx: 0.500, ry: 0.500, red: false }, // 0 origin
  { rx: 0.290, ry: 0.310, red: false }, // 1
  { rx: 0.710, ry: 0.300, red: false }, // 2
  { rx: 0.240, ry: 0.570, red: true  }, // 3
  { rx: 0.760, ry: 0.590, red: false }, // 4
  { rx: 0.460, ry: 0.220, red: false }, // 5
  { rx: 0.540, ry: 0.780, red: true  }, // 6
  { rx: 0.140, ry: 0.400, red: false }, // 7
  { rx: 0.860, ry: 0.430, red: false }, // 8
  { rx: 0.610, ry: 0.185, red: false }, // 9
  { rx: 0.350, ry: 0.720, red: true  }, // 10
  { rx: 0.800, ry: 0.710, red: false }, // 11
  { rx: 0.195, ry: 0.710, red: false }, // 12
  { rx: 0.640, ry: 0.510, red: false }, // 13
  { rx: 0.360, ry: 0.440, red: false }, // 14
  { rx: 0.550, ry: 0.340, red: false }, // 15
  { rx: 0.690, ry: 0.760, red: true  }, // 16
  { rx: 0.200, ry: 0.240, red: false }, // 17
  { rx: 0.800, ry: 0.240, red: false }, // 18
  { rx: 0.500, ry: 0.830, red: false }, // 19
  { rx: 0.095, ry: 0.620, red: true  }, // 20
  { rx: 0.905, ry: 0.580, red: false }, // 21
  { rx: 0.415, ry: 0.140, red: false }, // 22
  { rx: 0.600, ry: 0.870, red: false }, // 23
  { rx: 0.855, ry: 0.340, red: false }, // 24
  { rx: 0.330, ry: 0.160, red: false }, // 25
  { rx: 0.730, ry: 0.140, red: false }, // 26
  { rx: 0.115, ry: 0.840, red: true  }, // 27
];

const EDGES = [
  [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
  [1,7],[1,14],[1,17],[1,25],
  [2,8],[2,9],[2,18],[2,24],[2,26],
  [3,10],[3,12],[3,20],
  [4,11],[4,13],[4,21],
  [5,9],[5,15],[5,22],[5,25],[5,26],
  [6,10],[6,16],[6,19],[6,23],[6,27],
  [7,12],[7,20],
  [8,18],[8,21],[8,24],
  [10,12],[10,27],
  [11,16],[11,21],
  [13,15],[14,15],
  [16,23],[19,23],[22,25],
];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interp = (f, i, o) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const Scene1Threat = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startFrame; // local frame

  // Each node springs into its final position; stagger by 7 frames each
  const nodes = NODES.map((n, i) => {
    const sf = i * 7;
    const prog = spring({ frame: lf - sf, fps, config: { damping: 14, stiffness: 90, mass: 0.7 } });
    const op = interp(lf, [sf, sf + 12], [0, 1]);
    return { x: n.rx * W, y: n.ry * H, op: clamp(op, 0, 1), prog, red: n.red };
  });

  // Packet animation: each edge gets a packet travelling along it
  const tick = lf % 80;

  // Ambient pulse for red nodes
  const redPulse = 1 + Math.sin(lf * 0.1) * 0.15;

  // Text fade-in immediately with the dots
  const line1Op = interp(lf, [10, 45], [0, 1]);
  const line2Op = interp(lf, [55, 90], [0, 1]);
  const line2Scale = interp(lf, [55, 115], [0.85, 1]);

  // Vignette overlay
  const vigOp = interp(lf, [0, 40], [0, 0.5]);

  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.darkBg, overflow: "hidden" }}>

      {/* Ambient glow at center */}
      <div style={{
        position: "absolute", width: 700, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.blue}18 0%, transparent 65%)`,
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.red}12 0%, transparent 65%)`,
        top: "38%", left: "28%", transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />

      {/* Grid */}
      <svg style={{ position: "absolute", inset: 0, opacity: 0.03 }} width={W} height={H}>
        <defs>
          <pattern id="tg" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#tg)" />
      </svg>

      {/* Edges + packets */}
      <svg style={{ position: "absolute", inset: 0 }} width={W} height={H}>
        {EDGES.map(([a, b], i) => {
          const na = nodes[a], nb = nodes[b];
          const edgeSf = (Math.min(a, b) * 7) + 25;
          const edgeOp = interp(lf, [edgeSf, edgeSf + 18], [0, 1]) * Math.min(na.op, nb.op);
          const isRed = na.red || nb.red;
          const color = isRed ? COLORS.red : COLORS.blue;
          const phasedT = ((tick / 80) + i * 0.11) % 1;
          const px = na.x + (nb.x - na.x) * phasedT;
          const py = na.y + (nb.y - na.y) * phasedT;
          return (
            <g key={i} opacity={clamp(edgeOp, 0, 1)}>
              <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={color} strokeWidth={isRed ? 1.5 : 0.8}
                strokeOpacity={isRed ? 0.55 : 0.28}
              />
              <circle cx={px} cy={py} r={isRed ? 4 : 2.5}
                fill={color} opacity={0.9}
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((n, i) => {
        const sz = n.red ? 14 : 8;
        const pulse = n.red ? redPulse : 1;
        const glow = n.red ? `0 0 22px ${COLORS.red}, 0 0 40px ${COLORS.red}55` : `0 0 12px ${COLORS.blue}99`;
        return (
          <div key={i} style={{
            position: "absolute",
            left: n.x - sz * pulse,
            top: n.y - sz * pulse,
            width: sz * 2 * pulse,
            height: sz * 2 * pulse,
            borderRadius: "50%",
            background: n.red ? COLORS.red : COLORS.blue,
            opacity: n.op * n.prog,
            boxShadow: glow,
          }} />
        );
      })}

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 40%, #0A0E1Aaa 100%)",
        opacity: vigOp, pointerEvents: "none",
      }} />

      {/* Text — vertical center */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center", width: 1200, pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 40,
          fontWeight: 300, color: "rgba(255,255,255,0.82)",
          opacity: line1Op, marginBottom: 10, letterSpacing: 0.3,
        }}>
          The threat is no longer isolated.
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 58,
          fontWeight: 700, color: COLORS.red,
          opacity: line2Op,
          transform: `scale(${line2Scale})`,
          display: "inline-block",
          letterSpacing: -0.5,
          textShadow: `0 0 40px ${COLORS.red}88`,
        }}>
          It is structural.
        </div>
      </div>

      {/* Module label top-left */}
      <div style={{
        position: "absolute", top: 44, left: 60,
        fontFamily: "'Inter', sans-serif", fontSize: 13,
        fontWeight: 600, color: COLORS.red, letterSpacing: 2,
        textTransform: "uppercase", opacity: interp(lf, [20, 40], [0, 1]),
      }}>
        AI Defense · Threat Overview
      </div>
    </div>
  );
};
