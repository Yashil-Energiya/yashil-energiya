import { PUBLIC_OFFER_EFFECTIVE_DATE, PUBLIC_OFFER_PDF_URLS, PUBLIC_OFFER_PUBLICATION_DATE, PUBLIC_OFFER_VERSION } from "./config";
import type { PublicOfferContent } from "./types";

const content = {
  "title": "Ommaviy oferta",
  "subtitle": "Elektr transport vositalarini quvvatlash xizmatlarini ko‘rsatish bo‘yicha qo‘shilish ofertasi",
  "project": "Charging Stations",
  "executor": "СП ООО «Yashil Energiya»",
  "priorityNotice": "Til versiyalari o‘rtasida tafovutlar yuzaga kelgan taqdirda, rus tilidagi versiya ustuvor hisoblanadi.",
  "serviceNotice": "Hujjat zaryadlash stansiyalari tarmog‘i va «Yashil Energiya Quvvatlash stansiyalari» mobil ilovasi orqali elektr transport vositalarini quvvatlash xizmatlariga taalluqlidir.",
  "labels": {
    "project": "Loyiha",
    "version": "Hujjat versiyasi",
    "publicationDate": "E’lon qilingan sana",
    "effectiveDate": "Kuchga kirish sanasi",
    "executor": "Ijrochi",
    "downloadPdf": "PDF yuklab olish",
    "documentFormat": "Hujjat formati: PDF",
    "information": "Hujjat haqida ma’lumot",
    "toc": "Mundarija",
    "archive": "Tahrirlar arxivi",
    "archiveEntries": [
      "1.2-versiya, 21.09.2026",
      "1.1-versiya, 29.06.2026",
      "1.0-versiya, 15.05.2024"
    ],
    "backToChargingStations": "Charging Stations sahifasiga qaytish"
  },
  "seo": {
    "title": "Ommaviy oferta | Charging Stations | Yashil Energiya",
    "description": "Yashil Energiya quvvatlash stansiyalari orqali elektr transport vositalarini quvvatlash xizmatlarini ko‘rsatish bo‘yicha ommaviy oferta."
  },
  "preamble": [
    "Mazkur Oferta O‘zbekiston Respublikasi Fuqarolik kodeksining 367-moddasida belgilanganidek, qo‘shilish shartnomasi (qo‘shilish ofertasi) hisoblanadi. Oferta Ijrochi - mazkur Oferta predmetiga muvofiq Xizmatlar ko‘rsatuvchi shaxs va Mijoz - mazkur Ofertada nazarda tutilgan Xizmatlarni olish niyatida bo‘lgan hamda Ijrochining tizimida ro‘yxatdan o‘tish orqali bunday niyatini tasdiqlagan yoki Ijrochining tizimidagi o‘z akkauntiga kirgan shaxs o‘rtasida tuziladi. Mazkur harakatlarning amalga oshirilishi Mijoz Oferta qoidalari bilan tanishganini, ularni hech qanday istisno va cheklovlarsiz to‘liq hajmda qabul qilganini, shuningdek tegishli Xizmatlarni ko‘rsatish munosabati bilan o‘z shaxsga doir ma’lumotlarini saqlash va qayta ishlashga rozilik berganini anglatadi."
  ],
  "sections": [
    {
      "id": "terms",
      "title": "1. Atamalar va ta’riflar",
      "paragraphs": [
        "Mazkur Oferta maqsadlari uchun quyidagi atamalar quyidagi ma’nolarda qo‘llaniladi:",
        "Oferta aksepti – Mijoz tomonidan mazkur Oferta shartlarining mobil ilova \"Yashil Energiya Quvvatlash stansiyalari\"da ro‘yxatdan o‘tish, shaxsiy kabinetda avtorizatsiyadan o‘tish, Balansni to‘ldirish yoki Xizmatlardan foydalanishni boshlash orqali to‘liq va so‘zsiz qabul qilinishi.",
        "Balans (Shaxsiy hisob) – Mijozning Ijrochi tizimidagi virtual hisob yuritish hisobvarag‘i bo‘lib, Mijoz tomonidan Xizmatlar haqini to‘lash uchun kiritilgan pul mablag‘larini hisobga olish uchun mo‘ljallangan.",
        "Zaryadlash stansiyasi – Ijrochiga tegishli yoki u tomonidan qonuniy asosda foydalaniladigan, elektr transport vositalarining akkumulyator batareyalarini zaryadlash uchun mo‘ljallangan uskuna.",
        "Zaryadlash sessiyasi – Mijozning transport vositasiga elektr energiyasi uzatila boshlangan paytdan zaryadlash yakunlanguniga yoki sessiya majburiy ravishda to‘xtatilguniga qadar Xizmat ko‘rsatish jarayoni.",
        "Ijrochi – zaryadlash stansiyalari tarmog‘i va \"Yashil Energiya Quvvatlash stansiyalari\" mobil ilovasi orqali elektr transport vositalarini zaryadlash bo‘yicha Xizmatlar ko‘rsatuvchi yuridik shaxs.",
        "Mijoz – mazkur Ofertani aksept qilgan va Ijrochining Xizmatlaridan foydalanadigan jismoniy yoki yuridik shaxs.",
        "Shaxsiy kabinet – Mijozning \"Yashil Energiya Quvvatlash stansiyalari\" mobil ilovasidagi shaxsiy bo‘limi bo‘lib, zaryadlash sessiyalarini boshqarish, Balansni to‘ldirish va Xizmatlar haqida ma’lumot olish uchun foydalaniladi.",
        "Mobil ilova – Mijozning Ijrochi bilan o‘zaro aloqasi uchun mo‘ljallangan \"Yashil Energiya Quvvatlash stansiyalari\" dasturiy ta’minoti.",
        "Tarif – Ijrochi tomonidan belgilanadigan va mobil ilovada va/yoki Ijrochining saytida e’lon qilinadigan Xizmatlar qiymati.",
        "Xizmatlar – Ijrochining zaryadlash infratuzilmasidan foydalanish imkoniyatini berish va elektr transport vositalari akkumulyator batareyalarini zaryadlash jarayonini ta’minlash bo‘yicha xizmatlar majmui.",
        "Elektr transport vositasi (ETV) – tortuvchi akkumulyator batareyasi bilan jihozlangan va Zaryadlash stansiyasi orqali zaryadlash uchun mo‘ljallangan transport vositasi.",
        "Sayt – Ijrochining rasmiy internet-resursi.",
        "Shaxsga doir ma’lumotlar – O‘zbekiston Respublikasi qonunchiligiga muvofiq Ijrochi tomonidan qayta ishlanadigan Mijoz haqidagi ma’lumotlar.",
        "1.2. Mazkur Ofertada ta’riflanmagan atamalar O‘zbekiston Respublikasi qonunchiligiga muvofiq talqin qilinadi.",
        "1.3. Oferta matnida atama bir ma’noli talqinga ega bo‘lmagan taqdirda, uning O‘zbekiston Respublikasi qonunchiligida belgilangan talqiniga, bunday talqin mavjud bo‘lmagan taqdirda esa shakllangan ishbilarmonlik amaliyotiga amal qilinadi."
      ]
    },
    {
      "id": "subject",
      "title": "2. Oferta predmeti",
      "paragraphs": [
        "2.1. Ijrochi mazkur Oferta bo‘yicha Mijozlarning elektr transport vositalari akkumulyator batareyalarini zaryadlash stansiyalaridan foydalangan holda zaryadlash xizmatlarini ko‘rsatadi (keyingi o‘rinlarda - \"Xizmatlar\").",
        "2.2. Mijoz mazkur Ofertada belgilangan qoidalarga rioya qilgan holda, Ijrochi tizimidagi Mijozning shaxsiy hisobiga pul mablag‘larini oldindan kiritish orqali Ijrochiga Xizmatlar haqini to‘lash majburiyatini oladi."
      ]
    },
    {
      "id": "cost-settlement",
      "title": "3. Xizmatlar qiymati va hisob-kitoblar tartibi",
      "paragraphs": [
        "3.1. Xizmatlarning aniq qiymati har bir zaryadlash stansiyasi uchun alohida hisoblanadigan va Ijrochining mobil ilovasida ko‘rsatiladigan tariflarga muvofiq belgilanadi.",
        "3.2. Elektr transport vositalarini zaryadlash bo‘yicha Xizmat qiymati haqiqatda iste’mol qilingan elektr energiyasi hajmi asosida hisoblanadi, kVt·soat (kilovatt-soat)da o‘lchanadi va Ijrochining mobil ilovasi interfeysida ko‘rsatiladi. Mazkur qiymat Ijrochining kompleks xizmati uchun qat’iy narx bo‘lib, u zaryadlash stansiyasining texnik ishlashini ta’minlash, servis va ekspluatatsiya xarajatlari, shuningdek Ijrochining tijorat daromadini o‘z ichiga oladi.",
        "3.3. Xizmat ko‘rsatishda iste’mol qilinadigan elektr energiyasi miqdori kVt·soat bo‘yicha tariflashda xizmat Qiymatini hisoblash uchun mo‘ljallangan bo‘lib, zaryadlash stansiyasida o‘rnatilgan elektr energiyasini hisobga olish asboblari orqali aniqlanadi. Ijrochi elektr energiyasi yetkazib beruvchisi hisoblanmaydi, balki zaryadlash bo‘yicha kompleks Xizmat ko‘rsatadi.",
        "3.4. Zaryadlash sessiyasi tugaganidan so‘ng Mijozga avtoturargoh joyini bo‘shatish uchun 20 (yigirma) daqiqa bepul vaqt beriladi. Mazkur muddat tugaganidan keyin stansiyaning avtoturargoh joyida transport vositasi bekor turib qolgan har bir daqiqa uchun 500 (besh yuz) so‘m miqdorida haq undiriladi."
      ]
    },
    {
      "id": "payment-balance",
      "title": "4. To‘lov usullari va mijoz balansi",
      "paragraphs": [
        "4.1. Xizmatlar uchun to‘lov O‘zbekiston Respublikasining milliy valyutasida (so‘m) Ijrochining mobil ilovasidagi Mijozning shaxsiy hisobiga pul mablag‘larini oldindan kiritish (depozit qilish) orqali amalga oshiriladi.",
        "4.2. Mobil ilovadagi shaxsiy hisobni quyidagi usullar bilan to‘ldirish mumkin:",
        "a) Milliy va xalqaro to‘lov tizimlarining bank kartalaridan foydalangan holda (jumladan: Uzcard, Humo, Visa, Mastercard);",
        "b) Integratsiya qilingan elektron to‘lov tizimlari va hamkor banklarning mobil ilovalari orqali (Uzum bank, Paylov, Payme, Click, Paynet);",
        "c) Ilova interfeysida mavjud bo‘lgan boshqa naqdsiz to‘lov usullari orqali.",
        "4.3. Xizmatlarni olish uchun Ijrochining mobil ilovasidagi Mijozning shaxsiy hisobida pul mablag‘lari miqdori kamida 10 000 (o‘n ming) so‘m bo‘lishi kerak.",
        "4.4. Mijoz tomonidan Xizmatlar bevosita olinganda, haqiqatda ko‘rsatilgan Xizmatlar qiymati miqdoridagi pul mablag‘lari Mijoz hisobidan avtomatik tarzda yechib olinadi.",
        "4.5. Agar Xizmatlar ko‘rsatish jarayonida Mijozning shaxsiy hisobidagi pul mablag‘lari summasi 10 000 (o‘n ming) so‘mgacha kamaysa, Xizmatlar ko‘rsatish avtomatik tarzda to‘xtatib turiladi.",
        "4.6. Agar texnik sabablarga ko‘ra zaryadlash sessiyasi o‘z vaqtida to‘xtatilmagan bo‘lsa va Xizmatlar ko‘rsatish yakunida Mijoz balansi manfiy qiymatga tushib qolsa, Mijoz o‘z balansini ijobiy qiymatgacha to‘ldirishi shart. Ijrochi keyingi to‘ldirishda Mijoz balansidan to‘plangan qarzdorlik summasini yechib olish huquqini o‘zida saqlab qoladi.",
        "4.7. Mazkur bo‘lim qoidalariga rioya qilgan holda Xizmatlar uchun to‘lov amalga oshirilgan taqdirda, Mijoz Ijrochining sayt va mobil ilovada joylashtirilgan ma’lumotlarga ega bo‘lgan bo‘sh zaryadlash stansiyalaridan foydalanish huquqiga ega.",
        "4.8. Ijrochi o‘z xohishiga ko‘ra Mijozlarga sodiqlik dasturlari, marketing, reklama va rag‘batlantirish aksiyalari doirasida promokodlar, chegirmalar, bonuslar, maxsus tariflar va boshqa imtiyozlarni taqdim etishga haqli. Bunday imtiyozlar alohida Mijozlarga individual tarzda ham, mobil ilova, rasmiy sayt, reklama materiallari va boshqa axborot kanallari orqali cheklanmagan doiradagi shaxslarga ham taqdim etilishi mumkin. Foydalanish shartlari, amal qilish muddati, taqdim etish tartibi va cheklovlar Ijrochi tomonidan belgilanadi.",
        "4.9. Texnik nosozliklar, mobil ilova, zaryadlash stansiyalari ishida uzilishlar yoki Xizmatlarni ko‘rsatishning imkonsizligi yoxud lozim darajada ko‘rsatilmasligiga olib kelgan boshqa holatlar yuzaga kelganda, Ijrochi Mijoz bilan kelishgan holda promokod, chegirma, Balansga bonus mablag‘lari yoki Ijrochining sodiqlik dasturlarida nazarda tutilgan boshqa imtiyozlar ko‘rinishida kompensatsiya taqdim etishga haqli. Bunday kompensatsiya tomonlarning kelishuvi asosida taqdim etiladi va da’voni tartibga solish usuli sifatida foydalanilishi mumkin."
      ]
    },
    {
      "id": "refunds",
      "title": "5. Pul mablag‘larini qaytarish tartibi",
      "paragraphs": [
        "5.1. Mijoz tomonidan Ijrochi tizimidagi shaxsiy hisobga kiritilgan pul mablag‘lari kelgusi Xizmatlar uchun avans to‘lovi deb e’tirof etiladi. Mijoz Ofertani bajarishdan voz kechish va foydalanilmagan pul mablag‘lari qoldig‘ini qaytarishni talab qilish huquqiga ega.",
        "5.2. Pul mablag‘larini qaytarish Ijrochi tomonidan Mijozning rasmiy yozma arizasi (jumladan, ilovaning Qo‘llab-quvvatlash xizmatining verifikatsiya qilingan kanallari orqali elektron shaklda yuborilgan ariza) asosida amalga oshiriladi.",
        "5.3. Xavfsizlik maqsadida va mablag‘larning ruxsatsiz chiqarib ketilishining oldini olish uchun qaytarish faqat dastlabki hisob to‘ldirilgan aynan o‘sha rekvizitlarga va aynan o‘sha bank kartasiga amalga oshiriladi. Naqd pul mablag‘lari bilan qaytarish amalga oshirilmaydi.",
        "5.4. Arizani ko‘rib chiqish va pul mablag‘larini o‘tkazish muddati Ijrochi tomonidan ariza tasdiqlangan paytdan boshlab 3 (uch) dan 10 (o‘n) bank kunigacha (Mijoz banki shartlariga qarab) tashkil etadi. Qaytarish tranzaksiyasini amalga oshirish uchun uchinchi shaxslar (banklar, to‘lov tizimlari) komissiyalari qaytariladigan summadan ushlab qolinishi mumkin."
      ]
    },
    {
      "id": "risk-control",
      "title": "6. Xavflarni nazorat qilish va firibgarlik operatsiyalarining oldini olish",
      "paragraphs": [
        "6.1. Ijrochi ekvayer banklar va protsessing markazlari bilan birgalikda xavflarni nazorat qilish, shubhali operatsiyalarni aniqlash va firibgarlik harakatlarining oldini olish (antifrod-nazorat) maqsadida tranzaksiyalarning uzluksiz monitoringini amalga oshiradi.",
        "6.2. Ijrochi quyidagi hollarda bir tomonlama tartibda Mijoz akkauntini vaqtincha bloklash, shaxsiy hisobga kirishni cheklash yoki joriy Xizmat ko‘rsatishni to‘xtatib turish huquqiga ega:",
        "a) To‘lov tizimi yoki bankdan to‘lov vositasidan ruxsatsiz foydalanish gumoni to‘g‘risida rasmiy xabarnoma olinganda;",
        "b) Ijrochining avtomatlashtirilgan xavfsizlik tizimlari tomonidan akkauntdan noodatiy, shubhali yoki firibgarlikka oid foydalanish belgilarini aniqlaganda (jumladan, ilova protokollarini buzib kirishga urinishlar);",
        "c) Balans to‘ldirilgan karta egaligining qonuniyligi uchinchi shaxslar tomonidan e’tiroz qilinishi haqidagi da’volar kelib tushganda."
      ]
    },
    {
      "id": "disputed-transactions",
      "title": "7. Nizoli moliyaviy operatsiyalarni ko‘rib chiqish tartibi",
      "paragraphs": [
        "7.1. Pul mablag‘larining yechib olinishi, sessiya tariflanishi hajmiga nisbatan norozilik yoki to‘lovning balansga tushmasligi bilan bog‘liq nizolar yuzaga kelganda, Mijoz Ijrochining Qo‘llab-quvvatlash xizmatiga asoslantirilgan e’tiroz yuborishi shart.",
        "7.2. Mijoz tomonidan moliyaviy e’tirozlarni taqdim etish muddati nizoli tranzaksiya o‘tkazilgan yoki nizoli zaryadlash sessiyasi yakunlangan sanadan boshlab 30 (o‘ttiz) kalendar kunni tashkil etadi. Mazkur muddat tugaganidan so‘ng Ijrochining majburiyatlari lozim darajada bajarilgan, hisob-kitoblar esa Mijoz tomonidan e’tirozlarsiz qabul qilingan deb hisoblanadi.",
        "7.3. E’tirozda Mijoz o‘z identifikatsiya ma’lumotlarini (F.I.O., akkauntga bog‘langan telefon raqami), sessiya sanasi va vaqtini, zaryadlash stansiyasi raqami/manzilini, e’tiroz mazmunini ko‘rsatishi, shuningdek to‘lov tizimi chekini (kvitansiyasini) ilova qilishi shart.",
        "7.4. Ijrochi e’tiroz yuzasidan tekshiruv o‘tkazadi va barcha ma’lumotlar olingan paytdan boshlab 10 (o‘n) ish kunidan ko‘p bo‘lmagan muddatda Mijozga rasmiy javob yuboradi.",
        "7.5. Nizoli holat tashqi to‘lov tizimlari yoki banklar tomonidagi nosozlik sababli yuzaga kelgan hollarda, nizoni yakuniy tartibga solish muddatlari tegishli to‘lov tizimlari reglamentlari (Uzcard, Humo, Visa, Mastercard) bilan belgilanadi."
      ]
    },
    {
      "id": "rights-obligations",
      "title": "8. Tomonlarning huquq va majburiyatlari",
      "paragraphs": [
        "8.1. Mijoz quyidagi huquqlarga ega:",
        "8.1.1. Ijrochidan Xizmatlar qiymati va ularni ko‘rsatish tartibi to‘g‘risida Ijrochining saytida va mobil ilovada to‘liq hamda ishonchli ma’lumot olish;",
        "8.1.2. Ijrochi yoki to‘lov shlyuzlari tomonida rejali texnik ishlar o‘tkazilayotgan davrlar bundan mustasno, shuningdek mazkur Ofertaning 6-bo‘limiga muvofiq xavflarni nazorat qilish va firibgarlik operatsiyalarining oldini olish tizimlari tomonidan qo‘yilgan cheklovlar mavjud bo‘lmagan taqdirda, mazkur Ofertaning 4-bo‘limida nazarda tutilgan usullar bilan mavjud texnik imkoniyatlar doirasida Ijrochi tizimidagi shaxsiy hisobni to‘ldirish.",
        "8.2. Ijrochi quyidagi huquqlarga ega:",
        "8.2.1. Xizmatlar qiymatini, Balans limitlarini, bekor turib qolish tariflarini o‘zgartirish, shuningdek qo‘shimcha pullik xizmatlarni joriy etish;",
        "8.2.2. Sayt va mobil ilovada amaldagi tahrirni joylashtirish orqali Ofertaga bir tomonlama tartibda o‘zgartirishlar kiritish;",
        "8.2.3. Zaryadlash stansiyalarining joylashuvini, ularning texnik parametrlarini o‘zgartirish, ularning sonini ko‘paytirish yoki kamaytirish;",
        "8.2.4. Oferta shartlarini buzgan yoki to‘lanmagan jarima sanksiyalariga ega bo‘lgan Mijozga Xizmatlar ko‘rsatishni to‘xtatib turish yoki uni bloklash.",
        "8.3. Mijoz quyidagilarga majbur:",
        "8.3.1. Ijrochining mulki va uskunalariga ehtiyotkorlik bilan hamda ko‘rsatmalarga qat’iy muvofiq munosabatda bo‘lish;",
        "8.3.2. Ijrochi va uning Xizmatlari sifati haqida ishonchsiz ma’lumotlarni tarqatmaslik;",
        "8.3.3. Oferta doirasida olingan ma’lumotlarga nisbatan to‘liq maxfiylikni saqlash.",
        "8.4. Ijrochi quyidagilarga majbur:",
        "8.4.1. Oferta shartlari, tariflar va faol zaryadlash stansiyalari manzillarini ilovada va saytda o‘z vaqtida e’lon qilish;",
        "8.4.2. Mijozlarni qo‘llab-quvvatlash xizmatining uzluksiz ishlashi va lozim darajada faoliyat yuritishini ta’minlash."
      ]
    },
    {
      "id": "liability-warranties",
      "title": "9. Javobgarlikni cheklash va kafolatlar",
      "paragraphs": [
        "9.1. Ijrochi zaryadlash stansiyasining e’lon qilingan quvvatdagi tokni berish qobiliyatini kafolatlaydi. Ijrochi Mijozning elektr transport vositalaridagi nuqsonlar, nosozliklar yoki konstruktiv xususiyatlar (shu jumladan AKB, kontroller, zaryadlash porti yoki kabel holati), shuningdek batareyani boshqarish ichki tizimi (BMS) cheklovlari sababli yuzaga kelgan zaryadlash sifati va tezligi uchun javobgar bo‘lmaydi.",
        "9.2. Ijrochi energiya tizimi parametrlarining me’yoriy qiymatlardan og‘ishi yoki uchinchi shaxslar elektr tarmoqlarining texnik holati (jumladan, hududiy elektr tarmoqlari tomonidan elektr energiyasining avariyaviy o‘chirilishi) sababli uskuna ishida yuzaga kelgan uzilishlar uchun javobgar bo‘lmaydi.",
        "9.3. Ijrochi Xizmatlarni olish jarayonida Mijoz yoki uchinchi shaxslar tomonidan ko‘rilgan zarar, boy berilgan foyda yoki ziyon uchun, O‘zbekiston Respublikasining amaldagi qonunchiligida bevosita nazarda tutilgan hollar bundan mustasno, javobgar bo‘lmaydi."
      ]
    },
    {
      "id": "confidentiality-personal-data",
      "title": "10. Maxfiylik va shaxsga doir ma’lumotlar",
      "paragraphs": [
        "10.1. Ijrochining tariflash, zaryadlash sessiyalari, to‘lovlar va texnologik jarayonlariga oid ma’lumotlar Maxfiy deb e’tirof etiladi. Mijoz Ijrochining yozma roziligisiz ularni uchinchi shaxslarga oshkor qilmaslik majburiyatini oladi.",
        "10.2. Mijoz mobil ilovada ro‘yxatdan o‘tish va/yoki avtorizatsiyadan o‘tish bo‘yicha konklyudent harakatlarni amalga oshirgan holda, Ijrochiga o‘z shaxsga doir ma’lumotlarini qayta ishlashga to‘liq, xabardor va ongli roziligini bildiradi. Mazkur rozilik quyidagi ma’lumotlarga tatbiq etiladi: familiya, ism, otasining ismi, mobil telefon raqami, elektron pochta manzili, avtotransport vositasining markasi, modeli va davlat ro‘yxatidan o‘tkazilgan raqami, bank kartasi rekvizitlari, shuningdek amalga oshirilgan tranzaksiyalar va zaryadlash sessiyalari haqidagi ma’lumotlar. Qayta ishlash O‘zbekiston Respublikasining \"Shaxsga doir ma’lumotlar to‘g‘risida\"gi Qonuniga muvofiq avtomatlashtirish vositalaridan foydalangan holda ham, ulardan foydalanmagan holda ham amalga oshiriladigan shaxsga doir ma’lumotlarni yig‘ish, tizimlashtirish, jamlash, saqlash, aniqlashtirish (yangilash, o‘zgartirish), foydalanish, egasizlantirish, bloklash va yo‘q qilishni o‘z ichiga oladi.",
        "10.3. Qayta ishlash maqsadlari quyidagilardan iborat: Ofertaning bajarilishini ta’minlash, bozor kon’yunkturasini o‘rganish, statistikani yig‘ish, servisni yaxshilash va Ijrochi mahsulotlarini targ‘ib qilish (jumladan Mijozning SMS, email va telefon orqali reklama materiallarini olish huquqi). Ijrochi O‘zbekiston Respublikasi qonunchiligi talablariga muvofiq ma’lumotlar saqlanishining maxfiyligini kafolatlaydi."
      ]
    },
    {
      "id": "intellectual-property",
      "title": "11. Intellektual mulk",
      "paragraphs": [
        "11.1. Mobil ilova, uning kontenti, dizayni, logotiplari, ma’lumotlar bazalari va boshqa intellektual mulk obyektlariga bo‘lgan mutlaq huquqlar Ijrochiga tegishli.",
        "11.2. Ilovadan ruxsatsiz foydalanish, nusxa ko‘chirish, ma’lumot yig‘ish O‘zbekiston Respublikasi qonunchiligiga muvofiq ma’muriy va jinoiy javobgarlikka sabab bo‘ladi. Bunday huquqbuzarliklar aniqlanganda, Ijrochi bir tomonlama tartibda oldindan ogohlantirmasdan huquqbuzarning akkaunti va shaxsiy hisobiga kirishni bloklash, shuningdek materiallarni huquqni muhofaza qiluvchi organlarga yuborish huquqiga ega."
      ]
    },
    {
      "id": "emission-reductions",
      "title": "12. Emissiyalar qisqarishiga bo‘lgan huquqlar",
      "paragraphs": [
        "12.1. Mazkur Oferta shartlarini qabul qilish orqali Mijoz Ijrochi tomonidan Zaryadlash stansiyalari orqali Mijozga yetkazib beriladigan elektr energiyasidan foydalanish natijasida yoki u bilan bog‘liq holda yuzaga keladigan emissiyalar qisqarishiga bo‘lgan mulk huquqini Ijrochiga o‘tkazishga rozilik bildiradi.",
        "12.2. Mijoz Ijrochi tomonidan Zaryadlash stansiyalari orqali Mijozga yetkazib beriladigan elektr energiyasidan foydalanish natijasida yoki u bilan bog‘liq holda yuzaga keladigan emissiyalar qisqarishining e’tirof etilishini yoki ularga nisbatan biror-bir yuridik huquqlarni Ijrochidan ham, har qanday uchinchi shaxslardan ham talab qilish, so‘rash, olish yoki bu haqda ariza bilan murojaat qilish huquqidan voz kechadi.",
        "12.3. Mijoz Ijrochi tomonidan Zaryadlash stansiyalari orqali Mijozga yetkazib beriladigan elektr energiyasidan foydalanish natijasida yoki u bilan bog‘liq holda yuzaga keladigan har qanday emissiyalar qisqarishiga nisbatan Ijrochi hech qanday yuklamalarsiz to‘liq va mutlaq yuridik hamda huquqiy titulga, shuningdek barcha huquqlarga ega bo‘lishini va ulardan keyinchalik o‘z xohishiga ko‘ra foydalanishi mumkinligini tasdiqlaydi."
      ]
    },
    {
      "id": "penalties",
      "title": "13. Tomonlarning javobgarligi va jarima sanksiyalari",
      "paragraphs": [
        "13.1. Majburiyatlarni bajarmaganlik yoki lozim darajada bajarmaganlik uchun Tomonlar O‘zbekiston Respublikasi qonunchiligiga muvofiq javobgar bo‘ladilar.",
        "13.2. Ijrochi Mijoz tomonidan mazkur Ofertaning 8.3.1-bandi (uskunaga beparvo munosabatda bo‘lish), 8.3.2-bandi (ishonchsiz ma’lumot), 8.3.3-bandi (maxfiy ma’lumotlarni oshkor qilish)da nazarda tutilgan buzilishlar sodir etilgan taqdirda, Mijozga nisbatan jarima sanksiyalarini qo‘llashga haqli.",
        "13.3. Jarima miqdori Ijrochi tomonidan har bir holatda yetkazilgan zararga mutanosib ravishda individual tartibda belgilanadi, bu haqda Mijoz ro‘yxatdan o‘tgan raqamiga SMS orqali yoki ilova orqali bildirishnoma bilan xabardor qilinadi. Jarima to‘liq to‘languniga qadar Xizmatlar ko‘rsatish to‘xtatib turilishi mumkin."
      ]
    },
    {
      "id": "term-amendments",
      "title": "14. Ofertaning amal qilish muddati va uni o‘zgartirish tartibi",
      "paragraphs": [
        "14.1. Ofertaga kiritilgan o‘zgartirishlar Ofertaning matni tarkibida mobil ilovada va Ijrochining rasmiy saytida e’lon qilingan paytdan boshlab kuchga kiradi.",
        "14.2. O‘zgartirishlarga rozi bo‘lmagan taqdirda, Mijoz Xizmatlarni olishni darhol to‘xtatishi va Ijrochiga yozma xabarnoma yuborishi shart. Ilova va zaryadlash stansiyalaridan foydalanishni davom ettirish Mijozning Ofertaning yangi tahririga avtomatik va to‘liq roziligi deb e’tirof etiladi.",
        "14.3. Mazkur Oferta Mijoz ro‘yxatdan o‘tgan yoki akkauntga kirgan paytdan (konklyudent harakat) boshlab kuchga kiradi."
      ]
    },
    {
      "id": "legal-details",
      "title": "15. Tomonlarning yuridik manzillari va rekvizitlari",
      "paragraphs": [
        "Ijrochi:",
        "\"Yashil Energiya\" MChJ QK",
        "100022, Toshkent sh., Yunusobod tumani, Bodomzor ko‘chasi, 2-B",
        "H/r: 2020 8000 9056 1612 2002",
        "\"O‘ZSANOATQURILISHBANK\" ATB bosh ofisi",
        "MFO: 00440",
        "STIR: 310243547",
        "OKED: 42220",
        "QQS to‘lovchisi kodi: 326080214845",
        "info@yashil-energiya.uz",
        "Tel: +998-55-511-88-44 (ofis)",
        "Tel: +998-90-830-10-00 (qo‘llab-quvvatlash xizmati)"
      ]
    }
  ]
};

export const publicOfferUz = {
  ...content,
  version: PUBLIC_OFFER_VERSION,
  publicationDate: PUBLIC_OFFER_PUBLICATION_DATE,
  effectiveDate: PUBLIC_OFFER_EFFECTIVE_DATE,
  pdfUrl: PUBLIC_OFFER_PDF_URLS.uz,
} satisfies PublicOfferContent;
