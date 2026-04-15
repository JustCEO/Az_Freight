const az = {
  // Ümumi
  common: {
    save: 'Yadda saxla',
    cancel: 'Ləğv et',
    delete: 'Sil',
    edit: 'Redaktə et',
    create: 'Yarat',
    back: 'Geri',
    next: 'Növbəti',
    submit: 'Göndər',
    loading: 'Yüklənir...',
    search: 'Axtar',
    noResults: 'Nəticə tapılmadı',
    confirm: 'Təsdiq et',
    close: 'Bağla',
    yes: 'Bəli',
    no: 'Xeyr',
    required: 'Məcburi',
    optional: 'İstəyə bağlı',
    actions: 'Əməliyyatlar',
    status: 'Status',
    date: 'Tarix',
    name: 'Ad',
    email: 'E-poçt',
    phone: 'Telefon',
    company: 'Şirkət',
    notes: 'Qeydlər',
    description: 'Təsvir',
  },

  // Portal
  portal: {
    submitRequest: 'Daşıma sorğusu göndər',
    trackShipment: 'Yükü izlə',
    welcomeDefault: 'Etibarlı logistika tərəfdaşınız. Başlamaq üçün daşıma sorğusu göndərin.',
    signIn: 'Daxil ol',
    poweredBy: 'AzFreight tərəfindən dəstəklənir',
  },

  // Sorğu forması
  requestForm: {
    title: 'Daşıma sorğusu',
    steps: {
      contact: 'Əlaqə məlumatları',
      route: 'Marşrut və nəqliyyat',
      cargo: 'Yük',
      documents: 'Sənədlər',
      confirmation: 'Təsdiq',
    },
    // Əlaqə
    fullName: 'Ad Soyad',
    emailAddress: 'E-poçt',
    phoneNumber: 'Telefon',
    companyName: 'Şirkət adı',
    voen: 'VÖEN',
    voenPlaceholder: '1234567890',
    // Marşrut
    originCountry: 'Göndərmə ölkəsi',
    originCity: 'Göndərmə şəhəri',
    destinationCountry: 'Təyinat ölkəsi',
    destinationCity: 'Təyinat şəhəri',
    transportType: 'Nəqliyyat növü',
    transportTypes: 'Nəqliyyat növləri',
    transportOrder: 'Nəqliyyat sırası (sürüşdürərək dəyişdirin)',
    preferredDate: 'Arzu olunan tarix',
    urgentShipment: 'Təcili daşıma',
    // Yük
    cargoType: 'Yük növü',
    cargoSubtype: 'Yük alt kateqoriyası',
    cargoDescription: 'Təsvir',
    weight: 'Çəki (kq)',
    volume: 'Həcm (CBM)',
    length: 'Uzunluq',
    width: 'En',
    height: 'Hündürlük',
    unit: 'Vahid',
    calculatedCbm: 'Hesablanmış CBM',
    packages: 'Bağlama sayı',
    declaredValue: 'Bəyan edilmiş dəyər',
    currency: 'Valyuta',
    incoterms: 'Incoterms',
    hsCode: 'HS Kodu',
    // Xüsusi tələblər
    hazardous: 'Təhlükəli yük (ADR/IMDG)',
    refrigeration: 'Temperatur nəzarətli',
    fragile: 'Kövrək',
    customsClearance: 'Gömrük rəsmiləşdirməsi',
    groupageLcl: 'Qrupal yük (LCL)',
    stackable: 'Yığıla bilən',
    // Gömrük bölməsi
    customsFinancialDetails: 'Gömrük və maliyyə məlumatları (istəyə bağlı)',
    // Sənədlər
    documentsTitle: 'Sənədlər',
    dragDropFiles: 'Faylları bura sürüşdürün və ya seçmək üçün klikləyin',
    fileHint: 'PDF, JPG, PNG — hər fayl üçün maks. 20MB, 10 fayla qədər',
    noDocumentsWarning: 'Sənədsiz göndərə bilərsiniz, lakin emal daha uzun çəkə bilər.',
    // Təsdiq
    reviewSubmit: 'Yoxla və göndər',
    agreeText: 'Bu daşıma sorğusunun emalı məqsədilə şəxsi məlumatlarımın işlənməsinə razıyam.',
    submitting: 'Göndərilir...',
    submitRequest: 'Sorğunu göndər',
    requestSubmitted: 'Sorğu göndərildi!',
    requestId: 'Sorğu nömrəniz',
    willContact: '24 saat ərzində sizinlə əlaqə saxlayacağıq.',
  },

  // İzləmə
  tracking: {
    title: 'Yükü izlə',
    referenceNumber: 'İstinad nömrəsi',
    placeholder: 'məs. SHP-20260317-0001',
    trackButton: 'İzlə',
    enterNumber: 'Zəhmət olmasa izləmə nömrəsini daxil edin',
    notFound: 'Göndərmə tapılmadı. Zəhmət olmasa istinad nömrəsini yoxlayın.',
    route: 'Marşrut',
    type: 'Növ',
    currentStatus: 'Cari status',
    eta: 'Təxmini çatma vaxtı',
    timeline: 'Xronologiya',
    statusChanged: 'Status dəyişdirildi',
  },

  // Nəqliyyat növləri
  transport: {
    road_tir: 'Avtomobil / TIR',
    sea: 'Dəniz daşıması',
    air: 'Hava daşıması',
    rail: 'Dəmir yolu',
    multimodal: 'Multimodal',
  },

  // Göndərmə statusları
  statuses: {
    request: 'Sorğu',
    confirmed: 'Təsdiqlənib',
    in_transit: 'Yolda',
    customs: 'Gömrük',
    delivered: 'Çatdırılıb',
    cancelled: 'Ləğv edilib',
    // Sorğu statusları
    new: 'Yeni',
    reviewing: 'Baxılır',
    quoted: 'Qiymət təklif edilib',
    converted: 'Çevrilib',
    rejected: 'Rədd edilib',
  },

  // Faktura statusları
  invoiceStatuses: {
    draft: 'Qaralama',
    sent: 'Göndərilib',
    paid: 'Ödənilib',
    partially_paid: 'Qismən ödənilib',
    overdue: 'Vaxtı keçib',
    cancelled: 'Ləğv edilib',
  },

  // Rollar
  roles: {
    superadmin: 'Baş admin',
    admin: 'Admin',
    manager: 'Menecer',
    accountant: 'Mühasib',
    client: 'Müştəri',
  },

  // İdarəetmə paneli naviqasiyası
  nav: {
    dashboard: 'İdarəetmə paneli',
    shipments: 'Göndərmələr',
    requests: 'Sorğular',
    clients: 'Müştərilər',
    carriers: 'Daşıyıcılar',
    invoices: 'Fakturalar',
    invitations: 'Dəvətnamələr',
    users: 'İstifadəçilər',
    portalSettings: 'Portal parametrləri',
    statusSettings: 'Fərdi statuslar',
    settings: 'Parametrlər',
  },

  // Yük növləri
  cargoTypes: {
    electronics: 'Elektronika',
    food_beverage: 'Qida və içkilər',
    clothing_textile: 'Geyim və tekstil',
    chemicals: 'Kimyəvi maddələr',
    machinery: 'Maşın və avadanlıqlar',
    pharma: 'Əczaçılıq',
    automotive: 'Avtomobil',
    construction: 'Tikinti materialları',
    furniture: 'Mebel və ev əşyaları',
    oil_gas: 'Neft və qaz',
    alcohol_tobacco: 'Spirtli içkilər və tütün',
    animals: 'Canlı heyvanlar',
    plants: 'Bitkilər və toxumlar',
    other: 'Digər',
  },

  // Fakturalar
  invoices: {
    title: 'Fakturalar',
    number: 'Faktura nömrəsi',
    amount: 'Məbləğ',
    paidAmount: 'Ödənilmiş məbləğ',
    remaining: 'Qalıq',
    recordPayment: 'Ödənişi qeyd et',
    enterPaidAmount: 'Ödəniş məbləğini daxil edin',
    paymentDate: 'Ödəniş tarixi',
    paymentRecorded: 'Ödəniş qeyd edildi',
    progressLabel: 'Ödəniş gedişatı',
  },

  // İstifadəçilər
  users: {
    title: 'İstifadəçilər',
    editRole: 'Rolu dəyişdir',
    deactivate: 'Deaktiv et',
    activate: 'Aktiv et',
    cannotDeactivateSelf: 'Özünüzü deaktiv edə bilməzsiniz',
  },

  // Baş admin
  superadmin: {
    title: 'Baş Admin',
    dashboard: 'İdarəetmə paneli',
    tenants: 'İcarəçilər',
    totalTenants: 'Ümumi icarəçilər',
    totalUsers: 'Ümumi istifadəçilər',
    totalRequests: 'Ümumi sorğular',
    createTenant: 'İcarəçi yarat',
    tenantName: 'Şirkət adı',
    tenantSlug: 'Slug',
    plan: 'Tarif planı',
    adminName: 'Admin adı',
    adminEmail: 'Admin e-poçtu',
    adminPassword: 'Admin şifrəsi',
    deactivateTenant: 'Deaktiv et',
    activateTenant: 'Aktiv et',
    inviteUser: 'E-poçtla dəvət et',
    assignUser: 'Mövcud istifadəçini təyin et',
    overview: 'İcmal',
    usersTab: 'İstifadəçilər',
    settingsTab: 'Parametrlər',
  },

  // Fərdi statuslar
  customStatuses: {
    title: 'Fərdi statuslar',
    create: 'Status yarat',
    statusName: 'Status adı',
    color: 'Rəng',
    order: 'Sıra',
    noStatuses: 'Hələ fərdi status yaradılmayıb',
    assignStatus: 'Fərdi status',
    statusNote: 'Status qeydi',
    builtIn: 'Əsas statuslar',
    builtInHint: 'Bu standart statuslar həmişə mövcuddur. Aşağıdakı fərdi statuslar bu siyahını genişləndirir.',
  },

  // Daşıyıcılar
  carriers: {
    title: 'Daşıyıcılar',
    assign: 'Daşıyıcı təyin et',
    selectCarrier: 'Daşıyıcı seçin',
    assigned: 'Təyin edilmiş daşıyıcı',
  },

  // İdarəetmə paneli
  dashboard: {
    recentShipments: 'Son göndərmələr',
    noShipmentsYet: 'Hələ göndərmə yoxdur',
    refNumber: 'İst. №',
  },

  // Göndərmələr siyahısı
  shipmentsList: {
    searchPlaceholder: 'Göndərmələrdə axtar...',
    allStatuses: 'Bütün statuslar',
    newShipment: 'Yeni göndərmə',
    noShipmentsFound: 'Göndərmə tapılmadı',
    client: 'Müştəri',
    carrier: 'Daşıyıcı',
    route: 'Marşrut',
    created: 'Yaradılıb',
  },

  // Yeni göndərmə
  newShipment: {
    transportAndParties: 'Nəqliyyat və tərəflər',
    transportTypeRequired: 'Nəqliyyat növü *',
    currency: 'Valyuta',
    clientRequired: 'Müştəri *',
    selectClient: 'Müştəri seçin',
    carrier: 'Daşıyıcı',
    selectCarrier: 'Daşıyıcı seçin',
    route: 'Marşrut',
    originCountryRequired: 'Göndərmə ölkəsi *',
    originCityRequired: 'Göndərmə şəhəri *',
    originAddress: 'Göndərmə ünvanı',
    destinationCountryRequired: 'Təyinat ölkəsi *',
    destinationCityRequired: 'Təyinat şəhəri *',
    destinationAddress: 'Təyinat ünvanı',
    eta: 'Təxmini çatma vaxtı',
    cargo: 'Yük',
    weight: 'Çəki (kq)',
    volume: 'Həcm (m³)',
    packageCount: 'Bağlama sayı',
    financials: 'Maliyyə',
    clientRate: 'Müştəri tarifi',
    carrierRate: 'Daşıyıcı tarifi',
    transportDetails: 'Nəqliyyat detalları',
    containerNumber: 'Konteyner nömrəsi',
    blNumber: 'B/L nömrəsi',
    vesselName: 'Gəmi adı',
    awbNumber: 'AWB nömrəsi',
    flightNumber: 'Uçuş nömrəsi',
    truckPlate: 'Yük maşını nömrəsi',
    tirNumber: 'TIR nömrəsi',
    wagonNumbers: 'Vaqon nömrələri',
    creating: 'Yaradılır...',
    createShipment: 'Göndərmə yarat',
    failedToCreate: 'Göndərmə yaradıla bilmədi',
  },

  // Sorğular siyahısı
  requestsList: {
    title: 'Daşıma sorğuları',
    searchPlaceholder: 'Sorğularda axtar...',
    allStatuses: 'Bütün statuslar',
    requester: 'Sorğu verən',
    company: 'Şirkət',
    route: 'Marşrut',
    cargo: 'Yük',
    transport: 'Nəqliyyat',
    noRequestsFound: 'Sorğu tapılmadı',
  },

  // Müştərilər siyahısı
  clientsList: {
    searchPlaceholder: 'Müştərilərdə axtar...',
    newClient: 'Yeni müştəri',
    companyName: 'Şirkət adı',
    country: 'Ölkə',
    city: 'Şəhər',
    active: 'Aktiv',
    inactive: 'Deaktiv',
    noClientsFound: 'Müştəri tapılmadı',
  },

  newClient: {
    clientInformation: 'Müştəri məlumatları',
    companyNameRequired: 'Şirkət adı *',
    taxId: 'Vergi ID',
    website: 'Veb-sayt',
    address: 'Ünvan',
    paymentTermsDays: 'Ödəniş şərtləri (gün)',
    creditLimit: 'Kredit limiti',
    creating: 'Yaradılır...',
    createClient: 'Müştəri yarat',
    failedToCreate: 'Müştəri yaradıla bilmədi',
  },

  // Daşıyıcılar siyahısı
  carriersList: {
    searchPlaceholder: 'Daşıyıcılarda axtar...',
    newCarrier: 'Yeni daşıyıcı',
    companyName: 'Şirkət adı',
    transportTypes: 'Nəqliyyat növləri',
    country: 'Ölkə',
    rating: 'Reytinq',
    shipments: 'Göndərmələr',
    noCarriersFound: 'Daşıyıcı tapılmadı',
  },

  // Fakturalar siyahısı
  invoicesList: {
    searchPlaceholder: 'Fakturalarda axtar...',
    newInvoice: 'Yeni faktura',
    invoiceNumber: 'Faktura №',
    client: 'Müştəri',
    amount: 'Məbləğ',
    issued: 'Verilmə tarixi',
    due: 'Son tarix',
    noInvoicesFound: 'Faktura tapılmadı',
  },

  // İstifadəçilər səhifəsi
  usersPage: {
    lastLogin: 'Son giriş',
    you: '(siz)',
    noUsersFound: 'İstifadəçi tapılmadı',
  },

  // Dəvətnamələr səhifəsi
  invitationsPage: {
    title: 'Dəvətnamələr',
    sendInvitation: 'Dəvətnamə göndər',
    role: 'Rol',
    expiresDays: 'Bitmə müddəti (gün)',
    sending: 'Göndərilir...',
    invitedBy: 'Dəvət edən',
    expires: 'Bitmə tarixi',
    used: 'İstifadə edilib',
    expired: 'Vaxtı keçib',
    copied: 'Kopyalandı!',
    copyLink: 'Linki kopyala',
    revoke: 'Ləğv et',
    noInvitationsYet: 'Hələ dəvətnamə yoxdur',
  },

  // Portal parametrləri səhifəsi
  portalSettingsPage: {
    title: 'Portal parametrləri',
    configuration: 'Konfiqurasiya',
    portalActive: 'Portal aktiv',
    portalUrl: 'Portal URL',
    brandColor: 'Brend rəngi',
    logoUrl: 'Loqo URL',
    welcomeText: 'Qarşılama mətni',
    welcomePlaceholder: 'Müştəriləriniz üçün qarşılama mesajı...',
    saving: 'Saxlanılır...',
    saveSettings: 'Parametrləri saxla',
    saved: 'Saxlanıldı!',
    preview: 'Önizləmə',
    yourCompany: 'Sizin şirkət',
    defaultWelcome: 'Etibarlı logistika tərəfdaşınız.',
  },

  // Autentifikasiya
  auth: {
    signInTitle: 'AzFreight-ə daxil olun',
    signInSubtitle: 'Yük logistikası idarəetməsi',
    emailPlaceholder: 'siz@sirket.com',
    password: 'Şifrə',
    passwordPlaceholder: '••••••••',
    signingIn: 'Daxil olunur...',
    signIn: 'Daxil ol',
    noAccount: 'Hesabınız yoxdur?',
    register: 'Qeydiyyat',
    loginFailed: 'Giriş uğursuz oldu',
    createAccount: 'Hesab yaradın',
    createAccountSubtitle: 'Yük daşımalarınızı idarə etməyə başlayın',
    companySlug: 'Şirkət slug',
    autoGenerated: 'Şirkət adından avtomatik yaradılır',
    yourName: 'Adınız',
    minPassword: 'Minimum 8 simvol',
    creatingAccount: 'Hesab yaradılır...',
    createAccountBtn: 'Hesab yarat',
    hasAccount: 'Artıq hesabınız var?',
    registrationFailed: 'Qeydiyyat uğursuz oldu',
  },
};

export default az;
