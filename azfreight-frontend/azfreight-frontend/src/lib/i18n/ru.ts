const ru = {
  // Общие
  common: {
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    back: 'Назад',
    next: 'Далее',
    submit: 'Отправить',
    loading: 'Загрузка...',
    search: 'Поиск',
    noResults: 'Ничего не найдено',
    confirm: 'Подтвердить',
    close: 'Закрыть',
    yes: 'Да',
    no: 'Нет',
    required: 'Обязательное',
    optional: 'Необязательное',
    actions: 'Действия',
    status: 'Статус',
    date: 'Дата',
    name: 'Имя',
    email: 'Эл. почта',
    phone: 'Телефон',
    company: 'Компания',
    notes: 'Заметки',
    description: 'Описание',
  },

  // Портал
  portal: {
    submitRequest: 'Подать заявку на перевозку',
    trackShipment: 'Отследить груз',
    welcomeDefault: 'Ваш надёжный логистический партнёр. Подайте заявку на перевозку, чтобы начать.',
    signIn: 'Войти',
    poweredBy: 'Работает на AzFreight',
  },

  // Форма заявки
  requestForm: {
    title: 'Заявка на перевозку',
    steps: {
      contact: 'Контактная информация',
      route: 'Маршрут и транспорт',
      cargo: 'Груз',
      documents: 'Документы',
      confirmation: 'Подтверждение',
    },
    // Контакты
    fullName: 'ФИО',
    emailAddress: 'Эл. почта',
    phoneNumber: 'Телефон',
    companyName: 'Название компании',
    voen: 'VOEN (ИНН)',
    voenPlaceholder: '1234567890',
    // Маршрут
    originCountry: 'Страна отправления',
    originCity: 'Город отправления',
    destinationCountry: 'Страна назначения',
    destinationCity: 'Город назначения',
    transportType: 'Тип транспорта',
    transportTypes: 'Типы транспорта',
    transportOrder: 'Порядок транспортировки (перетащите для изменения)',
    preferredDate: 'Желаемая дата',
    urgentShipment: 'Срочная перевозка',
    // Груз
    cargoType: 'Тип груза',
    cargoSubtype: 'Подкатегория груза',
    cargoDescription: 'Описание',
    weight: 'Вес (кг)',
    volume: 'Объём (CBM)',
    length: 'Длина',
    width: 'Ширина',
    height: 'Высота',
    unit: 'Единица измерения',
    calculatedCbm: 'Расчётный CBM',
    packages: 'Количество мест',
    declaredValue: 'Заявленная стоимость',
    currency: 'Валюта',
    incoterms: 'Инкотермс',
    hsCode: 'Код HS',
    // Специальные требования
    hazardous: 'Опасный груз (ADR/IMDG)',
    refrigeration: 'Температурный режим',
    fragile: 'Хрупкий',
    customsClearance: 'Таможенное оформление',
    groupageLcl: 'Сборный груз (LCL)',
    stackable: 'Штабелируемый',
    // Таможенный раздел
    customsFinancialDetails: 'Таможенные и финансовые данные (необязательно)',
    // Документы
    documentsTitle: 'Документы',
    dragDropFiles: 'Перетащите файлы сюда или нажмите для выбора',
    fileHint: 'PDF, JPG, PNG — макс. 20 МБ на файл, до 10 файлов',
    noDocumentsWarning: 'Вы можете отправить заявку без документов, но обработка может занять больше времени.',
    // Подтверждение
    reviewSubmit: 'Проверка и отправка',
    agreeText: 'Я согласен на обработку моих персональных данных в целях обработки данной заявки на перевозку.',
    submitting: 'Отправка...',
    submitRequest: 'Отправить заявку',
    requestSubmitted: 'Заявка отправлена!',
    requestId: 'Номер вашей заявки',
    willContact: 'Мы свяжемся с вами в течение 24 часов.',
  },

  // Трекинг
  tracking: {
    title: 'Отследить груз',
    referenceNumber: 'Номер отправления',
    placeholder: 'напр. SHP-20260317-0001',
    trackButton: 'Отследить',
    enterNumber: 'Пожалуйста, введите номер отслеживания',
    notFound: 'Отправление не найдено. Проверьте номер.',
    route: 'Маршрут',
    type: 'Тип',
    currentStatus: 'Текущий статус',
    eta: 'Ожидаемая дата прибытия',
    timeline: 'Хронология',
    statusChanged: 'Статус изменён',
  },

  // Типы транспорта
  transport: {
    road_tir: 'Автомобильный / TIR',
    sea: 'Морской',
    air: 'Авиа',
    rail: 'Железнодорожный',
    multimodal: 'Мультимодальный',
  },

  // Статусы отправлений
  statuses: {
    request: 'Заявка',
    confirmed: 'Подтверждено',
    in_transit: 'В пути',
    customs: 'Таможня',
    delivered: 'Доставлено',
    cancelled: 'Отменено',
    // Статусы заявок
    new: 'Новая',
    reviewing: 'На рассмотрении',
    quoted: 'Предложение отправлено',
    converted: 'Конвертировано',
    rejected: 'Отклонено',
  },

  // Статусы инвойсов
  invoiceStatuses: {
    draft: 'Черновик',
    sent: 'Отправлен',
    paid: 'Оплачен',
    partially_paid: 'Частично оплачен',
    overdue: 'Просрочен',
    cancelled: 'Отменён',
  },

  // Роли
  roles: {
    superadmin: 'Суперадмин',
    admin: 'Администратор',
    manager: 'Менеджер',
    accountant: 'Бухгалтер',
    client: 'Клиент',
  },

  // Навигация панели управления
  nav: {
    dashboard: 'Панель управления',
    shipments: 'Отправления',
    requests: 'Заявки',
    clients: 'Клиенты',
    carriers: 'Перевозчики',
    invoices: 'Счета',
    invitations: 'Приглашения',
    users: 'Пользователи',
    portalSettings: 'Настройки портала',
    statusSettings: 'Пользовательские статусы',
    settings: 'Настройки',
  },

  // Типы груза
  cargoTypes: {
    electronics: 'Электроника',
    food_beverage: 'Продукты питания и напитки',
    clothing_textile: 'Одежда и текстиль',
    chemicals: 'Химикаты',
    machinery: 'Машины и оборудование',
    pharma: 'Фармацевтика',
    automotive: 'Автомобильные товары',
    construction: 'Стройматериалы',
    furniture: 'Мебель и товары для дома',
    oil_gas: 'Нефть и газ',
    alcohol_tobacco: 'Алкоголь и табак',
    animals: 'Живые животные',
    plants: 'Растения и семена',
    other: 'Прочее',
  },

  // Счета
  invoices: {
    title: 'Счета',
    number: 'Номер счёта',
    amount: 'Сумма',
    paidAmount: 'Оплаченная сумма',
    remaining: 'Остаток',
    recordPayment: 'Записать оплату',
    enterPaidAmount: 'Введите сумму оплаты',
    paymentDate: 'Дата оплаты',
    paymentRecorded: 'Оплата записана',
    progressLabel: 'Прогресс оплаты',
  },

  // Пользователи
  users: {
    title: 'Пользователи',
    editRole: 'Изменить роль',
    deactivate: 'Деактивировать',
    activate: 'Активировать',
    cannotDeactivateSelf: 'Невозможно деактивировать себя',
  },

  // Суперадмин
  superadmin: {
    title: 'Суперадмин',
    dashboard: 'Панель управления',
    tenants: 'Арендаторы',
    totalTenants: 'Всего арендаторов',
    totalUsers: 'Всего пользователей',
    totalRequests: 'Всего заявок',
    createTenant: 'Создать арендатора',
    tenantName: 'Название компании',
    tenantSlug: 'Slug',
    plan: 'Тарифный план',
    adminName: 'Имя администратора',
    adminEmail: 'Эл. почта администратора',
    adminPassword: 'Пароль администратора',
    deactivateTenant: 'Деактивировать',
    activateTenant: 'Активировать',
    inviteUser: 'Пригласить по эл. почте',
    assignUser: 'Назначить существующего пользователя',
    overview: 'Обзор',
    usersTab: 'Пользователи',
    settingsTab: 'Настройки',
  },

  // Пользовательские статусы
  customStatuses: {
    title: 'Пользовательские статусы',
    create: 'Создать статус',
    statusName: 'Название статуса',
    color: 'Цвет',
    order: 'Порядок',
    noStatuses: 'Пользовательские статусы ещё не созданы',
    assignStatus: 'Пользовательский статус',
    statusNote: 'Примечание к статусу',
  },

  // Перевозчики
  carriers: {
    title: 'Перевозчики',
    assign: 'Назначить перевозчика',
    selectCarrier: 'Выберите перевозчика',
    assigned: 'Назначенный перевозчик',
  },
};

export default ru;
