// ============================================================
// WhiteStellar — Articles Listing Page
// src/pages/ArticlesPage.tsx
// ============================================================

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Star } from 'lucide-react'
import { ARTICLES } from '../data/articles'

const CATEGORIES = ['All', 'Astrology', 'Tarot', 'Love & Relationships', 'Dream Interpretation', 'Psychic Readings']

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const navigate = useNavigate()

  const filtered = useMemo(() =>
    activeCategory === 'All'
      ? ARTICLES
      : ARTICLES.filter(a => a.category === activeCategory),
  [activeCategory])

  const featured = ARTICLES[0]

  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,60,180,0.15) 0%, transparent 60%)',
        padding: '56px 20px 40px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
          <Star size={14} fill="#C9A84C" color="#C9A84C" />
          <span style={{ color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            WhiteStellar Insights
          </span>
        </div>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '36px', fontFamily: "'Playfair Display', serif", margin: '0 0 10px' }}>
          Astrology, Tarot & Spiritual Guidance
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '16px', margin: 0, maxWidth: '500px', marginInline: 'auto' }}>
          Expert articles from our top advisors to help you navigate love, life, and the cosmos
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* ── Featured Article ── */}
        <div
          onClick={() => navigate(`/articles/${featured.slug}`)}
          style={{
            cursor: 'pointer', marginBottom: '40px',
            background: '#0D1221', border: '1px solid #1A2235', borderRadius: '20px',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{
            height: '280px', overflow: 'hidden', position: 'relative',
          }}>
            <img
              src={featured.coverImage}
              alt={featured.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(13,18,33,0.9) 0%, transparent 50%)',
            }} />
            <span style={{
              position: 'absolute', top: '16px', left: '16px',
              background: 'rgba(201,168,76,0.15)', color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: 600,
            }}>
              Featured
            </span>
          </div>
          <div style={{ padding: '24px 28px' }}>
            <span style={{
              background: 'rgba(201,168,76,0.08)', color: '#C9A84C',
              borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600,
            }}>
              {featured.category}
            </span>
            <h2 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', fontFamily: "'Playfair Display', serif", margin: '10px 0 8px' }}>
              {featured.title}
            </h2>
            <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.6 }}>
              {featured.excerpt}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={featured.authorAvatar} alt={featured.author} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ color: '#8B9BB4', fontSize: '13px' }}>{featured.author}</span>
              <span style={{ color: '#4B5563' }}>·</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} color="#4B5563" />
                <span style={{ color: '#4B5563', fontSize: '12px' }}>{featured.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Category filter ── */}
        <div style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap',
          marginBottom: '28px',
        }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px', borderRadius: '20px', cursor: 'pointer',
                  background: active ? '#C9A84C' : '#131929',
                  border: `1px solid ${active ? '#C9A84C' : '#1E2D45'}`,
                  color: active ? '#0B0F1A' : '#8B9BB4',
                  fontSize: '13px', fontWeight: active ? 700 : 500,
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* ── Articles grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filtered.map(article => (
            <article
              key={article.slug}
              onClick={() => navigate(`/articles/${article.slug}`)}
              style={{
                cursor: 'pointer',
                background: '#0D1221', border: '1px solid #1A2235',
                borderRadius: '16px', overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = '0 8px 32px rgba(201,168,76,0.1)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              <div style={{ height: '180px', overflow: 'hidden' }}>
                <img
                  src={article.coverImage}
                  alt={article.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
                />
              </div>
              <div style={{ padding: '16px 18px' }}>
                <span style={{
                  background: 'rgba(201,168,76,0.08)', color: '#C9A84C',
                  borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600,
                }}>
                  {article.category}
                </span>
                <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '15px', fontFamily: "'Playfair Display', serif", margin: '8px 0 6px', lineHeight: 1.4 }}>
                  {article.title}
                </h3>
                <p style={{
                  color: '#8B9BB4', fontSize: '13px', margin: '0 0 14px', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {article.excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={article.authorAvatar} alt={article.author} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ color: '#4B5563', fontSize: '12px' }}>{article.author}</span>
                  <span style={{ color: '#4B5563' }}>·</span>
                  <Clock size={11} color="#4B5563" />
                  <span style={{ color: '#4B5563', fontSize: '12px' }}>{article.readTime} min</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
