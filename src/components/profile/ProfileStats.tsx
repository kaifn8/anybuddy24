interface Stat {
  value: string | number;
  label: string;
}

interface ProfileStatsProps {
  stats: Stat[];
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat, i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl bg-background/60 backdrop-blur-sm border border-border/30 p-3 text-center">
          <p className="text-lg font-bold tabular-nums text-foreground">{stat.value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
