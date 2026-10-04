/**
 * 💰 PRICING & SHIPPING CONSTANTS (USA / USD)
 * 
 * Bu fayl tətbiqdə istifadə olunan çatdırılma haqqı, vergi dərəcəsi və regional 
 * çatdırılma məhdudiyyətləri üçün sabit qiymət parametrlərini saxlayır.
 */

/**
 * 📍 Qeydiyyat və Sifariş pəncərəsində çatdırılma ünvanı üçün ABŞ ştatları siyahısı (US States)
 */
export const US_STATES = [
  "California",
  "Texas",
  "Florida",
  "New York",
  "Pennsylvania",
  "Illinois",
  "Ohio",
  "Georgia",
  "North Carolina",
  "Michigan",
  "New Jersey",
  "Virginia",
  "Washington",
  "Arizona",
  "Massachusetts",
  "Tennessee",
  "Indiana",
  "Missouri",
  "Maryland",
  "Wisconsin",
  "Colorado",
  "Minnesota",
  "South Carolina",
  "Alabama",
  "Louisiana",
  "Kentucky",
  "Oregon",
  "Oklahoma",
  "Connecticut",
  "Utah",
  "Nevada",
  "Iowa",
  "Arkansas",
  "Mississippi",
  "Kansas",
  "New Mexico",
  "Nebraska",
  "Idaho",
  "West Virginia",
  "Hawaii",
  "New Hampshire",
  "Maine",
  "Montana",
  "Rhode Island",
  "Delaware",
  "South Dakota",
  "North Dakota",
  "Alaska",
  "Vermont",
  "Wyoming",
] as const;

export type USState = (typeof US_STATES)[number];

// Alias for backward compatibility if needed
export const INDIAN_STATES = US_STATES;
export type IndianState = USState;

/**
 * 🏔️ Uzaq və çətin çatan ABŞ ştatları (Əlavə çatdırılma rüsumu tətbiq olunur)
 */
export const REMOTE_STATES = [
  "Alaska",
  "Hawaii",
] as const;

/**
 * 📊 Qiymətləndirmə və Vergi Parametrləri (USD):
 * - FREE_SHIPPING_THRESHOLD: Pulsuz çatdırılma üçün minimum səbət məbləği ($50)
 * - BASE_SHIPPING: Standart çatdırılma haqqı ($5)
 * - REMOTE_STATE_CHARGE: Uzaq ştatlar üçün əlavə rüsum ($15)
 * - GST_RATE: Vergi dərəcəsi (%8 / 0.08)
 */
export const PRICING_THRESHOLDS = {
  FREE_SHIPPING_THRESHOLD: 50,
  BASE_SHIPPING: 5,
  REMOTE_STATE_CHARGE: 15,
  GST_RATE: 0.08,
} as const;
