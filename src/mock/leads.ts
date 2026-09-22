import { Lead, LeadSource, LeadStatus } from '../types';

// High-fidelity showcase leads for client demo
const SHOWCASE_LEADS: Lead[] = [
  {
    id: 'lead_1',
    organizationId: 'org_nexus_01',
    name: 'Sunita Menon',
    companyName: 'ABC Technologies',
    email: 'sunita.menon@abctechnologies.io',
    phone: '+91 98451 99012',
    source: 'Website',
    status: 'Qualified',
    leadScore: 87,
    aiInsight: {
      score: 87,
      factors: [
        'Visited enterprise pricing & security whitepaper 6 times in past 48 hours',
        'Matches ideal customer profile: Enterprise SaaS with 500+ employees',
        'Chief Decision Maker role verified on LinkedIn (VP Sales Operations)',
        'Budget capacity confirmed for multi-tenant deployment tier',
      ],
      recommendedAction: 'Schedule executive architectural demo and share customized pilot agreement.',
      lastEvaluatedAt: '2025-04-12T08:15:00Z',
      intentLevel: 'High',
    },
    ownerId: 'usr_3',
    ownerName: 'Vikramaditya Rao',
    estimatedValue: 800000,
    title: 'VP of Sales Operations',
    location: 'Bengaluru, Karnataka',
    notes: 'Requested a comprehensive demo of pipeline forecasting and role-based permissions.',
    createdAt: '2025-04-02T10:14:00Z',
    updatedAt: '2025-04-12T08:15:00Z',
  },
  {
    id: 'lead_2',
    organizationId: 'org_nexus_01',
    name: 'Gaurav Bhasin',
    companyName: 'OmniRetail Omnichannel Labs',
    email: 'gaurav.bhasin@omniretail.store',
    phone: '+91 98100 44810',
    source: 'LinkedIn',
    status: 'Contacted',
    leadScore: 92,
    aiInsight: {
      score: 92,
      factors: [
        'Engaged with CEO keynote speech on omnichannel retail integration',
        'High urgent pain point: Existing legacy CRM suffering sync timeouts across 120 stores',
        'Direct inquiry submitted through inbound partner portal',
      ],
      recommendedAction: 'Send technical architecture benchmark and offer 30-day proof of concept.',
      lastEvaluatedAt: '2025-04-11T14:20:00Z',
      intentLevel: 'High',
    },
    ownerId: 'usr_4',
    ownerName: 'Rohan Mehta',
    estimatedValue: 1250000,
    title: 'Head of Omnichannel Commerce',
    location: 'Gurugram, Haryana',
    notes: 'Urgent replacement needed before festive sales season.',
    createdAt: '2025-04-03T11:30:00Z',
    updatedAt: '2025-04-11T14:20:00Z',
  },
  {
    id: 'lead_3',
    organizationId: 'org_nexus_01',
    name: 'Dr. Shalini Aggarwal',
    companyName: 'Quantum Health Systems',
    email: 'shalini.aggarwal@quantumhealth.in',
    phone: '+91 98111 67200',
    source: 'Referral',
    status: 'Qualified',
    leadScore: 84,
    aiInsight: {
      score: 84,
      factors: [
        'Warm referral from advisory board member',
        'High regulatory requirement: strict data residency & audit logs needed',
        'Budget sanctioned for Q2 digital patient intake upgrade',
      ],
      recommendedAction: 'Deliver compliance checklist and arrange security review call with CISO.',
      lastEvaluatedAt: '2025-04-10T09:00:00Z',
      intentLevel: 'High',
    },
    ownerId: 'usr_6',
    ownerName: 'Kavita Patel',
    estimatedValue: 950000,
    title: 'Chief Medical Officer',
    location: 'Gurugram, Haryana',
    notes: 'Referred by Dr. Venkat Raman from PulseBio.',
    createdAt: '2025-04-01T15:20:00Z',
    updatedAt: '2025-04-10T09:00:00Z',
  },
  {
    id: 'lead_4',
    organizationId: 'org_nexus_01',
    name: 'Devendra Joshi',
    companyName: 'Stellar Precision Robotics',
    email: 'devendra.joshi@stellarrobotics.com',
    phone: '+91 98220 55190',
    source: 'Advertisement',
    status: 'New',
    leadScore: 76,
    aiInsight: {
      score: 76,
      factors: [
        'Clicked Google search ad for "Industrial machinery sales pipeline tool"',
        'Downloaded technical datasheet and filled out request form',
      ],
      recommendedAction: 'Dispatch introductory email within 2 hours highlighting field engineer mobile app.',
      lastEvaluatedAt: '2025-04-12T11:45:00Z',
      intentLevel: 'Medium',
    },
    ownerId: 'usr_7',
    ownerName: 'Arjun Deshmukh',
    estimatedValue: 620000,
    title: 'VP of Manufacturing Automation',
    location: 'Pune, Maharashtra',
    notes: 'Interested in offline mobile sync for factory floor reps.',
    createdAt: '2025-04-08T09:10:00Z',
    updatedAt: '2025-04-12T11:45:00Z',
  },
  {
    id: 'lead_5',
    organizationId: 'org_nexus_01',
    name: 'Aditya Chawla',
    companyName: 'Skyline Urban Infra',
    email: 'aditya.chawla@skylineurban.in',
    phone: '+91 98112 33499',
    source: 'Cold Call',
    status: 'Contacted',
    leadScore: 68,
    aiInsight: {
      score: 68,
      factors: [
        'Outbound rep had 18-minute qualification call with VP of Commercial Leasing',
        'Needs multi-property leasing workflow and lead provenance tracking',
      ],
      recommendedAction: 'Follow up with customer case study in real estate asset management.',
      lastEvaluatedAt: '2025-04-09T16:00:00Z',
      intentLevel: 'Medium',
    },
    ownerId: 'usr_3',
    ownerName: 'Vikramaditya Rao',
    estimatedValue: 750000,
    title: 'VP of Commercial Leasing',
    location: 'New Delhi',
    notes: 'Evaluation timeline is mid-May 2025.',
    createdAt: '2025-04-04T14:00:00Z',
    updatedAt: '2025-04-09T16:00:00Z',
  },
  {
    id: 'lead_6',
    organizationId: 'org_nexus_01',
    name: 'Antonio Fernandes',
    companyName: 'Crestview Hospitality Group',
    email: 'antonio.fernandes@crestviewhotels.in',
    phone: '+91 98230 44910',
    source: 'Website',
    status: 'Qualified',
    leadScore: 81,
    aiInsight: {
      score: 81,
      factors: [
        'Requested quote for 60 sales agents across 14 resort properties',
        'High customer lifetime value potential with fast expansion',
      ],
      recommendedAction: 'Book custom demo featuring banquet event order management.',
      lastEvaluatedAt: '2025-04-11T10:15:00Z',
      intentLevel: 'High',
    },
    ownerId: 'usr_6',
    ownerName: 'Kavita Patel',
    estimatedValue: 880000,
    title: 'VP of Revenue Management',
    location: 'Panaji, Goa',
    notes: 'Current contract with legacy provider expires in June.',
    createdAt: '2025-04-05T16:40:00Z',
    updatedAt: '2025-04-11T10:15:00Z',
  },
  {
    id: 'lead_7',
    organizationId: 'org_nexus_01',
    name: 'Radhika Merchant-Sen',
    companyName: 'Optima Insurance Brokers',
    email: 'radhika.sen@optimainsure.co.in',
    phone: '+91 98201 66500',
    source: 'Email',
    status: 'Contacted',
    leadScore: 73,
    aiInsight: {
      score: 73,
      factors: [
        'Opened cold outreach email twice and clicked product video link',
        'Replied inquiring about renewal reminder automation',
      ],
      recommendedAction: 'Send pre-recorded walkthrough of automated policy renewal notifications.',
      lastEvaluatedAt: '2025-04-10T12:00:00Z',
      intentLevel: 'Medium',
    },
    ownerId: 'usr_6',
    ownerName: 'Kavita Patel',
    estimatedValue: 540000,
    title: 'VP of Commercial Lines',
    location: 'Mumbai, Maharashtra',
    notes: 'Wants to reduce churn on group mediclaim policies.',
    createdAt: '2025-04-06T10:30:00Z',
    updatedAt: '2025-04-10T12:00:00Z',
  },
  {
    id: 'lead_8',
    organizationId: 'org_nexus_01',
    name: 'Hardik Trivedi',
    companyName: 'GreenLeaf Packaging Tech',
    email: 'hardik.trivedi@greenleafpack.com',
    phone: '+91 98240 11990',
    source: 'LinkedIn',
    status: 'New',
    leadScore: 59,
    aiInsight: {
      score: 59,
      factors: [
        'Connected with Account Exec on LinkedIn',
        'Mid-market manufacturer experiencing rapid distributor expansion',
      ],
      recommendedAction: 'Engage with LinkedIn message offering distributor portal demo.',
      lastEvaluatedAt: '2025-04-12T09:30:00Z',
      intentLevel: 'Medium',
    },
    ownerId: 'usr_7',
    ownerName: 'Arjun Deshmukh',
    estimatedValue: 420000,
    title: 'Head of Industrial Sales',
    location: 'Vadodara, Gujarat',
    createdAt: '2025-04-07T11:00:00Z',
    updatedAt: '2025-04-12T09:30:00Z',
  },
  {
    id: 'lead_9',
    organizationId: 'org_nexus_01',
    name: 'Swati Balakrishnan',
    companyName: 'Edify Learning EdTech',
    email: 'swati.bala@edifylearn.ai',
    phone: '+91 98804 77200',
    source: 'Website',
    status: 'Converted',
    leadScore: 95,
    convertedContactId: 'cnt_24',
    convertedCompanyId: 'comp_23',
    aiInsight: {
      score: 95,
      factors: [
        'Completed full technical validation trial',
        'Signed mutual NDA and requested commercial proposal',
      ],
      recommendedAction: 'Converted to active deal in Proposal stage.',
      lastEvaluatedAt: '2025-04-05T13:10:00Z',
      intentLevel: 'High',
    },
    ownerId: 'usr_10',
    ownerName: 'Meera Sen',
    estimatedValue: 1100000,
    title: 'Chief Customer Officer',
    location: 'Bengaluru, Karnataka',
    notes: 'Successfully converted during Q1 sales summit.',
    createdAt: '2025-03-26T11:45:00Z',
    updatedAt: '2025-04-05T13:10:00Z',
  },
  {
    id: 'lead_10',
    organizationId: 'org_nexus_01',
    name: 'Rajat Oberoi',
    companyName: 'Summit Hospitality & Venues',
    email: 'rajat.oberoi@summitvenues.in',
    phone: '+91 98110 88200',
    source: 'Advertisement',
    status: 'Unqualified',
    leadScore: 32,
    aiInsight: {
      score: 32,
      factors: [
        'Single boutique cafe owner looking for low-cost invoicing rather than CRM',
        'Budget below platform minimum threshold (< ₹20k/yr)',
      ],
      recommendedAction: 'Nurture with self-service newsletter; route to micro-business partners.',
      lastEvaluatedAt: '2025-04-08T15:00:00Z',
      intentLevel: 'Low',
    },
    ownerId: 'usr_10',
    ownerName: 'Meera Sen',
    estimatedValue: 60000,
    title: 'Sole Proprietor',
    location: 'Dehradun, Uttarakhand',
    notes: 'Budget does not match enterprise tier.',
    createdAt: '2025-04-07T14:15:00Z',
    updatedAt: '2025-04-08T15:00:00Z',
  },
];

// Generate the remaining 95 realistic leads
const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Priya', 'Vivek', 'Sneha', 'Aditya', 'Neha',
  'Kunal', 'Pooja', 'Rahul', 'Divya', 'Siddharth', 'Tanvi', 'Manish', 'Kavita',
  'Vikram', 'Meera', 'Gaurav', 'Shalini', 'Karan', 'Deepa', 'Naveen', 'Ritu',
  'Harish', 'Preeti', 'Suresh', 'Anita', 'Sunil', 'Swati', 'Alok', 'Rashmi'
];

const LAST_NAMES = [
  'Verma', 'Sharma', 'Patel', 'Iyer', 'Deshmukh', 'Mehta', 'Kulkarni', 'Reddy',
  'Menon', 'Chopra', 'Nambiar', 'Bose', 'Gupta', 'Joshi', 'Aggarwal', 'Bhasin',
  'Saxena', 'Sundaram', 'Nair', 'Chawla', 'Trivedi', 'Bhatt', 'Mishra', 'Kapoor'
];

const COMPANY_PREFIXES = [
  'Apex', 'Quantum', 'Nexus', 'Vertex', 'Stellar', 'Aura', 'Helios', 'Zenith',
  'Pulse', 'Cobalt', 'Terra', 'Titan', 'Hyperion', 'Kore', 'Solace', 'Falcon',
  'Omni', 'BlueWave', 'Vanguard', 'Skyline', 'Crest', 'Sterling', 'Lumina', 'Optima'
];

const COMPANY_SUFFIXES = [
  'Technologies', 'Solutions', 'Global', 'Enterprises', 'Systems', 'Networks',
  'Dynamics', 'Industries', 'Labs', 'Logistics', 'Consulting', 'Digital', 'Energy'
];

const SOURCES: LeadSource[] = ['Website', 'Referral', 'LinkedIn', 'Advertisement', 'Cold Call', 'Email', 'Other'];
const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted'];

const OWNERS = [
  { id: 'usr_3', name: 'Vikramaditya Rao' },
  { id: 'usr_4', name: 'Rohan Mehta' },
  { id: 'usr_5', name: 'Pooja Iyer' },
  { id: 'usr_6', name: 'Kavita Patel' },
  { id: 'usr_7', name: 'Arjun Deshmukh' },
  { id: 'usr_10', name: 'Meera Sen' },
];

const LOCATIONS = [
  'Bengaluru, Karnataka', 'Mumbai, Maharashtra', 'New Delhi, Delhi',
  'Hyderabad, Telangana', 'Pune, Maharashtra', 'Chennai, Tamil Nadu',
  'Gurugram, Haryana', 'Noida, Uttar Pradesh', 'Ahmedabad, Gujarat', 'Kolkata, West Bengal'
];

const TITLES = [
  'Chief Technology Officer', 'VP of Sales Operations', 'Head of Business Development',
  'Director of IT Infrastructure', 'Managing Director', 'Procurement Manager',
  'VP of Digital Transformation', 'Chief Marketing Officer', 'Chief Executive Officer'
];

function generateRemainingLeads(): Lead[] {
  const generated: Lead[] = [];
  for (let i = 11; i <= 105; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const fullName = `${fn} ${ln}`;
    const compName = `${COMPANY_PREFIXES[(i * 7) % COMPANY_PREFIXES.length]} ${COMPANY_SUFFIXES[(i * 5) % COMPANY_SUFFIXES.length]}`;
    const source = SOURCES[i % SOURCES.length];
    const status = STATUSES[(i * 2) % STATUSES.length];
    const owner = OWNERS[i % OWNERS.length];
    const location = LOCATIONS[i % LOCATIONS.length];
    const title = TITLES[i % TITLES.length];
    const score = Math.floor(30 + ((i * 17) % 68)); // Score between 30 and 97
    const estVal = Math.floor(250000 + ((i * 43100) % 2200000));
    
    // Day in past 90 days
    const daysAgo = (i * 2) % 85;
    const dateObj = new Date('2025-04-12T10:00:00Z');
    dateObj.setDate(dateObj.getDate() - daysAgo);
    const createdIso = dateObj.toISOString();

    const intentLevel: 'High' | 'Medium' | 'Low' = score >= 75 ? 'High' : score >= 50 ? 'Medium' : 'Low';

    const aiInsight = {
      score,
      factors: [
        `Interaction history shows strong resonance with ${title} buyer persona`,
        `Organization operates in high-growth sector (${location})`,
        `Estimated annual pipeline potential exceeds ₹${Math.round(estVal / 100000)} Lakhs`,
      ],
      recommendedAction: score >= 75 
        ? 'Engage senior sales architect to lead high-level solution pitch.'
        : score >= 50 
        ? 'Enroll in targeted nurture drip campaign with ROI case study.'
        : 'Re-qualify intent during monthly marketing check-in.',
      lastEvaluatedAt: createdIso,
      intentLevel,
    };

    generated.push({
      id: `lead_${i}`,
      organizationId: 'org_nexus_01',
      name: fullName,
      companyName: compName,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${compName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: `+91 ${98000 + ((i * 137) % 1999)} ${10000 + ((i * 321) % 89999)}`,
      source,
      status,
      leadScore: score,
      aiInsight,
      ownerId: owner.id,
      ownerName: owner.name,
      estimatedValue: estVal,
      title,
      location,
      notes: `Prospect expressed interest in centralized reporting and multi-tier pipeline visibility.`,
      createdAt: createdIso,
      updatedAt: createdIso,
    });
  }
  return generated;
}

export const MOCK_LEADS: Lead[] = [...SHOWCASE_LEADS, ...generateRemainingLeads()];
