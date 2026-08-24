export type DashboardTimeframe = "30d" | "6m" | "12m" | "year";

export interface DashboardSummary {
  totalFiles: number;
  totalSuccessfulValue: number;
  successRate: number;
  inProgressFiles: number;
  growthRate: number;
}

export interface TrendPoint {
  period: string;
  fileCount: number;
  auctionValue: number;
}

export interface AssetBreakdownItem {
  assetType: string;
  fileCount: number;
  totalValue: number;
}

export interface ContractOwnerBreakdownItem {
  ownerType: string | null;
  fileCount: number;
}

export interface RecentFile {
  id: number;
  fileCode: string;
  assetName: string;
  createdDate: string;
  status: string;
  assignedOfficer: string;
}

export interface LiquidatedFile {
  id: number;
  fileCode: string;
  startingPrice: number;
  winningPrice: number;
  auctioneer: string;
  liquidationDate: string;
}

export interface TopOfficer {
  id: number;
  officerName: string;
  handledFiles: number;
  totalValue: number;
  completionRate: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  trends: TrendPoint[];
  assetBreakdown: AssetBreakdownItem[];
  contractOwnerBreakdown: ContractOwnerBreakdownItem[];
  recentFiles: RecentFile[];
  liquidatedFiles: LiquidatedFile[];
  topOfficers: TopOfficer[];
}

// Kept for the reusable legacy chart/table components still used elsewhere.
import { ContractStatus, PaymentStatus, PropertyType } from "../enums/contract.enum";
export interface ChartData {
  percentageOfContractsByStatus: { labels: string[]; data: number[] };
  percentageOfContractsByPropertyType: { labels: string[]; data: number[] };
  percentageOfContractsByPaymentStatus: { labels: string[]; data: number[] };
}
export interface recentContractsData {
  id: string;
  contractNumber: string;
  propertyName: string;
  propertyType: PropertyType;
  status: ContractStatus;
  paymentStatus: PaymentStatus;
}
