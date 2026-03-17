// ============================================================
// WhiteStellar — Dummy Data
// src/data/advisors.ts
// ============================================================

// ─── ENUMS & TYPES ───────────────────────────────────────────

export type SessionType = "chat" | "audio" | "video";
export type AdvisorStatus = "online" | "offline" | "busy";
export type AccountStatus = "active" | "inactive" | "pending" | "frozen";
export type UserType = "client" | "advisor" | "superadmin";
export type WithdrawalMethod = "paypal" | "payoneer" | "bank";
export type ConversationType = "chat" | "audio" | "video";
export type SessionStatus = "completed" | "cancelled" | "in_progress";
export type TransactionType = "deposit" | "session_charge" | "refund" | "payout";

// ─── CATEGORIES ──────────────────────────────────────────────

export interface Category {
  id: number;
  slug: string;
  title: string;
  icon: string; // lucide icon name
  description: string;
  advisorCount: number;
}

export const CATEGORIES: Category[] = [
  {
    id: 1,
    slug: "psychic-readings",
    title: "Psychic Readings",
    icon: "Eye",
    description: "Gain deep insights beyond the physical world",
    advisorCount: 142,
  },
  {
    id: 2,
    slug: "love-relationships",
    title: "Love & Relationships",
    icon: "Heart",
    description: "Navigate matters of the heart with clarity",
    advisorCount: 98,
  },
  {
    id: 3,
    slug: "tarot",
    title: "Tarot Readings",
    icon: "Layers",
    description: "Unlock hidden truths through the cards",
    advisorCount: 76,
  },
  {
    id: 4,
    slug: "astrology",
    title: "Astrology",
    icon: "Star",
    description: "Discover how the stars shape your path",
    advisorCount: 63,
  },
  {
    id: 5,
    slug: "spiritual",
    title: "Spiritual Guidance",
    icon: "Sparkles",
    description: "Embark on a journey of self-discovery",
    advisorCount: 54,
  },
  {
    id: 6,
    slug: "dream-interpretation",
    title: "Dream Interpretation",
    icon: "Moon",
    description: "Decode the messages in your dreams",
    advisorCount: 38,
  },
  {
    id: 7,
    slug: "career-finance",
    title: "Career & Finance",
    icon: "TrendingUp",
    description: "Find clarity in your professional journey",
    advisorCount: 45,
  },
  {
    id: 8,
    slug: "mediumship",
    title: "Mediumship",
    icon: "Zap",
    description: "Connect with loved ones who have passed",
    advisorCount: 29,
  },
];

// ─── SPECIALIZATIONS ─────────────────────────────────────────

export interface Specialization {
  id: number;
  title: string;
  categoryId: number;
}

export const SPECIALIZATIONS: Specialization[] = [
  { id: 1, title: "Love & Relationships", categoryId: 2 },
  { id: 2, title: "Soulmates", categoryId: 2 },
  { id: 3, title: "Breakups & Divorce", categoryId: 2 },
  { id: 4, title: "Career & Work", categoryId: 7 },
  { id: 5, title: "Money & Prosperity", categoryId: 7 },
  { id: 6, title: "Life Path & Destiny", categoryId: 1 },
  { id: 7, title: "Past Life", categoryId: 1 },
  { id: 8, title: "Deceased Loved Ones", categoryId: 8 },
  { id: 9, title: "Spirit Guides", categoryId: 5 },
  { id: 10, title: "Energy Healing", categoryId: 5 },
  { id: 11, title: "Chakra Balancing", categoryId: 5 },
  { id: 12, title: "Birth Chart", categoryId: 4 },
  { id: 13, title: "Numerology", categoryId: 4 },
  { id: 14, title: "Celtic Cross", categoryId: 3 },
  { id: 15, title: "Oracle Cards", categoryId: 3 },
];

// ─── SKILLS & METHODS ────────────────────────────────────────

export interface SkillAndMethod {
  id: number;
  title: string;
}

export const SKILLS_AND_METHODS: SkillAndMethod[] = [
  { id: 1, title: "Clairvoyance" },
  { id: 2, title: "Clairsentience" },
  { id: 3, title: "Clairaudience" },
  { id: 4, title: "Empathy" },
  { id: 5, title: "Channeling" },
  { id: 6, title: "Pendulum" },
  { id: 7, title: "Crystal Ball" },
  { id: 8, title: "Runes" },
  { id: 9, title: "Automatic Writing" },
  { id: 10, title: "Remote Viewing" },
];

// ─── LANGUAGES ───────────────────────────────────────────────

export interface Language {
  id: number;
  name: string;
  code: string;
}

export const LANGUAGES: Language[] = [
  { id: 1, name: "English", code: "en" },
  { id: 2, name: "Spanish", code: "es" },
  { id: 3, name: "French", code: "fr" },
  { id: 4, name: "Portuguese", code: "pt" },
  { id: 5, name: "German", code: "de" },
  { id: 6, name: "Italian", code: "it" },
  { id: 7, name: "Hebrew", code: "he" },
  { id: 8, name: "Arabic", code: "ar" },
];

// ─── SESSION PRICING ─────────────────────────────────────────

export interface SessionPricing {
  chat: number | null;   // price per minute in USD
  audio: number | null;
  video: number | null;
}

// ─── RATING & REVIEW ─────────────────────────────────────────

export interface Review {
  id: number;
  advisorId: number;
  clientId: number;
  clientName: string;
  clientAvatar: string;
  rating: number; // 1-5
  comment: string;
  sessionType: ConversationType;
  createdAt: string;
  isApproved: boolean;
}

// ─── ADVISOR PROFILE ─────────────────────────────────────────

export interface Advisor {
  id: number;
  userId: number;
  fullName: string;
  shortBio: string;
  longBio: string;
  avatar: string;
  backgroundImage: string;
  status: AdvisorStatus;
  accountStatus: AccountStatus;
  isTopAdvisor: boolean;
  isNew: boolean;
  languages: Language[];
  categories: Category[];
  specializations: Specialization[];
  skillsAndMethods: SkillAndMethod[];
  sessionTypes: SessionType[];
  pricing: SessionPricing;
  rating: number;
  reviewCount: number;
  totalSessions: number;
  yearsActive: number;
  responseTime: string; // e.g. "~3 min"
  withdrawalMethod: WithdrawalMethod;
  joinedAt: string;
  reviews: Review[];
}

// ─── DUMMY ADVISORS ──────────────────────────────────────────

export const ADVISORS: Advisor[] = [
  {
    id: 1,
    userId: 101,
    fullName: "Luna Starweaver",
    shortBio: "Empathic psychic specializing in love, soul connections & life path guidance.",
    longBio:
      "With over 15 years of experience, Luna channels her natural clairvoyant gifts to bring clarity and healing. Her readings are known for their accuracy and compassionate depth. Luna specializes in matters of the heart but offers insight across all life areas.",
    avatar: "https://i.pravatar.cc/150?img=47",
    backgroundImage: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800",
    status: "online",
    accountStatus: "active",
    isTopAdvisor: true,
    isNew: false,
    languages: [LANGUAGES[0], LANGUAGES[2]],
    categories: [CATEGORIES[0], CATEGORIES[1]],
    specializations: [SPECIALIZATIONS[0], SPECIALIZATIONS[1], SPECIALIZATIONS[5]],
    skillsAndMethods: [SKILLS_AND_METHODS[0], SKILLS_AND_METHODS[3]],
    sessionTypes: ["chat", "audio", "video"],
    pricing: { chat: 3.99, audio: 4.99, video: 5.99 },
    rating: 4.9,
    reviewCount: 1247,
    totalSessions: 3821,
    yearsActive: 15,
    responseTime: "~2 min",
    withdrawalMethod: "paypal",
    joinedAt: "2019-03-12",
    reviews: [
      {
        id: 1,
        advisorId: 1,
        clientId: 201,
        clientName: "Sarah M.",
        clientAvatar: "https://i.pravatar.cc/40?img=5",
        rating: 5,
        comment: "Luna is absolutely incredible. She picked up on details no one could have known. Life-changing reading.",
        sessionType: "video",
        createdAt: "2024-11-15",
        isApproved: true,
      },
      {
        id: 2,
        advisorId: 1,
        clientId: 202,
        clientName: "James T.",
        clientAvatar: "https://i.pravatar.cc/40?img=12",
        rating: 5,
        comment: "Every session with Luna leaves me feeling grounded and clear. She's my go-to advisor.",
        sessionType: "audio",
        createdAt: "2024-10-28",
        isApproved: true,
      },
    ],
  },
  {
    id: 2,
    userId: 102,
    fullName: "Marcus Veil",
    shortBio: "Tarot master & numerologist. Clear, honest guidance for your crossroads moments.",
    longBio:
      "Marcus has been practicing tarot and numerology for 12 years. Known for his direct, no-nonsense approach, he delivers insights without sugarcoating. His clients appreciate his rare combination of logic and intuition.",
    avatar: "https://i.pravatar.cc/150?img=68",
    backgroundImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    status: "online",
    accountStatus: "active",
    isTopAdvisor: true,
    isNew: false,
    languages: [LANGUAGES[0], LANGUAGES[4]],
    categories: [CATEGORIES[2], CATEGORIES[3]],
    specializations: [SPECIALIZATIONS[13], SPECIALIZATIONS[12], SPECIALIZATIONS[3]],
    skillsAndMethods: [SKILLS_AND_METHODS[7], SKILLS_AND_METHODS[8]],
    sessionTypes: ["chat", "audio"],
    pricing: { chat: 2.99, audio: 3.99, video: null },
    rating: 4.8,
    reviewCount: 892,
    totalSessions: 2103,
    yearsActive: 12,
    responseTime: "~5 min",
    withdrawalMethod: "payoneer",
    joinedAt: "2020-07-22",
    reviews: [
      {
        id: 3,
        advisorId: 2,
        clientId: 203,
        clientName: "Elena K.",
        clientAvatar: "https://i.pravatar.cc/40?img=9",
        rating: 5,
        comment: "Marcus is the most accurate tarot reader I've ever consulted. He told me things that happened exactly as he described.",
        sessionType: "chat",
        createdAt: "2024-11-02",
        isApproved: true,
      },
    ],
  },
  {
    id: 3,
    userId: 103,
    fullName: "Celestine Ora",
    shortBio: "Spiritual healer & medium. Bridging the gap between worlds with love and light.",
    longBio:
      "Celestine discovered her mediumship abilities at age 7. Today she uses her gifts to help clients connect with departed loved ones and navigate grief with grace. Her gentle energy creates a safe space for healing.",
    avatar: "https://i.pravatar.cc/150?img=44",
    backgroundImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    status: "busy",
    accountStatus: "active",
    isTopAdvisor: false,
    isNew: false,
    languages: [LANGUAGES[0], LANGUAGES[1]],
    categories: [CATEGORIES[4], CATEGORIES[7]],
    specializations: [SPECIALIZATIONS[7], SPECIALIZATIONS[8], SPECIALIZATIONS[9]],
    skillsAndMethods: [SKILLS_AND_METHODS[4], SKILLS_AND_METHODS[1]],
    sessionTypes: ["audio", "video"],
    pricing: { chat: null, audio: 5.99, video: 7.99 },
    rating: 4.7,
    reviewCount: 634,
    totalSessions: 1456,
    yearsActive: 20,
    responseTime: "~8 min",
    withdrawalMethod: "bank",
    joinedAt: "2018-11-05",
    reviews: [
      {
        id: 4,
        advisorId: 3,
        clientId: 204,
        clientName: "Michael R.",
        clientAvatar: "https://i.pravatar.cc/40?img=15",
        rating: 5,
        comment: "Celestine connected with my mother who passed last year. The details she shared were undeniable. I'm forever grateful.",
        sessionType: "video",
        createdAt: "2024-09-18",
        isApproved: true,
      },
    ],
  },
  {
    id: 4,
    userId: 104,
    fullName: "Raven Nightshade",
    shortBio: "Astrologer & birth chart specialist. Your stars have a story — let's read it.",
    longBio:
      "Raven has studied Western and Vedic astrology for 8 years, combining both traditions to create rich, nuanced readings. She specializes in natal charts, relationship compatibility, and predictive astrology.",
    avatar: "https://i.pravatar.cc/150?img=32",
    backgroundImage: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800",
    status: "online",
    accountStatus: "pending",
    isTopAdvisor: false,
    isNew: true,
    languages: [LANGUAGES[0]],
    categories: [CATEGORIES[3]],
    specializations: [SPECIALIZATIONS[11], SPECIALIZATIONS[12]],
    skillsAndMethods: [SKILLS_AND_METHODS[0]],
    sessionTypes: ["chat", "video"],
    pricing: { chat: 1.99, audio: null, video: 3.99 },
    rating: 4.6,
    reviewCount: 187,
    totalSessions: 412,
    yearsActive: 3,
    responseTime: "~3 min",
    withdrawalMethod: "paypal",
    joinedAt: "2023-01-15",
    reviews: [],
  },
  {
    id: 5,
    userId: 105,
    fullName: "Solomon Grey",
    shortBio: "Clairvoyant & energy healer with a no-nonsense, practical approach.",
    longBio:
      "Solomon combines his natural clairvoyant gifts with energy healing to help clients clear blockages and move forward. His readings are practical, grounded, and action-oriented.",
    avatar: "https://i.pravatar.cc/150?img=57",
    backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    status: "offline",
    accountStatus: "active",
    isTopAdvisor: false,
    isNew: false,
    languages: [LANGUAGES[0], LANGUAGES[3]],
    categories: [CATEGORIES[0], CATEGORIES[4]],
    specializations: [SPECIALIZATIONS[5], SPECIALIZATIONS[9], SPECIALIZATIONS[10]],
    skillsAndMethods: [SKILLS_AND_METHODS[0], SKILLS_AND_METHODS[9]],
    sessionTypes: ["chat", "audio"],
    pricing: { chat: 2.49, audio: 3.49, video: null },
    rating: 4.5,
    reviewCount: 423,
    totalSessions: 987,
    yearsActive: 7,
    responseTime: "~10 min",
    withdrawalMethod: "payoneer",
    joinedAt: "2021-05-30",
    reviews: [],
  },
  {
    id: 6,
    userId: 106,
    fullName: "Iris Moonwell",
    shortBio: "Dream interpreter & past life reader. Unlock the deeper meaning behind your experiences.",
    longBio:
      "Iris has devoted her practice to the exploration of the subconscious. Through dream analysis and past life regression, she helps clients understand recurring patterns and find liberation from them.",
    avatar: "https://i.pravatar.cc/150?img=29",
    backgroundImage: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800",
    status: "online",
    accountStatus: "active",
    isTopAdvisor: true,
    isNew: false,
    languages: [LANGUAGES[0], LANGUAGES[5]],
    categories: [CATEGORIES[5], CATEGORIES[0]],
    specializations: [SPECIALIZATIONS[6], SPECIALIZATIONS[5]],
    skillsAndMethods: [SKILLS_AND_METHODS[8], SKILLS_AND_METHODS[3]],
    sessionTypes: ["chat", "audio", "video"],
    pricing: { chat: 3.49, audio: 4.49, video: 5.49 },
    rating: 4.8,
    reviewCount: 756,
    totalSessions: 1876,
    yearsActive: 11,
    responseTime: "~4 min",
    withdrawalMethod: "paypal",
    joinedAt: "2019-09-20",
    reviews: [],
  },
];

// ─── CLIENT PROFILE ──────────────────────────────────────────

export interface Client {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  avatar: string;
  phone: string;
  country: string;
  walletBalance: number; // in USD
  totalSpent: number;
  totalSessions: number;
  accountStatus: AccountStatus;
  joinedAt: string;
  savedAdvisors: number[]; // advisor IDs
}

export const CLIENTS: Client[] = [
  {
    id: 201,
    userId: 301,
    fullName: "Sarah Mitchell",
    email: "sarah.m@email.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    phone: "+1 555 0101",
    country: "United States",
    walletBalance: 45.00,
    totalSpent: 320.50,
    totalSessions: 28,
    accountStatus: "active",
    joinedAt: "2023-04-10",
    savedAdvisors: [1, 3, 6],
  },
  {
    id: 202,
    userId: 302,
    fullName: "James Torres",
    email: "james.t@email.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    phone: "+1 555 0102",
    country: "United States",
    walletBalance: 12.50,
    totalSpent: 178.00,
    totalSessions: 15,
    accountStatus: "active",
    joinedAt: "2023-08-22",
    savedAdvisors: [1, 2],
  },
  {
    id: 203,
    userId: 303,
    fullName: "Elena Kovacs",
    email: "elena.k@email.com",
    avatar: "https://i.pravatar.cc/150?img=9",
    phone: "+44 7700 900100",
    country: "United Kingdom",
    walletBalance: 0.00,
    totalSpent: 95.00,
    totalSessions: 8,
    accountStatus: "active",
    joinedAt: "2024-01-05",
    savedAdvisors: [2],
  },
];

// ─── SESSIONS ────────────────────────────────────────────────

export interface Session {
  id: number;
  advisorId: number;
  clientId: number;
  advisorName: string;
  clientName: string;
  type: ConversationType;
  status: SessionStatus;
  durationMinutes: number;
  pricePerMinute: number;
  totalCost: number;
  startedAt: string;
  endedAt: string;
  hasReview: boolean;
  notes?: string;
}

export const SESSIONS: Session[] = [
  {
    id: 1001,
    advisorId: 1,
    clientId: 201,
    advisorName: "Luna Starweaver",
    clientName: "Sarah Mitchell",
    type: "video",
    status: "completed",
    durationMinutes: 22,
    pricePerMinute: 5.99,
    totalCost: 131.78,
    startedAt: "2024-11-15T14:30:00Z",
    endedAt: "2024-11-15T14:52:00Z",
    hasReview: true,
    notes: "Client seeking clarity on relationship situation.",
  },
  {
    id: 1002,
    advisorId: 2,
    clientId: 203,
    advisorName: "Marcus Veil",
    clientName: "Elena Kovacs",
    type: "chat",
    status: "completed",
    durationMinutes: 18,
    pricePerMinute: 2.99,
    totalCost: 53.82,
    startedAt: "2024-11-02T10:00:00Z",
    endedAt: "2024-11-02T10:18:00Z",
    hasReview: true,
  },
  {
    id: 1003,
    advisorId: 1,
    clientId: 202,
    advisorName: "Luna Starweaver",
    clientName: "James Torres",
    type: "audio",
    status: "completed",
    durationMinutes: 35,
    pricePerMinute: 4.99,
    totalCost: 174.65,
    startedAt: "2024-10-28T18:00:00Z",
    endedAt: "2024-10-28T18:35:00Z",
    hasReview: true,
  },
  {
    id: 1004,
    advisorId: 3,
    clientId: 201,
    advisorName: "Celestine Ora",
    clientName: "Sarah Mitchell",
    type: "video",
    status: "cancelled",
    durationMinutes: 0,
    pricePerMinute: 7.99,
    totalCost: 0,
    startedAt: "2024-10-20T09:00:00Z",
    endedAt: "2024-10-20T09:00:00Z",
    hasReview: false,
  },
];

// ─── TRANSACTIONS ────────────────────────────────────────────

export interface Transaction {
  id: number;
  clientId: number;
  sessionId?: number;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export const TRANSACTIONS: Transaction[] = [
  {
    id: 5001,
    clientId: 201,
    type: "deposit",
    amount: 50.00,
    balanceBefore: 0,
    balanceAfter: 50.00,
    description: "Wallet top-up via Stripe",
    createdAt: "2024-11-14T12:00:00Z",
  },
  {
    id: 5002,
    clientId: 201,
    sessionId: 1001,
    type: "session_charge",
    amount: -131.78,
    balanceBefore: 176.78,
    balanceAfter: 45.00,
    description: "Video session with Luna Starweaver (22 min)",
    createdAt: "2024-11-15T14:52:00Z",
  },
  {
    id: 5003,
    clientId: 202,
    type: "deposit",
    amount: 100.00,
    balanceBefore: 0,
    balanceAfter: 100.00,
    description: "Wallet top-up via Stripe",
    createdAt: "2024-10-27T08:00:00Z",
  },
];

// ─── NOTIFICATIONS ───────────────────────────────────────────

export type NotificationType =
  | "session_request"
  | "session_accepted"
  | "session_rejected"
  | "session_cancelled"
  | "advisor_online"
  | "new_review"
  | "payout_processed"
  | "advisor_review_response";

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: 9001,
    userId: 201,
    type: "advisor_online",
    title: "Advisor is Online",
    message: "Luna Starweaver is now available for sessions.",
    isRead: false,
    createdAt: "2024-11-16T09:00:00Z",
    metadata: { advisorId: 1 },
  },
  {
    id: 9002,
    userId: 101,
    type: "new_review",
    title: "New Review Received",
    message: "Sarah Mitchell left you a 5-star review.",
    isRead: true,
    createdAt: "2024-11-15T15:00:00Z",
    metadata: { reviewId: 1 },
  },
];

// ─── SUPER ADMIN DASHBOARD ───────────────────────────────────

export interface DashboardStats {
  totalAdvisors: number;
  activeAdvisors: number;
  pendingAdvisors: number;
  totalClients: number;
  activeClients: number;
  totalSessionsToday: number;
  totalSessionsThisMonth: number;
  revenueToday: number;
  revenueThisMonth: number;
  platformCommissionRate: number; // percentage e.g. 30
}

export const DASHBOARD_STATS: DashboardStats = {
  totalAdvisors: 248,
  activeAdvisors: 189,
  pendingAdvisors: 14,
  totalClients: 12847,
  activeClients: 3421,
  totalSessionsToday: 142,
  totalSessionsThisMonth: 3876,
  revenueToday: 2341.50,
  revenueThisMonth: 64320.80,
  platformCommissionRate: 30,
};

export const REVENUE_GRAPH_DATA = [
  { month: "Jun", revenue: 41200, sessions: 2841 },
  { month: "Jul", revenue: 47800, sessions: 3102 },
  { month: "Aug", revenue: 52300, sessions: 3398 },
  { month: "Sep", revenue: 49600, sessions: 3201 },
  { month: "Oct", revenue: 58900, sessions: 3654 },
  { month: "Nov", revenue: 64320, sessions: 3876 },
];

// ─── HERO BANNERS ─────────────────────────────────────────────

export interface HeroBanner {
  id: number;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  backgroundImage: string;
  isActive: boolean;
}

export const HERO_BANNERS: HeroBanner[] = [
  {
    id: 1,
    title: "Find Your Clarity",
    subtitle: "Connect with world-class advisors for guidance on love, life & beyond.",
    ctaText: "Explore Advisors",
    ctaUrl: "/category/psychic-readings",
    backgroundImage: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1600",
    isActive: true,
  },
  {
    id: 2,
    title: "New to WhiteStellar?",
    subtitle: "Get your first 5 minutes free with any advisor.",
    ctaText: "Claim Offer",
    ctaUrl: "/register",
    backgroundImage: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1600",
    isActive: true,
  },
];

// ─── HELPER FUNCTIONS ────────────────────────────────────────

export const getAdvisorById = (id: number): Advisor | undefined =>
  ADVISORS.find((a) => a.id === id);

export const getAdvisorsByCategory = (slug: string): Advisor[] =>
  ADVISORS.filter((a) => a.categories.some((c) => c.slug === slug));

export const getOnlineAdvisors = (): Advisor[] =>
  ADVISORS.filter((a) => a.status === "online");

export const getTopAdvisors = (): Advisor[] =>
  ADVISORS.filter((a) => a.isTopAdvisor);

export const getNewAdvisors = (): Advisor[] =>
  ADVISORS.filter((a) => a.isNew);

export const getClientById = (id: number): Client | undefined =>
  CLIENTS.find((c) => c.id === id);

export const getSessionsByAdvisor = (advisorId: number): Session[] =>
  SESSIONS.filter((s) => s.advisorId === advisorId);

export const getSessionsByClient = (clientId: number): Session[] =>
  SESSIONS.filter((s) => s.clientId === clientId);

export const formatPrice = (price: number | null): string =>
  price !== null ? `$${price.toFixed(2)}/min` : "N/A";

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
