import type { Task } from '@/store'

type Source = Task['source']

interface SourceToggleProps {
  value: Source
  onChange: (source: Source) => void
}

export function SourceToggle({ value, onChange }: SourceToggleProps) {
  return (
    <div className="flex rounded-lg border border-border p-1 w-fit">
      {(['inbox', 'today'] as Source[]).map((source) => (
        <button
          key={source}
          onClick={() => onChange(source)}
          className={[
            'px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
            value === source
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {source === 'inbox' ? 'Inbox' : 'Hoy'}
        </button>
      ))}
    </div>
  )
}
