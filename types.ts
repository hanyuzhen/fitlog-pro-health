
export interface HealthRecord {
  id: string;
  date: string;
  morningWeight: number; // 单位：斤
  eveningWeight: number; // 单位：斤
  bmCount: number;
  hasBM: boolean;
  notes?: string;
}

export interface StatsSummary {
  avgMorning: number;
  avgEvening: number;
  bmFrequencyRate: number;
}
