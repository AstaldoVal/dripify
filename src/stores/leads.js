import { ref, computed } from 'vue';

// Lead Stage Enumerations
export const LeadStageGroup = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
};

export const LeadStage = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  ENGAGED: 'ENGAGED',
  GHOSTED: 'GHOSTED',
  NOT_INTERESTED: 'NOT_INTERESTED',
  EXCLUDED: 'EXCLUDED',
};

export const LeadStageSource = {
  AI: 'AI',
  MANUAL: 'MANUAL',
};

// AI Intent enumerations - machine-readable semantic meaning for AI classification
export const AIIntent = {
  NO_CONTACT: 'no_contact',
  OUTREACH_SENT: 'outreach_sent',
  POSITIVE_ENGAGEMENT: 'positive_engagement',
  NEGATIVE_ENGAGEMENT: 'negative_engagement',
  NO_RESPONSE_AFTER_ENGAGEMENT: 'no_response_after_engagement',
  DO_NOT_CONTACT: 'do_not_contact',
};

// AI Intent configuration with labels and descriptions
export const aiIntentConfig = {
  [AIIntent.NO_CONTACT]: {
    label: 'No Contact',
    description: 'Lead has been added but no outreach has been sent yet.',
  },
  [AIIntent.OUTREACH_SENT]: {
    label: 'Outreach Sent',
    description: 'Initial outreach message has been sent, waiting for response.',
  },
  [AIIntent.POSITIVE_ENGAGEMENT]: {
    label: 'Positive Engagement',
    description: 'Lead shows interest or actively participates in conversation.',
  },
  [AIIntent.NEGATIVE_ENGAGEMENT]: {
    label: 'Negative Engagement',
    description: 'Lead explicitly or implicitly rejects the offer.',
  },
  [AIIntent.NO_RESPONSE_AFTER_ENGAGEMENT]: {
    label: 'No Response After Engagement',
    description: 'Conversation stopped after initial engagement or multiple attempts.',
  },
  [AIIntent.DO_NOT_CONTACT]: {
    label: 'Do Not Contact',
    description: 'Lead should not be contacted (system or user exclusion).',
  },
};

// AI Signals - INTERNAL ONLY: Low-level system events detected by AI (not visible to users)
// These represent raw detection events and are never exposed in the UI
export const AISignal = {
  OUTREACH_SENT: 'outreach_sent',
  REPLY_RECEIVED: 'reply_received',
  NO_REPLY_AFTER_N_DAYS: 'no_reply_after_n_days',
  AUTO_REPLY_DETECTED: 'auto_reply_detected',
  SENTIMENT_POSITIVE: 'sentiment_positive',
  SENTIMENT_NEGATIVE: 'sentiment_negative',
  SENTIMENT_NEUTRAL: 'sentiment_neutral',
  CONVERSATION_STOPPED: 'conversation_stopped',
  EXPLICIT_REJECTION: 'explicit_rejection',
  USER_EXCLUDED: 'user_excluded',
};

// Internal mapping: AI Signals → AI Intent (system logic, not user-configurable)
// This is where AI aggregates low-level signals into semantic intents
export const signalToIntentMapping = {
  // No signals detected → no_contact
  // (default state when no outreach has been sent)
  
  [AISignal.OUTREACH_SENT]: AIIntent.OUTREACH_SENT,
  
  [AISignal.REPLY_RECEIVED]: AIIntent.POSITIVE_ENGAGEMENT, // Default, can be refined by sentiment
  [AISignal.SENTIMENT_POSITIVE]: AIIntent.POSITIVE_ENGAGEMENT,
  [AISignal.SENTIMENT_NEUTRAL]: AIIntent.POSITIVE_ENGAGEMENT, // Treated as positive for workflow
  [AISignal.SENTIMENT_NEGATIVE]: AIIntent.NEGATIVE_ENGAGEMENT,
  [AISignal.EXPLICIT_REJECTION]: AIIntent.NEGATIVE_ENGAGEMENT,
  
  [AISignal.NO_REPLY_AFTER_N_DAYS]: AIIntent.NO_RESPONSE_AFTER_ENGAGEMENT,
  [AISignal.CONVERSATION_STOPPED]: AIIntent.NO_RESPONSE_AFTER_ENGAGEMENT,
  
  [AISignal.AUTO_REPLY_DETECTED]: AIIntent.OUTREACH_SENT, // Auto-reply doesn't change intent
  
  [AISignal.USER_EXCLUDED]: AIIntent.DO_NOT_CONTACT,
};

// Helper function: Resolve AI Signals to AI Intent (internal system logic)
export const resolveAISignalsToIntent = (signals) => {
  if (!signals || signals.length === 0) {
    return AIIntent.NO_CONTACT;
  }
  
  // Priority order for signal resolution
  const priorityOrder = [
    AISignal.USER_EXCLUDED,
    AISignal.EXPLICIT_REJECTION,
    AISignal.SENTIMENT_NEGATIVE,
    AISignal.SENTIMENT_POSITIVE,
    AISignal.SENTIMENT_NEUTRAL,
    AISignal.REPLY_RECEIVED,
    AISignal.CONVERSATION_STOPPED,
    AISignal.NO_REPLY_AFTER_N_DAYS,
    AISignal.OUTREACH_SENT,
    AISignal.AUTO_REPLY_DETECTED,
  ];
  
  // Find the highest priority signal
  for (const prioritySignal of priorityOrder) {
    if (signals.includes(prioritySignal)) {
      return signalToIntentMapping[prioritySignal] || AIIntent.NO_CONTACT;
    }
  }
  
  // Fallback
  return AIIntent.NO_CONTACT;
};

// Stage to Group mapping
export const stageToGroup = {
  [LeadStage.NEW]: LeadStageGroup.NEW,
  [LeadStage.CONTACTED]: LeadStageGroup.IN_PROGRESS,
  [LeadStage.ENGAGED]: LeadStageGroup.IN_PROGRESS,
  [LeadStage.GHOSTED]: LeadStageGroup.IN_PROGRESS,
  [LeadStage.NOT_INTERESTED]: LeadStageGroup.CLOSED,
  [LeadStage.EXCLUDED]: LeadStageGroup.CLOSED,
};

// Assignment Eligibility - defines which stages a stage can be assigned from
export const AssignmentEligibility = {
  ANY: 'any', // Can be assigned from any stage
  SPECIFIC: 'specific', // Can only be assigned from specific stages
};

// Assignment Strictness - controls how strong the contextual match must be
export const AssignmentStrictness = {
  LOW: 'low', // More permissive, assigns with lower confidence
  MEDIUM: 'medium', // Balanced matching
  HIGH: 'high', // Requires strong contextual match
};

// Stage display configuration - мягкие, приятные для глаз цвета
// Lead Stages map to AI Intent (semantic layer), NOT directly to AI Signals
// AI Intent filters candidates, contextual matching determines the final selection
export const stageConfig = {
  [LeadStage.NEW]: {
    label: 'New',
    description: 'Lead added but not contacted yet',
    color: '#8B5CF6', // Мягкий фиолетовый
    bgColor: 'rgba(139, 92, 246, 0.12)', // Очень светлый фиолетовый фон
    borderColor: 'rgba(139, 92, 246, 0.3)', // Для левой границы строки
    aiIntent: AIIntent.NO_CONTACT, // AI Intent that filters candidate stages
    // Contextual matching configuration
    assignmentEligibility: AssignmentEligibility.ANY, // Can be assigned from any stage
    eligibleFromStages: [], // Empty means "any stage"
    assignmentStrictness: AssignmentStrictness.LOW, // Low strictness for initial stage
  },
  [LeadStage.CONTACTED]: {
    label: 'Contacted',
    description: 'Outreach sent, no reply yet',
    color: '#F59E0B', // Мягкий оранжевый
    bgColor: 'rgba(245, 158, 11, 0.12)', // Очень светлый оранжевый фон
    borderColor: 'rgba(245, 158, 11, 0.3)',
    aiIntent: AIIntent.OUTREACH_SENT,
    assignmentEligibility: AssignmentEligibility.SPECIFIC,
    eligibleFromStages: [LeadStage.NEW], // Can only be assigned from NEW
    assignmentStrictness: AssignmentStrictness.MEDIUM,
  },
  [LeadStage.ENGAGED]: {
    label: 'Engaged',
    description: 'Meaningful reply detected',
    color: '#10B981', // Мягкий зеленый
    bgColor: 'rgba(16, 185, 129, 0.12)', // Очень светлый зеленый фон
    borderColor: 'rgba(16, 185, 129, 0.3)',
    aiIntent: AIIntent.POSITIVE_ENGAGEMENT,
    assignmentEligibility: AssignmentEligibility.SPECIFIC,
    eligibleFromStages: [LeadStage.CONTACTED, LeadStage.ENGAGED], // Can be assigned from CONTACTED or stay ENGAGED
    assignmentStrictness: AssignmentStrictness.MEDIUM,
  },
  [LeadStage.GHOSTED]: {
    label: 'Ghosted',
    description: 'Conversation stopped after engagement',
    color: '#F97316', // Мягкий красно-оранжевый
    bgColor: 'rgba(249, 115, 22, 0.12)', // Очень светлый красно-оранжевый фон
    borderColor: 'rgba(249, 115, 22, 0.3)',
    aiIntent: AIIntent.NO_RESPONSE_AFTER_ENGAGEMENT,
    assignmentEligibility: AssignmentEligibility.SPECIFIC,
    eligibleFromStages: [LeadStage.CONTACTED, LeadStage.ENGAGED], // Can be assigned from CONTACTED or ENGAGED
    assignmentStrictness: AssignmentStrictness.HIGH, // High strictness - requires strong evidence
  },
  [LeadStage.NOT_INTERESTED]: {
    label: 'Not Interested',
    description: 'Explicit or implicit rejection',
    color: '#64748B', // Мягкий серо-синий
    bgColor: 'rgba(100, 116, 139, 0.12)', // Очень светлый серо-синий фон
    borderColor: 'rgba(100, 116, 139, 0.3)',
    aiIntent: AIIntent.NEGATIVE_ENGAGEMENT,
    assignmentEligibility: AssignmentEligibility.ANY, // Can be assigned from any stage
    eligibleFromStages: [],
    assignmentStrictness: AssignmentStrictness.MEDIUM,
  },
  [LeadStage.EXCLUDED]: {
    label: 'Excluded',
    description: 'Do not contact',
    color: '#475569', // Мягкий темно-серый
    bgColor: 'rgba(71, 85, 105, 0.12)', // Очень светлый темно-серый фон
    borderColor: 'rgba(71, 85, 105, 0.3)',
    aiIntent: AIIntent.DO_NOT_CONTACT,
    assignmentEligibility: AssignmentEligibility.ANY,
    eligibleFromStages: [],
    assignmentStrictness: AssignmentStrictness.LOW, // Low strictness for manual exclusions
  },
};

// Contextual matching function (internal AI logic)
// Evaluates which stage best matches the current context
export const evaluateContextualMatch = (candidateStage, context) => {
  const config = stageConfig[candidateStage];
  if (!config) return 0;

  let matchScore = 0;

  // 1. Check eligibility: can this stage be assigned from current stage?
  if (config.assignmentEligibility === AssignmentEligibility.SPECIFIC) {
    if (config.eligibleFromStages && config.eligibleFromStages.length > 0) {
      if (!config.eligibleFromStages.includes(context.currentStage)) {
        return 0; // Not eligible from current stage
      }
      matchScore += 30; // Base score for eligibility match
    }
  } else {
    matchScore += 20; // Base score for "any stage" eligibility
  }

  // 2. Evaluate semantic relevance (would be enhanced with actual AI model)
  // For now, this is a placeholder that would use message content analysis
  if (context.semanticRelevance && context.semanticRelevance[candidateStage]) {
    matchScore += context.semanticRelevance[candidateStage] * 40; // Up to 40 points
  }

  // 3. Consider conversation activity
  if (context.replyReceived && config.aiIntent === AIIntent.POSITIVE_ENGAGEMENT) {
    matchScore += 20;
  }
  if (context.silenceDuration > 7 && config.aiIntent === AIIntent.NO_RESPONSE_AFTER_ENGAGEMENT) {
    matchScore += 15;
  }

  // 4. Respect manual override history
  if (context.manualOverride && context.manualOverride === candidateStage) {
    matchScore -= 10; // Slight penalty to avoid immediate reversion
  }

  // 5. Apply strictness threshold
  const strictnessThresholds = {
    [AssignmentStrictness.LOW]: 30,
    [AssignmentStrictness.MEDIUM]: 50,
    [AssignmentStrictness.HIGH]: 70,
  };

  const threshold = strictnessThresholds[config.assignmentStrictness] || 50;

  return {
    score: matchScore,
    exceedsThreshold: matchScore >= threshold,
    threshold,
  };
};

export const groupConfig = {
  [LeadStageGroup.NEW]: {
    label: 'New',
    color: '#6366F1',
    stages: [LeadStage.NEW],
  },
  [LeadStageGroup.IN_PROGRESS]: {
    label: 'In Progress',
    color: '#F59E0B',
    stages: [LeadStage.CONTACTED, LeadStage.ENGAGED, LeadStage.GHOSTED],
  },
  [LeadStageGroup.CLOSED]: {
    label: 'Closed',
    color: '#6B7280',
    stages: [LeadStage.NOT_INTERESTED, LeadStage.EXCLUDED],
  },
};

// AI Reasons templates
const aiReasons = {
  [LeadStage.NEW]: [
    'Lead was recently added to campaign',
    'No outreach has been sent yet',
  ],
  [LeadStage.CONTACTED]: [
    'First outreach message was sent',
    'Awaiting response from lead',
    'Connection request sent via LinkedIn',
  ],
  [LeadStage.ENGAGED]: [
    'Lead replied with interest in learning more',
    'Positive response detected in conversation',
    'Lead asked questions about the offering',
    'Meaningful conversation initiated',
  ],
  [LeadStage.GHOSTED]: [
    'No reply after 3 follow-up attempts over 14 days',
    'Conversation stopped after initial engagement',
    'Lead has not responded for 10+ days',
  ],
  [LeadStage.NOT_INTERESTED]: [
    'Lead explicitly declined the offer',
    'Negative sentiment detected in reply',
    'Lead requested to be removed from outreach',
    'Auto-reply indicates permanent unavailability',
  ],
  [LeadStage.EXCLUDED]: [
    'Manually marked as do not contact',
    'Lead is a competitor or internal contact',
  ],
};

// Simple reactive store for leads management
const leads = ref([]);
const searchQuery = ref('');
const scope = ref('all');
const campaignFilter = ref(null);
const stageFilter = ref([]);
const stageGroupFilter = ref([]);
const inlineFilterExpression = ref(null); // New inline filter structure

// Curated example leads to demonstrate all stages
const getExampleLeads = () => {
  const now = new Date();
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  const examples = [
    // ===== NEW STAGE - Lead added but not contacted yet =====
    {
      id: 1,
      name: 'Bryan Bayless',
      headline: 'VP, Revenue Center of Excellence',
      emails: ['bayless.b@excellence.io'],
      emailStatus: 'found',
      location: 'Portland',
      lastAction: daysAgo(2),
      linkedinUrl: 'https://linkedin.com/in/bryan-bayless',
      campaignName: 'Q4 Outreach',
      campaignId: 1,
      avatar: null,
      leadStage: LeadStage.NEW,
      leadStageGroup: LeadStageGroup.NEW,
      leadStageSource: LeadStageSource.AI,
      leadStageUpdatedAt: daysAgo(2),
      leadStageReason: 'Lead was recently added to campaign. No outreach has been sent yet.',
      messagesSent: 0,
      repliesReceived: 0,
      followUpCount: 0,
      lastMessageAt: null,
      lastReplyAt: null,
      stageHistory: [],
    },
    {
      id: 2,
      name: 'David Pierce',
      headline: 'Director - US Sales at POWWR',
      emails: ['pdavidpierce@gmail.com'],
      emailStatus: 'found',
      location: 'Houston',
      lastAction: daysAgo(7),
      linkedinUrl: 'https://linkedin.com/in/david-pierce',
      campaignName: 'Product Launch',
      campaignId: 2,
      avatar: null,
      leadStage: LeadStage.NEW,
      leadStageGroup: LeadStageGroup.NEW,
      leadStageSource: LeadStageSource.AI,
      leadStageUpdatedAt: daysAgo(7),
      leadStageReason: 'Lead imported from LinkedIn Sales Navigator. Awaiting campaign start.',
      messagesSent: 0,
      repliesReceived: 0,
      followUpCount: 0,
      lastMessageAt: null,
      lastReplyAt: null,
      stageHistory: [],
    },

    // ===== CONTACTED STAGE - Outreach sent, awaiting reply =====
    {
      id: 3,
      name: 'Hannah Turner',
      headline: 'CMO at SecureFrame',
      emails: ['antar.work.acc@gmail.com', 'hannah.t@secureframe.com'],
      emailStatus: 'found',
      location: 'United States',
      lastAction: daysAgo(10),
      linkedinUrl: 'https://linkedin.com/in/hannah-turner',
      campaignName: 'Q4 Outreach',
      campaignId: 1,
      avatar: null,
      leadStage: LeadStage.CONTACTED,
      leadStageGroup: LeadStageGroup.IN_PROGRESS,
      leadStageSource: LeadStageSource.AI,
      leadStageUpdatedAt: daysAgo(3),
      leadStageReason: 'First outreach message was sent via LinkedIn. Connection request accepted, awaiting response.',
      messagesSent: 2,
      repliesReceived: 0,
      followUpCount: 1,
      lastMessageAt: daysAgo(3),
      lastReplyAt: null,
      stageHistory: [
        { stage: LeadStage.NEW, source: LeadStageSource.AI, timestamp: daysAgo(10), reason: 'Lead added to campaign' },
      ],
    },
    {
      id: 4,
      name: 'Will Anastas',
      headline: 'SVP of Sales',
      emails: [],
      emailStatus: 'find',
      location: 'San Francisco',
      lastAction: daysAgo(13),
      linkedinUrl: 'https://linkedin.com/in/will-anastas',
      campaignName: 'Follow-up Sequence',
      campaignId: 3,
      avatar: null,
      leadStage: LeadStage.CONTACTED,
      leadStageGroup: LeadStageGroup.IN_PROGRESS,
      leadStageSource: LeadStageSource.AI,
      leadStageUpdatedAt: daysAgo(5),
      leadStageReason: 'LinkedIn connection request sent. Email not found - consider using email finder.',
      messagesSent: 1,
      repliesReceived: 0,
      followUpCount: 0,
      lastMessageAt: daysAgo(5),
      lastReplyAt: null,
      stageHistory: [
        { stage: LeadStage.NEW, source: LeadStageSource.AI, timestamp: daysAgo(13), reason: 'Lead added to campaign' },
      ],
    },

    // ===== ENGAGED STAGE - Meaningful conversation started =====
    {
      id: 5,
      name: 'Joe Kvidera',
      headline: 'Vice President of Sales',
      emails: ['joe.kvidera@gmail.com'],
      emailStatus: 'found',
      location: 'United States',
      lastAction: daysAgo(13),
      linkedinUrl: 'https://linkedin.com/in/joe-kvidera',
      campaignName: 'Q4 Outreach',
      campaignId: 1,
      avatar: null,
      leadStage: LeadStage.ENGAGED,
      leadStageGroup: LeadStageGroup.IN_PROGRESS,
      leadStageSource: LeadStageSource.AI,
      leadStageUpdatedAt: daysAgo(1),
      leadStageReason: 'Lead replied with interest! Asked about pricing and demo availability. High engagement signal detected.',
      messagesSent: 3,
      repliesReceived: 2,
      followUpCount: 2,
      lastMessageAt: daysAgo(1),
      lastReplyAt: daysAgo(1),
      stageHistory: [
        { stage: LeadStage.NEW, source: LeadStageSource.AI, timestamp: daysAgo(13), reason: 'Lead added to campaign' },
        { stage: LeadStage.CONTACTED, source: LeadStageSource.AI, timestamp: daysAgo(10), reason: 'First message sent' },
      ],
    },
    {
      id: 6,
      name: 'Jerry Recht',
      headline: 'Sales & Business Development Executive',
      emails: ['jrrecht@msn.com'],
      emailStatus: 'found',
      location: 'United States',
      lastAction: daysAgo(14),
      linkedinUrl: 'https://linkedin.com/in/jerry-recht',
      campaignName: 'Product Launch',
      campaignId: 2,
      avatar: null,
      leadStage: LeadStage.ENGAGED,
      leadStageGroup: LeadStageGroup.IN_PROGRESS,
      leadStageSource: LeadStageSource.MANUAL,
      leadStageUpdatedAt: daysAgo(2),
      leadStageReason: null,
      messagesSent: 4,
      repliesReceived: 3,
      followUpCount: 3,
      lastMessageAt: daysAgo(2),
      lastReplyAt: daysAgo(2),
      stageHistory: [
        { stage: LeadStage.NEW, source: LeadStageSource.AI, timestamp: daysAgo(14), reason: 'Lead added to campaign' },
        { stage: LeadStage.CONTACTED, source: LeadStageSource.AI, timestamp: daysAgo(12), reason: 'First message sent' },
      ],
    },

    // ===== GHOSTED STAGE - Conversation stopped =====
    {
      id: 7,
      name: 'Sanjay Malhotra',
      headline: 'CEO at Mi Analyst | Transforming Industry',
      emails: ['smalhotra.to@gmail.com'],
      emailStatus: 'found',
      location: 'Canada',
      lastAction: daysAgo(16),
      linkedinUrl: 'https://linkedin.com/in/sanjay-malhotra',
      campaignName: 'Q4 Outreach',
      campaignId: 1,
      avatar: null,
      leadStage: LeadStage.GHOSTED,
      leadStageGroup: LeadStageGroup.IN_PROGRESS,
      leadStageSource: LeadStageSource.AI,
      leadStageUpdatedAt: daysAgo(1),
      leadStageReason: 'No reply after 4 follow-up attempts over 16 days. Lead initially showed interest but went silent.',
      messagesSent: 5,
      repliesReceived: 1,
      followUpCount: 4,
      lastMessageAt: daysAgo(3),
      lastReplyAt: daysAgo(14),
      stageHistory: [
        { stage: LeadStage.NEW, source: LeadStageSource.AI, timestamp: daysAgo(20), reason: 'Lead added to campaign' },
        { stage: LeadStage.CONTACTED, source: LeadStageSource.AI, timestamp: daysAgo(18), reason: 'First message sent' },
        { stage: LeadStage.ENGAGED, source: LeadStageSource.AI, timestamp: daysAgo(14), reason: 'Positive reply received' },
      ],
    },
    {
      id: 8,
      name: 'Robert Novena',
      headline: 'Founder, Creative Director',
      emails: [],
      emailStatus: 'not_found',
      location: 'Windsor',
      lastAction: daysAgo(16),
      linkedinUrl: 'https://linkedin.com/in/robert-novena',
      campaignName: 'Follow-up Sequence',
      campaignId: 3,
      avatar: null,
      leadStage: LeadStage.GHOSTED,
      leadStageGroup: LeadStageGroup.IN_PROGRESS,
      leadStageSource: LeadStageSource.AI,
      leadStageUpdatedAt: daysAgo(2),
      leadStageReason: 'No reply after 3 LinkedIn messages over 12 days. Email not available for alternative outreach.',
      messagesSent: 3,
      repliesReceived: 0,
      followUpCount: 2,
      lastMessageAt: daysAgo(4),
      lastReplyAt: null,
      stageHistory: [
        { stage: LeadStage.NEW, source: LeadStageSource.AI, timestamp: daysAgo(16), reason: 'Lead added to campaign' },
        { stage: LeadStage.CONTACTED, source: LeadStageSource.AI, timestamp: daysAgo(14), reason: 'First message sent' },
      ],
    },

    // ===== NOT INTERESTED STAGE - Rejection detected =====
    {
      id: 9,
      name: 'Bryan Held',
      headline: 'Sales & Marketing for Growth in Enterprise',
      emails: ['bheld6@gmail.com'],
      emailStatus: 'found',
      location: 'Slinger',
      lastAction: daysAgo(14),
      linkedinUrl: 'https://linkedin.com/in/bryan-held',
      campaignName: 'Product Launch',
      campaignId: 2,
      avatar: null,
      leadStage: LeadStage.NOT_INTERESTED,
      leadStageGroup: LeadStageGroup.CLOSED,
      leadStageSource: LeadStageSource.AI,
      leadStageUpdatedAt: daysAgo(3),
      leadStageReason: 'Lead explicitly declined: "Thanks but we already have a solution in place. Not interested at this time."',
      messagesSent: 2,
      repliesReceived: 1,
      followUpCount: 1,
      lastMessageAt: daysAgo(5),
      lastReplyAt: daysAgo(3),
      replyContent: 'Thanks but we already have a solution in place. Not interested at this time.',
      stageHistory: [
        { stage: LeadStage.NEW, source: LeadStageSource.AI, timestamp: daysAgo(14), reason: 'Lead added to campaign' },
        { stage: LeadStage.CONTACTED, source: LeadStageSource.AI, timestamp: daysAgo(12), reason: 'First message sent' },
      ],
    },
    {
      id: 10,
      name: 'Gregory Watford',
      headline: 'Business Account Executive at Specialized Solutions',
      emails: ['gregwatford@cox.net'],
      emailStatus: 'found',
      location: 'Baton Rouge Metropolitan Area',
      lastAction: daysAgo(14),
      linkedinUrl: 'https://linkedin.com/in/gregory-watford',
      campaignName: 'Q4 Outreach',
      campaignId: 1,
      avatar: null,
      leadStage: LeadStage.NOT_INTERESTED,
      leadStageGroup: LeadStageGroup.CLOSED,
      leadStageSource: LeadStageSource.AI,
      leadStageUpdatedAt: daysAgo(4),
      leadStageReason: 'Negative sentiment detected in reply. Lead requested to be removed from outreach list.',
      messagesSent: 3,
      repliesReceived: 1,
      followUpCount: 2,
      lastMessageAt: daysAgo(6),
      lastReplyAt: daysAgo(4),
      replyContent: 'Please stop contacting me. Remove me from your list.',
      stageHistory: [
        { stage: LeadStage.NEW, source: LeadStageSource.AI, timestamp: daysAgo(20), reason: 'Lead added to campaign' },
        { stage: LeadStage.CONTACTED, source: LeadStageSource.AI, timestamp: daysAgo(18), reason: 'First message sent' },
      ],
    },

    // ===== EXCLUDED STAGE - Do not contact =====
    {
      id: 11,
      name: 'Sarah Johnson',
      headline: 'Chief Revenue Officer at TechCorp',
      emails: ['s.johnson@techcorp.com'],
      emailStatus: 'found',
      location: 'New York',
      lastAction: daysAgo(30),
      linkedinUrl: 'https://linkedin.com/in/sarah-johnson',
      campaignName: 'Q4 Outreach',
      campaignId: 1,
      avatar: null,
      leadStage: LeadStage.EXCLUDED,
      leadStageGroup: LeadStageGroup.CLOSED,
      leadStageSource: LeadStageSource.MANUAL,
      leadStageUpdatedAt: daysAgo(5),
      leadStageReason: null,
      messagesSent: 0,
      repliesReceived: 0,
      followUpCount: 0,
      lastMessageAt: null,
      lastReplyAt: null,
      stageHistory: [
        { stage: LeadStage.NEW, source: LeadStageSource.AI, timestamp: daysAgo(30), reason: 'Lead added to campaign' },
      ],
    },
    {
      id: 12,
      name: 'Michael Chen',
      headline: 'VP of Partnerships at Competitor Inc.',
      emails: ['m.chen@competitor.com'],
      emailStatus: 'found',
      location: 'Los Angeles',
      lastAction: daysAgo(25),
      linkedinUrl: 'https://linkedin.com/in/michael-chen',
      campaignName: 'Product Launch',
      campaignId: 2,
      avatar: null,
      leadStage: LeadStage.EXCLUDED,
      leadStageGroup: LeadStageGroup.CLOSED,
      leadStageSource: LeadStageSource.MANUAL,
      leadStageUpdatedAt: daysAgo(10),
      leadStageReason: null,
      messagesSent: 0,
      repliesReceived: 0,
      followUpCount: 0,
      lastMessageAt: null,
      lastReplyAt: null,
      stageHistory: [
        { stage: LeadStage.NEW, source: LeadStageSource.AI, timestamp: daysAgo(25), reason: 'Lead added to campaign' },
      ],
    },
  ];
  console.log('✅ getExampleLeads() returning', examples.length, 'example leads');
  console.log('👤 First example:', examples[0]?.name || 'NO DATA');
  return examples;
};

// Mock data generator with Lead Stages
const generateMockLeads = (count = 100) => {
  console.log('📦 generateMockLeads() called with count:', count);
  // Start with curated example leads - ALWAYS include these first
  const exampleLeads = getExampleLeads();
  console.log('📋 Example leads:', exampleLeads.length);
  
  // If count is less than examples, return only examples
  if (count <= exampleLeads.length) {
    console.log('📦 Returning only examples');
    return exampleLeads.slice(0, count);
  }
  
  const names = [
    'Emily Rodriguez', 'James Wilson', 'Lisa Anderson', 'Kevin Martinez',
    'Rachel Thompson', 'Daniel Garcia', 'Michelle Lee', 'Christopher Brown',
    'Amanda Davis', 'Matthew Taylor', 'Jennifer White', 'Andrew Clark',
    'Stephanie Harris', 'Joshua Moore', 'Nicole Lewis', 'Ryan Walker',
  ];
  
  const headlines = [
    'VP, Revenue Center of Excellence',
    'Director - US Sales at POWWR',
    'CMO at SecureFrame',
    'SVP of Sales',
    'Vice President of Sales',
    'Sales & Business Development Executive',
    'CEO at Mi Analyst | Transforming Industry',
    'Founder, Creative Director',
    'Sales & Marketing for Growth in Enterprise',
    'Business Account Executive at Specialized Solutions',
    'Head of Growth at TechStartup',
    'Enterprise Sales Director',
    'Regional Sales Manager',
    'Account Executive at Fortune 500',
  ];
  
  const locations = [
    'Portland', 'Houston', 'United States', 'San Francisco',
    'Canada', 'Windsor', 'Slinger', 'Baton Rouge Metropolitan Area',
    'New York', 'Los Angeles', 'Chicago', 'Seattle', 'Boston', 'Austin',
    'Denver', 'Miami', 'Atlanta', 'Phoenix',
  ];
  
  const emailDomains = ['gmail.com', 'company.com', 'excellence.io', 'msn.com', 'cox.net', 'outlook.com', 'yahoo.com'];

  const stageDistribution = [
    { stage: LeadStage.NEW, weight: 0.15 },
    { stage: LeadStage.CONTACTED, weight: 0.30 },
    { stage: LeadStage.ENGAGED, weight: 0.25 },
    { stage: LeadStage.GHOSTED, weight: 0.15 },
    { stage: LeadStage.NOT_INTERESTED, weight: 0.10 },
    { stage: LeadStage.EXCLUDED, weight: 0.05 },
  ];

  const getRandomStage = () => {
    const random = Math.random();
    let cumulative = 0;
    for (const { stage, weight } of stageDistribution) {
      cumulative += weight;
      if (random <= cumulative) return stage;
    }
    return LeadStage.NEW;
  };
  
  // Generate additional random leads (count minus examples)
  const additionalCount = count - exampleLeads.length;
  const additionalLeads = Array.from({ length: additionalCount }, (_, i) => {
    const idx = i + exampleLeads.length;
    const name = names[i % names.length];
    const hasEmail = Math.random() > 0.2;
    const emailStatus = !hasEmail 
      ? (Math.random() > 0.5 ? 'not_found' : 'find')
      : 'found';
    
    const emails = hasEmail 
      ? [`${name.toLowerCase().replace(/\s+/g, '.')}@${emailDomains[i % emailDomains.length]}`]
      : [];
    
    if (hasEmail && Math.random() > 0.7) {
      emails.push(`${name.toLowerCase().replace(/\s+/g, '')}2@${emailDomains[(i + 1) % emailDomains.length]}`);
    }
    
    const lastActionDate = new Date();
    lastActionDate.setDate(lastActionDate.getDate() - Math.floor(Math.random() * 30));

    // Generate stage data
    const leadStage = getRandomStage();
    const leadStageGroup = stageToGroup[leadStage];
    const isManual = Math.random() > 0.8;
    const leadStageSource = isManual ? LeadStageSource.MANUAL : LeadStageSource.AI;
    
    const stageReasons = aiReasons[leadStage];
    const leadStageReason = leadStageSource === LeadStageSource.AI 
      ? stageReasons[Math.floor(Math.random() * stageReasons.length)]
      : null;

    const stageUpdatedDate = new Date();
    stageUpdatedDate.setDate(stageUpdatedDate.getDate() - Math.floor(Math.random() * 7));

    // Engagement signals for AI
    const messagesSent = leadStage === LeadStage.NEW ? 0 : Math.floor(Math.random() * 5) + 1;
    const repliesReceived = [LeadStage.ENGAGED, LeadStage.NOT_INTERESTED].includes(leadStage)
      ? Math.floor(Math.random() * 3) + 1
      : 0;
    
    return {
      id: idx + 1,
      name,
      headline: headlines[i % headlines.length],
      emails,
      emailStatus,
      location: locations[i % locations.length],
      lastAction: lastActionDate.toISOString(),
      linkedinUrl: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`,
      campaignName: ['Q4 Outreach', 'Product Launch', 'Follow-up Sequence'][i % 3],
      campaignId: (i % 3) + 1,
      avatar: null,
      // Lead Stage fields
      leadStage,
      leadStageGroup,
      leadStageSource,
      leadStageUpdatedAt: stageUpdatedDate.toISOString(),
      leadStageReason,
      // Engagement signals
      messagesSent,
      repliesReceived,
      followUpCount: Math.max(0, messagesSent - 1),
      lastMessageAt: messagesSent > 0 ? lastActionDate.toISOString() : null,
      lastReplyAt: repliesReceived > 0 ? lastActionDate.toISOString() : null,
      // Stage history
      stageHistory: [
        {
          stage: LeadStage.NEW,
          source: LeadStageSource.AI,
          timestamp: new Date(stageUpdatedDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          reason: 'Lead was recently added to campaign',
        },
      ],
    };
  });

  const result = [...exampleLeads, ...additionalLeads];
  console.log('✅ generateMockLeads returning:', result.length, 'leads');
  console.log('👤 First 3 leads:', result.slice(0, 3).map(l => `${l.id}: ${l.name}`));
  return result;
};

// Helper function to apply inline filter expression
const applyInlineFilter = (leads, expression) => {
  if (!expression.conditions || expression.conditions.length === 0) {
    return leads;
  }

  // Extract conditions and connectors
  const conditions = [];
  const connectors = [];

  for (const item of expression.conditions) {
    if (item.logic) {
      connectors.push(item.logic);
    } else {
      conditions.push(item);
    }
  }

  // If no connectors, all conditions are AND
  if (connectors.length === 0) {
    return leads.filter(lead => {
      return conditions.every(condition => evaluateCondition(lead, condition));
    });
  }

  // Apply filters with logical connectors
  return leads.filter(lead => {
    let result = null;

    for (let i = 0; i < conditions.length; i++) {
      const conditionResult = evaluateCondition(lead, conditions[i]);

      if (result === null) {
        result = conditionResult;
      } else {
        // Get connector between current and previous condition
        const connector = connectors[i - 1] || 'AND';
        if (connector === 'AND') {
          result = result && conditionResult;
        } else {
          result = result || conditionResult;
        }
      }
    }

    return result === null ? true : result;
  });
};

// Helper function to evaluate a single condition
const evaluateCondition = (lead, condition) => {
  const { field, operator, value } = condition;

  switch (field) {
    case 'stage':
      return evaluateStageCondition(lead, operator, value);
    case 'email':
      return evaluateEmailCondition(lead, operator, value);
    case 'company':
      return evaluateCompanyCondition(lead, operator, value);
    case 'location':
      return evaluateLocationCondition(lead, operator, value);
    case 'createDate':
      return evaluateDateCondition(lead, operator, value);
    default:
      return true;
  }
};

const evaluateStageCondition = (lead, operator, value) => {
  const leadStage = lead.leadStage;
  
  switch (operator) {
    case 'eq':
      return leadStage === value;
    case 'ne':
      return leadStage !== value;
    default:
      return true;
  }
};

const evaluateEmailCondition = (lead, operator, value) => {
  const emails = lead.emails || [];
  const hasEmail = emails.length > 0;
  const emailStr = emails.join(' ').toLowerCase();
  const valueStr = (value || '').trim().toLowerCase();

  if (!valueStr && operator !== 'is_set' && operator !== 'is_blank') {
    return false; // Empty value for operators that need value
  }

  switch (operator) {
    case 'eq':
      // Exact match - check if any email exactly matches (case-insensitive)
      return emails.some(e => e.toLowerCase().trim() === valueStr);
    case 'ne':
      // Not equal - check if no email exactly matches
      return !emails.some(e => e.toLowerCase().trim() === valueStr);
    case 'contains':
      return emailStr.includes(valueStr);
    case 'not_contains':
      return !emailStr.includes(valueStr);
    case 'is_set':
      return hasEmail;
    case 'is_blank':
      return !hasEmail;
    default:
      return true;
  }
};

const evaluateCompanyCondition = (lead, operator, value) => {
  const company = (lead.company || '').toLowerCase();
  const valueStr = (value || '').toLowerCase();
  const isSet = !!lead.company;

  switch (operator) {
    case 'eq':
      return company === valueStr;
    case 'ne':
      return company !== valueStr;
    case 'contains':
      return company.includes(valueStr);
    case 'not_contains':
      return !company.includes(valueStr);
    case 'is_set':
      return isSet;
    case 'is_blank':
      return !isSet;
    default:
      return true;
  }
};

const evaluateLocationCondition = (lead, operator, value) => {
  const location = (lead.location || '').toLowerCase();
  const valueStr = (value || '').toLowerCase();
  const isSet = !!lead.location;

  switch (operator) {
    case 'eq':
      return location === valueStr;
    case 'ne':
      return location !== valueStr;
    case 'contains':
      return location.includes(valueStr);
    case 'not_contains':
      return !location.includes(valueStr);
    case 'is_set':
      return isSet;
    case 'is_blank':
      return !isSet;
    default:
      return true;
  }
};

const evaluateDateCondition = (lead, operator, value) => {
  const createDate = lead.createdAt ? new Date(lead.createdAt) : null;
  const isSet = !!createDate;

  switch (operator) {
    case 'is_set':
      return isSet;
    case 'is_blank':
      return !isSet;
    case 'before':
      if (!isSet || !value) return false;
      const beforeDate = new Date(value);
      return createDate < beforeDate;
    case 'after':
      if (!isSet || !value) return false;
      const afterDate = new Date(value);
      return createDate > afterDate;
    default:
      return true;
  }
};

export function useLeadsStore() {
  const totalLeads = computed(() => leads.value.length);
  
  const filteredLeads = computed(() => {
    console.log('🔍 filteredLeads computed called');
    console.log('📊 leads.value:', {
      type: typeof leads.value,
      isArray: Array.isArray(leads.value),
      length: leads.value?.length || 0
    });
    
    if (!Array.isArray(leads.value)) {
      console.warn('⚠️ leads.value is not an array!');
      return [];
    }
    
    if (leads.value.length === 0) {
      console.warn('⚠️ leads.value is empty array!');
      return [];
    }
    
    let result = [...leads.value];
    console.log('📋 Starting with', result.length, 'leads');
    
    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const before = result.length;
      result = result.filter(lead => {
        return (
          lead.name?.toLowerCase().includes(query) ||
          lead.headline?.toLowerCase().includes(query) ||
          (lead.emails && Array.isArray(lead.emails) && lead.emails.some(email => email.toLowerCase().includes(query))) ||
          (lead.location && lead.location.toLowerCase().includes(query))
        );
      });
      console.log('🔎 Search filter:', before, '->', result.length);
    }
    
    // Apply campaign filter
    if (campaignFilter.value) {
      const before = result.length;
      result = result.filter(lead => lead.campaignId === campaignFilter.value);
      console.log('🎯 Campaign filter:', before, '->', result.length);
    }

    // Apply stage filter
    if (stageFilter.value && stageFilter.value.length > 0) {
      const before = result.length;
      result = result.filter(lead => stageFilter.value.includes(lead.leadStage));
      console.log('🏷️ Stage filter:', before, '->', result.length);
    }

    // Apply stage group filter
    if (stageGroupFilter.value && stageGroupFilter.value.length > 0) {
      const before = result.length;
      result = result.filter(lead => stageGroupFilter.value.includes(lead.leadStageGroup));
      console.log('📁 Stage group filter:', before, '->', result.length);
    }

    // Apply inline filter expression (new filter builder)
    if (inlineFilterExpression.value && inlineFilterExpression.value.conditions) {
      const before = result.length;
      result = applyInlineFilter(result, inlineFilterExpression.value);
      console.log('🔧 Inline filter:', before, '->', result.length);
    }
    
    // Apply scope filter (all vs custom segments)
    if (scope.value === 'custom') {
      // Custom segments logic would go here
    }
    
    console.log('✅ filteredLeads returning:', result.length, 'leads');
    console.log('✅ filteredLeads result type:', typeof result, 'isArray:', Array.isArray(result));
    if (result.length > 0) {
      console.log('👤 First filtered lead:', result[0].name);
      console.log('👤 Full filtered lead object:', result[0]);
    } else {
      console.warn('⚠️ filteredLeads result is empty!');
    }
    return result;
  });

  // Stage statistics
  const stageStats = computed(() => {
    console.log('📊 stageStats computed - calculating...');
    console.log('📊 leads.value type:', typeof leads.value);
    console.log('📊 leads.value isArray:', Array.isArray(leads.value));
    console.log('📊 leads.value length:', leads.value?.length || 0);
    
    if (!Array.isArray(leads.value)) {
      console.warn('⚠️ stageStats: leads.value is not an array, returning empty object');
      return {};
    }
    
    const stats = {};
    Object.values(LeadStage).forEach(stage => {
      const count = leads.value.filter(lead => {
        const matches = lead.leadStage === stage;
        if (matches) {
          console.log(`  ✅ Found lead ${lead.id} (${lead.name}) with stage ${stage}`);
        }
        return matches;
      }).length;
      stats[stage] = count;
      console.log(`📊 Stage ${stage}: ${count} leads`);
    });
    
    console.log('📊 Final stageStats:', stats);
    return stats;
  });

  const groupStats = computed(() => {
    console.log('📁 groupStats computed - calculating...');
    console.log('📁 leads.value type:', typeof leads.value);
    console.log('📁 leads.value isArray:', Array.isArray(leads.value));
    console.log('📁 leads.value length:', leads.value?.length || 0);
    
    if (!Array.isArray(leads.value)) {
      console.warn('⚠️ groupStats: leads.value is not an array, returning empty object');
      return {};
    }
    
    const stats = {};
    Object.values(LeadStageGroup).forEach(group => {
      const count = leads.value.filter(lead => {
        const matches = lead.leadStageGroup === group;
        if (matches) {
          console.log(`  ✅ Found lead ${lead.id} (${lead.name}) with group ${group}`);
        }
        return matches;
      }).length;
      stats[group] = count;
      console.log(`📁 Group ${group}: ${count} leads`);
    });
    
    console.log('📁 Final groupStats:', stats);
    return stats;
  });
  
  const fetchLeads = async () => {
    console.log('🔄 fetchLeads() called');
    console.log('📊 Current leads.value.length:', leads.value.length);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Generate leads with examples first - examples are ALWAYS the first 12 leads
      const allLeads = generateMockLeads(100); // 12 examples + 88 random = 100 total
      console.log('✅ generateMockLeads returned:', allLeads.length, 'leads');
      console.log('👤 First 3 leads:', allLeads.slice(0, 3).map(l => `${l.id}: ${l.name}`));
      
      // CRITICAL: Set the leads value
      leads.value = allLeads;
      console.log('✅ leads.value set. New length:', leads.value.length);
      console.log('✅ leads.value is array:', Array.isArray(leads.value));
      console.log('👤 First lead in store:', leads.value[0]?.name || 'NO DATA');
      
      return allLeads;
    } catch (error) {
      console.error('❌ Error loading leads:', error);
      console.error('❌ Error stack:', error.stack);
      // Fallback to examples only
      const exampleLeads = getExampleLeads();
      console.log('🔄 Fallback: Using example leads only:', exampleLeads.length);
      leads.value = exampleLeads;
      return exampleLeads;
    }
  };
  
  const setSearchQuery = (query) => {
    searchQuery.value = query;
  };
  
  const setScope = (newScope) => {
    scope.value = newScope;
  };
  
  const setCampaignFilter = (campaignId) => {
    campaignFilter.value = campaignId;
  };

  const setStageFilter = (stages) => {
    stageFilter.value = stages;
  };

  const setStageGroupFilter = (groups) => {
    stageGroupFilter.value = groups;
  };

  const setInlineFilterExpression = (expression) => {
    inlineFilterExpression.value = expression;
  };

  const clearInlineFilter = () => {
    inlineFilterExpression.value = null;
  };

  const toggleStageFilter = (stage) => {
    const current = [...stageFilter.value];
    const index = current.indexOf(stage);
    if (index === -1) {
      current.push(stage);
    } else {
      current.splice(index, 1);
    }
    stageFilter.value = current;
  };

  const clearStageFilters = () => {
    stageFilter.value = [];
    stageGroupFilter.value = [];
  };
  
  const getLeadById = (id) => {
    return leads.value.find(lead => lead.id === id);
  };

  // Update lead stage manually
  const updateLeadStage = (leadId, newStage, reason = null) => {
    const lead = leads.value.find(l => l.id === leadId);
    if (!lead) return false;

    const previousStage = lead.leadStage;
    
    // Add to history
    if (!lead.stageHistory) lead.stageHistory = [];
    lead.stageHistory.push({
      stage: previousStage,
      source: lead.leadStageSource,
      timestamp: lead.leadStageUpdatedAt,
      reason: lead.leadStageReason,
    });

    // Update stage
    lead.leadStage = newStage;
    lead.leadStageGroup = stageToGroup[newStage];
    lead.leadStageSource = LeadStageSource.MANUAL;
    lead.leadStageUpdatedAt = new Date().toISOString();
    lead.leadStageReason = reason;

    return true;
  };

  // AI re-evaluation (simulated)
  const reEvaluateLeadStage = (leadId) => {
    const lead = leads.value.find(l => l.id === leadId);
    if (!lead) return null;

    // Simple AI logic simulation
    const { stage, reason, confidence } = {
      stage: lead.leadStage,
      reason: lead.leadStageReason || 'No change recommended',
      confidence: 0.8,
    };
    
    return {
      suggestedStage: stage,
      reason,
      confidence,
      currentStage: lead.leadStage,
    };
  };
  
  return {
    leads,
    totalLeads,
    filteredLeads,
    stageStats,
    groupStats,
    stageFilter,
    stageGroupFilter,
    inlineFilterExpression,
    fetchLeads,
    setSearchQuery,
    setScope,
    setCampaignFilter,
    setStageFilter,
    setStageGroupFilter,
    toggleStageFilter,
    clearStageFilters,
    setInlineFilterExpression,
    clearInlineFilter,
    getLeadById,
    updateLeadStage,
    reEvaluateLeadStage,
  };
}

