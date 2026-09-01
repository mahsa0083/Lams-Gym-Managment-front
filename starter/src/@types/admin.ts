 
export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected';
 export interface paymentMethod{
    paymentId: number;
  subscriptionId: number;
  amount: number;
  status: PaymentStatus | string;
  cardLastFourDigits: string;
  transferDateTime: string;
  firstName: string;
  lastName: string;
  nationalCode: string;
 }