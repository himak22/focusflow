interface SourceToggleProps {
  value: string
  onChange: (tag: string) => void
}

export function SourceToggle({ value, onChange }: SourceToggleProps) {
  return (
    <div className="flex rounded-lg border border-border p-1 w-fit">
      {(['inbox', 'today'] as const).map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(tag)}
          className={[
            'px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
            value === tag
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {tag === 'inbox' ? 'Inbox' : 'Hoy'}
        </button>
      ))}
    </div>
  )
}
