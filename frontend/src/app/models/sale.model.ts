export interface Sale {
  saleid: string;
  policyid: string;
  agentid: string;
  saleamount: number;
  saletype?: string;
  saledate: string; // ISO or mm/dd/yyyy string
  status?: 'Completed' | 'Pending' | 'Cancelled' | string; // new status field
}
