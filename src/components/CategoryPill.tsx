import {
  Eye, Heart, Layers, Star, Sparkles, Moon, TrendingUp, Zap, type LucideProps,
} from 'lucide-react'
import type { Category } from '../types'

// Map icon name strings from data to actual Lucide components
const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Eye, Heart, Layers, Star, Sparkles, Moon, TrendingUp, Zap,
}

interface Props {
  categories: Category[]
  activeSlug: string
  onChange: (slug: string) => void
}

const ALL_PILL = { id: 0, slug: 'all', title: 'All', icon: 'Sparkles' } as const

export default function CategoryPill({ categories, activeSlug, onChange }: Props) {
  const pills = [ALL_PILL, ...categories]

  return (
    <div
      className="flex gap-2 overflow-x-auto py-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {pills.map(cat => {
        const isActive = cat.slug === activeSlug
        const Icon = ICON_MAP[cat.icon] ?? Sparkles

        return (
          <button
            key={cat.slug}
            onClick={() => onChange(cat.slug)}
            className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-[250ms] ease-in-out whitespace-nowrap"
            style={{
              background: isActive ? 'rgba(201, 168, 76, 0.12)' : 'rgba(19, 25, 41, 0.8)',
              color: isActive ? '#C9A84C' : '#8B9BB4',
              border: isActive ? '1px solid rgba(201, 168, 76, 0.5)' : '1px solid #1E2D45',
            }}
          >
            <Icon size={15} />
            {cat.title}
          </button>
        )
      })}
    </div>
  )
}
