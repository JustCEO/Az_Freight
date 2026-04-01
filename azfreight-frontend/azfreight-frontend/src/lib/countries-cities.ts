export interface CityData {
  name: Record<string, string>; // locale -> name
}

export interface CountryData {
  name: Record<string, string>; // locale -> name
  cities: CityData[];
}

export const COUNTRIES: CountryData[] = [
  {
    name: { en: 'Azerbaijan', ru: 'Азербайджан', az: 'Azərbaycan' },
    cities: [
      { name: { en: 'Baku', ru: 'Баку', az: 'Bakı' } },
      { name: { en: 'Ganja', ru: 'Гянджа', az: 'Gəncə' } },
      { name: { en: 'Sumgait', ru: 'Сумгаит', az: 'Sumqayıt' } },
      { name: { en: 'Mingachevir', ru: 'Мингечевир', az: 'Mingəçevir' } },
      { name: { en: 'Lankaran', ru: 'Ленкорань', az: 'Lənkəran' } },
      { name: { en: 'Shirvan', ru: 'Ширван', az: 'Şirvan' } },
      { name: { en: 'Nakhchivan', ru: 'Нахчыван', az: 'Naxçıvan' } },
      { name: { en: 'Shaki', ru: 'Шеки', az: 'Şəki' } },
    ],
  },
  {
    name: { en: 'Turkey', ru: 'Турция', az: 'Türkiyə' },
    cities: [
      { name: { en: 'Istanbul', ru: 'Стамбул', az: 'İstanbul' } },
      { name: { en: 'Ankara', ru: 'Анкара', az: 'Ankara' } },
      { name: { en: 'Izmir', ru: 'Измир', az: 'İzmir' } },
      { name: { en: 'Bursa', ru: 'Бурса', az: 'Bursa' } },
      { name: { en: 'Antalya', ru: 'Анталья', az: 'Antalya' } },
      { name: { en: 'Trabzon', ru: 'Трабзон', az: 'Trabzon' } },
      { name: { en: 'Mersin', ru: 'Мерсин', az: 'Mersin' } },
    ],
  },
  {
    name: { en: 'Russia', ru: 'Россия', az: 'Rusiya' },
    cities: [
      { name: { en: 'Moscow', ru: 'Москва', az: 'Moskva' } },
      { name: { en: 'Saint Petersburg', ru: 'Санкт-Петербург', az: 'Sankt-Peterburq' } },
      { name: { en: 'Novosibirsk', ru: 'Новосибирск', az: 'Novosibirsk' } },
      { name: { en: 'Yekaterinburg', ru: 'Екатеринбург', az: 'Yekaterinburq' } },
      { name: { en: 'Kazan', ru: 'Казань', az: 'Kazan' } },
      { name: { en: 'Rostov-on-Don', ru: 'Ростов-на-Дону', az: 'Rostov-Don' } },
    ],
  },
  {
    name: { en: 'Georgia', ru: 'Грузия', az: 'Gürcüstan' },
    cities: [
      { name: { en: 'Tbilisi', ru: 'Тбилиси', az: 'Tbilisi' } },
      { name: { en: 'Batumi', ru: 'Батуми', az: 'Batumi' } },
      { name: { en: 'Kutaisi', ru: 'Кутаиси', az: 'Kutaisi' } },
      { name: { en: 'Poti', ru: 'Поти', az: 'Poti' } },
    ],
  },
  {
    name: { en: 'China', ru: 'Китай', az: 'Çin' },
    cities: [
      { name: { en: 'Shanghai', ru: 'Шанхай', az: 'Şanxay' } },
      { name: { en: 'Beijing', ru: 'Пекин', az: 'Pekin' } },
      { name: { en: 'Shenzhen', ru: 'Шэньчжэнь', az: 'Şençjen' } },
      { name: { en: 'Guangzhou', ru: 'Гуанчжоу', az: 'Quançjou' } },
      { name: { en: 'Ningbo', ru: 'Нинбо', az: 'Ninqbo' } },
      { name: { en: 'Qingdao', ru: 'Циндао', az: 'Çindao' } },
      { name: { en: 'Tianjin', ru: 'Тяньцзинь', az: 'Tyançin' } },
      { name: { en: 'Xiamen', ru: 'Сямэнь', az: 'Syamen' } },
    ],
  },
  {
    name: { en: 'Germany', ru: 'Германия', az: 'Almaniya' },
    cities: [
      { name: { en: 'Hamburg', ru: 'Гамбург', az: 'Hamburq' } },
      { name: { en: 'Berlin', ru: 'Берлин', az: 'Berlin' } },
      { name: { en: 'Munich', ru: 'Мюнхен', az: 'Münhen' } },
      { name: { en: 'Frankfurt', ru: 'Франкфурт', az: 'Frankfurt' } },
      { name: { en: 'Düsseldorf', ru: 'Дюссельдорф', az: 'Düsseldorf' } },
    ],
  },
  {
    name: { en: 'United Arab Emirates', ru: 'ОАЭ', az: 'BƏƏ' },
    cities: [
      { name: { en: 'Dubai', ru: 'Дубай', az: 'Dubay' } },
      { name: { en: 'Abu Dhabi', ru: 'Абу-Даби', az: 'Əbu-Dabi' } },
      { name: { en: 'Sharjah', ru: 'Шарджа', az: 'Şərcə' } },
    ],
  },
  {
    name: { en: 'Iran', ru: 'Иран', az: 'İran' },
    cities: [
      { name: { en: 'Tehran', ru: 'Тегеран', az: 'Tehran' } },
      { name: { en: 'Isfahan', ru: 'Исфахан', az: 'İsfahan' } },
      { name: { en: 'Tabriz', ru: 'Тебриз', az: 'Təbriz' } },
      { name: { en: 'Bandar Abbas', ru: 'Бендер-Аббас', az: 'Bəndər Abbas' } },
    ],
  },
  {
    name: { en: 'Kazakhstan', ru: 'Казахстан', az: 'Qazaxıstan' },
    cities: [
      { name: { en: 'Almaty', ru: 'Алматы', az: 'Almatı' } },
      { name: { en: 'Astana', ru: 'Астана', az: 'Astana' } },
      { name: { en: 'Aktau', ru: 'Актау', az: 'Aktau' } },
    ],
  },
  {
    name: { en: 'Turkmenistan', ru: 'Туркменистан', az: 'Türkmənistan' },
    cities: [
      { name: { en: 'Ashgabat', ru: 'Ашхабад', az: 'Aşqabad' } },
      { name: { en: 'Turkmenbashi', ru: 'Туркменбаши', az: 'Türkmənbaşı' } },
    ],
  },
  {
    name: { en: 'Uzbekistan', ru: 'Узбекистан', az: 'Özbəkistan' },
    cities: [
      { name: { en: 'Tashkent', ru: 'Ташкент', az: 'Daşkənd' } },
      { name: { en: 'Samarkand', ru: 'Самарканд', az: 'Səmərqənd' } },
    ],
  },
  {
    name: { en: 'Ukraine', ru: 'Украина', az: 'Ukrayna' },
    cities: [
      { name: { en: 'Kyiv', ru: 'Киев', az: 'Kiyev' } },
      { name: { en: 'Odessa', ru: 'Одесса', az: 'Odessa' } },
      { name: { en: 'Kharkiv', ru: 'Харьков', az: 'Xarkov' } },
    ],
  },
  {
    name: { en: 'Italy', ru: 'Италия', az: 'İtaliya' },
    cities: [
      { name: { en: 'Milan', ru: 'Милан', az: 'Milan' } },
      { name: { en: 'Rome', ru: 'Рим', az: 'Roma' } },
      { name: { en: 'Genoa', ru: 'Генуя', az: 'Genuya' } },
      { name: { en: 'Naples', ru: 'Неаполь', az: 'Neapol' } },
    ],
  },
  {
    name: { en: 'United Kingdom', ru: 'Великобритания', az: 'Böyük Britaniya' },
    cities: [
      { name: { en: 'London', ru: 'Лондон', az: 'London' } },
      { name: { en: 'Manchester', ru: 'Манчестер', az: 'Mançester' } },
      { name: { en: 'Liverpool', ru: 'Ливерпуль', az: 'Liverpul' } },
    ],
  },
  {
    name: { en: 'United States', ru: 'США', az: 'ABŞ' },
    cities: [
      { name: { en: 'New York', ru: 'Нью-Йорк', az: 'Nyu York' } },
      { name: { en: 'Los Angeles', ru: 'Лос-Анджелес', az: 'Los-Anceles' } },
      { name: { en: 'Houston', ru: 'Хьюстон', az: 'Hyuston' } },
      { name: { en: 'Chicago', ru: 'Чикаго', az: 'Çikaqo' } },
    ],
  },
  {
    name: { en: 'India', ru: 'Индия', az: 'Hindistan' },
    cities: [
      { name: { en: 'Mumbai', ru: 'Мумбаи', az: 'Mumbai' } },
      { name: { en: 'Delhi', ru: 'Дели', az: 'Dehli' } },
      { name: { en: 'Chennai', ru: 'Ченнаи', az: 'Çennay' } },
    ],
  },
  {
    name: { en: 'South Korea', ru: 'Южная Корея', az: 'Cənubi Koreya' },
    cities: [
      { name: { en: 'Seoul', ru: 'Сеул', az: 'Seul' } },
      { name: { en: 'Busan', ru: 'Пусан', az: 'Pusan' } },
    ],
  },
  {
    name: { en: 'Japan', ru: 'Япония', az: 'Yaponiya' },
    cities: [
      { name: { en: 'Tokyo', ru: 'Токио', az: 'Tokio' } },
      { name: { en: 'Yokohama', ru: 'Йокогама', az: 'Yokohama' } },
      { name: { en: 'Osaka', ru: 'Осака', az: 'Osaka' } },
    ],
  },
  {
    name: { en: 'Netherlands', ru: 'Нидерланды', az: 'Niderland' },
    cities: [
      { name: { en: 'Rotterdam', ru: 'Роттердам', az: 'Rotterdam' } },
      { name: { en: 'Amsterdam', ru: 'Амстердам', az: 'Amsterdam' } },
    ],
  },
  {
    name: { en: 'France', ru: 'Франция', az: 'Fransa' },
    cities: [
      { name: { en: 'Paris', ru: 'Париж', az: 'Paris' } },
      { name: { en: 'Marseille', ru: 'Марсель', az: 'Marsel' } },
      { name: { en: 'Le Havre', ru: 'Гавр', az: 'Le Havr' } },
    ],
  },
  {
    name: { en: 'Spain', ru: 'Испания', az: 'İspaniya' },
    cities: [
      { name: { en: 'Madrid', ru: 'Мадрид', az: 'Madrid' } },
      { name: { en: 'Barcelona', ru: 'Барселона', az: 'Barselona' } },
      { name: { en: 'Valencia', ru: 'Валенсия', az: 'Valensiya' } },
    ],
  },
  {
    name: { en: 'Poland', ru: 'Польша', az: 'Polşa' },
    cities: [
      { name: { en: 'Warsaw', ru: 'Варшава', az: 'Varşava' } },
      { name: { en: 'Gdansk', ru: 'Гданьск', az: 'Qdansk' } },
    ],
  },
  {
    name: { en: 'Brazil', ru: 'Бразилия', az: 'Braziliya' },
    cities: [
      { name: { en: 'São Paulo', ru: 'Сан-Паулу', az: 'San-Paulo' } },
      { name: { en: 'Santos', ru: 'Сантос', az: 'Santos' } },
    ],
  },
  {
    name: { en: 'Egypt', ru: 'Египет', az: 'Misir' },
    cities: [
      { name: { en: 'Cairo', ru: 'Каир', az: 'Qahirə' } },
      { name: { en: 'Alexandria', ru: 'Александрия', az: 'İsgəndəriyyə' } },
    ],
  },
  {
    name: { en: 'Belgium', ru: 'Бельгия', az: 'Belçika' },
    cities: [
      { name: { en: 'Antwerp', ru: 'Антверпен', az: 'Antverpen' } },
      { name: { en: 'Brussels', ru: 'Брюссель', az: 'Brüssel' } },
    ],
  },
  {
    name: { en: 'Saudi Arabia', ru: 'Саудовская Аравия', az: 'Səudiyyə Ərəbistanı' },
    cities: [
      { name: { en: 'Riyadh', ru: 'Эр-Рияд', az: 'Ər-Riyad' } },
      { name: { en: 'Jeddah', ru: 'Джидда', az: 'Ciddə' } },
      { name: { en: 'Dammam', ru: 'Даммам', az: 'Dammam' } },
    ],
  },
  {
    name: { en: 'Singapore', ru: 'Сингапур', az: 'Sinqapur' },
    cities: [
      { name: { en: 'Singapore', ru: 'Сингапур', az: 'Sinqapur' } },
    ],
  },
  {
    name: { en: 'Malaysia', ru: 'Малайзия', az: 'Malayziya' },
    cities: [
      { name: { en: 'Kuala Lumpur', ru: 'Куала-Лумпур', az: 'Kuala Lumpur' } },
      { name: { en: 'Port Klang', ru: 'Порт-Кланг', az: 'Port Klanq' } },
    ],
  },
  {
    name: { en: 'Thailand', ru: 'Таиланд', az: 'Tailand' },
    cities: [
      { name: { en: 'Bangkok', ru: 'Бангкок', az: 'Banqkok' } },
      { name: { en: 'Laem Chabang', ru: 'Лем-Чабанг', az: 'Lem Çabanq' } },
    ],
  },
  {
    name: { en: 'Vietnam', ru: 'Вьетнам', az: 'Vyetnam' },
    cities: [
      { name: { en: 'Ho Chi Minh', ru: 'Хошимин', az: 'Ho Şi Min' } },
      { name: { en: 'Hanoi', ru: 'Ханой', az: 'Hanoy' } },
      { name: { en: 'Hai Phong', ru: 'Хайфон', az: 'Hay Fonq' } },
    ],
  },
  {
    name: { en: 'Indonesia', ru: 'Индонезия', az: 'İndoneziya' },
    cities: [
      { name: { en: 'Jakarta', ru: 'Джакарта', az: 'Cakarta' } },
      { name: { en: 'Surabaya', ru: 'Сурабая', az: 'Surabaya' } },
    ],
  },
  {
    name: { en: 'Australia', ru: 'Австралия', az: 'Avstraliya' },
    cities: [
      { name: { en: 'Sydney', ru: 'Сидней', az: 'Sidney' } },
      { name: { en: 'Melbourne', ru: 'Мельбурн', az: 'Melburn' } },
    ],
  },
  {
    name: { en: 'Canada', ru: 'Канада', az: 'Kanada' },
    cities: [
      { name: { en: 'Toronto', ru: 'Торонто', az: 'Toronto' } },
      { name: { en: 'Vancouver', ru: 'Ванкувер', az: 'Vankuver' } },
      { name: { en: 'Montreal', ru: 'Монреаль', az: 'Monreal' } },
    ],
  },
  {
    name: { en: 'Mexico', ru: 'Мексика', az: 'Meksika' },
    cities: [
      { name: { en: 'Mexico City', ru: 'Мехико', az: 'Mexiko' } },
      { name: { en: 'Guadalajara', ru: 'Гвадалахара', az: 'Qvadalaxara' } },
    ],
  },
  {
    name: { en: 'South Africa', ru: 'ЮАР', az: 'CAR' },
    cities: [
      { name: { en: 'Johannesburg', ru: 'Йоханнесбург', az: 'Yohannesburq' } },
      { name: { en: 'Cape Town', ru: 'Кейптаун', az: 'Keyptaun' } },
      { name: { en: 'Durban', ru: 'Дурбан', az: 'Durban' } },
    ],
  },
  {
    name: { en: 'Romania', ru: 'Румыния', az: 'Rumıniya' },
    cities: [
      { name: { en: 'Bucharest', ru: 'Бухарест', az: 'Buxarest' } },
      { name: { en: 'Constanta', ru: 'Констанца', az: 'Konstansa' } },
    ],
  },
  {
    name: { en: 'Bulgaria', ru: 'Болгария', az: 'Bolqarıstan' },
    cities: [
      { name: { en: 'Sofia', ru: 'София', az: 'Sofiya' } },
      { name: { en: 'Varna', ru: 'Варна', az: 'Varna' } },
    ],
  },
  {
    name: { en: 'Greece', ru: 'Греция', az: 'Yunanıstan' },
    cities: [
      { name: { en: 'Athens', ru: 'Афины', az: 'Afina' } },
      { name: { en: 'Thessaloniki', ru: 'Салоники', az: 'Saloniki' } },
      { name: { en: 'Piraeus', ru: 'Пирей', az: 'Pirey' } },
    ],
  },
  {
    name: { en: 'Austria', ru: 'Австрия', az: 'Avstriya' },
    cities: [
      { name: { en: 'Vienna', ru: 'Вена', az: 'Vyana' } },
    ],
  },
  {
    name: { en: 'Switzerland', ru: 'Швейцария', az: 'İsveçrə' },
    cities: [
      { name: { en: 'Zurich', ru: 'Цюрих', az: 'Sürix' } },
      { name: { en: 'Geneva', ru: 'Женева', az: 'Cenevrə' } },
    ],
  },
  {
    name: { en: 'Czech Republic', ru: 'Чехия', az: 'Çexiya' },
    cities: [
      { name: { en: 'Prague', ru: 'Прага', az: 'Praqa' } },
    ],
  },
  {
    name: { en: 'Hungary', ru: 'Венгрия', az: 'Macarıstan' },
    cities: [
      { name: { en: 'Budapest', ru: 'Будапешт', az: 'Budapeşt' } },
    ],
  },
  {
    name: { en: 'Sweden', ru: 'Швеция', az: 'İsveç' },
    cities: [
      { name: { en: 'Stockholm', ru: 'Стокгольм', az: 'Stokholm' } },
      { name: { en: 'Gothenburg', ru: 'Гётеборг', az: 'Göteborg' } },
    ],
  },
  {
    name: { en: 'Finland', ru: 'Финляндия', az: 'Finlandiya' },
    cities: [
      { name: { en: 'Helsinki', ru: 'Хельсинки', az: 'Helsinki' } },
    ],
  },
  {
    name: { en: 'Denmark', ru: 'Дания', az: 'Danimarka' },
    cities: [
      { name: { en: 'Copenhagen', ru: 'Копенгаген', az: 'Kopenhagen' } },
    ],
  },
  {
    name: { en: 'Norway', ru: 'Норвегия', az: 'Norveç' },
    cities: [
      { name: { en: 'Oslo', ru: 'Осло', az: 'Oslo' } },
    ],
  },
  {
    name: { en: 'Portugal', ru: 'Португалия', az: 'Portuqaliya' },
    cities: [
      { name: { en: 'Lisbon', ru: 'Лиссабон', az: 'Lissabon' } },
    ],
  },
  {
    name: { en: 'Belarus', ru: 'Беларусь', az: 'Belarus' },
    cities: [
      { name: { en: 'Minsk', ru: 'Минск', az: 'Minsk' } },
    ],
  },
  {
    name: { en: 'Argentina', ru: 'Аргентина', az: 'Argentina' },
    cities: [
      { name: { en: 'Buenos Aires', ru: 'Буэнос-Айрес', az: 'Buenos Ayres' } },
    ],
  },
  {
    name: { en: 'Philippines', ru: 'Филиппины', az: 'Filippin' },
    cities: [
      { name: { en: 'Manila', ru: 'Манила', az: 'Manila' } },
    ],
  },
  {
    name: { en: 'New Zealand', ru: 'Новая Зеландия', az: 'Yeni Zelandiya' },
    cities: [
      { name: { en: 'Auckland', ru: 'Окленд', az: 'Oklend' } },
    ],
  },
];
