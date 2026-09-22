import { AiChatMessage } from '../types';
import { mockDb } from '../mock/db';
import { ApiResponse, simulateNetworkLatency } from './api';

export const aiService = {
  /**
   * Process an AI conversation query.
   *
   * PRODUCTION NOTE:
   * When deploying with Express backend:
   * Replace this mock function with a POST request to `/api/ai/chat`.
   * The server-side route will call the Google GenAI SDK (`@google/genai`)
   * using `process.env.GEMINI_API_KEY`, protecting all credentials from the client.
   */
  async sendMessage(userMessage: string): Promise<ApiResponse<AiChatMessage>> {
    const q = userMessage.toLowerCase();
    let replyText = '';
    let cards: AiChatMessage['cards'] = [];
    let suggestedActions: string[] = [];

    if (q.includes('attention') || q.includes('need attention')) {
      replyText = `You have **4 high-value deals** requiring immediate attention due to approaching close dates or pending legal review:

1. **CRM Implementation** (ABC Technologies) — ₹8,00,000 (Negotiation). In legal review for 48 hours.
2. **Omnichannel POS Sync Platform** (OmniRetail) — ₹12,50,000 (Proposal). RFP response pending delivery.
3. **Multi-Resort MICE Banquet CRM** (Crestview Hospitality) — ₹8,80,000 (Proposal). Proposal overdue for board sign-off.
4. **Clinical Data Stream Integration** (Quantum Health) — ₹9,50,000 (Qualified). CISO compliance review pending.`;

      cards = [
        {
          type: 'deal',
          title: 'CRM Implementation',
          subtitle: 'ABC Technologies • Rajesh Kulkarni',
          value: '₹8,00,000 (75% Win Prob)',
          link: '/deals/deal_1',
          meta: { Stage: 'Negotiation', 'Close Date': '15 May 2025' },
        },
        {
          type: 'deal',
          title: 'Omnichannel POS Sync Platform',
          subtitle: 'OmniRetail Omnichannel Labs • Gaurav Bhasin',
          value: '₹12,50,000 (60% Win Prob)',
          link: '/deals/deal_2',
          meta: { Stage: 'Proposal', 'Close Date': '30 May 2025' },
        },
      ];

      suggestedActions = [
        'Draft executive follow-up email to Rajesh Kulkarni',
        'Schedule internal pipeline review for OmniRetail RFP',
        'Review high priority leads',
      ];
    } else if (q.includes('highest priority leads') || q.includes('top leads') || q.includes('priority leads')) {
      replyText = `Here are your **top 3 AI-qualified prospects** with the highest conversion probability based on ICP match, behavioral web telemetry, and decision-maker seniority:`;

      cards = [
        {
          type: 'lead',
          title: 'Gaurav Bhasin (Score: 92/100)',
          subtitle: 'OmniRetail Omnichannel Labs • Head of Omnichannel',
          value: '₹12.5L Est. Value',
          link: '/leads/lead_2',
          meta: { Source: 'LinkedIn', Status: 'Contacted', Intent: 'High' },
        },
        {
          type: 'lead',
          title: 'Sunita Menon (Score: 87/100)',
          subtitle: 'ABC Technologies • VP of Sales Operations',
          value: '₹8.0L Est. Value',
          link: '/leads/lead_1',
          meta: { Source: 'Website', Status: 'Qualified', Intent: 'High' },
        },
        {
          type: 'lead',
          title: 'Dr. Shalini Aggarwal (Score: 84/100)',
          subtitle: 'Quantum Health Systems • Chief Medical Officer',
          value: '₹9.5L Est. Value',
          link: '/leads/lead_3',
          meta: { Source: 'Referral', Status: 'Qualified', Intent: 'High' },
        },
      ];

      suggestedActions = [
        'Open Sunita Menon lead profile',
        'Convert Sunita Menon to Contact & Deal',
        'Schedule discovery call with Gaurav Bhasin',
      ];
    } else if (q.includes('abc technologies') || q.includes('summarize abc')) {
      replyText = `### Enterprise Account Summary: ABC Technologies
- **Industry**: Enterprise Software & Cloud (500-1000 employees, HQ Bengaluru)
- **Key Contacts**: Rajesh Kulkarni (CIO), Sunita Menon (VP Sales Ops)
- **Current Opportunity**: **CRM Implementation** valued at **₹8,00,000** (Negotiation stage, 75% probability).
- **Recent Activity**: Architectural deep-dive meeting completed on April 10. Data residency and SSO questions addressed.
- **AI Recommendation**: Prompt procurement for signed Master Services Agreement; offer an accelerated 2-week deployment sprint.`;

      cards = [
        {
          type: 'company',
          title: 'ABC Technologies',
          subtitle: 'Enterprise Software & Cloud • Bengaluru',
          value: '₹120 Cr Annual Rev',
          link: '/companies/comp_1',
          meta: { Owner: 'Vikramaditya Rao', Status: 'Prospect' },
        },
      ];

      suggestedActions = [
        'View ABC Technologies Deal',
        'Log a call with Sunita Menon',
        'Create a follow-up task for Vikramaditya',
      ];
    } else if (q.includes('closing this month') || q.includes('closing')) {
      replyText = `**3 deals are scheduled to close within the current window**:

1. **High-Net-Worth Client Portfolio Portal** — Zenith Financial Advisory (₹7,20,000 | 80% Prob) — Expected April 30
2. **Cold-Chain Container IoT Telemetry** — BlueWave Maritime Fleet (₹9,20,000 | 80% Prob) — Expected April 28
3. **Heavy Forgings Railway Supply Tracker** — Titan Forge Steel (₹24,00,000 | 80% Prob) — Expected May 05

**Total weighted revenue closing soon**: ₹32.32 Lakhs.`;

      suggestedActions = [
        'Review contract terms for Titan Forge',
        'Check BlueWave Maritime activity timeline',
        'Generate revenue pipeline forecast',
      ];
    } else if (q.includes('follow-up email') || q.includes('email for this lead')) {
      replyText = `Here is a tailored executive outreach email for **Sunita Menon (VP of Sales Operations, ABC Technologies)**:

**Subject**: Tailored CRM Architecture & Pilot Framework for ABC Technologies

*Dear Sunita,*

*Thank you for exploring our enterprise platform and reviewing our security specifications over the past week.*

*Given ABC Technologies' upcoming expansion to 450 sales reps and your focus on real-time pipeline forecasting across multiple tiers, I would welcome the opportunity to walk you and CIO Rajesh Kulkarni through a customized 20-minute architecture demonstration.*

*Could you let me know if this Thursday at 3:00 PM IST or Friday at 11:00 AM IST works for an executive walkthrough?*

*Best regards,*  
**Vikramaditya Rao**  
Enterprise Sales Director, NexusCRM`;

      suggestedActions = [
        'Copy email to clipboard',
        'Log email activity on Sunita Menon timeline',
        'Create follow-up task for 48 hours later',
      ];
    } else if (q.includes('task for rahul') || q.includes('create a follow-up task')) {
      mockDb.createTask({
        title: 'Executive Follow-up Call with Client',
        description: 'AI Generated Task: Check on procurement sign-off and legal addendum status.',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'High',
        status: 'Pending',
        assignedToId: 'usr_4',
        assignedToName: 'Rohan Mehta',
        relatedCompanyName: 'ABC Technologies',
      });

      replyText = `✅ **Task created successfully!**
- **Title**: Executive Follow-up Call with Client
- **Assignee**: Rohan Mehta (Sales)
- **Due Date**: Tomorrow
- **Priority**: High
- **Associated Account**: ABC Technologies`;

      suggestedActions = [
        'Open Tasks Board',
        'View upcoming tasks for tomorrow',
      ];
    } else {
      replyText = `I have analyzed your CRM workspace across **1,248 leads**, **74 open deals (₹42.8L pipeline)**, and **50 team tasks**.

How can I help you accelerate sales today? You can ask me:
- *"Which deals need attention today?"*
- *"Show my highest priority leads"*
- *"Summarize ABC Technologies"*
- *"Which deals are closing this month?"*
- *"Generate a follow-up email for Sunita Menon"*
- *"Create a follow-up task for tomorrow"*`;

      suggestedActions = [
        'Which deals need attention today?',
        'Show my highest priority leads',
        'Summarize ABC Technologies',
        'Which deals are closing this month?',
      ];
    }

    const assistantMsg: AiChatMessage = {
      id: `ai_${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cards,
      suggestedActions,
    };

    return simulateNetworkLatency({
      success: true,
      data: assistantMsg,
    }, 200);
  },

  async queryAi(prompt: string): Promise<ApiResponse<{ text: string; data?: any }>> {
    const res = await this.sendMessage(prompt);
    return {
      success: true,
      data: {
        text: res.data.text,
        data: res.data,
      },
    };
  },
};
