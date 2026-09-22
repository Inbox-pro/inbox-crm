import { mockDb } from '../mock/db';
import { ApiResponse, simulateNetworkLatency } from './api';

export interface LeadSourceItem {
  name: string;
  source: string;
  value: number;
  count: number;
  percent: number;
  color: string;
}

export interface ReportsData {
  summary: {
    totalPipelineLakhs: number;
    wonRevenueLakhs: number;
    averageDealSizeLakhs: number;
    averageSalesCycleDays: number;
    winRatePercent: number;
    totalDealsCount: number;
    wonDealsCount: number;
    activeLeadsCount: number;
  };
  leadGrowth: { period: string; leads: number; qualified: number }[];
  revenueData: { month: string; actual: number; target: number; pipeline: number }[];
  pipelineByStage: { stage: string; count: number; value: number; valueLakhs: number; color: string }[];
  leadSources: LeadSourceItem[];
  leadsBySource: LeadSourceItem[];
  salesFunnel: { stage: string; count: number; conversion: string; dropoff: string }[];
  repPerformance: { name: string; dealsWon: number; revenueLakhs: number; winRate: number; quotaAttainment: number }[];
  conversionRates: { month: string; rate: number }[];
}

export const reportsService = {
  async getReportsData(dateRange: string = '30 Days'): Promise<ApiResponse<ReportsData>> {
    const deals = mockDb.getDeals();

    const stageColors: Record<string, string> = {
      New: '#64748b',
      Qualified: '#3b82f6',
      Proposal: '#f59e0b',
      Negotiation: '#8b5cf6',
      Won: '#10b981',
      Lost: '#ef4444',
    };

    let summary = {
      totalPipelineLakhs: 42.8,
      wonRevenueLakhs: 18.4,
      averageDealSizeLakhs: 7.6,
      averageSalesCycleDays: 34,
      winRatePercent: 23.6,
      totalDealsCount: 74,
      wonDealsCount: 16,
      activeLeadsCount: 340,
    };

    let leadGrowth = [
      { period: 'Week 1', leads: 64, qualified: 24 },
      { period: 'Week 2', leads: 138, qualified: 62 },
      { period: 'Week 3', leads: 230, qualified: 105 },
      { period: 'Week 4', leads: 340, qualified: 156 },
    ];

    let revenueData = [
      { month: 'Week 1', actual: 380000, target: 350000, pipeline: 980000 },
      { month: 'Week 2', actual: 790000, target: 700000, pipeline: 1850000 },
      { month: 'Week 3', actual: 1280000, target: 1150000, pipeline: 2900000 },
      { month: 'Week 4', actual: 1840000, target: 1600000, pipeline: 4280000 },
    ];

    let salesFunnel = [
      { stage: 'Total Inbound Prospects', count: 340, conversion: '100%', dropoff: '-' },
      { stage: 'Marketing Qualified Leads', count: 186, conversion: '54.7%', dropoff: '45.3%' },
      { stage: 'Sales Accepted Opportunities', count: 74, conversion: '39.8%', dropoff: '60.2%' },
      { stage: 'Proposals & Quotes Delivered', count: 38, conversion: '51.4%', dropoff: '48.6%' },
      { stage: 'Contracts Under Negotiation', count: 22, conversion: '57.9%', dropoff: '42.1%' },
      { stage: 'Closed Won Accounts', count: 16, conversion: '72.7%', dropoff: '27.3%' },
    ];

    let repPerformance = [
      { name: 'Vikramaditya Rao', dealsWon: 5, revenueLakhs: 6.4, winRate: 71, quotaAttainment: 128 },
      { name: 'Rohan Mehta', dealsWon: 4, revenueLakhs: 4.8, winRate: 64, quotaAttainment: 116 },
      { name: 'Pooja Iyer', dealsWon: 3, revenueLakhs: 3.2, winRate: 60, quotaAttainment: 104 },
      { name: 'Kavita Patel', dealsWon: 2, revenueLakhs: 2.2, winRate: 50, quotaAttainment: 92 },
      { name: 'Arjun Deshmukh', dealsWon: 1, revenueLakhs: 1.1, winRate: 40, quotaAttainment: 75 },
      { name: 'Meera Sen', dealsWon: 1, revenueLakhs: 0.7, winRate: 35, quotaAttainment: 68 },
    ];

    switch (dateRange) {
      case 'Today':
        summary = {
          totalPipelineLakhs: 9.5,
          wonRevenueLakhs: 3.2,
          averageDealSizeLakhs: 3.2,
          averageSalesCycleDays: 8,
          winRatePercent: 28.5,
          totalDealsCount: 9,
          wonDealsCount: 3,
          activeLeadsCount: 18,
        };
        revenueData = [
          { month: '9 AM', actual: 40000, target: 40000, pipeline: 150000 },
          { month: '11 AM', actual: 95000, target: 80000, pipeline: 320000 },
          { month: '1 PM', actual: 160000, target: 140000, pipeline: 510000 },
          { month: '3 PM', actual: 240000, target: 210000, pipeline: 730000 },
          { month: '5 PM', actual: 320000, target: 300000, pipeline: 950000 },
        ];
        leadGrowth = [
          { period: '9 AM', leads: 3, qualified: 1 },
          { period: '11 AM', leads: 7, qualified: 3 },
          { period: '1 PM', leads: 11, qualified: 5 },
          { period: '3 PM', leads: 14, qualified: 7 },
          { period: '5 PM', leads: 18, qualified: 9 },
        ];
        salesFunnel = [
          { stage: 'Today Inbound Prospects', count: 18, conversion: '100%', dropoff: '-' },
          { stage: 'Marketing Qualified Leads', count: 12, conversion: '66.7%', dropoff: '33.3%' },
          { stage: 'Opportunities In Motion', count: 8, conversion: '66.7%', dropoff: '33.3%' },
          { stage: 'Quotes Shared', count: 5, conversion: '62.5%', dropoff: '37.5%' },
          { stage: 'In Final Contracting', count: 4, conversion: '80.0%', dropoff: '20.0%' },
          { stage: 'Closed Won Today', count: 3, conversion: '75.0%', dropoff: '25.0%' },
        ];
        repPerformance = [
          { name: 'Vikramaditya Rao', dealsWon: 1, revenueLakhs: 1.4, winRate: 100, quotaAttainment: 140 },
          { name: 'Rohan Mehta', dealsWon: 1, revenueLakhs: 1.0, winRate: 100, quotaAttainment: 110 },
          { name: 'Pooja Iyer', dealsWon: 1, revenueLakhs: 0.8, winRate: 100, quotaAttainment: 95 },
          { name: 'Kavita Patel', dealsWon: 0, revenueLakhs: 0, winRate: 0, quotaAttainment: 45 },
          { name: 'Arjun Deshmukh', dealsWon: 0, revenueLakhs: 0, winRate: 0, quotaAttainment: 40 },
          { name: 'Meera Sen', dealsWon: 0, revenueLakhs: 0, winRate: 0, quotaAttainment: 35 },
        ];
        break;

      case '7 Days':
        summary = {
          totalPipelineLakhs: 21.4,
          wonRevenueLakhs: 8.6,
          averageDealSizeLakhs: 4.3,
          averageSalesCycleDays: 19,
          winRatePercent: 26.4,
          totalDealsCount: 28,
          wonDealsCount: 6,
          activeLeadsCount: 94,
        };
        revenueData = [
          { month: 'Mon', actual: 90000, target: 100000, pipeline: 320000 },
          { month: 'Tue', actual: 180000, target: 150000, pipeline: 540000 },
          { month: 'Wed', actual: 340000, target: 280000, pipeline: 920000 },
          { month: 'Thu', actual: 510000, target: 450000, pipeline: 1350000 },
          { month: 'Fri', actual: 680000, target: 600000, pipeline: 1720000 },
          { month: 'Sat', actual: 780000, target: 720000, pipeline: 1950000 },
          { month: 'Sun', actual: 860000, target: 800000, pipeline: 2140000 },
        ];
        leadGrowth = [
          { period: 'Mon', leads: 12, qualified: 5 },
          { period: 'Tue', leads: 24, qualified: 11 },
          { period: 'Wed', leads: 42, qualified: 20 },
          { period: 'Thu', leads: 60, qualified: 29 },
          { period: 'Fri', leads: 78, qualified: 38 },
          { period: 'Sat', leads: 88, qualified: 44 },
          { period: 'Sun', leads: 94, qualified: 48 },
        ];
        salesFunnel = [
          { stage: 'Weekly Inbound Prospects', count: 94, conversion: '100%', dropoff: '-' },
          { stage: 'Marketing Qualified Leads', count: 54, conversion: '57.4%', dropoff: '42.6%' },
          { stage: 'Sales Accepted Deals', count: 28, conversion: '51.8%', dropoff: '48.2%' },
          { stage: 'Proposals Delivered', count: 16, conversion: '57.1%', dropoff: '42.9%' },
          { stage: 'Contracts Under Negotiation', count: 9, conversion: '56.2%', dropoff: '43.8%' },
          { stage: 'Closed Won Accounts', count: 6, conversion: '66.7%', dropoff: '33.3%' },
        ];
        repPerformance = [
          { name: 'Vikramaditya Rao', dealsWon: 2, revenueLakhs: 3.2, winRate: 75, quotaAttainment: 130 },
          { name: 'Rohan Mehta', dealsWon: 2, revenueLakhs: 2.6, winRate: 67, quotaAttainment: 118 },
          { name: 'Pooja Iyer', dealsWon: 1, revenueLakhs: 1.4, winRate: 60, quotaAttainment: 102 },
          { name: 'Kavita Patel', dealsWon: 1, revenueLakhs: 1.4, winRate: 50, quotaAttainment: 92 },
          { name: 'Arjun Deshmukh', dealsWon: 0, revenueLakhs: 0, winRate: 0, quotaAttainment: 60 },
          { name: 'Meera Sen', dealsWon: 0, revenueLakhs: 0, winRate: 0, quotaAttainment: 55 },
        ];
        break;

      case '30 Days':
        // Default set above
        break;

      case '90 Days':
        summary = {
          totalPipelineLakhs: 88.5,
          wonRevenueLakhs: 49.2,
          averageDealSizeLakhs: 8.2,
          averageSalesCycleDays: 38,
          winRatePercent: 24.8,
          totalDealsCount: 116,
          wonDealsCount: 38,
          activeLeadsCount: 890,
        };
        revenueData = [
          { month: 'Month 1', actual: 1380000, target: 1200000, pipeline: 2800000 },
          { month: 'Month 2', actual: 2950000, target: 2600000, pipeline: 5600000 },
          { month: 'Month 3', actual: 4920000, target: 4400000, pipeline: 8850000 },
        ];
        leadGrowth = [
          { period: 'Month 1', leads: 260, qualified: 110 },
          { period: 'Month 2', leads: 540, qualified: 240 },
          { period: 'Month 3', leads: 890, qualified: 410 },
        ];
        salesFunnel = [
          { stage: 'Quarterly Inbound Prospects', count: 890, conversion: '100%', dropoff: '-' },
          { stage: 'Marketing Qualified Leads', count: 440, conversion: '49.4%', dropoff: '50.6%' },
          { stage: 'Sales Accepted Deals', count: 190, conversion: '43.2%', dropoff: '56.8%' },
          { stage: 'Proposals Delivered', count: 96, conversion: '50.5%', dropoff: '49.5%' },
          { stage: 'Contracts Under Negotiation', count: 54, conversion: '56.3%', dropoff: '43.8%' },
          { stage: 'Closed Won Accounts', count: 38, conversion: '70.4%', dropoff: '29.6%' },
        ];
        repPerformance = [
          { name: 'Vikramaditya Rao', dealsWon: 12, revenueLakhs: 16.4, winRate: 72, quotaAttainment: 135 },
          { name: 'Rohan Mehta', dealsWon: 10, revenueLakhs: 13.2, winRate: 66, quotaAttainment: 120 },
          { name: 'Pooja Iyer', dealsWon: 7, revenueLakhs: 9.8, winRate: 60, quotaAttainment: 108 },
          { name: 'Kavita Patel', dealsWon: 5, revenueLakhs: 5.6, winRate: 55, quotaAttainment: 94 },
          { name: 'Arjun Deshmukh', dealsWon: 3, revenueLakhs: 2.8, winRate: 48, quotaAttainment: 85 },
          { name: 'Meera Sen', dealsWon: 1, revenueLakhs: 1.4, winRate: 42, quotaAttainment: 78 },
        ];
        break;

      case 'This Year':
        summary = {
          totalPipelineLakhs: 148.5,
          wonRevenueLakhs: 94.5,
          averageDealSizeLakhs: 8.8,
          averageSalesCycleDays: 42,
          winRatePercent: 25.2,
          totalDealsCount: 158,
          wonDealsCount: 72,
          activeLeadsCount: 1248,
        };
        revenueData = [
          { month: 'Q1', actual: 2150000, target: 2000000, pipeline: 4200000 },
          { month: 'Q2', actual: 4800000, target: 4400000, pipeline: 7600000 },
          { month: 'Q3', actual: 7400000, target: 6900000, pipeline: 11400000 },
          { month: 'Q4 (Est)', actual: 9450000, target: 9000000, pipeline: 14850000 },
        ];
        leadGrowth = [
          { period: 'Q1', leads: 280, qualified: 120 },
          { period: 'Q2', leads: 620, qualified: 280 },
          { period: 'Q3', leads: 960, qualified: 440 },
          { period: 'Q4', leads: 1248, qualified: 590 },
        ];
        salesFunnel = [
          { stage: 'Total Inbound Prospects', count: 1248, conversion: '100%', dropoff: '-' },
          { stage: 'Marketing Qualified Leads', count: 712, conversion: '57.1%', dropoff: '42.9%' },
          { stage: 'Sales Accepted Deals', count: 320, conversion: '44.9%', dropoff: '55.1%' },
          { stage: 'Proposals Delivered', count: 174, conversion: '54.4%', dropoff: '45.6%' },
          { stage: 'Contracts Under Negotiation', count: 98, conversion: '56.3%', dropoff: '43.7%' },
          { stage: 'Closed Won Accounts', count: 72, conversion: '73.5%', dropoff: '26.5%' },
        ];
        repPerformance = [
          { name: 'Vikramaditya Rao', dealsWon: 24, revenueLakhs: 31.8, winRate: 74, quotaAttainment: 142 },
          { name: 'Rohan Mehta', dealsWon: 19, revenueLakhs: 24.6, winRate: 68, quotaAttainment: 128 },
          { name: 'Pooja Iyer', dealsWon: 14, revenueLakhs: 18.2, winRate: 62, quotaAttainment: 114 },
          { name: 'Kavita Patel', dealsWon: 8, revenueLakhs: 10.4, winRate: 56, quotaAttainment: 98 },
          { name: 'Arjun Deshmukh', dealsWon: 5, revenueLakhs: 5.8, winRate: 50, quotaAttainment: 89 },
          { name: 'Meera Sen', dealsWon: 2, revenueLakhs: 3.7, winRate: 45, quotaAttainment: 82 },
        ];
        break;
    }

    const stages = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    const pipelineByStage = stages.map(st => {
      const filtered = deals.filter(d => d.stage === st);
      const val = filtered.reduce((s, d) => s + (d.value || 0), 0);
      return {
        stage: st,
        count: filtered.length,
        value: val,
        valueLakhs: Math.round((val / 100000) * 10) / 10,
        color: stageColors[st] || '#64748b',
      };
    });

    const leadSourcesRaw = [
      { name: 'Website', value: 42, percent: 40, color: '#3b82f6' },
      { name: 'Referral', value: 24, percent: 23, color: '#10b981' },
      { name: 'LinkedIn', value: 18, percent: 17, color: '#0ea5e9' },
      { name: 'Advertisement', value: 12, percent: 11, color: '#f59e0b' },
      { name: 'Cold Call', value: 6, percent: 6, color: '#8b5cf6' },
      { name: 'Email', value: 3, percent: 3, color: '#ec4899' },
    ];

    const leadSources: LeadSourceItem[] = leadSourcesRaw.map(s => ({
      name: s.name,
      source: s.name,
      value: s.value,
      count: s.value,
      percent: s.percent,
      color: s.color,
    }));

    const conversionRates = [
      { month: 'Nov', rate: 19.2 },
      { month: 'Dec', rate: 20.8 },
      { month: 'Jan', rate: 21.5 },
      { month: 'Feb', rate: 22.1 },
      { month: 'Mar', rate: 23.6 },
    ];

    return simulateNetworkLatency({
      success: true,
      data: {
        summary,
        leadGrowth,
        revenueData,
        pipelineByStage,
        leadSources,
        leadsBySource: leadSources,
        salesFunnel,
        repPerformance,
        conversionRates,
      },
    }, 40);
  },
};
