
export enum AssetType {
  CASH = 'موجودی نقد',
  BANK_ACCOUNT = 'حساب بانکی',
  GOLD = 'طلا و ارز',
  REAL_ESTATE = 'املاک',
  VEHICLE = 'خودرو',
  OTHER = 'سایر دارایی‌ها'
}

export enum RepaymentType {
  INSTALLMENT = 'اقساطی',
  LUMP_SUM = 'یکجا'
}

export interface Member {
  id: string;
  name: string;
}

export interface Asset {
  id: string;
  memberId: string;
  type: AssetType;
  title: string;
  amount: number;
}

export interface Installment {
  id: string;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  isPaid: boolean;
}

export interface Liability {
  id: string;
  memberId: string;
  title: string;
  totalAmount: number;
  repaymentType: RepaymentType;
  installments: Installment[];
  startDate: string;
  description: string;
}

export interface Income {
  id: string;
  memberId: string;
  source: string;
  amount: number;
  isRecurring: boolean;
}

export interface FinancialData {
  members: Member[];
  assets: Asset[];
  liabilities: Liability[];
  incomes: Income[];
}
