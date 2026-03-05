// ============================================================
// WhiteStellar — Single Article Page
// src/pages/ArticlePage.tsx
// ============================================================

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, Star, ArrowLeft, ChevronRight } from 'lucide-react'
import { getArticleBySlug, ARTICLES } from '../data/articles'

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const article = getArticleBySlug(slug ?? '')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!article) {
    return (
      <div style={{
        background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px' }}>Article Not Found</h1>
        <button
          onClick={() => navigate('/articles')}
          style={{
            background: '#C9A84C', border: 'none', borderRadius: '10px',
            padding: '10px 24px', color: '#0B0F1A', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Back to Articles
        </button>
      </div>
    )
  }

  const related = ARTICLES.filter(a => a.categorySlug === article.categorySlug && a.slug !== article.slug).slice(0, 3)

  // Parse body into paragraphs (split on double newline)
  const paragraphs = article.body.split('\n\n')

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF' }}>

      {/* ── Cover ── */}
      <div style={{ position: 'relative', height: '380px', overflow: 'hidden' }}>
        <img
          src={article.coverImage}
          alt={article.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(11,15,26,0.4) 0%, rgba(11,15,26,0.85) 80%, #0B0F1A 100%)',
        }} />
        <button
          onClick={() => navigate('/articles')}
          style={{
            position: 'absolute', top: '20px', left: '20px',
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(11,15,26,0.7)', border: '1px solid rgba(240,244,255,0.15)',
            borderRadius: '8px', padding: '8px 14px',
            color: '#F0F4FF', fontSize: '13px', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={15} />
          Articles
        </button>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '0 20px 60px', marginTop: '-60px', position: 'relative', zIndex: 1 }}>

        {/* Category badge + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/category/${article.categorySlug}`)}
            style={{
              background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {article.category}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} color="#4B5563" />
            <span style={{ color: '#4B5563', fontSize: '13px' }}>{article.readTime} min read</span>
          </div>
          <span style={{ color: '#4B5563', fontSize: '13px' }}>{formatDate(article.publishedAt)}</span>
        </div>

        {/* Title + subtitle */}
        <h1 style={{
          color: '#F0F4FF', fontWeight: 700, fontSize: '32px',
          fontFamily: "'Playfair Display', serif",
          lineHeight: 1.3, margin: '0 0 12px',
        }}>
          {article.title}
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '17px', margin: '0 0 24px', lineHeight: 1.6 }}>
          {article.subtitle}
        </p>

        {/* Author */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 18px', background: '#0D1221', border: '1px solid #1A2235',
          borderRadius: '12px', marginBottom: '32px',
        }}>
          <img src={article.authorAvatar} alt={article.author} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C9A84C' }} />
          <div>
            <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: 0 }}>{article.author}</p>
            <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>WhiteStellar Advisor</p>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: '8px', padding: '7px 14px',
              color: '#C9A84C', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            View Profile
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Article body */}
        <div style={{ lineHeight: 1.8 }}>
          {paragraphs.map((para, i) => {
            // Bold headers (lines starting with **)
            if (para.startsWith('**') && para.endsWith('**')) {
              return (
                <h2
                  key={i}
                  style={{
                    color: '#F0F4FF', fontWeight: 700, fontSize: '18px',
                    fontFamily: "'Playfair Display', serif",
                    margin: '28px 0 10px',
                  }}
                >
                  {para.replace(/\*\*/g, '')}
                </h2>
              )
            }
            // Bold inline text within paragraph
            const parts = para.split(/(\*\*[^*]+\*\*)/g)
            return (
              <p key={i} style={{ color: '#8B9BB4', fontSize: '16px', margin: '0 0 18px', lineHeight: 1.8 }}>
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} style={{ color: '#F0F4FF' }}>{part.replace(/\*\*/g, '')}</strong>
                  }
                  return part
                })}
              </p>
            )
          })}
        </div>

        {/* CTA band */}
        <div style={{
          background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '16px', padding: '24px', textAlign: 'center', margin: '36px 0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '10px' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#C9A84C" color="#C9A84C" />)}
          </div>
          <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '18px', fontFamily: "'Playfair Display', serif", margin: '0 0 6px' }}>
            Ready to Go Deeper?
          </h3>
          <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 16px' }}>
            Connect with a live advisor for a personalized reading — first 3 minutes free
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
              border: 'none', borderRadius: '10px', padding: '12px 28px',
              color: '#0B0F1A', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            }}
          >
            Browse Advisors
          </button>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div>
            <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '18px', fontFamily: "'Playfair Display', serif", margin: '0 0 16px' }}>
              Related Articles
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {related.map(rel => (
                <div
                  key={rel.slug}
                  onClick={() => navigate(`/articles/${rel.slug}`)}
                  style={{
                    display: 'flex', gap: '14px', alignItems: 'center',
                    background: '#0D1221', border: '1px solid #1A2235',
                    borderRadius: '12px', padding: '14px', cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1A2235' }}
                >
                  <img src={rel.coverImage} alt={rel.title} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  <div>
                    <span style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 600 }}>{rel.category}</span>
                    <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: '2px 0 4px', lineHeight: 1.3 }}>{rel.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} color="#4B5563" />
                      <span style={{ color: '#4B5563', fontSize: '12px' }}>{rel.readTime} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
