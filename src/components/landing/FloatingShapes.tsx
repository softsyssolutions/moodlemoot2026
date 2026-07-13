import semicircles from "@/assets/brand/shapes/shape-semicircles.png";
import quarter from "@/assets/brand/shapes/shape-quarter.png";
import square from "@/assets/brand/shapes/shape-square.png";
import hex from "@/assets/brand/shapes/shape-hex.png";
import corner from "@/assets/brand/shapes/shape-corner.png";
import composition from "@/assets/brand/shapes/shape-composition.png";

const SHAPES = { semicircles, quarter, square, hex, corner, composition } as const;
type ShapeKey = keyof typeof SHAPES;

export interface FloatingShape {
  shape: ShapeKey;
  className: string;
  anim?: "floaty" | "floaty-rev" | "none";
  opacity?: number;
}

const FloatingShapes = ({ items }: { items: FloatingShape[] }) => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    {items.map((it, i) => (
      <img
        key={i}
        src={SHAPES[it.shape]}
        alt=""
        className={`absolute select-none ${it.className} ${
          it.anim === "floaty-rev" ? "animate-floaty-rev" : it.anim === "none" ? "" : "animate-floaty"
        }`}
        style={{ opacity: it.opacity ?? 0.85 }}
      />
    ))}
  </div>
);

export default FloatingShapes;
