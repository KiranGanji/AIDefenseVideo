import { interpolate } from "remotion";
import { COLORS } from "../theme";

export const AnimatedArrow = ({
  x1, y1, x2, y2,
  progress = 1,
  color = COLORS.blue,
  dashed = false,
  bidirectional = false,
  strokeWidth = 2,
}) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);

  // Control point for curve
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - len * 0.15;

  const path = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;

  // Approximate path length for stroke-dashoffset animation
  const pathLen = len * 1.1;
  const drawn = pathLen * progress;

  return (
    <svg
      style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
      width="1920"
      height="1080"
    >
      <defs>
        <marker
          id={`arrowhead-${color.replace("#", "")}`}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={color} opacity={0.8} />
        </marker>
        {bidirectional && (
          <marker
            id={`arrowhead-back-${color.replace("#", "")}`}
            markerWidth="8"
            markerHeight="6"
            refX="1"
            refY="3"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 8 3, 0 6" fill={color} opacity={0.8} />
          </marker>
        )}
      </defs>
      {/* Glow layer */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth + 4}
        opacity={0.1 * progress}
        strokeDasharray={dashed ? "10 8" : "none"}
        strokeDashoffset={dashed ? 0 : undefined}
      />
      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={0.7 * progress}
        strokeDasharray={pathLen}
        strokeDashoffset={pathLen - drawn}
        markerEnd={`url(#arrowhead-${color.replace("#", "")})`}
        markerStart={bidirectional ? `url(#arrowhead-back-${color.replace("#", "")})` : undefined}
        strokeLinecap="round"
      />
    </svg>
  );
};

// Animated data particle traveling along a path
export const DataParticle = ({ x1, y1, x2, y2, progress, color = COLORS.blue, size = 6 }) => {
  const t = progress;
  const mx = (x1 + x2) / 2;
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const my = (y1 + y2) / 2 - len * 0.15;

  // Quadratic bezier position
  const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
  const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;

  return (
    <div
      style={{
        position: "absolute",
        left: px - size / 2,
        top: py - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}80`,
        pointerEvents: "none",
      }}
    />
  );
};
