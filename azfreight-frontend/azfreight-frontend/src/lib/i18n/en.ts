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
    builtIn: 'Built-in Statuses',
    builtInHint: 'These default statuses are always available. Custom statuses below extend this list.',
    parentStatus: 'Extends',
    parentNone: '— Standalone —',
    parentHint: 'Optionally tie a custom status to a built-in lifecycle state so it appears at the right stage.',
  },

  // Carriers
  carriers: {
    title: 'Carriers',
    assign: 'Assign Carrier',
    selectCarrier: 'Select a carrier',
    assigned: 'Assigned Carrier',
  },

  // Dashboard
  dashboard: {
    recentShipments: 'Recent Shipments',
    noShipmentsYet: 'No shipments yet',
    refNumber: 'Ref #',
  },

  // Shipments list
  shipmentsList: {
    searchPlaceholder: 'Search shipments...',
    allStatuses: 'All Statuses',
    newShipment: 'New Shipment',
    noShipmentsFound: 'No shipments found',
    client: 'Client',
    carrier: 'Carrier',
    route: 'Route',
    created: 'Created',
  },

  // New shipment
  newShipment: {
    transportAndParties: 'Transport & Parties',
    transportTypeRequired: 'Transport Type *',
    currency: 'Currency',
    clientRequired: 'Client *',
    selectClient: 'Select client',
    carrier: 'Carrier',
    selectCarrier: 'Select carrier',
    route: 'Route',
    originCountryRequired: 'Origin Country *',
    originCityRequired: 'Origin City *',
    originAddress: 'Origin Address',
    destinationCountryRequired: 'Destination Country *',
    destinationCityRequired: 'Destination City *',
    destinationAddress: 'Destination Address',
    eta: 'ETA',
    cargo: 'Cargo',
    weight: 'Weight (kg)',
    volume: 'Volume (m³)',
    packageCount: 'Package Count',
    financials: 'Financials',
    clientRate: 'Client Rate',
    carrierRate: 'Carrier Rate',
    transportDetails: 'Transport Details',
    containerNumber: 'Container Number',
    blNumber: 'B/L Number',
    vesselName: 'Vessel Name',
    awbNumber: 'AWB Number',
    flightNumber: 'Flight Number',
    truckPlate: 'Truck Plate',
    tirNumber: 'TIR Number',
    wagonNumbers: 'Wagon Numbers',
    creating: 'Creating...',
    createShipment: 'Create Shipment',
    failedToCreate: 'Failed to create shipment',
  },

  // Requests list
  requestsList: {
    title: 'Shipment Requests',
    searchPlaceholder: 'Search requests...',
    allStatuses: 'All Statuses',
    requester: 'Requester',
    company: 'Company',
    route: 'Route',
    cargo: 'Cargo',
    transport: 'Transport',
    noRequestsFound: 'No requests found',
  },

  // Clients list
  clientsList: {
    searchPlaceholder: 'Search clients...',
    newClient: 'New Client',
    companyName: 'Company Name',
    country: 'Country',
    city: 'City',
    active: 'Active',
    inactive: 'Inactive',
    noClientsFound: 'No clients found',
  },

  newClient: {
    clientInformation: 'Client Information',
    companyNameRequired: 'Company Name *',
    taxId: 'Tax ID',
    website: 'Website',
    address: 'Address',
    paymentTermsDays: 'Payment Terms (days)',
    creditLimit: 'Credit Limit',
    creating: 'Creating...',
    createClient: 'Create Client',
    failedToCreate: 'Failed to create client',
  },

  // Carriers list
  carriersList: {
    searchPlaceholder: 'Search carriers...',
    newCarrier: 'New Carrier',
    companyName: 'Company Name',
    transportTypes: 'Transport Types',
    country: 'Country',
    rating: 'Rating',
    shipments: 'Shipments',
    noCarriersFound: 'No carriers found',
  },

  // Invoices list
  invoicesList: {
    searchPlaceholder: 'Search invoices...',
    newInvoice: 'New Invoice',
    invoiceNumber: 'Invoice #',
    client: 'Client',
    amount: 'Amount',
    issued: 'Issued',
    due: 'Due',
    noInvoicesFound: 'No invoices found',
  },

  // Users page
  usersPage: {
    lastLogin: 'Last Login',
    you: '(you)',
    noUsersFound: 'No users found',
  },

  // Invitations page
  invitationsPage: {
    title: 'Invitations',
    sendInvitation: 'Send Invitation',
    role: 'Role',
    expiresDays: 'Expires (days)',
    invalidEmail: 'Please enter a valid email address',
    sending: 'Sending...',
    invitedBy: 'Invited By',
    expires: 'Expires',
    used: 'Used',
    expired: 'Expired',
    copied: 'Copied!',
    copyLink: 'Copy Link',
    revoke: 'Revoke',
    noInvitationsYet: 'No invitations yet',
  },

  // Portal settings page
  portalSettingsPage: {
    title: 'Portal Settings',
    configuration: 'Configuration',
    portalActive: 'Portal Active',
    portalUrl: 'Portal URL',
    brandColor: 'Brand Color',
    logoUrl: 'Logo URL',
    welcomeText: 'Welcome Text',
    welcomePlaceholder: 'Welcome message for your clients...',
    saving: 'Saving...',
    saveSettings: 'Save Settings',
    saved: 'Saved!',
    preview: 'Preview',
    yourCompany: 'Your Company',
    defaultWelcome: 'Your trusted logistics partner.',
  },

  // Auth
  auth: {
    signInTitle: 'Sign in to AzFreight',
    signInSubtitle: 'Freight logistics management',
    emailPlaceholder: 'you@company.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    signingIn: 'Signing in...',
    signIn: 'Sign in',
    noAccount: "Don't have an account?",
    register: 'Register',
    loginFailed: 'Login failed',
    createAccount: 'Create your account',
    createAccountSubtitle: 'Start managing your freight operations',
    companySlug: 'Company Slug',
    autoGenerated: 'Auto-generated from company name',
    yourName: 'Your Name',
    minPassword: 'Min 8 characters',
    creatingAccount: 'Creating account...',
    createAccountBtn: 'Create account',
    hasAccount: 'Already have an account?',
    registrationFailed: 'Registration failed',
  },
};

export default en;
