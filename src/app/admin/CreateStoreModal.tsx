"use client";

import { useState } from "react";
import {
  Instagram,
  Sparkles,
  X,
  Copy,
  Check,
  ExternalLink,
  Store,
  Phone,
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Key,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createStoreByInstagramAdmin,
  QuickCreateStoreResult,
} from "./actions";
import { StoreData } from "./AdminClient";

const PMR_CITIES = [
  "Тирасполь",
  "Бендеры",
  "Рыбница",
  "Дубоссары",
  "Григориополь",
  "Слободзея",
  "Каменка",
  "Днестровск",
];

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreCreated: (newStore: StoreData) => void;
}

export function CreateStoreModal({
  isOpen,
  onClose,
  onStoreCreated,
}: CreateStoreModalProps) {
  const [instagram, setInstagram] = useState("");
  const [name, setName] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([
    "Тирасполь",
    "Бендеры",
  ]);
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [viber, setViber] = useState("");
  const [description, setDescription] = useState("");

  const [showExtraFields, setShowExtraFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuickCreateStoreResult | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldKey: string, toastMessage: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success(toastMessage);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCityToggle = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const handleSelectAllCities = () => {
    if (selectedCities.length === PMR_CITIES.length) {
      setSelectedCities(["Тирасполь", "Бендеры"]);
    } else {
      setSelectedCities([...PMR_CITIES]);
    }
  };

  const handleResetForm = () => {
    setInstagram("");
    setName("");
    setSelectedCities(["Тирасполь", "Бендеры"]);
    setPhone("");
    setTelegram("");
    setViber("");
    setDescription("");
    setShowExtraFields(false);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanHandle = instagram
      .replace(/^@+/, "")
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/[/?#].*$/, "")
      .trim();

    if (!cleanHandle || cleanHandle.length < 2) {
      toast.error("Укажите корректный ник в Instagram");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createStoreByInstagramAdmin({
        instagram: cleanHandle,
        name: name.trim() || undefined,
        cities: selectedCities,
        phone: phone.trim() || undefined,
        telegram: telegram.trim() || undefined,
        viber: viber.trim() || undefined,
        description: description.trim() || undefined,
      });

      setResult(res);
      onStoreCreated(res.store as StoreData);
      toast.success(`Витрина «${res.store.name}» успешно создана! 🎉`);
    } catch (err: any) {
      toast.error(err.message || "Не удалось создать витрину");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative my-8 w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-rose-50/70 via-purple-50/50 to-amber-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-sm">
              <Instagram className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                Создать витрину по Instagram
              </h3>
              <p className="text-xs text-gray-500">
                Быстрое создание магазина без ввода почты и паролей
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Экран 2: Успешно созданная витрина с готовыми ссылками и текстом для Direct */}
        {result ? (
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Витрина магазина готова к работе!
                </h4>
                <p className="text-xs text-emerald-800">
                  Магазин зарегистрирован. Скопируйте ссылку или готовый текст и отправьте продавцу в Instagram Direct.
                </p>
              </div>
            </div>

            {/* Карточка публичной ссылки */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Ссылка на витрину
                </span>
                <a
                  href={`/shop/${result.store.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                >
                  <span>Открыть витрину</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={result.url}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 shadow-xs outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      result.url,
                      "url",
                      "Ссылка на витрину скопирована!"
                    )
                  }
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition shadow-xs"
                >
                  {copiedField === "url" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedField === "url" ? "Скопировано" : "Копировать"}</span>
                </button>
              </div>
            </div>

            {/* Готовое ненавязчивое сообщение для Direct */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-900 uppercase tracking-wider">
                  <Instagram className="h-3.5 w-3.5 text-rose-600" />
                  <span>Готовое сообщение для отправки в Direct</span>
                </span>
                <span className="text-[11px] text-gray-500">
                  Высокая конверсия
                </span>
              </div>
              <textarea
                readOnly
                rows={5}
                value={result.directMessageTemplate}
                className="w-full resize-none rounded-xl border border-rose-200 bg-white p-3 text-xs leading-relaxed text-gray-800 shadow-xs outline-none select-all"
              />
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    result.directMessageTemplate,
                    "direct",
                    "Сообщение скопировано! Теперь вставьте его в Direct"
                  )
                }
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
              >
                {copiedField === "direct" ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>
                  {copiedField === "direct"
                    ? "Текст скопирован! Вставьте в Direct"
                    : "Скопировать текст для Direct"}
                </span>
              </button>
            </div>

            {/* Данные для входа (если продавец попросит доступ) */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-700">
                <Key className="h-3.5 w-3.5 text-amber-500" />
                <span>Данные для входа (если владелец захочет войти):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
                  <span className="text-gray-500">Логин:</span>
                  <span className="font-mono font-medium text-gray-900 truncate max-w-[170px]" title={result.credentials.email}>
                    {result.credentials.email}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
                  <span className="text-gray-500">Пароль:</span>
                  <span className="font-mono font-medium text-gray-900">
                    {result.credentials.password}
                  </span>
                </div>
              </div>
            </div>

            {/* Кнопки завершения */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Создать еще витрину</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition shadow-sm"
              >
                Готово
              </button>
            </div>
          </div>
        ) : (
          /* Экран 1: Быстрая форма создания */
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {/* Обязательное поле: Ник в Instagram */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Ник в Instagram <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="flex items-center gap-1 rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 px-3 py-2.5 text-xs font-medium text-gray-500">
                  <Instagram className="h-3.5 w-3.5 text-rose-500" />
                  <span>@</span>
                </span>
                <input
                  type="text"
                  required
                  autoFocus
                  value={instagram}
                  onChange={(e) => {
                    const clean = e.target.value
                      .replace(/^@+/, "")
                      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
                      .replace(/[/?#].*$/, "");
                    setInstagram(clean);
                    if (!name) {
                      setName(clean);
                    }
                  }}
                  placeholder="svechi_pmr"
                  className="w-full rounded-r-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Витрина будет доступна по адресу:{" "}
                <b className="text-gray-700">
                  e-vitrina.com/shop/{instagram.trim().toLowerCase() || "slug"}
                </b>
              </p>
            </div>

            {/* Название магазина (опционально) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Название витрины (опционально)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={instagram || "Например: Свечи ПМР"}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            {/* Выбор городов доставки/работы */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Города доставки/работы
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllCities}
                  className="text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  {selectedCities.length === PMR_CITIES.length
                    ? "Сбросить до Тирасполь/Бендеры"
                    : "Выбрать все города"}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PMR_CITIES.map((city) => {
                  const isChecked = selectedCities.includes(city);
                  return (
                    <button
                      type="button"
                      key={city}
                      onClick={() => handleCityToggle(city)}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition border ${
                        isChecked
                          ? "bg-rose-50 border-rose-200 text-rose-800 font-semibold"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{city}</span>
                      {isChecked && <Check className="h-3 w-3 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Раскрывающийся блок: Контакты и описание из био */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowExtraFields(!showExtraFields)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition"
              >
                {showExtraFields ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span>
                  {showExtraFields
                    ? "Скрыть дополнительные контакты"
                    : "Указать контакты из био Instagram (телефон, Telegram, Viber)"}
                </span>
              </button>

              {showExtraFields && (
                <div className="mt-3 space-y-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Телефон IDC */}
                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-medium text-gray-700 mb-1">
                        <Phone className="h-3 w-3 text-emerald-600" />
                        <span>Телефон (IDC)</span>
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+373 (77X) XX-XX-XX"
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                      />
                    </div>

                    {/* Telegram */}
                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-medium text-gray-700 mb-1">
                        <Send className="h-3 w-3 text-sky-500" />
                        <span>Telegram</span>
                      </label>
                      <input
                        type="text"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder="username"
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                      />
                    </div>

                    {/* Viber */}
                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-medium text-gray-700 mb-1">
                        <MessageCircle className="h-3 w-3 text-purple-600" />
                        <span>Viber</span>
                      </label>
                      <input
                        type="text"
                        value={viber}
                        onChange={(e) => setViber(e.target.value)}
                        placeholder="+373 77X XXXXX"
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                      />
                    </div>
                  </div>

                  {/* Описание из профиля */}
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-1">
                      Описание магазина из био
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Краткое описание ассортимента, графика работы или условий доставки..."
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white p-2.5 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Кнопки формы */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !instagram.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:from-rose-700 hover:to-pink-700 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Создание витрины...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Создать витрину</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
