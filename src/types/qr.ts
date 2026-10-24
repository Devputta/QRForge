export type DestinationType =
  | 'url'
  | 'maps'
  | 'wifi'
  | 'vcard'
  | 'social'
  | 'email'
  | 'phone'
  | 'file'
  | 'whatsapp'
  | 'text'
  | 'event';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type ModuleStyle = 'square' | 'rounded' | 'dots';

export type EyeFrameStyle = 'square' | 'rounded' | 'circle';

export interface StyleOptions {
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number; // in modules: 0, 1, 2, 4
  moduleStyle: ModuleStyle;
  eyeFrameStyle: EyeFrameStyle;
  logoDataUrl?: string;
  logoType?: 'preset' | 'custom' | 'none';
  logoPresetName?: string;
  logoSizePercent: number; // 10 to 22%
  logoHasBackground: boolean;
}

export interface GoogleMapsConfig {
  mode: 'search' | 'directions' | 'url';
  searchQuery: string;
  destinationAddress: string;
  originAddress: string;
  travelMode: 'driving' | 'walking' | 'bicycling' | 'transit';
  pastedUrl: string;
}

export interface WifiConfig {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardConfig {
  firstName: string;
  lastName: string;
  organization: string;
  jobTitle: string;
  cellPhone: string;
  workPhone: string;
  email: string;
  website: string;
  street: string;
  city: string;
  country: string;
  note: string;
}

export interface SocialConfig {
  platform: 'linkedin' | 'x' | 'github' | 'instagram' | 'youtube' | 'custom';
  usernameOrUrl: string;
}

export interface EmailConfig {
  recipient: string;
  subject: string;
  body: string;
}

export interface PhoneConfig {
  mode: 'tel' | 'sms';
  phoneNumber: string;
  smsMessage: string;
}

export interface FileConfig {
  fileUrl: string;
  fileName: string;
  fileType: string;
  accessNotice: string;
}

export interface WhatsAppConfig {
  phoneNumber: string;
  message: string;
}

export interface TextConfig {
  text: string;
}

export interface CalendarEventConfig {
  title: string;
  location: string;
  description: string;
  startDate: string; // e.g. 2026-10-23T10:00
  endDate: string; // e.g. 2026-10-23T11:00
  allDay: boolean;
}

export interface UrlFormConfig {
  url: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface DiagnosticCheck {
  id: string;
  title: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
}

export interface QRMatrixInfo {
  size: number;
  version: number;
  errorCorrectionLevel: string;
  modules: boolean[][];
}

export type DestinationConfig =
  | { type: 'url'; config: string | UrlFormConfig }
  | { type: 'maps'; config: GoogleMapsConfig }
  | { type: 'wifi'; config: WifiConfig }
  | { type: 'vcard'; config: VCardConfig }
  | { type: 'social'; config: SocialConfig }
  | { type: 'email'; config: EmailConfig }
  | { type: 'phone'; config: PhoneConfig }
  | { type: 'file'; config: FileConfig }
  | { type: 'whatsapp'; config: WhatsAppConfig }
  | { type: 'text'; config: TextConfig }
  | { type: 'event'; config: CalendarEventConfig };

export interface SavedQRCode {
  id: string;
  name: string;
  type: DestinationType;
  destinationPayload: string;
  displaySummary: string;
  style: StyleOptions;
  createdAt: number;
  updatedAt: number;
  config?: DestinationConfig;
}

export interface BatchRowItem {
  id: string;
  name: string;
  type: DestinationType;
  input: string;
  payload: string;
  isValid: boolean;
  errorMessage?: string;
}
