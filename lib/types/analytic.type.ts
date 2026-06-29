export interface AnalyticsData {
  summary: SummaryData;
  chart: ChartData;
}

export interface ChartData {
  contractsOverTime: {
    labels: string[];
    data: number[];
  };
  percentageOfContractsByStatus: {
    labels: string[];
    data: number[];
  };
  percentageOfContractsByPropertyType: {
    labels: string[];
    data: number[];
  };
  percentageOfContractsByPaymentStatus: {
    labels: string[];
    data: number[];
  };
}

export interface SummaryData {
  contracts: {
    totalContracts: number;
    contractsByStatus: Record<string, number>;
    contractsByPropertyType: Record<string, number>;
    contractsByPaymentStatus: Record<string, number>;
  };
  users: {
    activeUsers: number;
    inactiveUsers: number;
  };
}
