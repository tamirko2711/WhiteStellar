// ============================================================
// WhiteStellar — Privacy Policy Page
// src/pages/PrivacyPolicyPage.tsx
// ============================================================

import { useEffect } from 'react'

const UPDATED_DATE = 'January 15, 2025'
const CONTACT_EMAIL = 'service@whitestellar.com'

// ─── Section types ────────────────────────────────────────────

interface PolicySection {
  id: string
  title: string
  content: string | string[]
}

// ─── Policy content ───────────────────────────────────────────

const SECTIONS: PolicySection[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `WhiteStellar ("we," "our," or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our platform services. Please read this policy carefully. If you disagree with its terms, please discontinue use of our platform.`,
  },
  {
    id: 'information-collected',
    title: '2. Information We Collect',
    content: [
      'Personal Identification Information: Name, email address, phone number, and date of birth provided during registration.',
      'Payment Information: Credit card details, billing address, and transaction history. Payment data is processed through secure third-party processors and we do not store full card numbers.',
      'Profile Information: Profile photo, bio, spiritual preferences, and communication preferences you choose to add.',
      'Session Data: Records of sessions booked, session duration, session transcripts (where applicable), and advisor ratings and reviews.',
      'Usage Data: IP address, browser type, operating system, referring URLs, pages visited, time spent on pages, and clickstream data collected automatically via cookies and similar technologies.',
      'Device Information: Device type, unique device identifiers, and mobile network information.',
      'Communications: Messages sent through our platform, support tickets, and correspondence with our team.',
    ],
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    content: [
      'To create and manage your account and provide access to our services.',
      'To process payments and manage your WhiteStellar wallet.',
      'To connect you with advisors and facilitate live sessions.',
      'To send transactional communications including booking confirmations, receipts, and session reminders.',
      'To send marketing communications where you have opted in (you may opt out at any time).',
      'To improve our platform, personalize your experience, and develop new features.',
      'To detect, prevent, and address fraud, security breaches, and violations of our Terms of Service.',
      'To comply with applicable legal obligations and respond to lawful government requests.',
      'To conduct research and analytics to understand how our services are used.',
    ],
  },
  {
    id: 'legal-basis',
    title: '4. Legal Basis for Processing (GDPR)',
    content: `If you are located in the European Economic Area (EEA), we process your personal data under the following legal bases: (a) Contract Performance — processing necessary to provide the services you have requested; (b) Legitimate Interests — to improve our platform, prevent fraud, and ensure security; (c) Consent — where you have explicitly consented, such as for marketing communications; and (d) Legal Obligation — where we are required to process your data to comply with the law.`,
  },
  {
    id: 'sharing',
    title: '5. How We Share Your Information',
    content: [
      'With Advisors: Your first name and general location (city/country) may be visible to advisors during sessions. Full personal details are never shared.',
      'Service Providers: We share data with third-party vendors who assist us with payment processing, cloud hosting, analytics, email delivery, and customer support. These parties are contractually bound to protect your data.',
      'Business Transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction. You will be notified via email and a prominent notice on our site.',
      'Legal Compliance: We may disclose your information if required by law, subpoena, or government request, or if we believe disclosure is necessary to protect the rights, property, or safety of WhiteStellar, our users, or the public.',
      'With Your Consent: We may share your information with third parties when you give us explicit consent to do so.',
    ],
  },
  {
    id: 'cookies',
    title: '6. Cookies and Tracking Technologies',
    content: `We use cookies, web beacons, and similar tracking technologies to collect usage data, remember your preferences, and improve your experience. Cookies are small text files placed on your device. You can control cookie settings through your browser preferences, although disabling cookies may affect the functionality of certain features. We use both session cookies (which expire when you close your browser) and persistent cookies (which remain until deleted or expired). We also use third-party analytics tools including Google Analytics, which has its own privacy policy.`,
  },
  {
    id: 'data-security',
    title: '7. Data Security',
    content: `We implement industry-standard technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include SSL/TLS encryption for all data in transit, AES-256 encryption for data at rest, regular security audits and penetration testing, strict access controls and multi-factor authentication for internal systems, and employee training on data protection. However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security, and you use the platform at your own risk.`,
  },
  {
    id: 'data-retention',
    title: '8. Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required by law to retain certain records (such as financial transaction data, which may be retained for up to 7 years). Session transcripts and advisor review data may be retained in anonymized form for quality assurance purposes.`,
  },
  {
    id: 'your-rights',
    title: '9. Your Privacy Rights',
    content: [
      'Right to Access: You can request a copy of the personal data we hold about you at any time.',
      'Right to Rectification: You can correct inaccurate or incomplete information in your account settings or by contacting us.',
      'Right to Erasure: You can request deletion of your personal data. Some data may be retained where required by law.',
      'Right to Restrict Processing: You can ask us to limit how we use your data in certain circumstances.',
      'Right to Data Portability: You can request your data in a structured, machine-readable format.',
      'Right to Object: You can object to processing based on legitimate interests, including direct marketing.',
      'Right to Withdraw Consent: Where processing is based on consent, you can withdraw it at any time.',
      'Right to Lodge a Complaint: EU/EEA residents may lodge a complaint with their local data protection authority.',
    ],
  },
  {
    id: 'children',
    title: '10. Children\'s Privacy',
    content: `Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that a child under 18 has provided us with personal information, we will take steps to delete such information promptly. If you believe a child has provided us with personal information, please contact us immediately at ${CONTACT_EMAIL}.`,
  },
  {
    id: 'third-party',
    title: '11. Third-Party Links and Services',
    content: `Our platform may contain links to third-party websites, social media platforms, or services that are not owned or controlled by WhiteStellar. This Privacy Policy does not apply to those third-party services. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites. We encourage you to review the privacy policies of every site you visit.`,
  },
  {
    id: 'international',
    title: '12. International Data Transfers',
    content: `WhiteStellar operates globally and your information may be transferred to and stored on servers located outside your country of residence, including in the United States and European Union. When we transfer data from the EEA to countries without adequate data protection laws, we use appropriate safeguards such as Standard Contractual Clauses approved by the European Commission.`,
  },
  {
    id: 'california',
    title: '13. California Privacy Rights (CCPA)',
    content: `If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA): the right to know what personal information we collect and how it is used; the right to delete your personal information; the right to opt out of the sale of your personal information (note: WhiteStellar does not sell personal information); and the right to non-discrimination for exercising your CCPA rights. To exercise these rights, contact us at ${CONTACT_EMAIL}.`,
  },
  {
    id: 'changes',
    title: '14. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will notify you by updating the "Last Updated" date at the top of this policy and, where required by law, by sending an email notification or displaying a prominent notice on our platform. We encourage you to review this policy periodically.`,
  },
  {
    id: 'contact',
    title: '15. Contact Us',
    content: `If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection team at:\n\nWhiteStellar Privacy Team\nEmail: ${CONTACT_EMAIL}\n\nWe aim to respond to all privacy-related inquiries within 5 business days.`,
  },
]

// ─── Component ────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF' }}>

      {/* ── Header ── */}
      <section style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,60,180,0.14) 0%, transparent 60%)',
        padding: '64px 24px 48px',
        textAlign: 'center',
        borderBottom: '1px solid #1E2D45',
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '34px', fontWeight: 700, marginBottom: '10px',
        }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px' }}>
          Last updated: <span style={{ color: '#C9A84C' }}>{UPDATED_DATE}</span>
        </p>
      </section>

      {/* ── Body ── */}
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '48px 24px 80px', display: 'flex', gap: '48px', alignItems: 'flex-start' }}>

        {/* Table of Contents — sticky sidebar */}
        <aside
          style={{
            width: '220px', flexShrink: 0,
            position: 'sticky', top: '88px',
            display: 'none',
          }}
          className="hidden lg:block"
        >
          <p style={{ color: '#4B5563', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>
            Contents
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', padding: '5px 0',
                  color: '#8B9BB4', fontSize: '12px', lineHeight: 1.4,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C9A84C' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#8B9BB4' }}
              >
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Intro notice */}
          <div style={{
            background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '12px', padding: '16px 20px', marginBottom: '40px',
          }}>
            <p style={{ color: '#C9A84C', fontSize: '13px', lineHeight: 1.7 }}>
              This Privacy Policy describes how WhiteStellar collects, uses, and protects your information.
              By using our platform, you agree to the practices described herein. For questions, email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#C9A84C', textDecoration: 'underline' }}>
                {CONTACT_EMAIL}
              </a>.
            </p>
          </div>

          {SECTIONS.map(section => (
            <section
              key={section.id}
              id={section.id}
              style={{ marginBottom: '40px', scrollMarginTop: '96px' }}
            >
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px', fontWeight: 700,
                color: '#F0F4FF', marginBottom: '14px',
                paddingBottom: '10px', borderBottom: '1px solid #1E2D45',
              }}>
                {section.title}
              </h2>

              {Array.isArray(section.content) ? (
                <ul style={{ padding: '0 0 0 4px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {section.content.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#C9A84C', marginTop: '4px', flexShrink: 0, fontSize: '10px' }}>✦</span>
                      <p style={{ color: '#8B9BB4', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>{item}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>
                  {section.content.split('\n').map((paragraph, i) => (
                    paragraph.trim() ? (
                      <p key={i} style={{ color: '#8B9BB4', fontSize: '14px', lineHeight: 1.8, marginBottom: '10px' }}>
                        {paragraph}
                      </p>
                    ) : (
                      <div key={i} style={{ height: '8px' }} />
                    )
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Footer note */}
          <div style={{
            background: '#0D1221', border: '1px solid #1E2D45',
            borderRadius: '12px', padding: '20px 24px', marginTop: '48px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#8B9BB4', fontSize: '13px' }}>
              Questions about this policy? Contact us at{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                style={{ color: '#C9A84C', textDecoration: 'none' }}
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
