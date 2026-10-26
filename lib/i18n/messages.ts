import type { Locale } from "./locales";

/**
 * Flat message catalogue. Russian is the source of truth: every other locale
 * must provide exactly the same keys (checked by TypeScript and by a unit test).
 *
 * Placeholders use `{name}` syntax and are replaced by `translate()`.
 */
const ru = {
  "app.name": "Электроэнергия",
  "app.tagline": "расчёт и оплата по двум тарифам",
  "app.home": "На главную",

  "common.settings": "Настройки",
  "common.cancel": "Отмена",
  "common.close": "Закрыть",
  "common.edit": "Изменить",
  "common.delete": "Удалить",
  "common.open": "Открыть",
  "common.change": "Изменить",
  "common.confirm": "Подтвердить",
  "common.wait": "Подождите…",
  "common.day": "День",
  "common.night": "Ночь",
  "common.kwh": "кВт·ч",
  "common.yes": "Да",
  "common.no": "Нет",

  "boot.loading": "Загружаем расчёты…",
  "error.loadTitle": "Не удалось загрузить данные",
  "error.retry": "Повторить",
  "error.settings": "Настройки",
  "error.storageUnavailable": "Хранилище недоступно",
  "error.storageUnavailableCloud":
    "Хранилище в облаке недоступно. Проверьте настройки KV_REST_API_URL и KV_REST_API_TOKEN.",
  "error.recordNotFound": "Расчёт не найден",
  "error.paidLocked":
    "Оплаченный расчёт нельзя изменить. Сначала отмените оплату.",
  "error.noLocalRecords": "На этом устройстве нет сохранённых расчётов",
  "error.cloudNotConnected": "Облако не подключено",
  "error.unexpected": "Что-то пошло не так. Попробуйте ещё раз.",

  "lock.eyebrow": "Личный кабинет",
  "lock.subtitle":
    "Введите PIN-код, чтобы открыть расчёты и историю оплат на этом устройстве.",
  "lock.pinLabel": "PIN-код",
  "lock.pinPlaceholder": "PIN-код",
  "lock.enterPin": "Введите PIN-код",
  "lock.checking": "Проверяем…",
  "lock.submit": "Войти",
  "lock.hintBefore": "PIN-код задаётся владельцем приложения в переменной ",
  "lock.hintAfter": " на Vercel. Сессия сохраняется на 120 дней.",
  "lock.fallback": "Не удалось войти",

  "header.cloud": "Облако",
  "header.local": "Это устройство",
  "hero.eyebrow": "Личный учёт · {month}",
  "hero.title1": "Свет посчитан.",
  "hero.title2": "История сохранена.",
  "hero.subtitle":
    "Внесите показания за день и ночь — сумма посчитается автоматически. Отметьте оплату, и приложение запомнит дату навсегда.",
  "hero.changeRate": "изменить",
  "stats.toPay": "К оплате",
  "stats.unpaid": "Не оплачено: {count}",
  "stats.allPaid": "всё оплачено",
  "stats.paidForYear": "Оплачено за {year}",
  "stats.payments": "Платежей: {count}",
  "stats.noPayments": "пока нет платежей",
  "stats.usageForYear": "Расход за {year}",
  "stats.usageSub": "кВт·ч · {count} мес.",

  "banner.localTitle": "Данные хранятся только в этом браузере",
  "banner.localText":
    "Чтобы открывать историю с телефона и компьютера, включите бесплатное облако — настройка за пару минут. Инструкция в настройках.",
  "banner.configure": "Настроить",

  "side.ratesTitle": "Ваши тарифы",
  "side.dayHours": "с 07:00 до 23:00",
  "side.nightHours": "с 23:00 до 07:00",
  "side.rateNote": "Цена за 1 кВт·ч для новых расчётов.",
  "side.lastTitle": "Последний расчёт",
  "side.toHistory": "В историю",
  "side.statusPaid": "Оплачено",
  "side.statusUnpaid": "Не оплачено",
  "side.editReadings": "Изменить показания",
  "side.recordPaid": "Расчёт оплачен",
  "side.emptyTitle": "История пока пуста",
  "side.emptyText":
    "Первый расчёт появится здесь и будет храниться годами.",
  "side.syncTitle": "Синхронизация включена",
  "side.privacyTitle": "Ваши данные — только ваши",
  "side.syncText":
    "Телефон и компьютер видят одну историю. Вход защищён PIN-кодом.",
  "side.privacyText":
    "Показания не отправляются энергопоставщику. Скачайте резервную копию в настройках.",

  "footer.summary":
    "Личный расчёт электроэнергии · {day} / {night} ₴ за кВт·ч",
  "footer.settings": "Настройки и резервная копия",

  "form.newEyebrow": "Новый расчёт",
  "form.editEyebrow": "Редактирование",
  "form.newTitle": "Внесите показания",
  "form.editBanner":
    "Вы изменяете сохранённый расчёт. После сохранения история обновится.",
  "form.cancel": "Отменить",
  "form.periodLabel": "Расчётный месяц",
  "form.monthAria": "Месяц",
  "form.yearAria": "Год",
  "form.periodHint": "Месяц, за который оплачиваем",
  "form.enteredAtLabel": "Дата внесения данных",
  "form.enteredAtHint": "Когда вы записали показания",
  "form.readingsSection": "Показания счётчика",
  "form.prefill": "Прошлые показания подставлены из расчёта за {month}",
  "form.prevMonth": "Прошлый месяц",
  "form.thisMonth": "Этот месяц",
  "form.used": "Использовано",
  "form.rateUnit": "₴ / кВт·ч",
  "form.ratesToggle": "Тарифы для этого расчёта",
  "form.rateDayLabel": "Тариф день, ₴/кВт·ч",
  "form.rateNightLabel": "Тариф ночь, ₴/кВт·ч",
  "form.ratesHint":
    "Тариф сохраняется вместе с расчётом. Если тарифы изменятся, старые месяцы останутся посчитанными по прежней цене.",
  "form.duplicateTitle": "За {month} уже есть расчёт.",
  "form.duplicateText":
    "Откройте его, чтобы изменить показания, или выберите другой месяц.",
  "form.openExisting": "Открыть",
  "form.toPay": "К оплате за {month}",
  "form.totalKwh": "кВт·ч всего",
  "form.breakdownDay": "День · {kwh} кВт·ч × {rate}",
  "form.breakdownNight": "Ночь · {kwh} кВт·ч × {rate}",
  "form.negative":
    "Показание «этот месяц» меньше показания за прошлый месяц. Проверьте цифры.",
  "form.resultPlaceholder":
    "Заполните показания за прошлый и текущий месяц — сумма посчитается автоматически.",
  "form.saving": "Сохраняем…",
  "form.save": "Сохранить расчёт",
  "form.saveChanges": "Сохранить изменения",
  "form.note":
    "После сохранения расчёт появится в истории. Отметка «Оплачено» ставится там же и фиксирует дату оплаты.",
  "form.validationToast": "Проверьте заполнение полей",
  "form.saveError": "Не удалось сохранить расчёт",
  "form.saved": "Расчёт за {month} сохранён",
  "form.savedEdit": "Изменения за {month} сохранены",

  "validation.periodRequired": "Выберите расчётный месяц",
  "validation.periodDuplicate": "За этот месяц уже есть расчёт",
  "validation.enteredAtRequired": "Укажите дату внесения показаний",
  "validation.prevRequired": "Введите показание за прошлый месяц",
  "validation.currRequired": "Введите показание за этот месяц",
  "validation.negativeReading": "Показание не может быть отрицательным",
  "validation.readingTooLarge": "Слишком большое значение",
  "validation.currLessPrev":
    "Показание за этот месяц меньше предыдущего",
  "validation.rateRequired": "Укажите тариф",
  "validation.ratePositive": "Тариф должен быть больше нуля",
  "validation.rateTooLarge": "Слишком большой тариф",

  "history.eyebrow": "История",
  "history.title": "Расчёты и оплаты",
  "history.subtitle":
    "Все месяцы сохраняются — можно вернуться к любому году.",
  "history.yearFilter": "Фильтр по годам",
  "history.all": "Все",
  "history.emptyAll": "Пока нет расчётов",
  "history.emptyYear": "За {year} год расчётов нет",
  "history.emptyText":
    "Сохраните первый расчёт — он появится здесь. Записи хранятся годами, так что история всегда будет под рукой.",
  "history.goToCalc": "К расчёту",
  "history.showAll": "Показать все годы",
  "history.usage": "Расход",
  "history.charged": "Начислено",
  "history.paid": "Оплачено",
  "history.debt": "Долг",
  "history.chartTitle": "Начисления по месяцам, {year}",
  "history.yearGroup": "{year} год",
  "history.total": "Записей: {count} · {kwh} · {scope}",
  "history.scopeAll": "за всё время",
  "history.scopeYear": "за {year} год",

  "record.dataFrom": "данные от {date}",
  "record.metaDay": "День: {prev} → {curr}",
  "record.metaNight": "Ночь: {prev} → {curr}",
  "record.markPaid": "Отметить оплату",
  "record.payDateAuto": "Дата зафиксируется автоматически",
  "record.unlock": "Отменить оплату",
  "record.edit": "Изменить",
  "record.delete": "Удалить",

  "settings.title": "Настройки",
  "settings.languageTitle": "Язык интерфейса",
  "settings.languageText":
    "Выберите язык — изменение применится сразу и сохранится на этом устройстве.",
  "settings.ratesTitle": "Тарифы по умолчанию",
  "settings.ratesText":
    "Подставляются в новые расчёты. В сохранённых месяцах цены не меняются.",
  "settings.dayRateLabel": "День, ₴/кВт·ч",
  "settings.nightRateLabel": "Ночь, ₴/кВт·ч",
  "settings.rateError": "Укажите положительные значения тарифов",
  "settings.saveRates": "Сохранить тарифы",
  "settings.storageTitle": "Хранение данных",
  "settings.storageCloudText":
    "Расчёты синхронизируются между телефоном и компьютером.",
  "settings.storageLocalText":
    "Расчёты сохраняются только в этом браузере.",
  "settings.cloudConnected": "Облако подключено",
  "settings.pinProtection": "PIN-защита",
  "settings.cloudText":
    "Данные доступны на любом устройстве после ввода PIN-кода. История хранится, пока существует облачная база.",
  "settings.pushLocal": "Перенести {count} с этого устройства",
  "settings.signOut": "Выйти из облака",
  "settings.localTitle": "Локальное хранение",
  "settings.localText":
    "Записи не пропадут при обновлении страницы, но не появятся на другом устройстве и могут быть потеряны при очистке данных браузера. Скачайте резервную копию перед экспериментами.",
  "settings.setupTitle": "Как включить синхронизацию",
  "settings.setupStep1":
    "В Vercel откройте проект → Storage → Marketplace → Upstash Redis (free).",
  "settings.setupStep2":
    "Подключите базу к проекту: появятся KV_REST_API_URL и KV_REST_API_TOKEN.",
  "settings.setupStep3":
    "Добавьте переменную APP_PIN — код для входа в приложение.",
  "settings.setupStep4":
    "Передеплойте проект: приложение само перейдёт в облачный режим.",
  "settings.backupTitle": "Резервная копия",
  "settings.backupText":
    "Файл JSON можно хранить отдельно и восстановить данные в любой момент.",
  "settings.exportJson": "Скачать JSON",
  "settings.exportCsv": "Скачать CSV",
  "settings.importJson": "Импорт JSON",
  "settings.importNote":
    "Импорт добавляет недостающие месяцы и обновляет совпадающие по месяцу записи. Записи, которых нет в файле, остаются на месте.",
  "settings.aboutVersion": "Расчёт по двум тарифам · версия 1.0",
  "settings.aboutDisclaimer":
    "Приложение не отправляет показания энергопоставщику — это личный учёт.",

  "confirm.deleteTitle": "Удалить расчёт?",
  "confirm.deleteText":
    "Расчёт за {month} будет удалён безвозвратно. Резервная копия позволит восстановить его.",
  "confirm.unlockTitle": "Отменить оплату?",
  "confirm.unlockText":
    "Отметка об оплате за {month} будет снята, дата оплаты удалится, а расчёт снова станет доступен для изменения.",
  "confirm.importTitle": "Импортировать данные?",
  "confirm.importText":
    "Будет добавлено или обновлено {count} расчётов. Существующие месяцы из файла обновятся, остальные записи сохранятся.",
  "confirm.importSkipped": "Пропущено некорректных строк: {count}.",
  "confirm.deleteAction": "Удалить",
  "confirm.unlockAction": "Снять оплату",
  "confirm.importAction": "Импортировать",

  "toast.paid": "Оплата за {month} отмечена — дата сохранена",
  "toast.paidError": "Не удалось отметить оплату",
  "toast.deleted": "Расчёт за {month} удалён",
  "toast.unlocked":
    "Оплата за {month} отменена — расчёт разблокирован",
  "toast.importDone":
    "Импорт завершён: добавлено {added}, обновлено {updated}, пропущено {skipped}",
  "toast.importDoneClean":
    "Импорт завершён: добавлено {added}, обновлено {updated}",
  "toast.actionFailed": "Не удалось выполнить действие",
  "toast.backupDownloaded": "Резервная копия скачана",
  "toast.csvDownloaded": "Таблица CSV скачана",
  "toast.noValidRecords": "В файле не найдено корректных расчётов",
  "toast.readFileFailed":
    "Не удалось прочитать файл. Выберите JSON из резервной копии.",
  "toast.moved": "Перенесено: добавлено {added}, обновлено {updated}",
  "toast.moveFailed": "Не удалось перенести данные",
  "toast.signedOut": "Вы вышли из облака",
  "toast.signOutFailed": "Не удалось выйти",
  "toast.ratesUpdated": "Тарифы по умолчанию обновлены",
  "toast.editPaid":
    "Расчёт оплачен. Сначала отмените оплату в истории.",

  "csv.month": "Расчётный месяц",
  "csv.period": "Период",
  "csv.dayPrev": "День: прошлый",
  "csv.dayCurr": "День: этот",
  "csv.dayKwh": "День: кВт·ч",
  "csv.dayRate": "Тариф день",
  "csv.daySum": "День: сумма",
  "csv.nightPrev": "Ночь: прошлый",
  "csv.nightCurr": "Ночь: этот",
  "csv.nightKwh": "Ночь: кВт·ч",
  "csv.nightRate": "Тариф ночь",
  "csv.nightSum": "Ночь: сумма",
  "csv.total": "Итого",
  "csv.enteredAt": "Дата внесения",
  "csv.paid": "Оплачено",
  "csv.paidAt": "Дата оплаты",
  "csv.note": "Комментарий",

  "api.storage_not_configured": "Облачное хранилище не настроено",
  "api.unauthorized": "Требуется вход",
  "api.load_failed": "Не удалось загрузить расчёты из облака",
  "api.no_data": "Нет данных расчёта",
  "api.invalid_record": "Некорректные данные расчёта",
  "api.duplicate_period": "За этот месяц уже есть расчёт",
  "api.save_failed": "Не удалось сохранить расчёт",
  "api.no_records": "Нет списка расчётов",
  "api.too_many_records": "Слишком много записей в файле",
  "api.invalid_records": "В файле есть некорректные записи",
  "api.import_failed": "Не удалось импортировать расчёты",
  "api.record_not_found": "Расчёт не найден",
  "api.record_locked":
    "Расчёт оплачен и заблокирован. Сначала отмените оплату.",
  "api.paid_delete_forbidden":
    "Оплаченный расчёт нельзя удалить. Сначала отмените оплату.",
  "api.no_changes": "Нет изменений",
  "api.update_failed": "Не удалось обновить расчёт",
  "api.delete_failed": "Не удалось удалить расчёт",
  "api.pin_required": "Введите PIN-код",
  "api.rate_limited": "Слишком много попыток. Попробуйте через 15 минут.",
  "api.wrong_pin": "Неверный PIN-код",
  "api.login_failed":
    "Не удалось войти. Проверьте настройки хранилища.",
  "api.storage_unavailable": "Хранилище в облаке недоступно",
  "api.network": "Нет связи с сервером. Проверьте интернет.",
  "api.request_failed": "Не удалось выполнить запрос",
  "api.unexpected": "Что-то пошло не так. Попробуйте ещё раз.",
} as const;

export type MessageKey = keyof typeof ru;

const uk: Record<MessageKey, string> = {
  "app.name": "Електроенергія",
  "app.tagline": "розрахунок і оплата за двома тарифами",
  "app.home": "На головну",

  "common.settings": "Налаштування",
  "common.cancel": "Скасувати",
  "common.close": "Закрити",
  "common.edit": "Змінити",
  "common.delete": "Видалити",
  "common.open": "Відкрити",
  "common.change": "Змінити",
  "common.confirm": "Підтвердити",
  "common.wait": "Зачекайте…",
  "common.day": "День",
  "common.night": "Ніч",
  "common.kwh": "кВт·ч",
  "common.yes": "Так",
  "common.no": "Ні",

  "boot.loading": "Завантажуємо розрахунки…",
  "error.loadTitle": "Не вдалося завантажити дані",
  "error.retry": "Повторити",
  "error.settings": "Налаштування",
  "error.storageUnavailable": "Сховище недоступне",
  "error.storageUnavailableCloud":
    "Хмарне сховище недоступне. Перевірте налаштування KV_REST_API_URL і KV_REST_API_TOKEN.",
  "error.recordNotFound": "Розрахунок не знайдено",
  "error.paidLocked":
    "Оплачений розрахунок не можна змінити. Спершу скасуйте оплату.",
  "error.noLocalRecords": "На цьому пристрої немає збережених розрахунків",
  "error.cloudNotConnected": "Хмару не підключено",
  "error.unexpected": "Щось пішло не так. Спробуйте ще раз.",

  "lock.eyebrow": "Особистий кабінет",
  "lock.subtitle":
    "Введіть PIN-код, щоб відкрити розрахунки та історію оплат на цьому пристрої.",
  "lock.pinLabel": "PIN-код",
  "lock.pinPlaceholder": "PIN-код",
  "lock.enterPin": "Введіть PIN-код",
  "lock.checking": "Перевіряємо…",
  "lock.submit": "Увійти",
  "lock.hintBefore": "PIN-код задає власник застосунку у змінній ",
  "lock.hintAfter": " на Vercel. Сесія зберігається 120 днів.",
  "lock.fallback": "Не вдалося увійти",

  "header.cloud": "Хмара",
  "header.local": "Цей пристрій",
  "hero.eyebrow": "Особистий облік · {month}",
  "hero.title1": "Світло пораховано.",
  "hero.title2": "Історія збережена.",
  "hero.subtitle":
    "Внесіть показання за день і ніч — сума розрахується автоматично. Позначте оплату, і застосунок назавжди запам'ятає дату.",
  "hero.changeRate": "змінити",
  "stats.toPay": "До сплати",
  "stats.unpaid": "Не сплачено: {count}",
  "stats.allPaid": "усе сплачено",
  "stats.paidForYear": "Сплачено за {year}",
  "stats.payments": "Платежів: {count}",
  "stats.noPayments": "поки немає платежів",
  "stats.usageForYear": "Спожито за {year}",
  "stats.usageSub": "кВт·ч · {count} міс.",

  "banner.localTitle": "Дані зберігаються лише в цьому браузері",
  "banner.localText":
    "Щоб відкривати історію з телефона й комп'ютера, увімкніть безкоштовну хмару — налаштування за кілька хвилин. Інструкція в налаштуваннях.",
  "banner.configure": "Налаштувати",

  "side.ratesTitle": "Ваші тарифи",
  "side.dayHours": "з 07:00 до 23:00",
  "side.nightHours": "з 23:00 до 07:00",
  "side.rateNote": "Ціна за 1 кВт·ч для нових розрахунків.",
  "side.lastTitle": "Останній розрахунок",
  "side.toHistory": "До історії",
  "side.statusPaid": "Сплачено",
  "side.statusUnpaid": "Не сплачено",
  "side.editReadings": "Змінити показання",
  "side.recordPaid": "Розрахунок сплачено",
  "side.emptyTitle": "Історія поки порожня",
  "side.emptyText":
    "Перший розрахунок з'явиться тут і зберігатиметься роками.",
  "side.syncTitle": "Синхронізацію ввімкнено",
  "side.privacyTitle": "Ваші дані — лише ваші",
  "side.syncText":
    "Телефон і комп'ютер бачать одну історію. Вхід захищено PIN-кодом.",
  "side.privacyText":
    "Показання не надсилаються постачальнику. Завантажте резервну копію в налаштуваннях.",

  "footer.summary":
    "Особистий розрахунок електроенергії · {day} / {night} ₴ за кВт·ч",
  "footer.settings": "Налаштування та резервна копія",

  "form.newEyebrow": "Новий розрахунок",
  "form.editEyebrow": "Редагування",
  "form.newTitle": "Внесіть показання",
  "form.editBanner":
    "Ви змінюєте збережений розрахунок. Після збереження історія оновиться.",
  "form.cancel": "Скасувати",
  "form.periodLabel": "Розрахунковий місяць",
  "form.monthAria": "Місяць",
  "form.yearAria": "Рік",
  "form.periodHint": "Місяць, за який сплачуємо",
  "form.enteredAtLabel": "Дата внесення даних",
  "form.enteredAtHint": "Коли ви записали показання",
  "form.readingsSection": "Показання лічильника",
  "form.prefill": "Попередні показання підставлено з розрахунку за {month}",
  "form.prevMonth": "Минулий місяць",
  "form.thisMonth": "Цей місяць",
  "form.used": "Використано",
  "form.rateUnit": "₴ / кВт·ч",
  "form.ratesToggle": "Тарифи для цього розрахунку",
  "form.rateDayLabel": "Тариф день, ₴/кВт·ч",
  "form.rateNightLabel": "Тариф ніч, ₴/кВт·ч",
  "form.ratesHint":
    "Тариф зберігається разом із розрахунком. Якщо тарифи зміняться, старі місяці залишаться за старою ціною.",
  "form.duplicateTitle": "За {month} уже є розрахунок.",
  "form.duplicateText":
    "Відкрийте його, щоб змінити показання, або виберіть інший місяць.",
  "form.openExisting": "Відкрити",
  "form.toPay": "До сплати за {month}",
  "form.totalKwh": "кВт·ч усього",
  "form.breakdownDay": "День · {kwh} кВт·ч × {rate}",
  "form.breakdownNight": "Ніч · {kwh} кВт·ч × {rate}",
  "form.negative":
    "Показання «цей місяць» менше за показання минулого місяця. Перевірте цифри.",
  "form.resultPlaceholder":
    "Заповніть показання за минулий і поточний місяць — сума розрахується автоматично.",
  "form.saving": "Зберігаємо…",
  "form.save": "Зберегти розрахунок",
  "form.saveChanges": "Зберегти зміни",
  "form.note":
    "Після збереження розрахунок з'явиться в історії. Позначку «Сплачено» ставлять там же, вона фіксує дату оплати.",
  "form.validationToast": "Перевірте заповнення полів",
  "form.saveError": "Не вдалося зберегти розрахунок",
  "form.saved": "Розрахунок за {month} збережено",
  "form.savedEdit": "Зміни за {month} збережено",

  "validation.periodRequired": "Виберіть розрахунковий місяць",
  "validation.periodDuplicate": "За цей місяць уже є розрахунок",
  "validation.enteredAtRequired": "Укажіть дату внесення показань",
  "validation.prevRequired": "Введіть показання за минулий місяць",
  "validation.currRequired": "Введіть показання за цей місяць",
  "validation.negativeReading": "Показання не може бути від'ємним",
  "validation.readingTooLarge": "Занадто велике значення",
  "validation.currLessPrev":
    "Показання за цей місяць менше за попереднє",
  "validation.rateRequired": "Укажіть тариф",
  "validation.ratePositive": "Тариф має бути більшим за нуль",
  "validation.rateTooLarge": "Занадто великий тариф",

  "history.eyebrow": "Історія",
  "history.title": "Розрахунки та оплати",
  "history.subtitle":
    "Усі місяці зберігаються — можна повернутися до будь-якого року.",
  "history.yearFilter": "Фільтр за роками",
  "history.all": "Усі",
  "history.emptyAll": "Поки немає розрахунків",
  "history.emptyYear": "За {year} рік розрахунків немає",
  "history.emptyText":
    "Збережіть перший розрахунок — він з'явиться тут. Записи зберігаються роками, тож історія завжди буде під рукою.",
  "history.goToCalc": "До розрахунку",
  "history.showAll": "Показати всі роки",
  "history.usage": "Спожито",
  "history.charged": "Нараховано",
  "history.paid": "Сплачено",
  "history.debt": "Борг",
  "history.chartTitle": "Нарахування за місяцями, {year}",
  "history.yearGroup": "{year} рік",
  "history.total": "Записів: {count} · {kwh} · {scope}",
  "history.scopeAll": "за весь час",
  "history.scopeYear": "за {year} рік",

  "record.dataFrom": "дані від {date}",
  "record.metaDay": "День: {prev} → {curr}",
  "record.metaNight": "Ніч: {prev} → {curr}",
  "record.markPaid": "Позначити оплату",
  "record.payDateAuto": "Дата зафіксується автоматично",
  "record.unlock": "Скасувати оплату",
  "record.edit": "Змінити",
  "record.delete": "Видалити",

  "settings.title": "Налаштування",
  "settings.languageTitle": "Мова інтерфейсу",
  "settings.languageText":
    "Виберіть мову — зміна застосується одразу й збережеться на цьому пристрої.",
  "settings.ratesTitle": "Тарифи за замовчуванням",
  "settings.ratesText":
    "Підставляються в нові розрахунки. У збережених місяцях ціни не змінюються.",
  "settings.dayRateLabel": "День, ₴/кВт·ч",
  "settings.nightRateLabel": "Ніч, ₴/кВт·ч",
  "settings.rateError": "Укажіть додатні значення тарифів",
  "settings.saveRates": "Зберегти тарифи",
  "settings.storageTitle": "Зберігання даних",
  "settings.storageCloudText":
    "Розрахунки синхронізуються між телефоном і комп'ютером.",
  "settings.storageLocalText":
    "Розрахунки зберігаються лише в цьому браузері.",
  "settings.cloudConnected": "Хмару підключено",
  "settings.pinProtection": "PIN-захист",
  "settings.cloudText":
    "Дані доступні на будь-якому пристрої після введення PIN-коду. Історія зберігається, поки існує хмарна база.",
  "settings.pushLocal": "Перенести {count} із цього пристрою",
  "settings.signOut": "Вийти з хмари",
  "settings.localTitle": "Локальне зберігання",
  "settings.localText":
    "Записи не зникнуть після оновлення сторінки, але не з'являться на іншому пристрої та можуть бути втрачені під час очищення даних браузера. Завантажте резервну копію перед експериментами.",
  "settings.setupTitle": "Як увімкнути синхронізацію",
  "settings.setupStep1":
    "У Vercel відкрийте проєкт → Storage → Marketplace → Upstash Redis (free).",
  "settings.setupStep2":
    "Підключіть базу до проєкту: з'являться KV_REST_API_URL і KV_REST_API_TOKEN.",
  "settings.setupStep3":
    "Додайте змінну APP_PIN — код для входу в застосунок.",
  "settings.setupStep4":
    "Перезапустіть деплой: застосунок сам перейде в хмарний режим.",
  "settings.backupTitle": "Резервна копія",
  "settings.backupText":
    "Файл JSON можна зберігати окремо й відновити дані будь-коли.",
  "settings.exportJson": "Завантажити JSON",
  "settings.exportCsv": "Завантажити CSV",
  "settings.importJson": "Імпорт JSON",
  "settings.importNote":
    "Імпорт додає відсутні місяці та оновлює записи, що збігаються за місяцем. Записи, яких немає у файлі, залишаються на місці.",
  "settings.aboutVersion": "Розрахунок за двома тарифами · версія 1.0",
  "settings.aboutDisclaimer":
    "Застосунок не надсилає показання постачальнику — це особистий облік.",

  "confirm.deleteTitle": "Видалити розрахунок?",
  "confirm.deleteText":
    "Розрахунок за {month} буде видалено безповоротно. Резервна копія допоможе його відновити.",
  "confirm.unlockTitle": "Скасувати оплату?",
  "confirm.unlockText":
    "Позначку про оплату за {month} буде знято, дата оплати видалиться, а розрахунок знову стане доступним для зміни.",
  "confirm.importTitle": "Імпортувати дані?",
  "confirm.importText":
    "Буде додано або оновлено {count} розрахунків. Існуючі місяці з файлу оновляться, інші записи збережуться.",
  "confirm.importSkipped": "Пропущено некоректних рядків: {count}.",
  "confirm.deleteAction": "Видалити",
  "confirm.unlockAction": "Зняти оплату",
  "confirm.importAction": "Імпортувати",

  "toast.paid": "Оплату за {month} позначено — дату збережено",
  "toast.paidError": "Не вдалося позначити оплату",
  "toast.deleted": "Розрахунок за {month} видалено",
  "toast.unlocked":
    "Оплату за {month} скасовано — розрахунок розблоковано",
  "toast.importDone":
    "Імпорт завершено: додано {added}, оновлено {updated}, пропущено {skipped}",
  "toast.importDoneClean":
    "Імпорт завершено: додано {added}, оновлено {updated}",
  "toast.actionFailed": "Не вдалося виконати дію",
  "toast.backupDownloaded": "Резервну копію завантажено",
  "toast.csvDownloaded": "Таблицю CSV завантажено",
  "toast.noValidRecords": "У файлі не знайдено коректних розрахунків",
  "toast.readFileFailed":
    "Не вдалося прочитати файл. Виберіть JSON із резервної копії.",
  "toast.moved": "Перенесено: додано {added}, оновлено {updated}",
  "toast.moveFailed": "Не вдалося перенести дані",
  "toast.signedOut": "Ви вийшли з хмари",
  "toast.signOutFailed": "Не вдалося вийти",
  "toast.ratesUpdated": "Тарифи за замовчуванням оновлено",
  "toast.editPaid":
    "Розрахунок сплачено. Спершу скасуйте оплату в історії.",

  "csv.month": "Розрахунковий місяць",
  "csv.period": "Період",
  "csv.dayPrev": "День: минулий",
  "csv.dayCurr": "День: цей",
  "csv.dayKwh": "День: кВт·ч",
  "csv.dayRate": "Тариф день",
  "csv.daySum": "День: сума",
  "csv.nightPrev": "Ніч: минулий",
  "csv.nightCurr": "Ніч: цей",
  "csv.nightKwh": "Ніч: кВт·ч",
  "csv.nightRate": "Тариф ніч",
  "csv.nightSum": "Ніч: сума",
  "csv.total": "Разом",
  "csv.enteredAt": "Дата внесення",
  "csv.paid": "Сплачено",
  "csv.paidAt": "Дата оплати",
  "csv.note": "Коментар",

  "api.storage_not_configured": "Хмарне сховище не налаштовано",
  "api.unauthorized": "Потрібен вхід",
  "api.load_failed": "Не вдалося завантажити розрахунки з хмари",
  "api.no_data": "Немає даних розрахунку",
  "api.invalid_record": "Некоректні дані розрахунку",
  "api.duplicate_period": "За цей місяць уже є розрахунок",
  "api.save_failed": "Не вдалося зберегти розрахунок",
  "api.no_records": "Немає списку розрахунків",
  "api.too_many_records": "Забагато записів у файлі",
  "api.invalid_records": "У файлі є некоректні записи",
  "api.import_failed": "Не вдалося імпортувати розрахунки",
  "api.record_not_found": "Розрахунок не знайдено",
  "api.record_locked":
    "Розрахунок сплачено й заблоковано. Спершу скасуйте оплату.",
  "api.paid_delete_forbidden":
    "Сплачений розрахунок не можна видалити. Спершу скасуйте оплату.",
  "api.no_changes": "Немає змін",
  "api.update_failed": "Не вдалося оновити розрахунок",
  "api.delete_failed": "Не вдалося видалити розрахунок",
  "api.pin_required": "Введіть PIN-код",
  "api.rate_limited": "Забагато спроб. Спробуйте через 15 хвилин.",
  "api.wrong_pin": "Невірний PIN-код",
  "api.login_failed":
    "Не вдалося увійти. Перевірте налаштування сховища.",
  "api.storage_unavailable": "Хмарне сховище недоступне",
  "api.network": "Немає зв'язку із сервером. Перевірте інтернет.",
  "api.request_failed": "Не вдалося виконати запит",
  "api.unexpected": "Щось пішло не так. Спробуйте ще раз.",
};

const en: Record<MessageKey, string> = {
  "app.name": "Electricity",
  "app.tagline": "two-tariff meter readings & payments",
  "app.home": "Back to top",

  "common.settings": "Settings",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.open": "Open",
  "common.change": "Change",
  "common.confirm": "Confirm",
  "common.wait": "Please wait…",
  "common.day": "Day",
  "common.night": "Night",
  "common.kwh": "kWh",
  "common.yes": "Yes",
  "common.no": "No",

  "boot.loading": "Loading your records…",
  "error.loadTitle": "Could not load data",
  "error.retry": "Try again",
  "error.settings": "Settings",
  "error.storageUnavailable": "Storage is unavailable",
  "error.storageUnavailableCloud":
    "Cloud storage is unavailable. Check KV_REST_API_URL and KV_REST_API_TOKEN.",
  "error.recordNotFound": "Record not found",
  "error.paidLocked":
    "A paid record cannot be edited. Cancel the payment first.",
  "error.noLocalRecords": "There are no saved records on this device",
  "error.cloudNotConnected": "Cloud storage is not connected",
  "error.unexpected": "Something went wrong. Please try again.",

  "lock.eyebrow": "Personal account",
  "lock.subtitle":
    "Enter your PIN to open the meter records and payment history on this device.",
  "lock.pinLabel": "PIN code",
  "lock.pinPlaceholder": "PIN code",
  "lock.enterPin": "Enter your PIN",
  "lock.checking": "Checking…",
  "lock.submit": "Sign in",
  "lock.hintBefore": "The PIN is set by the app owner in the ",
  "lock.hintAfter": " variable on Vercel. The session lasts 120 days.",
  "lock.fallback": "Could not sign in",

  "header.cloud": "Cloud",
  "header.local": "This device",
  "hero.eyebrow": "Personal meter log · {month}",
  "hero.title1": "Bill calculated.",
  "hero.title2": "History kept.",
  "hero.subtitle":
    "Enter your day and night readings — the total is calculated automatically. Mark the bill as paid and the app remembers the date for good.",
  "hero.changeRate": "change",
  "stats.toPay": "Due",
  "stats.unpaid": "Unpaid: {count}",
  "stats.allPaid": "all paid",
  "stats.paidForYear": "Paid in {year}",
  "stats.payments": "Payments: {count}",
  "stats.noPayments": "no payments yet",
  "stats.usageForYear": "Usage in {year}",
  "stats.usageSub": "kWh · {count} mo.",

  "banner.localTitle": "Data is stored only in this browser",
  "banner.localText":
    "To open your history from your phone and computer, enable free cloud sync — it takes a couple of minutes. Instructions are in Settings.",
  "banner.configure": "Set up",

  "side.ratesTitle": "Your tariffs",
  "side.dayHours": "07:00 – 23:00",
  "side.nightHours": "23:00 – 07:00",
  "side.rateNote": "Price per 1 kWh for new records.",
  "side.lastTitle": "Latest record",
  "side.toHistory": "View history",
  "side.statusPaid": "Paid",
  "side.statusUnpaid": "Unpaid",
  "side.editReadings": "Edit readings",
  "side.recordPaid": "Record paid",
  "side.emptyTitle": "No records yet",
  "side.emptyText":
    "Your first record will appear here and stay for years.",
  "side.syncTitle": "Sync is on",
  "side.privacyTitle": "Your data stays yours",
  "side.syncText":
    "Your phone and computer share one history. Sign-in is protected by a PIN.",
  "side.privacyText":
    "Readings are not sent to your utility provider. Download a backup in Settings.",

  "footer.summary":
    "Personal electricity log · {day} / {night} ₴ per kWh",
  "footer.settings": "Settings & backup",

  "form.newEyebrow": "New record",
  "form.editEyebrow": "Editing",
  "form.newTitle": "Enter meter readings",
  "form.editBanner":
    "You are editing a saved record. History will update after saving.",
  "form.cancel": "Cancel",
  "form.periodLabel": "Billing month",
  "form.monthAria": "Month",
  "form.yearAria": "Year",
  "form.periodHint": "The month you are paying for",
  "form.enteredAtLabel": "Date entered",
  "form.enteredAtHint": "When you recorded the readings",
  "form.readingsSection": "Meter readings",
  "form.prefill": "Previous readings filled in from the {month} record",
  "form.prevMonth": "Previous month",
  "form.thisMonth": "This month",
  "form.used": "Used",
  "form.rateUnit": "₴ / kWh",
  "form.ratesToggle": "Tariffs for this record",
  "form.rateDayLabel": "Day tariff, ₴/kWh",
  "form.rateNightLabel": "Night tariff, ₴/kWh",
  "form.ratesHint":
    "The tariff is saved with the record. If prices change, earlier months keep their original price.",
  "form.duplicateTitle": "A record for {month} already exists.",
  "form.duplicateText":
    "Open it to edit the readings, or choose another month.",
  "form.openExisting": "Open",
  "form.toPay": "Due for {month}",
  "form.totalKwh": "kWh total",
  "form.breakdownDay": "Day · {kwh} kWh × {rate}",
  "form.breakdownNight": "Night · {kwh} kWh × {rate}",
  "form.negative":
    "The “this month” reading is lower than the previous one. Check the numbers.",
  "form.resultPlaceholder":
    "Enter previous and current readings — the total will be calculated automatically.",
  "form.saving": "Saving…",
  "form.save": "Save record",
  "form.saveChanges": "Save changes",
  "form.note":
    "After saving, the record appears in history. The “Paid” checkbox is there and records the payment date.",
  "form.validationToast": "Please check the fields",
  "form.saveError": "Could not save the record",
  "form.saved": "Record for {month} saved",
  "form.savedEdit": "Changes for {month} saved",

  "validation.periodRequired": "Choose a billing month",
  "validation.periodDuplicate": "A record for this month already exists",
  "validation.enteredAtRequired": "Enter the date the readings were taken",
  "validation.prevRequired": "Enter the previous month reading",
  "validation.currRequired": "Enter this month reading",
  "validation.negativeReading": "A reading cannot be negative",
  "validation.readingTooLarge": "Value is too large",
  "validation.currLessPrev":
    "This month reading is lower than the previous one",
  "validation.rateRequired": "Enter a tariff",
  "validation.ratePositive": "Tariff must be greater than zero",
  "validation.rateTooLarge": "Tariff is too large",

  "history.eyebrow": "History",
  "history.title": "Records & payments",
  "history.subtitle":
    "Every month is kept — you can return to any year.",
  "history.yearFilter": "Filter by year",
  "history.all": "All",
  "history.emptyAll": "No records yet",
  "history.emptyYear": "No records for {year}",
  "history.emptyText":
    "Save your first record and it will appear here. Records are kept for years, so your history is always at hand.",
  "history.goToCalc": "Go to calculator",
  "history.showAll": "Show all years",
  "history.usage": "Usage",
  "history.charged": "Charged",
  "history.paid": "Paid",
  "history.debt": "Debt",
  "history.chartTitle": "Monthly charges, {year}",
  "history.yearGroup": "{year}",
  "history.total": "Records: {count} · {kwh} · {scope}",
  "history.scopeAll": "all time",
  "history.scopeYear": "in {year}",

  "record.dataFrom": "entered {date}",
  "record.metaDay": "Day: {prev} → {curr}",
  "record.metaNight": "Night: {prev} → {curr}",
  "record.markPaid": "Mark as paid",
  "record.payDateAuto": "The date is saved automatically",
  "record.unlock": "Cancel payment",
  "record.edit": "Edit",
  "record.delete": "Delete",

  "settings.title": "Settings",
  "settings.languageTitle": "Interface language",
  "settings.languageText":
    "Choose a language — it applies immediately and is saved on this device.",
  "settings.ratesTitle": "Default tariffs",
  "settings.ratesText":
    "Used for new records. Prices in saved months do not change.",
  "settings.dayRateLabel": "Day, ₴/kWh",
  "settings.nightRateLabel": "Night, ₴/kWh",
  "settings.rateError": "Enter positive tariff values",
  "settings.saveRates": "Save tariffs",
  "settings.storageTitle": "Data storage",
  "settings.storageCloudText":
    "Records are synced between your phone and computer.",
  "settings.storageLocalText":
    "Records are stored only in this browser.",
  "settings.cloudConnected": "Cloud connected",
  "settings.pinProtection": "PIN protected",
  "settings.cloudText":
    "Your data is available on any device after entering the PIN. History is kept as long as the cloud database exists.",
  "settings.pushLocal": "Move {count} from this device",
  "settings.signOut": "Sign out of cloud",
  "settings.localTitle": "Local storage",
  "settings.localText":
    "Records survive page reloads, but will not appear on another device and may be lost if browser data is cleared. Download a backup before experimenting.",
  "settings.setupTitle": "How to enable sync",
  "settings.setupStep1":
    "In Vercel open the project → Storage → Marketplace → Upstash Redis (free).",
  "settings.setupStep2":
    "Connect the database to the project: KV_REST_API_URL and KV_REST_API_TOKEN will appear.",
  "settings.setupStep3":
    "Add the APP_PIN variable — the code used to sign in.",
  "settings.setupStep4":
    "Redeploy: the app switches to cloud mode automatically.",
  "settings.backupTitle": "Backup",
  "settings.backupText":
    "Keep the JSON file separately and restore your data at any time.",
  "settings.exportJson": "Download JSON",
  "settings.exportCsv": "Download CSV",
  "settings.importJson": "Import JSON",
  "settings.importNote":
    "Import adds missing months and updates records that match by month. Records not in the file stay in place.",
  "settings.aboutVersion": "Two-tariff calculator · version 1.0",
  "settings.aboutDisclaimer":
    "The app does not send readings to your utility provider — this is a personal log.",

  "confirm.deleteTitle": "Delete this record?",
  "confirm.deleteText":
    "The record for {month} will be permanently deleted. A backup can restore it.",
  "confirm.unlockTitle": "Cancel this payment?",
  "confirm.unlockText":
    "The payment mark for {month} will be removed, the payment date deleted, and the record will become editable again.",
  "confirm.importTitle": "Import data?",
  "confirm.importText":
    "{count} records will be added or updated. Existing months from the file will be updated; other records stay in place.",
  "confirm.importSkipped": "Skipped invalid rows: {count}.",
  "confirm.deleteAction": "Delete",
  "confirm.unlockAction": "Remove payment",
  "confirm.importAction": "Import",

  "toast.paid": "Payment for {month} marked — date saved",
  "toast.paidError": "Could not mark the payment",
  "toast.deleted": "Record for {month} deleted",
  "toast.unlocked":
    "Payment for {month} cancelled — record unlocked",
  "toast.importDone":
    "Import complete: {added} added, {updated} updated, {skipped} skipped",
  "toast.importDoneClean":
    "Import complete: {added} added, {updated} updated",
  "toast.actionFailed": "Could not complete the action",
  "toast.backupDownloaded": "Backup downloaded",
  "toast.csvDownloaded": "CSV downloaded",
  "toast.noValidRecords": "No valid records found in the file",
  "toast.readFileFailed":
    "Could not read the file. Choose a JSON backup.",
  "toast.moved": "Moved: {added} added, {updated} updated",
  "toast.moveFailed": "Could not move the data",
  "toast.signedOut": "Signed out of cloud",
  "toast.signOutFailed": "Could not sign out",
  "toast.ratesUpdated": "Default tariffs updated",
  "toast.editPaid":
    "This record is paid. Cancel the payment in history first.",

  "csv.month": "Billing month",
  "csv.period": "Period",
  "csv.dayPrev": "Day: previous",
  "csv.dayCurr": "Day: current",
  "csv.dayKwh": "Day: kWh",
  "csv.dayRate": "Day tariff",
  "csv.daySum": "Day: amount",
  "csv.nightPrev": "Night: previous",
  "csv.nightCurr": "Night: current",
  "csv.nightKwh": "Night: kWh",
  "csv.nightRate": "Night tariff",
  "csv.nightSum": "Night: amount",
  "csv.total": "Total",
  "csv.enteredAt": "Date entered",
  "csv.paid": "Paid",
  "csv.paidAt": "Payment date",
  "csv.note": "Note",

  "api.storage_not_configured": "Cloud storage is not configured",
  "api.unauthorized": "Sign-in required",
  "api.load_failed": "Could not load records from the cloud",
  "api.no_data": "No record data",
  "api.invalid_record": "Invalid record data",
  "api.duplicate_period": "A record for this month already exists",
  "api.save_failed": "Could not save the record",
  "api.no_records": "No records list provided",
  "api.too_many_records": "Too many records in the file",
  "api.invalid_records": "The file contains invalid records",
  "api.import_failed": "Could not import records",
  "api.record_not_found": "Record not found",
  "api.record_locked":
    "This record is paid and locked. Cancel the payment first.",
  "api.paid_delete_forbidden":
    "A paid record cannot be deleted. Cancel the payment first.",
  "api.no_changes": "No changes",
  "api.update_failed": "Could not update the record",
  "api.delete_failed": "Could not delete the record",
  "api.pin_required": "Enter your PIN",
  "api.rate_limited": "Too many attempts. Try again in 15 minutes.",
  "api.wrong_pin": "Incorrect PIN",
  "api.login_failed": "Could not sign in. Check the storage settings.",
  "api.storage_unavailable": "Cloud storage is unavailable",
  "api.network": "No connection to the server. Check your internet.",
  "api.request_failed": "Could not complete the request",
  "api.unexpected": "Something went wrong. Please try again.",
};

const pl: Record<MessageKey, string> = {
  "app.name": "Energia elektryczna",
  "app.tagline": "rozliczenie i płatność według dwóch taryf",
  "app.home": "Na górę",

  "common.settings": "Ustawienia",
  "common.cancel": "Anuluj",
  "common.close": "Zamknij",
  "common.edit": "Edytuj",
  "common.delete": "Usuń",
  "common.open": "Otwórz",
  "common.change": "Zmień",
  "common.confirm": "Potwierdź",
  "common.wait": "Proszę czekać…",
  "common.day": "Dzień",
  "common.night": "Noc",
  "common.kwh": "kWh",
  "common.yes": "Tak",
  "common.no": "Nie",

  "boot.loading": "Ładowanie rozliczeń…",
  "error.loadTitle": "Nie udało się wczytać danych",
  "error.retry": "Spróbuj ponownie",
  "error.settings": "Ustawienia",
  "error.storageUnavailable": "Pamięć jest niedostępna",
  "error.storageUnavailableCloud":
    "Pamięć w chmurze jest niedostępna. Sprawdź KV_REST_API_URL i KV_REST_API_TOKEN.",
  "error.recordNotFound": "Nie znaleziono rozliczenia",
  "error.paidLocked":
    "Opłaconego rozliczenia nie można edytować. Najpierw anuluj płatność.",
  "error.noLocalRecords": "Na tym urządzeniu nie ma zapisanych rozliczeń",
  "error.cloudNotConnected": "Chmura nie jest połączona",
  "error.unexpected": "Coś poszło nie tak. Spróbuj ponownie.",

  "lock.eyebrow": "Konto osobiste",
  "lock.subtitle":
    "Wpisz kod PIN, aby otworzyć rozliczenia i historię płatności na tym urządzeniu.",
  "lock.pinLabel": "Kod PIN",
  "lock.pinPlaceholder": "Kod PIN",
  "lock.enterPin": "Wpisz kod PIN",
  "lock.checking": "Sprawdzanie…",
  "lock.submit": "Zaloguj się",
  "lock.hintBefore": "Kod PIN ustawia właściciel aplikacji w zmiennej ",
  "lock.hintAfter": " na Vercel. Sesja trwa 120 dni.",
  "lock.fallback": "Nie udało się zalogować",

  "header.cloud": "Chmura",
  "header.local": "To urządzenie",
  "hero.eyebrow": "Osobista ewidencja · {month}",
  "hero.title1": "Prąd policzony.",
  "hero.title2": "Historia zapisana.",
  "hero.subtitle":
    "Wpisz odczyty dzienne i nocne — kwota wyliczy się automatycznie. Oznacz płatność, a aplikacja zapamięta datę na zawsze.",
  "hero.changeRate": "zmień",
  "stats.toPay": "Do zapłaty",
  "stats.unpaid": "Nieopłacone: {count}",
  "stats.allPaid": "wszystko opłacone",
  "stats.paidForYear": "Opłacono w {year}",
  "stats.payments": "Płatności: {count}",
  "stats.noPayments": "brak płatności",
  "stats.usageForYear": "Zużycie w {year}",
  "stats.usageSub": "kWh · {count} mies.",

  "banner.localTitle": "Dane są przechowywane tylko w tej przeglądarce",
  "banner.localText":
    "Aby otwierać historię z telefonu i komputera, włącz bezpłatną chmurę — konfiguracja zajmie kilka minut. Instrukcja jest w ustawieniach.",
  "banner.configure": "Skonfiguruj",

  "side.ratesTitle": "Twoje taryfy",
  "side.dayHours": "07:00 – 23:00",
  "side.nightHours": "23:00 – 07:00",
  "side.rateNote": "Cena za 1 kWh dla nowych rozliczeń.",
  "side.lastTitle": "Ostatnie rozliczenie",
  "side.toHistory": "Do historii",
  "side.statusPaid": "Opłacone",
  "side.statusUnpaid": "Nieopłacone",
  "side.editReadings": "Edytuj odczyty",
  "side.recordPaid": "Rozliczenie opłacone",
  "side.emptyTitle": "Historia jest jeszcze pusta",
  "side.emptyText":
    "Pierwsze rozliczenie pojawi się tutaj i zostanie na lata.",
  "side.syncTitle": "Synchronizacja włączona",
  "side.privacyTitle": "Twoje dane należą do Ciebie",
  "side.syncText":
    "Telefon i komputer widzą jedną historię. Logowanie chroni kod PIN.",
  "side.privacyText":
    "Odczyty nie są wysyłane do dostawcy energii. Pobierz kopię zapasową w ustawieniach.",

  "footer.summary":
    "Osobiste rozliczenie energii · {day} / {night} ₴ za kWh",
  "footer.settings": "Ustawienia i kopia zapasowa",

  "form.newEyebrow": "Nowe rozliczenie",
  "form.editEyebrow": "Edycja",
  "form.newTitle": "Wpisz odczyty licznika",
  "form.editBanner":
    "Edytujesz zapisane rozliczenie. Historia zaktualizuje się po zapisaniu.",
  "form.cancel": "Anuluj",
  "form.periodLabel": "Miesiąc rozliczeniowy",
  "form.monthAria": "Miesiąc",
  "form.yearAria": "Rok",
  "form.periodHint": "Miesiąc, za który płacisz",
  "form.enteredAtLabel": "Data wpisania",
  "form.enteredAtHint": "Kiedy zapisano odczyty",
  "form.readingsSection": "Odczyty licznika",
  "form.prefill": "Poprzednie odczyty uzupełniono z rozliczenia za {month}",
  "form.prevMonth": "Poprzedni miesiąc",
  "form.thisMonth": "Ten miesiąc",
  "form.used": "Zużyto",
  "form.rateUnit": "₴ / kWh",
  "form.ratesToggle": "Taryfy dla tego rozliczenia",
  "form.rateDayLabel": "Taryfa dzienna, ₴/kWh",
  "form.rateNightLabel": "Taryfa nocna, ₴/kWh",
  "form.ratesHint":
    "Taryfa jest zapisywana razem z rozliczeniem. Jeśli ceny się zmienią, starsze miesiące zachowają starą cenę.",
  "form.duplicateTitle": "Rozliczenie za {month} już istnieje.",
  "form.duplicateText":
    "Otwórz je, aby zmienić odczyty, albo wybierz inny miesiąc.",
  "form.openExisting": "Otwórz",
  "form.toPay": "Do zapłaty za {month}",
  "form.totalKwh": "kWh łącznie",
  "form.breakdownDay": "Dzień · {kwh} kWh × {rate}",
  "form.breakdownNight": "Noc · {kwh} kWh × {rate}",
  "form.negative":
    "Odczyt „ten miesiąc” jest mniejszy od poprzedniego. Sprawdź liczby.",
  "form.resultPlaceholder":
    "Wpisz odczyty za poprzedni i bieżący miesiąc — kwota wyliczy się automatycznie.",
  "form.saving": "Zapisywanie…",
  "form.save": "Zapisz rozliczenie",
  "form.saveChanges": "Zapisz zmiany",
  "form.note":
    "Po zapisaniu rozliczenie pojawi się w historii. Pole „Opłacone” jest tam i zapisuje datę płatności.",
  "form.validationToast": "Sprawdź wypełnienie pól",
  "form.saveError": "Nie udało się zapisać rozliczenia",
  "form.saved": "Rozliczenie za {month} zapisane",
  "form.savedEdit": "Zmiany za {month} zapisane",

  "validation.periodRequired": "Wybierz miesiąc rozliczeniowy",
  "validation.periodDuplicate": "Rozliczenie za ten miesiąc już istnieje",
  "validation.enteredAtRequired": "Podaj datę wpisania odczytów",
  "validation.prevRequired": "Wpisz odczyt za poprzedni miesiąc",
  "validation.currRequired": "Wpisz odczyt za ten miesiąc",
  "validation.negativeReading": "Odczyt nie może być ujemny",
  "validation.readingTooLarge": "Wartość jest zbyt duża",
  "validation.currLessPrev":
    "Odczyt za ten miesiąc jest mniejszy od poprzedniego",
  "validation.rateRequired": "Podaj taryfę",
  "validation.ratePositive": "Taryfa musi być większa od zera",
  "validation.rateTooLarge": "Taryfa jest zbyt duża",

  "history.eyebrow": "Historia",
  "history.title": "Rozliczenia i płatności",
  "history.subtitle":
    "Wszystkie miesiące są zachowane — możesz wrócić do dowolnego roku.",
  "history.yearFilter": "Filtruj według roku",
  "history.all": "Wszystkie",
  "history.emptyAll": "Brak rozliczeń",
  "history.emptyYear": "Brak rozliczeń za {year}",
  "history.emptyText":
    "Zapisz pierwsze rozliczenie — pojawi się tutaj. Zapisane miesiące zostają na lata, więc historia zawsze będzie pod ręką.",
  "history.goToCalc": "Do kalkulatora",
  "history.showAll": "Pokaż wszystkie lata",
  "history.usage": "Zużycie",
  "history.charged": "Naliczono",
  "history.paid": "Opłacono",
  "history.debt": "Zaległość",
  "history.chartTitle": "Naliczenia miesięczne, {year}",
  "history.yearGroup": "{year}",
  "history.total": "Zapisy: {count} · {kwh} · {scope}",
  "history.scopeAll": "cały okres",
  "history.scopeYear": "za {year}",

  "record.dataFrom": "dane z {date}",
  "record.metaDay": "Dzień: {prev} → {curr}",
  "record.metaNight": "Noc: {prev} → {curr}",
  "record.markPaid": "Oznacz jako opłacone",
  "record.payDateAuto": "Data zostanie zapisana automatycznie",
  "record.unlock": "Anuluj płatność",
  "record.edit": "Edytuj",
  "record.delete": "Usuń",

  "settings.title": "Ustawienia",
  "settings.languageTitle": "Język interfejsu",
  "settings.languageText":
    "Wybierz język — zmiana działa od razu i zostanie zapisana na tym urządzeniu.",
  "settings.ratesTitle": "Domyślne taryfy",
  "settings.ratesText":
    "Używane w nowych rozliczeniach. Ceny w zapisanych miesiącach się nie zmieniają.",
  "settings.dayRateLabel": "Dzień, ₴/kWh",
  "settings.nightRateLabel": "Noc, ₴/kWh",
  "settings.rateError": "Podaj dodatnie wartości taryf",
  "settings.saveRates": "Zapisz taryfy",
  "settings.storageTitle": "Przechowywanie danych",
  "settings.storageCloudText":
    "Rozliczenia są synchronizowane między telefonem i komputerem.",
  "settings.storageLocalText":
    "Rozliczenia są przechowywane tylko w tej przeglądarce.",
  "settings.cloudConnected": "Chmura połączona",
  "settings.pinProtection": "Ochrona PIN",
  "settings.cloudText":
    "Dane są dostępne na dowolnym urządzeniu po wpisaniu kodu PIN. Historia jest przechowywana tak długo, jak istnieje baza w chmurze.",
  "settings.pushLocal": "Przenieś {count} z tego urządzenia",
  "settings.signOut": "Wyloguj z chmury",
  "settings.localTitle": "Pamięć lokalna",
  "settings.localText":
    "Zapisy przetrwają odświeżenie strony, ale nie pojawią się na innym urządzeniu i mogą zostać utracone po wyczyszczeniu danych przeglądarki. Przed eksperymentami pobierz kopię zapasową.",
  "settings.setupTitle": "Jak włączyć synchronizację",
  "settings.setupStep1":
    "W Vercel otwórz projekt → Storage → Marketplace → Upstash Redis (free).",
  "settings.setupStep2":
    "Podłącz bazę do projektu: pojawią się KV_REST_API_URL i KV_REST_API_TOKEN.",
  "settings.setupStep3":
    "Dodaj zmienną APP_PIN — kod do logowania w aplikacji.",
  "settings.setupStep4":
    "Wdróż ponownie: aplikacja sama przejdzie w tryb chmury.",
  "settings.backupTitle": "Kopia zapasowa",
  "settings.backupText":
    "Plik JSON możesz przechowywać osobno i w każdej chwili przywrócić dane.",
  "settings.exportJson": "Pobierz JSON",
  "settings.exportCsv": "Pobierz CSV",
  "settings.importJson": "Importuj JSON",
  "settings.importNote":
    "Import dodaje brakujące miesiące i aktualizuje zapisy zgodne według miesiąca. Zapisy, których nie ma w pliku, pozostają na miejscu.",
  "settings.aboutVersion": "Kalkulator dwóch taryf · wersja 1.0",
  "settings.aboutDisclaimer":
    "Aplikacja nie wysyła odczytów do dostawcy energii — to osobista ewidencja.",

  "confirm.deleteTitle": "Usunąć rozliczenie?",
  "confirm.deleteText":
    "Rozliczenie za {month} zostanie trwale usunięte. Kopia zapasowa pozwoli je przywrócić.",
  "confirm.unlockTitle": "Anulować płatność?",
  "confirm.unlockText":
    "Oznaczenie płatności za {month} zostanie usunięte, data płatności zniknie, a rozliczenie znów będzie można edytować.",
  "confirm.importTitle": "Importować dane?",
  "confirm.importText":
    "Zostanie dodanych lub zaktualizowanych {count} rozliczeń. Istniejące miesiące z pliku zostaną zaktualizowane, pozostałe zapisy pozostaną.",
  "confirm.importSkipped": "Pominięto nieprawidłowe wiersze: {count}.",
  "confirm.deleteAction": "Usuń",
  "confirm.unlockAction": "Usuń płatność",
  "confirm.importAction": "Importuj",

  "toast.paid": "Płatność za {month} oznaczona — data zapisana",
  "toast.paidError": "Nie udało się oznaczyć płatności",
  "toast.deleted": "Rozliczenie za {month} usunięte",
  "toast.unlocked":
    "Płatność za {month} anulowana — rozliczenie odblokowane",
  "toast.importDone":
    "Import zakończony: dodano {added}, zaktualizowano {updated}, pominięto {skipped}",
  "toast.importDoneClean":
    "Import zakończony: dodano {added}, zaktualizowano {updated}",
  "toast.actionFailed": "Nie udało się wykonać działania",
  "toast.backupDownloaded": "Kopia zapasowa pobrana",
  "toast.csvDownloaded": "Tabela CSV pobrana",
  "toast.noValidRecords": "W pliku nie znaleziono prawidłowych rozliczeń",
  "toast.readFileFailed":
    "Nie udało się odczytać pliku. Wybierz JSON z kopii zapasowej.",
  "toast.moved": "Przeniesiono: dodano {added}, zaktualizowano {updated}",
  "toast.moveFailed": "Nie udało się przenieść danych",
  "toast.signedOut": "Wylogowano z chmury",
  "toast.signOutFailed": "Nie udało się wylogować",
  "toast.ratesUpdated": "Domyślne taryfy zaktualizowane",
  "toast.editPaid":
    "Rozliczenie jest opłacone. Najpierw anuluj płatność w historii.",

  "csv.month": "Miesiąc rozliczeniowy",
  "csv.period": "Okres",
  "csv.dayPrev": "Dzień: poprzedni",
  "csv.dayCurr": "Dzień: bieżący",
  "csv.dayKwh": "Dzień: kWh",
  "csv.dayRate": "Taryfa dzienna",
  "csv.daySum": "Dzień: kwota",
  "csv.nightPrev": "Noc: poprzednia",
  "csv.nightCurr": "Noc: bieżąca",
  "csv.nightKwh": "Noc: kWh",
  "csv.nightRate": "Taryfa nocna",
  "csv.nightSum": "Noc: kwota",
  "csv.total": "Razem",
  "csv.enteredAt": "Data wpisania",
  "csv.paid": "Opłacone",
  "csv.paidAt": "Data płatności",
  "csv.note": "Komentarz",

  "api.storage_not_configured": "Pamięć w chmurze nie jest skonfigurowana",
  "api.unauthorized": "Wymagane logowanie",
  "api.load_failed": "Nie udało się wczytać rozliczeń z chmury",
  "api.no_data": "Brak danych rozliczenia",
  "api.invalid_record": "Nieprawidłowe dane rozliczenia",
  "api.duplicate_period": "Rozliczenie za ten miesiąc już istnieje",
  "api.save_failed": "Nie udało się zapisać rozliczenia",
  "api.no_records": "Brak listy rozliczeń",
  "api.too_many_records": "Zbyt wiele zapisów w pliku",
  "api.invalid_records": "Plik zawiera nieprawidłowe zapisy",
  "api.import_failed": "Nie udało się zaimportować rozliczeń",
  "api.record_not_found": "Nie znaleziono rozliczenia",
  "api.record_locked":
    "Rozliczenie jest opłacone i zablokowane. Najpierw anuluj płatność.",
  "api.paid_delete_forbidden":
    "Opłaconego rozliczenia nie można usunąć. Najpierw anuluj płatność.",
  "api.no_changes": "Brak zmian",
  "api.update_failed": "Nie udało się zaktualizować rozliczenia",
  "api.delete_failed": "Nie udało się usunąć rozliczenia",
  "api.pin_required": "Wpisz kod PIN",
  "api.rate_limited": "Zbyt wiele prób. Spróbuj ponownie za 15 minut.",
  "api.wrong_pin": "Nieprawidłowy kod PIN",
  "api.login_failed":
    "Nie udało się zalogować. Sprawdź ustawienia pamięci.",
  "api.storage_unavailable": "Pamięć w chmurze jest niedostępna",
  "api.network": "Brak połączenia z serwerem. Sprawdź internet.",
  "api.request_failed": "Nie udało się wykonać żądania",
  "api.unexpected": "Coś poszło nie tak. Spróbuj ponownie.",
};

const zh: Record<MessageKey, string> = {
  "app.name": "电费",
  "app.tagline": "分时电价计算与缴费记录",
  "app.home": "回到顶部",

  "common.settings": "设置",
  "common.cancel": "取消",
  "common.close": "关闭",
  "common.edit": "编辑",
  "common.delete": "删除",
  "common.open": "打开",
  "common.change": "更改",
  "common.confirm": "确认",
  "common.wait": "请稍候…",
  "common.day": "白天",
  "common.night": "夜间",
  "common.kwh": "千瓦时",
  "common.yes": "是",
  "common.no": "否",

  "boot.loading": "正在加载记录…",
  "error.loadTitle": "无法加载数据",
  "error.retry": "重试",
  "error.settings": "设置",
  "error.storageUnavailable": "存储不可用",
  "error.storageUnavailableCloud":
    "云存储不可用。请检查 KV_REST_API_URL 和 KV_REST_API_TOKEN。",
  "error.recordNotFound": "未找到记录",
  "error.paidLocked": "已支付的记录无法编辑。请先取消支付。",
  "error.noLocalRecords": "此设备上没有已保存的记录",
  "error.cloudNotConnected": "云存储未连接",
  "error.unexpected": "出现问题，请重试。",

  "lock.eyebrow": "个人账户",
  "lock.subtitle": "输入 PIN 码以在此设备上查看电费记录和支付历史。",
  "lock.pinLabel": "PIN 码",
  "lock.pinPlaceholder": "PIN 码",
  "lock.enterPin": "请输入 PIN 码",
  "lock.checking": "正在验证…",
  "lock.submit": "登录",
  "lock.hintBefore": "PIN 码由应用所有者在 Vercel 的 ",
  "lock.hintAfter": " 变量中设置。登录状态保留 120 天。",
  "lock.fallback": "登录失败",

  "header.cloud": "云端",
  "header.local": "此设备",
  "hero.eyebrow": "个人用电记录 · {month}",
  "hero.title1": "电费已计算。",
  "hero.title2": "历史已保存。",
  "hero.subtitle":
    "填写白天和夜间读数，金额会自动计算。标记支付后，应用会永久保存支付日期。",
  "hero.changeRate": "更改",
  "stats.toPay": "应付",
  "stats.unpaid": "未支付：{count}",
  "stats.allPaid": "全部已支付",
  "stats.paidForYear": "{year} 年已支付",
  "stats.payments": "支付笔数：{count}",
  "stats.noPayments": "暂无支付",
  "stats.usageForYear": "{year} 年用电量",
  "stats.usageSub": "千瓦时 · {count} 个月",

  "banner.localTitle": "数据仅保存在此浏览器中",
  "banner.localText":
    "要在手机和电脑上查看历史，请启用免费云同步——只需几分钟。设置中有操作说明。",
  "banner.configure": "去设置",

  "side.ratesTitle": "您的费率",
  "side.dayHours": "07:00 – 23:00",
  "side.nightHours": "23:00 – 07:00",
  "side.rateNote": "新记录使用的每千瓦时价格。",
  "side.lastTitle": "最近记录",
  "side.toHistory": "查看历史",
  "side.statusPaid": "已支付",
  "side.statusUnpaid": "未支付",
  "side.editReadings": "编辑读数",
  "side.recordPaid": "记录已支付",
  "side.emptyTitle": "暂无历史记录",
  "side.emptyText": "第一条记录会显示在这里，并长期保存。",
  "side.syncTitle": "同步已开启",
  "side.privacyTitle": "您的数据只属于您",
  "side.syncText": "手机和电脑共享同一份历史。登录受 PIN 码保护。",
  "side.privacyText": "读数不会发送给供电公司，这是个人记录。",

  "footer.summary": "个人电费记录 · 每千瓦时 {day} / {night} ₴",
  "footer.settings": "设置与备份",

  "form.newEyebrow": "新记录",
  "form.editEyebrow": "编辑",
  "form.newTitle": "填写电表读数",
  "form.editBanner": "您正在编辑已保存的记录，保存后将更新历史。",
  "form.cancel": "取消",
  "form.periodLabel": "账单月份",
  "form.monthAria": "月份",
  "form.yearAria": "年份",
  "form.periodHint": "本次缴费对应的月份",
  "form.enteredAtLabel": "录入日期",
  "form.enteredAtHint": "记录读数的日期",
  "form.readingsSection": "电表读数",
  "form.prefill": "已从 {month} 的记录填入上次读数",
  "form.prevMonth": "上月",
  "form.thisMonth": "本月",
  "form.used": "已用",
  "form.rateUnit": "₴ / 千瓦时",
  "form.ratesToggle": "本次记录的费率",
  "form.rateDayLabel": "白天费率，₴/千瓦时",
  "form.rateNightLabel": "夜间费率，₴/千瓦时",
  "form.ratesHint":
    "费率随记录一起保存。如果价格变化，旧月份仍按原价计算。",
  "form.duplicateTitle": "{month} 已有记录。",
  "form.duplicateText": "打开该记录修改读数，或选择其他月份。",
  "form.openExisting": "打开",
  "form.toPay": "{month} 应付",
  "form.totalKwh": "千瓦时（合计）",
  "form.breakdownDay": "白天 · {kwh} 千瓦时 × {rate}",
  "form.breakdownNight": "夜间 · {kwh} 千瓦时 × {rate}",
  "form.negative": "“本月”读数小于上月读数，请核对数字。",
  "form.resultPlaceholder": "填写上月和本月读数，金额会自动计算。",
  "form.saving": "正在保存…",
  "form.save": "保存记录",
  "form.saveChanges": "保存更改",
  "form.note":
    "保存后记录会出现在历史中。“已支付”勾选框也在那里，并会记录支付日期。",
  "form.validationToast": "请检查填写内容",
  "form.saveError": "无法保存记录",
  "form.saved": "{month} 的记录已保存",
  "form.savedEdit": "{month} 的更改已保存",

  "validation.periodRequired": "请选择账单月份",
  "validation.periodDuplicate": "该月份已有记录",
  "validation.enteredAtRequired": "请填写读数录入日期",
  "validation.prevRequired": "请填写上月读数",
  "validation.currRequired": "请填写本月读数",
  "validation.negativeReading": "读数不能为负数",
  "validation.readingTooLarge": "数值过大",
  "validation.currLessPrev": "本月读数小于上月读数",
  "validation.rateRequired": "请填写费率",
  "validation.ratePositive": "费率必须大于零",
  "validation.rateTooLarge": "费率过大",

  "history.eyebrow": "历史",
  "history.title": "记录与支付",
  "history.subtitle": "所有月份都会保存，可随时查看任意年份。",
  "history.yearFilter": "按年份筛选",
  "history.all": "全部",
  "history.emptyAll": "暂无记录",
  "history.emptyYear": "{year} 年暂无记录",
  "history.emptyText":
    "保存第一条记录后会显示在这里。记录会长期保存，随时可查。",
  "history.goToCalc": "去计算",
  "history.showAll": "显示所有年份",
  "history.usage": "用电量",
  "history.charged": "应缴",
  "history.paid": "已支付",
  "history.debt": "欠费",
  "history.chartTitle": "{year} 年月度费用",
  "history.yearGroup": "{year} 年",
  "history.total": "记录：{count} · {kwh} · {scope}",
  "history.scopeAll": "全部时间",
  "history.scopeYear": "{year} 年",

  "record.dataFrom": "录入于 {date}",
  "record.metaDay": "白天：{prev} → {curr}",
  "record.metaNight": "夜间：{prev} → {curr}",
  "record.markPaid": "标记为已支付",
  "record.payDateAuto": "日期会自动保存",
  "record.unlock": "取消支付",
  "record.edit": "编辑",
  "record.delete": "删除",

  "settings.title": "设置",
  "settings.languageTitle": "界面语言",
  "settings.languageText": "选择语言——立即生效，并保存在此设备上。",
  "settings.ratesTitle": "默认费率",
  "settings.ratesText": "用于新记录。已保存月份的费率不会改变。",
  "settings.dayRateLabel": "白天，₴/千瓦时",
  "settings.nightRateLabel": "夜间，₴/千瓦时",
  "settings.rateError": "请输入大于零的费率",
  "settings.saveRates": "保存费率",
  "settings.storageTitle": "数据存储",
  "settings.storageCloudText": "记录会在手机和电脑之间同步。",
  "settings.storageLocalText": "记录仅保存在此浏览器中。",
  "settings.cloudConnected": "云端已连接",
  "settings.pinProtection": "PIN 保护",
  "settings.cloudText":
    "输入 PIN 码后可在任何设备上访问数据。只要云数据库存在，历史就会保留。",
  "settings.pushLocal": "从此设备迁移 {count} 条",
  "settings.signOut": "退出云端",
  "settings.localTitle": "本地存储",
  "settings.localText":
    "刷新页面不会丢失记录，但其他设备看不到，清除浏览器数据时可能丢失。实验前请下载备份。",
  "settings.setupTitle": "如何启用同步",
  "settings.setupStep1":
    "在 Vercel 中打开项目 → Storage → Marketplace → Upstash Redis（免费）。",
  "settings.setupStep2":
    "将数据库连接到项目：会出现 KV_REST_API_URL 和 KV_REST_API_TOKEN。",
  "settings.setupStep3": "添加 APP_PIN 变量——用于登录应用的代码。",
  "settings.setupStep4": "重新部署：应用会自动切换到云端模式。",
  "settings.backupTitle": "备份",
  "settings.backupText": "可以将 JSON 文件单独保存，随时恢复数据。",
  "settings.exportJson": "下载 JSON",
  "settings.exportCsv": "下载 CSV",
  "settings.importJson": "导入 JSON",
  "settings.importNote":
    "导入会添加缺失的月份，并更新同月份记录。文件中没有的记录会保留。",
  "settings.aboutVersion": "双费率计算器 · 版本 1.0",
  "settings.aboutDisclaimer": "本应用不会把读数发送给供电公司，仅为个人记录。",

  "confirm.deleteTitle": "删除此记录？",
  "confirm.deleteText": "{month} 的记录将被永久删除。备份可以恢复它。",
  "confirm.unlockTitle": "取消此支付？",
  "confirm.unlockText":
    "将移除 {month} 的支付标记，删除支付日期，记录将再次可编辑。",
  "confirm.importTitle": "导入数据？",
  "confirm.importText":
    "将添加或更新 {count} 条记录。文件中的同月份记录会更新，其他记录保持不变。",
  "confirm.importSkipped": "已跳过无效行：{count}。",
  "confirm.deleteAction": "删除",
  "confirm.unlockAction": "取消支付",
  "confirm.importAction": "导入",

  "toast.paid": "{month} 的支付已标记——日期已保存",
  "toast.paidError": "无法标记支付",
  "toast.deleted": "{month} 的记录已删除",
  "toast.unlocked": "{month} 的支付已取消——记录已解锁",
  "toast.importDone":
    "导入完成：新增 {added} 条，更新 {updated} 条，跳过 {skipped} 条",
  "toast.importDoneClean": "导入完成：新增 {added} 条，更新 {updated} 条",
  "toast.actionFailed": "无法完成操作",
  "toast.backupDownloaded": "备份已下载",
  "toast.csvDownloaded": "CSV 已下载",
  "toast.noValidRecords": "文件中没有有效的记录",
  "toast.readFileFailed": "无法读取文件。请选择备份 JSON。",
  "toast.moved": "已迁移：新增 {added} 条，更新 {updated} 条",
  "toast.moveFailed": "无法迁移数据",
  "toast.signedOut": "已退出云端",
  "toast.signOutFailed": "无法退出",
  "toast.ratesUpdated": "默认费率已更新",
  "toast.editPaid": "该记录已支付。请先在历史中取消支付。",

  "csv.month": "账单月份",
  "csv.period": "期间",
  "csv.dayPrev": "白天：上月",
  "csv.dayCurr": "白天：本月",
  "csv.dayKwh": "白天：千瓦时",
  "csv.dayRate": "白天费率",
  "csv.daySum": "白天：金额",
  "csv.nightPrev": "夜间：上月",
  "csv.nightCurr": "夜间：本月",
  "csv.nightKwh": "夜间：千瓦时",
  "csv.nightRate": "夜间费率",
  "csv.nightSum": "夜间：金额",
  "csv.total": "合计",
  "csv.enteredAt": "录入日期",
  "csv.paid": "已支付",
  "csv.paidAt": "支付日期",
  "csv.note": "备注",

  "api.storage_not_configured": "云存储未配置",
  "api.unauthorized": "需要登录",
  "api.load_failed": "无法从云端加载记录",
  "api.no_data": "没有记录数据",
  "api.invalid_record": "记录数据无效",
  "api.duplicate_period": "该月份已有记录",
  "api.save_failed": "无法保存记录",
  "api.no_records": "未提供记录列表",
  "api.too_many_records": "文件中的记录过多",
  "api.invalid_records": "文件包含无效记录",
  "api.import_failed": "无法导入记录",
  "api.record_not_found": "未找到记录",
  "api.record_locked": "该记录已支付并锁定。请先取消支付。",
  "api.paid_delete_forbidden": "已支付的记录无法删除。请先取消支付。",
  "api.no_changes": "没有更改",
  "api.update_failed": "无法更新记录",
  "api.delete_failed": "无法删除记录",
  "api.pin_required": "请输入 PIN 码",
  "api.rate_limited": "尝试次数过多。请 15 分钟后再试。",
  "api.wrong_pin": "PIN 码错误",
  "api.login_failed": "无法登录。请检查存储设置。",
  "api.storage_unavailable": "云存储不可用",
  "api.network": "无法连接服务器。请检查网络。",
  "api.request_failed": "请求失败",
  "api.unexpected": "出现问题，请重试。",
};

export const messages: Record<Locale, Record<MessageKey, string>> = {
  ru,
  uk,
  en,
  pl,
  zh,
};

export type MessageVars = Record<string, string | number>;

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: MessageVars,
): string {
  const template = messages[locale]?.[key] ?? messages.ru[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

let activeLocale: Locale = "ru";

export function setActiveLocale(locale: Locale): void {
  activeLocale = locale;
}

export function getActiveLocale(): Locale {
  return activeLocale;
}

/** Translate using the locale currently selected in the interface. */
export function tNow(key: MessageKey, vars?: MessageVars): string {
  return translate(activeLocale, key, vars);
}

/** Map a stable server error code to a localised message. */
export function apiErrorMessage(code: string | undefined): string {
  if (!code) return tNow("api.request_failed");
  const key = `api.${code}` as MessageKey;
  if (key in messages.ru) return tNow(key);
  return tNow("api.unexpected");
}
