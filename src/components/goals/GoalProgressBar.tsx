interface Props {
  total: number
  completed: number
}

export function GoalProgressBar({ total, completed }: Props) {
  if (total === 0) return null
  const pct = total > 0 ? (completed / total) * 100 : 0
  const done = pct >= 100

  return (
    <div className="mt-1.5">
      <div className="h-[2px] w-full bg-surface-4 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-accent-green' : 'bg-accent-green-dim'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[10px] text-text-muted mt-0.5">
        {completed} / {total}
      </div>
    </div>
  )
}
