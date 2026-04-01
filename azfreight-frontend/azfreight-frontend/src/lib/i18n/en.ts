const en = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    loading: 'Loading...',
    search: 'Search',
    noResults: 'No results found',
    confirm: 'Confirm',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    required: 'Required',
    optional: 'Optional',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    notes: 'Notes',
    description: 'Description',
  },

  // Portal
  portal: {
    submitRequest: 'Submit Shipment Request',
    trackShipment: 'Track Shipment',
    welcomeDefault: 'Your trusted logistics partner. Submit a shipment request to get started.',
    signIn: 'Sign In',
    poweredBy: 'Powered by AzFreight',
  },

  // Request form
  requestForm: {
    title: 'Shipment Request',
    steps: {
      contact: 'Contact Info',
      route: 'Route & Transport',
      cargo: 'Cargo',
      documents: 'Documents',
      confirmation: 'Confirmation',
    },
    // Contact
    fullName: 'Full Name',
    emailAddress: 'Email',
    phoneNumber: 'Phone',
    companyName: 'Company Name',
    voen: 'VOEN (Tax ID)',
    voenPlaceholder: '1234567890',
    // Route
    originCountry: 'Origin Country',
    originCity: 'Origin City',
    destinationCountry: 'Destination Country',
    destinationCity: 'Destination City',
    transportType: 'Transport Type',
    transportTypes: 'Transport Types',
    transportOrder: 'Transport Order (drag to reorder)',
    preferredDate: 'Preferred Date',
    urgentShipment: 'Urgent Shipment',
    // Cargo
    cargoType: 'Cargo Type',
    cargoSubtype: 'Cargo Subcategory',
    cargoDescription: 'Description',
    weight: 'Weight (kg)',
    volume: 'Volume (CBM)',
    length: 'Length',
    width: 'Width',
    height: 'Height',
    unit: 'Unit',
    calculatedCbm: 'Calculated CBM',
    packages: 'Packages',
    declaredValue: 'Declared Value',
    currency: 'Currency',
    incoterms: 'Incoterms',
    hsCode: 'HS Code',
    // Special requirements
    hazardous: 'Hazardous (ADR/IMDG)',
    refrigeration: 'Temperature controlled',
    fragile: 'Fragile',
    customsClearance: 'Customs Clearance',
    groupageLcl: 'Groupage (LCL)',
    stackable: 'Stackable',
    // Customs section
    customsFinancialDetails: 'Customs & Financial Details (Optional)',
    // Documents
    documentsTitle: 'Documents',
    dragDropFiles: 'Drag & drop files here, or click to browse',
    fileHint: 'PDF, JPG, PNG — max 20MB per file, up to 10 files',
    noDocumentsWarning: 'You can submit without documents, but processing may take longer.',
    // Confirmation
    reviewSubmit: 'Review & Submit',
    agreeText: 'I agree to the processing of my personal data for the purpose of handling this shipment request.',
    submitting: 'Submitting...',
    submitRequest: 'Submit Request',
    requestSubmitted: 'Request Submitted!',
    requestId: 'Your request ID',
    willContact: 'We will contact you within 24 hours.',
  },

  // Tracking
  tracking: {
    title: 'Track Shipment',
    referenceNumber: 'Reference Number',
    placeholder: 'e.g. SHP-20260317-0001',
    trackButton: 'Track',
    enterNumber: 'Please enter a tracking number',
    notFound: 'Shipment not found. Please check the reference number.',
    route: 'Route',
    type: 'Type',
    currentStatus: 'Current Status',
    eta: 'ETA',
    timeline: 'Timeline',
    statusChanged: 'Status changed',
  },

  // Transport types
  transport: {
    road_tir: 'Road / TIR',
    sea: 'Sea Freight',
    air: 'Air Freight',
    rail: 'Rail',
    multimodal: 'Multimodal',
  },

  // Shipment statuses
  statuses: {
    request: 'Request',
    confirmed: 'Confirmed',
    in_transit: 'In Transit',
    customs: 'Customs',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    // Request statuses
    new: 'New',
    reviewing: 'Reviewing',
    quoted: 'Quoted',
    converted: 'Converted',
    rejected: 'Rejected',
  },

  // Invoice statuses
  invoiceStatuses: {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    partially_paid: 'Partially Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  },

  // Roles
  roles: {
    superadmin: 'Super Admin',
    admin: 'Admin',
    manager: 'Manager',
    accountant: 'Accountant',
    client: 'Client',
  },

  // Dashboard sidebar navigation
  nav: {
    dashboard: 'Dashboard',
    shipments: 'Shipments',
    requests: 'Requests',
    clients: 'Clients',
    carriers: 'Carriers',
    invoices: 'Invoices',
    invitations: 'Invitations',
    users: 'Users',
    portalSettings: 'Portal Settings',
    statusSettings: 'Custom Statuses',
    settings: 'Settings',
  },

  // Cargo types
  cargoTypes: {
    electronics: 'Electronics',
    food_beverage: 'Food & Beverage',
    clothing_textile: 'Clothing & Textile',
    chemicals: 'Chemicals',
    machinery: 'Machinery & Equipment',
    pharma: 'Pharmaceuticals',
    automotive: 'Automotive',
    construction: 'Construction Materials',
    furniture: 'Furniture & Home',
    oil_gas: 'Oil & Gas',
    alcohol_tobacco: 'Alcohol & Tobacco',
    animals: 'Live Animals',
    plants: 'Plants & Seeds',
    other: 'Other',
  },

  // Invoices
  invoices: {
    title: 'Invoices',
    number: 'Invoice Number',
    amount: 'Amount',
    paidAmount: 'Paid Amount',
    remaining: 'Remaining',
    recordPayment: 'Record Payment',
    enterPaidAmount: 'Enter paid amount',
    paymentDate: 'Payment date',
    paymentRecorded: 'Payment recorded',
    progressLabel: 'Payment Progress',
  },

  // Users
  users: {
    title: 'Users',
    editRole: 'Edit Role',
    deactivate: 'Deactivate',
    activate: 'Activate',
    cannotDeactivateSelf: 'Cannot deactivate yourself',
  },

  // Superadmin
  superadmin: {
    title: 'Super Admin',
    dashboard: 'Dashboard',
    tenants: 'Tenants',
    totalTenants: 'Total Tenants',
    totalUsers: 'Total Users',
    totalRequests: 'Total Requests',
    createTenant: 'Create Tenant',
    tenantName: 'Company Name',
    tenantSlug: 'Slug',
    plan: 'Plan',
    adminName: 'Admin Name',
    adminEmail: 'Admin Email',
    adminPassword: 'Admin Password',
    deactivateTenant: 'Deactivate',
    activateTenant: 'Activate',
    inviteUser: 'Invite by email',
    assignUser: 'Assign existing user',
    overview: 'Overview',
    usersTab: 'Users',
    settingsTab: 'Settings',
  },

  // Custom statuses
  customStatuses: {
    title: 'Custom Statuses',
    create: 'Create Status',
    statusName: 'Status Name',
    color: 'Color',
    order: 'Order',
    noStatuses: 'No custom statuses yet',
    assignStatus: 'Custom Status',
    statusNote: 'Status Note',
  },

  // Carriers
  carriers: {
    title: 'Carriers',
    assign: 'Assign Carrier',
    selectCarrier: 'Select a carrier',
    assigned: 'Assigned Carrier',
  },
};

export default en;
