interface BarChartProps {
  data: { label: string; value: number }[];
  barColor?: string;
  height?: number;
}

export function BarChart({ data, barColor = '#4f6ef7', height = 140 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-semibold text-content">{d.value}</span>
            <div className="w-full rounded-t-md" style={{ height: `${pct}%`, backgroundColor: barColor, minHeight: 4 }} />
            <span className="text-[10px] text-content-muted text-center leading-tight max-w-[60px] break-words">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
