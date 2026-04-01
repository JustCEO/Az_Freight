export const STATUS_TRANSITIONS: Record<string, string[]> = {
  request: ['confirmed', 'cancelled'],
  confirmed: ['in_transit', 'cancelled'],
  in_transit: ['customs', 'delivered'],
  customs: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const TRANSPORT_LABELS: Record<string, string> = {
  road_tir: 'Road/TIR',
  sea: 'Sea',
  air: 'Air',
  rail: 'Rail',
};

export const STATUS_LABELS: Record<string, string> = {
  request: 'Request',
  confirmed: 'Confirmed',
  in_transit: 'In Transit',
  customs: 'Customs',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  partially_paid: 'Partially Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  accountant: 'Accountant',
  client: 'Client',
};
