"use client";

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
}

export function MiniBarChart({ data, height = 200 }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const _barWidth = 100 / data.length; // eslint-disable-line @typescript-eslint/no-unused-vars

  return (
    <div className="w-full">
      <div className="relative" style={{ height }}>
        <svg viewBox={`0 0 ${data.length * 60} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {data.map((d, i) => {
            const barH = (d.value / maxVal) * (height - 30);
            const x = i * 60 + 10;
            const y = height - barH - 20;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={35}
                  height={barH}
                  rx={4}
                  className="fill-primary/80 hover:fill-primary transition-colors"
                />
                <text
                  x={x + 17.5}
                  y={height - 4}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                  style={{ fontSize: "10px" }}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
}

export function MiniLineChart({ data, height = 200 }: LineChartProps) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = Math.min(...data.map((d) => d.value));
  const range = maxVal - minVal || 1;
  const padding = 40;
  const chartW = data.length * 60;
  const chartH = height - padding;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (chartW - padding * 2);
    const y = padding / 2 + (1 - (d.value - minVal) / range) * (chartH - padding / 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartH} L ${points[0].x} ${chartH} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartW} ${height}`} className="w-full h-full min-w-[400px]" style={{ height }} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padding / 2 + pct * (chartH - padding / 2);
          return (
            <line
              key={pct}
              x1={padding}
              y1={y}
              x2={chartW - padding}
              y2={y}
              className="stroke-border"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area fill */}
        <path d={areaPath} className="fill-primary/10" />

        {/* Line */}
        <path d={linePath} fill="none" className="stroke-primary" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} className="fill-primary stroke-background" strokeWidth={2} />
            <text
              x={p.x}
              y={chartH + 16}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: "9px" }}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
