export interface TCheckoutInput {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  notes?: string;
  issueId?: string;
  quantity?: number;
}

export interface TOrderQuery {
  page?: number;
  limit?: number;
  status?: string;
}
