// ============================================================
// WhiteStellar — Articles Data
// src/data/articles.ts
// ============================================================

export interface Article {
  slug: string
  title: string
  subtitle: string
  category: string
  categorySlug: string
  author: string
  authorAvatar: string
  publishedAt: string   // ISO date string
  readTime: number      // minutes
  coverImage: string
  excerpt: string
  body: string          // HTML-like paragraphs separated by \n\n
}

export const ARTICLES: Article[] = [
  {
    slug: 'what-your-rising-sign-reveals',
    title: 'What Your Rising Sign Actually Reveals About You',
    subtitle: 'Beyond the sun sign: why your ascendant shapes every first impression',
    category: 'Astrology',
    categorySlug: 'astrology',
    author: 'Luna Starweaver',
    authorAvatar: 'https://i.pravatar.cc/150?img=47',
    publishedAt: '2024-11-15',
    readTime: 6,
    coverImage: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
    excerpt: "Your sun sign gets all the attention, but astrologers argue that your rising sign is the real director of your life's first act — and it shapes everything from your appearance to your destiny.",
    body: `Your rising sign, also called the Ascendant, is the zodiac sign that was rising on the eastern horizon at the exact moment you were born. While your sun sign describes your core identity and your moon sign governs your emotional world, the rising sign acts as the mask you wear — the first impression you make on every person who enters your life.

Think of it this way: if you were a movie, your sun sign would be the director, your moon sign would be the cinematography, and your rising sign would be the opening scene. It's what the audience sees first, and it colors everything that follows.

**Why the Rising Sign Matters More Than You Think**

Many people feel that their sun sign description doesn't quite fit them. An Aquarius who seems traditionally romantic, a Capricorn who's the life of the party — these apparent contradictions often dissolve when we look at the rising sign. A Capricorn with Libra rising will soften their ambition with charm and a deep appreciation for beauty and partnership.

The Ascendant also rules the First House in your natal chart — the house of self, physical appearance, and how you project yourself into the world. This is why two people born on the same day can look and behave so differently. Their sun signs are identical, but their rising signs — determined by birth time and place — can be completely opposite.

**How to Find Your Rising Sign**

To calculate your rising sign accurately, you need three things: your birth date, your birth time (as precise as possible), and your birth location. This is why many astrologers consider the birth time the most important piece of information in a reading. Even a 15-minute difference can shift the Ascendant into a different sign entirely.

If you don't know your birth time, there are techniques astrologers use to "rectify" the chart — working backwards from significant life events to narrow down the likely Ascendant. It's a complex process, but one that can be illuminating.

**The Twelve Ascendants at a Glance**

Aries rising people tend to come across as bold, direct, and energetic — they walk into a room as if they own it. Taurus rising individuals project groundedness and sensuality; people immediately trust them. Gemini rising people are witty, quick, and hard to pin down — you never know quite what to expect. Cancer rising people emanate warmth and nurturing energy; strangers feel comfortable confiding in them almost immediately.

Leo rising radiates confidence and magnetism — there's something regal about their bearing that draws eyes. Virgo rising individuals seem precise, observant, and quietly capable. Libra rising people are graceful and diplomatic; they have a natural beauty and an innate sense of fairness. Scorpio rising projects intensity and depth — they rarely reveal what they're truly thinking.

Sagittarius rising brings an adventurous, philosophical energy. Capricorn rising individuals seem older and more serious than they may actually be; they exude authority. Aquarius rising people come across as unique, a little eccentric, and ahead of their time. Pisces rising individuals have a dreamy, ethereal quality — as if they're not quite of this world.

**Integrating Sun, Moon, and Rising**

The richness of astrology lies in understanding how these three placements interact. A fiery Aries sun might be tempered by a Capricorn moon (giving emotional reserve and discipline) and a Pisces rising (presenting the world a soft, compassionate exterior). Reading someone's chart is like reading a story — each placement adds nuance, texture, and complexity.

If you're curious about your own rising sign and how it weaves through your chart, consider scheduling a reading with one of our certified astrologers. They can walk you through your entire natal chart and show you how these energies play out in your actual life — past, present, and future.`,
  },
  {
    slug: 'tarot-for-beginners-guide',
    title: 'Tarot for Beginners: A Practical Guide to Reading the Cards',
    subtitle: 'From the Major Arcana to your first spread — everything you need to start',
    category: 'Tarot',
    categorySlug: 'tarot',
    author: 'Marcus Veil',
    authorAvatar: 'https://i.pravatar.cc/150?img=68',
    publishedAt: '2024-11-08',
    readTime: 8,
    coverImage: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800',
    excerpt: 'The 78-card tarot deck has guided seekers for centuries. Here is everything a beginner needs to understand the cards, the spreads, and how to begin developing an intuitive relationship with the deck.',
    body: `Tarot is not fortune-telling. That's the first thing most experienced readers want new practitioners to understand. It is a system of symbolic mirrors — a tool for reflection, insight, and accessing the deeper layers of your own intuition. The cards don't predict a fixed future; they illuminate the energies and patterns at work in your life right now, and offer possibilities for what could unfold.

A standard tarot deck contains 78 cards divided into two main sections: the Major Arcana (22 cards) and the Minor Arcana (56 cards). Understanding the structure is the foundation of everything.

**The Major Arcana**

The 22 Major Arcana cards represent significant life themes, archetypal forces, and soul-level lessons. When these cards appear in a reading, they carry extra weight — they're signaling something important and often karmic. The journey through the Major Arcana, known as the Fool's Journey, tells the story of human experience from innocence (The Fool) to enlightenment (The World).

Key cards to know: The High Priestess represents intuition and mystery. The Wheel of Fortune speaks to cycles and fate. The Tower signals sudden, necessary change. The Star offers hope after darkness. The Moon reveals illusions and the subconscious. The Sun brings clarity and vitality.

**The Minor Arcana**

The 56 Minor Arcana cards are divided into four suits — Wands, Cups, Swords, and Pentacles — each corresponding to one of the four classical elements. Wands (Fire) represent passion, creativity, and career. Cups (Water) deal with emotions, relationships, and intuition. Swords (Air) address thought, conflict, and communication. Pentacles (Earth) speak to material matters, finances, and the physical world.

Each suit runs from Ace through Ten, plus four Court Cards (Page, Knight, Queen, King). The numerological meaning of each number applies across all suits: Aces represent new beginnings, Fives represent conflict or challenge, Tens represent completion.

**Choosing Your Deck**

There are hundreds of tarot decks available, ranging from the classic Rider-Waite-Smith to modern artistic interpretations. For beginners, it's generally recommended to start with the Rider-Waite or a deck closely based on its imagery, since most books and resources use that symbolism as a reference. Choose a deck that resonates visually with you — you'll be spending a lot of time with these images.

**Your First Spread: The Three-Card Pull**

Before diving into complex spreads, begin with a simple three-card pull. Shuffle the deck while holding a question or intention in mind. Draw three cards and lay them left to right. The positions can represent: Past / Present / Future, or Situation / Action / Outcome, or Mind / Body / Spirit.

Don't worry about memorizing all 78 meanings right away. Start by spending time with one card each day. Look at the imagery. What story does it tell? What feelings does it evoke? The relationship between a reader and their deck is deeply personal — it develops over time.

**Developing Your Intuition**

The most important skill in tarot reading is not memorization — it's trust. Trust in your first impressions. Trust in the images, symbols, and feelings that arise. The "correct" meaning of a card is always the one that rings true in context.

Keep a tarot journal. Write down the cards you draw each day, the question you asked, and what you intuitively felt. Over time, you'll notice patterns. You'll start to see how the cards speak to you specifically, in your own symbolic language.

If you feel ready to go deeper, a reading with an experienced tarot advisor can accelerate your understanding enormously. Having someone interpret your cards with seasoned skill — and explain the reasoning behind each interpretation — is one of the fastest ways to learn.`,
  },
  {
    slug: 'signs-soulmate-relationship',
    title: "7 Signs You've Found a Soulmate Connection",
    subtitle: "Not every deep relationship is a soulmate bond — here's how to tell the difference",
    category: 'Love & Relationships',
    categorySlug: 'love-relationships',
    author: 'Celestine Ora',
    authorAvatar: 'https://i.pravatar.cc/150?img=44',
    publishedAt: '2024-10-29',
    readTime: 5,
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    excerpt: "Soulmates aren't just a romantic myth — they're a real and recognizable phenomenon that leaves specific energetic and emotional signatures. Here are seven signs that you may have found one.",
    body: `The word "soulmate" has been romanticized to the point of cliché, but beneath the greeting-card gloss lies a genuinely profound concept. In spiritual traditions across the world — from Hindu philosophy's concept of kindred spirits, to the Platonic notion of two halves of a whole — the idea of soulmate connections is ancient and cross-cultural. So what does it actually feel like to meet one?

**1. An Immediate Sense of Recognition**

Meeting a soulmate rarely feels like meeting a stranger. Most people describe an uncanny sense of familiarity — a "have we met before?" sensation that defies rational explanation. Psychics and spiritual practitioners sometimes explain this as recognition from past lives. Whether or not you hold that belief, the feeling itself is distinctive and worth paying attention to.

**2. Effortless Depth**

Conversations with a soulmate tend to move quickly past small talk into meaningful territory. You find yourselves exploring ideas, vulnerabilities, and truths that usually take months or years to reach. The depth emerges naturally, almost urgently, as if there's an unspoken mutual understanding that there's no time for surface exchanges.

**3. Mirroring and Growth**

Soulmate relationships are not always comfortable — in fact, they're often precisely the opposite. A soulmate holds up a mirror to your most challenging aspects. They trigger your wounds not to harm you, but because healing those wounds is part of your shared spiritual contract. If a relationship is pushing you toward your deepest growth, that's a significant sign.

**4. Uncanny Timing and Synchronicities**

The circumstances surrounding a soulmate meeting are often extraordinary. Meeting at an unexpected moment, at a place you almost didn't go, through a chain of events that seems too improbable to be coincidence — these synchronicities are hallmarks of a soulmate connection. The universe, as it were, conspired to bring you together.

**5. Telepathic Understanding**

You finish each other's sentences. You text simultaneously. You think of them and they call. This kind of intuitive attunement goes beyond what ordinary friendship or love typically produces. It suggests an energetic resonance operating beneath the level of conscious communication.

**6. A Sense of Purpose**

There's often a feeling that your meeting had a reason — that you were brought together to accomplish something, learn something, or heal something together. This sense of shared purpose is one of the most spiritually significant aspects of a soulmate connection.

**7. Unconditional Acceptance**

Perhaps the most definitive sign: you feel seen. Not the curated, best-version-of-yourself seen, but truly, messily, entirely seen — and accepted anyway. That kind of witnessing is rare and precious, and it's at the core of what makes a soulmate different from any other relationship.

**A Word of Caution**

Not all soulmate connections are meant to be lifelong romantic partnerships. Some are catalysts — they enter for a season, shake everything loose, and leave you fundamentally changed. Others are enduring companions. Recognizing the type of soulmate connection you're experiencing is part of the spiritual work.

If you're navigating a relationship that has soulmate qualities and aren't sure how to interpret it, speaking with a spiritual advisor can provide clarity. The energy of a connection — its purpose, its trajectory, its lessons — is something that experienced empaths and psychics can often read with remarkable precision.`,
  },
  {
    slug: 'mercury-retrograde-survival-guide',
    title: 'Mercury Retrograde: The Complete Survival Guide',
    subtitle: 'What actually happens during retrograde — and how to use it to your advantage',
    category: 'Astrology',
    categorySlug: 'astrology',
    author: 'Raven Nightshade',
    authorAvatar: 'https://i.pravatar.cc/150?img=32',
    publishedAt: '2024-10-18',
    readTime: 7,
    coverImage: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800',
    excerpt: "Three to four times a year, Mercury appears to move backwards in the sky — and communication, technology, and travel go haywire. Here's the truth behind the phenomenon and how to survive it.",
    body: `Every few months, the phrase "Mercury is in retrograde" starts trending on social media and people start blaming their communication breakdowns, tech glitches, and delayed flights on the cosmos. But what's actually happening astronomically, and how much of the chaos is real?

**The Astronomy**

Mercury retrograde is an optical illusion. Mercury doesn't actually reverse its orbit — no planet does. What happens is that Mercury, the fastest-moving planet in our solar system, periodically appears to move backward relative to Earth because of the difference in orbital speeds. Imagine two cars on a highway: when the faster car passes the slower one, the slower car briefly appears to move backward. That's Mercury retrograde.

From Earth's perspective, Mercury appears to move backward for approximately 21 days, three to four times a year. The shadow periods — the two to three weeks before and after the retrograde — are considered part of the influence by many astrologers.

**Why Mercury Rules Communication**

In astrology, Mercury governs communication, information, technology, travel, and commerce. It's associated with how we think, how we speak, how we process information, and how we get from one place to another. When Mercury goes retrograde, all of these areas are said to be subject to disruption, delay, and miscommunication.

Astrologers have noted patterns that appear to align with retrograde periods: contracts that fall through, emails going to the wrong person, technology glitching at critical moments, old friends or lovers reappearing, travel plans going sideways. Whether or not you attribute these to Mercury, the pattern is consistent enough that many practitioners adjust their behavior accordingly.

**What to Avoid During Retrograde**

The traditional advice: don't sign contracts if you can help it. Don't launch new projects or make major purchases — especially of technology or vehicles. Don't make irreversible decisions. Avoid miscommunication by being extra explicit and confirming important conversations in writing.

This doesn't mean you should hide under your bed for three weeks. Life goes on. The advice is about adding extra care, double-checking communications, and building in buffers for delays. If you absolutely must sign a contract or launch something, triple-check everything.

**What Retrograde Is Actually Good For**

Here's what most Mercury retrograde articles don't tell you: retrograde periods are actually powerful times for certain activities. Specifically, anything starting with "re-" is favored: review, revise, reflect, reconnect, research, rest, reorganize, reconcile.

Mercury retrograde is an excellent time to revisit old projects, reconnect with people from your past (that ex texting you might not be a coincidence), go back over plans you've had to table, or take time to reflect on the direction your life is heading. It's a time for internal processing rather than external launching.

**Retrograde in Each Sign**

The zodiac sign Mercury is retrograding through adds nuance to the experience. Mercury retrograde in Gemini (its home sign) tends to produce communication chaos and scattered thinking. In Virgo (its other home), it brings hyper-critical thinking and health anxieties. In Scorpio, it stirs up secrets and hidden agendas. In Pisces, it blurs boundaries and invites confusion but also spiritual insight.

**Working With the Retrograde, Not Against It**

The most empowering shift you can make around Mercury retrograde is to stop seeing it as something that happens to you and start seeing it as a rhythmic invitation. Every retrograde is an opportunity to slow down, look backward, and integrate what you've learned. In a culture obsessed with forward momentum, that's genuinely valuable.

If you want guidance on how Mercury retrograde is affecting your specific chart — and how to navigate it based on your natal placements — an astrology reading can give you personalized insight that goes far beyond the general advice.`,
  },
  {
    slug: 'dream-interpretation-symbols',
    title: 'The Most Common Dream Symbols and What They Mean',
    subtitle: 'A practical guide to decoding the messages your subconscious sends every night',
    category: 'Dream Interpretation',
    categorySlug: 'dream-interpretation',
    author: 'Iris Moonwell',
    authorAvatar: 'https://i.pravatar.cc/150?img=29',
    publishedAt: '2024-10-05',
    readTime: 6,
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    excerpt: 'Dreams speak in symbols — water, falling, flying, teeth. Understanding the archetypal language of your sleeping mind is a powerful tool for self-knowledge and spiritual growth.',
    body: `Every night, while your body rests, your subconscious mind works. It processes the day's events, confronts unresolved emotions, rehearses scenarios, and communicates through a rich, symbolic language that is both personal and universal. Learning to decode that language is one of the most powerful tools for self-understanding available.

Dream interpretation has roots in virtually every ancient civilization — Mesopotamian dream tablets, Egyptian papyri, the dream-books of Ancient Greece, and the sophisticated interpretive systems developed by Jungian psychologists in the 20th century all testify to how central dreams have always been to human self-knowledge.

**Water**

Water is one of the most universal dream symbols, and its meaning shifts dramatically based on context. Calm, clear water typically represents emotional peace, clarity, or spiritual depth. Turbulent or murky water suggests emotional turmoil, confusion, or unresolved feelings. Drowning often indicates feeling overwhelmed — by emotions, responsibilities, or a situation in waking life. Swimming confidently suggests you are navigating your emotional world with ease.

Ocean dreams often carry spiritual significance — the vastness of the unconscious, the connection to something greater than yourself. A shallow pool might represent surface-level awareness or relationships that lack depth.

**Falling**

Falling dreams are among the most common reported across cultures. They often occur during the hypnagogic state — the transition between wakefulness and sleep — and are frequently accompanied by a sudden jerking sensation. In symbolic terms, falling can represent a fear of failure, loss of control, or anxiety about a situation where you feel unsupported. Interestingly, allowing yourself to fall and land in a dream — rather than waking up before you hit the ground — is considered by many dream workers to be a positive sign of surrendering control and trusting the process.

**Flying**

Flying dreams are generally positive, associated with freedom, perspective, and rising above limitations. The quality of the flying matters: soaring effortlessly suggests confidence and a sense of possibility; struggling to stay airborne might indicate efforts to rise above a challenge; flying low to the ground can represent a desire for change without the courage to fully commit.

**Teeth Falling Out**

This is one of the most frequently reported dreams across cultures, and interpretations vary. Common psychological readings suggest teeth dreams are connected to anxiety about appearance, communication, or how we present ourselves to the world. Teeth are also associated with power — in nature, an animal's teeth determine its ability to survive. Losing them in a dream may signal feeling powerless or vulnerable in some area of life.

**Being Chased**

Chase dreams are almost always about avoidance — some emotion, situation, or aspect of yourself that you're running from rather than confronting. The nature of the pursuer is revealing: a shadowy figure might represent your own shadow (repressed aspects of yourself); a monster might be an exaggerated fear; a person from your past might represent unresolved issues with them.

**Houses and Rooms**

Dreaming of a house — particularly your childhood home — is a classic symbol of the self. The different rooms represent different aspects of your psyche. Discovering a new room you didn't know existed often suggests a newly emerging aspect of self, a talent being uncovered, or an area of life opening up. A crumbling or flooding house may indicate stress about your foundation or sense of self.

**Keeping a Dream Journal**

The single most important practice for anyone interested in dream work is keeping a journal by the bed. Write down your dreams immediately upon waking — before you check your phone, before you get up, before the images dissolve. Even fragments are valuable. Over time, patterns emerge: recurring symbols, recurring settings, recurring emotions.

If you're experiencing vivid, recurring, or particularly significant dreams that you'd like help interpreting, a dream interpretation reading with a specialist can provide insight that goes far beyond symbol dictionaries — connecting your dreams to the specific patterns and questions of your life.`,
  },
  {
    slug: 'how-psychic-readings-work',
    title: 'How Psychic Readings Actually Work — The Science and Spirituality',
    subtitle: 'A clear-eyed exploration of what psychics do, how they do it, and what to expect',
    category: 'Psychic Readings',
    categorySlug: 'psychic-readings',
    author: 'Solomon Grey',
    authorAvatar: 'https://i.pravatar.cc/150?img=57',
    publishedAt: '2024-09-22',
    readTime: 7,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    excerpt: 'What do psychics actually perceive? How do readings work? What should you expect from a quality session? This guide separates fact from fiction and prepares you to get the most from a reading.',
    body: `The word "psychic" carries a lot of cultural baggage — images of crystal balls, velvet curtains, and theatrical pronouncements. The reality of genuine psychic reading is considerably more subtle, more personal, and more consistent with certain fringe areas of scientific investigation than most people realize.

**What Are Psychic Abilities?**

Psychic abilities — also called extrasensory perception (ESP) or psi phenomena — refer to the purported ability to perceive information beyond the conventional five senses. Research institutions including Princeton's PEAR Lab, the Rhine Research Center, and the Stanford Research Institute have conducted experiments over decades attempting to quantify these phenomena. Results have been mixed but consistently enough above chance to keep serious researchers engaged.

From a spiritual perspective, psychic ability is understood as an extension of natural human intuition — the capacity to perceive subtle energetic information that is theoretically available to everyone but developed to a higher degree in some individuals.

**The Main Clair Senses**

Most psychics describe their ability in terms of one or more "clair" senses — extrasensory extensions of the five physical senses.

Clairvoyance ("clear seeing") refers to visual perception — images, scenes, or symbols appearing in the mind's eye. Clairaudience ("clear hearing") involves receiving information as sounds, words, or music. Clairsentience ("clear feeling") is perhaps the most common — the psychic feels the emotions, physical sensations, or energies of another person. Claircognizance ("clear knowing") is the direct download of information without knowing how or why you know it.

Most practicing psychics use a combination of these senses, and the dominant clair often differs from person to person.

**What Happens During a Reading?**

A quality psychic reading begins with the practitioner tuning into the client's energy. This might involve looking at a photo, hearing the client's voice, or simply focusing on their name and intention. From this energetic attunement, information begins to flow — impressions, images, feelings, or words that the psychic shares with the client.

The best readings are collaborative. The psychic shares what they perceive, and the client confirms or clarifies. This is not "fishing for information" — it's calibration. Even the most gifted psychic is working with impressions that require context to interpret correctly. A symbol of a red car might mean something literal (a red car), or it might be symbolic (a warning about speed, or a specific memory associated with a red car).

**What to Expect and What Not to Expect**

A responsible psychic reading will offer insight, possibility, and reflection — not absolute certainties about fixed futures. If a reader claims 100% accuracy or guarantees specific outcomes, approach with caution. The future is dynamic and responsive to free will. What a psychic can often perceive are the current trajectories, the energies at play, the patterns that are operating beneath the surface.

Expect to feel genuinely seen. Quality readings often surface information that the client hadn't explicitly shared — details about a relationship, a situation, an emotion — that confirm the reader is genuinely accessing something beyond the ordinary. This isn't performance; it's the actual mechanism of psychic perception working.

**Getting the Most from Your Reading**

Come with an open mind and a genuine question. Readings where the client actively engages, provides feedback, and asks follow-up questions tend to be far richer than those where the client sits back expecting to be impressed.

It's also worth noting that not every reading will be equally powerful. Factors like the client's own openness, the complexity of the situation, and the energetic conditions of the day all influence the flow of information. Even exceptional psychics have ordinary readings. The value lies in the pattern of insight over time.

If you're curious about trying a psychic reading for the first time, our platform allows you to browse reader profiles, review genuine client feedback, and choose the advisor whose energy resonates with you — with the first three minutes free.`,
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug)
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return ARTICLES.filter(a => a.categorySlug === categorySlug)
}
