import React, { useState, useEffect, useMemo } from 'react';
import {
  DestinationType,
  StyleOptions,
  GoogleMapsConfig,
  WifiConfig,
  VCardConfig,
  SocialConfig,
  EmailConfig,
  PhoneConfig,
  FileConfig,
  WhatsAppConfig,
  TextConfig,
  CalendarEventConfig,
  UrlFormConfig,
  SavedQRCode,
  DestinationConfig,
} from './types/qr';
import {
  buildUrlWithUtmPayload,
  buildGoogleMapsPayload,
  buildWifiPayload,
  buildVCardPayload,
  buildSocialPayload,
  buildEmailPayload,
  buildPhonePayload,
  buildFilePayload,
  buildWhatsAppPayload,
  buildTextPayload,
  buildCalendarEventPayload,
} from './utils/qrPayloads';
import { Header } from './components/Header';
import { UrlForm } from './components/DestinationForms/UrlForm';
import { GoogleMapsForm } from './components/DestinationForms/GoogleMapsForm';
import { WifiForm } from './components/DestinationForms/WifiForm';
import { VCardForm } from './components/DestinationForms/VCardForm';
import { SocialForm } from './components/DestinationForms/SocialForm';
import { CommunicationForm } from './components/DestinationForms/CommunicationForm';
import { MediaFileForm } from './components/DestinationForms/MediaFileForm';
import { WhatsAppForm } from './components/DestinationForms/WhatsAppForm';
import { TextForm } from './components/DestinationForms/TextForm';
import { CalendarEventForm } from './components/DestinationForms/CalendarEventForm';
import { StyleControls } from './components/StyleControls';
import { QRPreviewPanel } from './components/QRPreviewPanel';
import { BatchGenerator } from './components/BatchGenerator';
import { SavedLibrary } from './components/SavedLibrary';
import { StandardsModal } from './components/StandardsModal';
import { useModalA11y } from './utils/useModalA11y';
import { useTheme } from './utils/theme';
import {
  Globe,
  MapPin,
  Wifi,
  Contact,
  Share2,
  Mail,
  Phone,
  FileText,
  SlidersHorizontal,
  MessageCircle,
  Type,
  Calendar,
} from 'lucide-react';

export const DEFAULT_STYLE: StyleOptions = {
  fgColor: '#000000',
  bgColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 4,
  moduleStyle: 'square',
  eyeFrameStyle: 'square',
  logoSizePercent: 18,
  logoHasBackground: true,
};

// Seed codes shown on first launch so the library isn't empty.
// Wi-Fi passwords are never stored in seed data or localStorage.
export const SEED_SAVED_CODES: SavedQRCode[] = [
  {
    id: 'seed-1',
    name: 'Central Park meetup',
    type: 'maps',
    destinationPayload: 'https://www.google.com/maps/search/?api=1&query=Central%20Park%2C%20New%20York%2C%20NY',
    displaySummary: 'Google Maps: Central Park, New York, NY',
    style: { ...DEFAULT_STYLE, fgColor: '#0f172a' },
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    config: {
      type: 'maps',
      config: {
        mode: 'search',
        searchQuery: 'Central Park, New York, NY',
        destinationAddress: '',
        originAddress: '',
        travelMode: 'driving',
        pastedUrl: '',
      },
    },
  },
  {
    id: 'seed-2',
    name: 'Guest Wi-Fi',
    type: 'wifi',
    destinationPayload: 'WIFI:S:Enterprise_Guest;T:WPA;P:;;',
    displaySummary: 'Wi-Fi: Enterprise_Guest (WPA)',
    style: DEFAULT_STYLE,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    config: {
      type: 'wifi',
      config: {
        ssid: 'Enterprise_Guest',
        password: '',
        encryption: 'WPA',
        hidden: false,
      },
    },
  },
  {
    id: 'seed-3',
    name: 'Personal website',
    type: 'url',
    destinationPayload: 'https://example.com',
    displaySummary: 'https://example.com',
    style: { ...DEFAULT_STYLE, moduleStyle: 'rounded' },
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    config: {
      type: 'url',
      config: {
        url: 'https://example.com',
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
      },
    },
  },
];

export function sanitizeSavedCodesForStorage(codes: SavedQRCode[]): SavedQRCode[] {
  return codes.map((c) => {
    if (c.type === 'wifi') {
      return {
        ...c,
        destinationPayload: c.destinationPayload.replace(/;P:[^;]*;/g, ';P:;'),
        config:
          c.config?.type === 'wifi'
            ? {
                ...c.config,
                config: {
                  ...c.config.config,
                  password: '',
                },
              }
            : c.config,
      };
    }
    return c;
  });
}

function loadSavedDraft(): {
  destinationType?: DestinationType;
  urlConfig?: UrlFormConfig;
  mapsConfig?: GoogleMapsConfig;
  wifiConfig?: WifiConfig;
  vCardConfig?: VCardConfig;
  socialConfig?: SocialConfig;
  emailConfig?: EmailConfig;
  phoneConfig?: PhoneConfig;
  fileConfig?: FileConfig;
  whatsAppConfig?: WhatsAppConfig;
  textConfig?: TextConfig;
  calendarConfig?: CalendarEventConfig;
} | null {
  try {
    const raw = sessionStorage.getItem('qrforge_form_draft') || localStorage.getItem('qrforge_form_draft');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load form draft', e);
  }
  return null;
}

const SaveDialogModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  saveLabelInput: string;
  setSaveLabelInput: (val: string) => void;
  onConfirmSave: () => void;
}> = ({ isOpen, onClose, saveLabelInput, setSaveLabelInput, onConfirmSave }) => {
  const modalRef = useModalA11y(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-dialog-title"
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl focus:outline-none"
        tabIndex={-1}
      >
        <h3 id="save-dialog-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Save to library
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Give this code a name so you can find it later.
        </p>
        <div>
          <label htmlFor="save-label" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
            Name
          </label>
          <input
            id="save-label"
            type="text"
            value={saveLabelInput}
            onChange={(e) => setSaveLabelInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && saveLabelInput.trim()) {
                e.preventDefault();
                onConfirmSave();
              }
            }}
            placeholder="e.g. Front desk Wi-Fi"
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            autoFocus
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmSave}
            disabled={!saveLabelInput.trim()}
            className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-40 transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { theme, cycleTheme } = useTheme();
  const [currentTab, setCurrentTab] = useState<'generator' | 'batch' | 'library'>('generator');
  const [mobileActiveView, setMobileActiveView] = useState<'edit' | 'preview'>('edit');
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveLabelInput, setSaveLabelInput] = useState('');

  const draft = useMemo(() => loadSavedDraft(), []);

  // Destination configuration: fields start empty with realistic placeholders
  const [destinationType, setDestinationType] = useState<DestinationType>(draft?.destinationType || 'url');
  const [urlConfig, setUrlConfig] = useState<UrlFormConfig>(
    draft?.urlConfig || { url: '', utmSource: '', utmMedium: '', utmCampaign: '' }
  );
  const [mapsConfig, setMapsConfig] = useState<GoogleMapsConfig>(
    draft?.mapsConfig || {
      mode: 'search',
      searchQuery: '',
      destinationAddress: '',
      originAddress: '',
      travelMode: 'driving',
      pastedUrl: '',
    }
  );
  const [wifiConfig, setWifiConfig] = useState<WifiConfig>(
    draft?.wifiConfig || {
      ssid: '',
      password: '',
      encryption: 'WPA',
      hidden: false,
    }
  );
  const [vCardConfig, setVCardConfig] = useState<VCardConfig>(
    draft?.vCardConfig || {
      firstName: '',
      lastName: '',
      organization: '',
      jobTitle: '',
      cellPhone: '',
      workPhone: '',
      email: '',
      website: '',
      street: '',
      city: '',
      country: '',
      note: '',
    }
  );
  const [socialConfig, setSocialConfig] = useState<SocialConfig>(
    draft?.socialConfig || {
      platform: 'instagram',
      usernameOrUrl: '',
    }
  );
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(
    draft?.emailConfig || {
      recipient: '',
      subject: '',
      body: '',
    }
  );
  const [phoneConfig, setPhoneConfig] = useState<PhoneConfig>(
    draft?.phoneConfig || {
      mode: 'tel',
      phoneNumber: '',
      smsMessage: '',
    }
  );
  const [fileConfig, setFileConfig] = useState<FileConfig>(
    draft?.fileConfig || {
      fileUrl: '',
      fileName: '',
      fileType: 'PDF Document',
      accessNotice: '',
    }
  );
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(
    draft?.whatsAppConfig || {
      phoneNumber: '',
      message: '',
    }
  );
  const [textConfig, setTextConfig] = useState<TextConfig>(
    draft?.textConfig || {
      text: '',
    }
  );
  const [calendarConfig, setCalendarConfig] = useState<CalendarEventConfig>(
    draft?.calendarConfig || {
      title: '',
      location: '',
      description: '',
      startDate: '',
      endDate: '',
      allDay: false,
    }
  );

  const [styleOptions, setStyleOptions] = useState<StyleOptions>(DEFAULT_STYLE);

  const [savedCodes, setSavedCodes] = useState<SavedQRCode[]>(() => {
    try {
      const stored = localStorage.getItem('qrforge_saved_codes');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved codes from localStorage', e);
    }
    return SEED_SAVED_CODES;
  });

  // Sync saved codes to localStorage (never store Wi-Fi passwords)
  useEffect(() => {
    try {
      const sanitized = sanitizeSavedCodesForStorage(savedCodes);
      localStorage.setItem('qrforge_saved_codes', JSON.stringify(sanitized));
    } catch (e) {
      console.warn('Failed to save codes to localStorage', e);
    }
  }, [savedCodes]);

  // Persist current draft to sessionStorage and localStorage (Wi-Fi password excluded)
  useEffect(() => {
    try {
      const currentDraft = {
        destinationType,
        urlConfig,
        mapsConfig,
        wifiConfig: { ...wifiConfig, password: '' },
        vCardConfig,
        socialConfig,
        emailConfig,
        phoneConfig,
        fileConfig,
        whatsAppConfig,
        textConfig,
        calendarConfig,
      };
      sessionStorage.setItem('qrforge_form_draft', JSON.stringify(currentDraft));
      localStorage.setItem('qrforge_form_draft', JSON.stringify(currentDraft));
    } catch (e) {
      console.warn('Failed to persist draft', e);
    }
  }, [
    destinationType,
    urlConfig,
    mapsConfig,
    wifiConfig,
    vCardConfig,
    socialConfig,
    emailConfig,
    phoneConfig,
    fileConfig,
    whatsAppConfig,
    textConfig,
    calendarConfig,
  ]);

  // Recompute QR text and validation whenever the active form input changes
  const validationResult = useMemo(() => {
    switch (destinationType) {
      case 'url': {
        const v = buildUrlWithUtmPayload(urlConfig);
        return {
          isValid: v.isValid,
          payload: v.payload,
          summary: v.summary,
          error: v.error,
        };
      }
      case 'maps': {
        const v = buildGoogleMapsPayload(mapsConfig);
        return {
          isValid: v.isValid,
          payload: v.payload,
          summary: v.summary,
          error: v.error,
        };
      }
      case 'wifi': {
        const v = buildWifiPayload(wifiConfig);
        return {
          isValid: v.isValid,
          payload: v.payload,
          summary: v.summary,
          error: v.error,
        };
      }
      case 'vcard': {
        const v = buildVCardPayload(vCardConfig);
        return {
          isValid: v.isValid,
          payload: v.payload,
          summary: v.summary,
          error: v.error,
        };
      }
      case 'social': {
        const v = buildSocialPayload(socialConfig);
        return {
          isValid: v.isValid,
          payload: v.payload,
          summary: v.summary,
          error: v.error,
        };
      }
      case 'email': {
        const v = buildEmailPayload(emailConfig);
        return {
          isValid: v.isValid,
          payload: v.payload,
          summary: v.summary,
          error: v.error,
        };
      }
      case 'phone': {
        const v = buildPhonePayload(phoneConfig);
        return {
          isValid: v.isValid,
          payload: v.payload,
          summary: v.summary,
          error: v.error,
        };
      }
      case 'file': {
        const v = buildFilePayload(fileConfig);
        return {
          isValid: v.isValid,
          payload: v.payload,
          summary: v.summary,
          error: v.error,
        };
      }
      case 'whatsapp': {
        const v = buildWhatsAppPayload(whatsAppConfig);
        return {
          isValid: v.isValid,
          payload: v.payload,
          summary: v.summary,
          error: v.error,
        };
      }
      case 'text': {
        const v = buildTextPayload(textConfig);
        return {
          isValid: v.isValid,
          payload: v.payload,
          summary: v.summary,
          error: v.error,
        };
      }
      case 'event': {
        const v = buildCalendarEventPayload(calendarConfig);
        return {
          isValid: v.isValid,
          payload: v.payload,
          summary: v.summary,
          error: v.error,
        };
      }
      default:
        return { isValid: false, payload: '', summary: '', error: 'Unknown type' };
    }
  }, [
    destinationType,
    urlConfig,
    mapsConfig,
    wifiConfig,
    vCardConfig,
    socialConfig,
    emailConfig,
    phoneConfig,
    fileConfig,
    whatsAppConfig,
    textConfig,
    calendarConfig,
  ]);

  const handleResetDefaults = () => {
    setStyleOptions(DEFAULT_STYLE);
  };

  const handleNewCode = () => {
    setDestinationType('url');
    setUrlConfig({ url: '', utmSource: '', utmMedium: '', utmCampaign: '' });
    setStyleOptions(DEFAULT_STYLE);
    setCurrentTab('generator');
  };

  const handleOpenSaveDialog = () => {
    if (!validationResult.isValid) return;
    setSaveLabelInput(validationResult.summary || 'My QR code');
    setShowSaveDialog(true);
  };

  const handleConfirmSave = () => {
    if (!saveLabelInput.trim()) return;

    let config: DestinationConfig | undefined;
    switch (destinationType) {
      case 'url':
        config = { type: 'url', config: { ...urlConfig } };
        break;
      case 'maps':
        config = { type: 'maps', config: { ...mapsConfig } };
        break;
      case 'wifi':
        config = {
          type: 'wifi',
          config: {
            ...wifiConfig,
            password: '', // Wi-Fi passwords are intentionally not saved to disk
          },
        };
        break;
      case 'vcard':
        config = { type: 'vcard', config: { ...vCardConfig } };
        break;
      case 'social':
        config = { type: 'social', config: { ...socialConfig } };
        break;
      case 'email':
        config = { type: 'email', config: { ...emailConfig } };
        break;
      case 'phone':
        config = { type: 'phone', config: { ...phoneConfig } };
        break;
      case 'file':
        config = { type: 'file', config: { ...fileConfig } };
        break;
      case 'whatsapp':
        config = { type: 'whatsapp', config: { ...whatsAppConfig } };
        break;
      case 'text':
        config = { type: 'text', config: { ...textConfig } };
        break;
      case 'event':
        config = { type: 'event', config: { ...calendarConfig } };
        break;
    }

    const newCode: SavedQRCode = {
      id: `code-${Date.now()}`,
      name: saveLabelInput.trim(),
      type: destinationType,
      destinationPayload: validationResult.payload,
      displaySummary: validationResult.summary,
      style: styleOptions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      config,
    };

    setSavedCodes([newCode, ...savedCodes]);
    setShowSaveDialog(false);
  };

  const handleLoadSavedCode = (item: SavedQRCode) => {
    setDestinationType(item.type);
    setStyleOptions(item.style);

    if (item.config) {
      switch (item.config.type) {
        case 'url':
          if (typeof item.config.config === 'string') {
            setUrlConfig({ url: item.config.config, utmSource: '', utmMedium: '', utmCampaign: '' });
          } else {
            setUrlConfig({ ...item.config.config });
          }
          break;
        case 'maps':
          setMapsConfig(item.config.config);
          break;
        case 'wifi':
          setWifiConfig({ ...item.config.config, password: '' });
          break;
        case 'vcard':
          setVCardConfig(item.config.config);
          break;
        case 'social':
          setSocialConfig(item.config.config);
          break;
        case 'email':
          setEmailConfig(item.config.config);
          break;
        case 'phone':
          setPhoneConfig(item.config.config);
          break;
        case 'file':
          setFileConfig(item.config.config);
          break;
        case 'whatsapp':
          setWhatsAppConfig(item.config.config);
          break;
        case 'text':
          setTextConfig(item.config.config);
          break;
        case 'event':
          setCalendarConfig(item.config.config);
          break;
      }
    } else {
      // Legacy fallback for older saved codes without explicit form config
      if (item.type === 'url') {
        setUrlConfig({ url: item.destinationPayload, utmSource: '', utmMedium: '', utmCampaign: '' });
      } else if (item.type === 'maps') {
        setMapsConfig({
          mode: 'url',
          searchQuery: '',
          destinationAddress: '',
          originAddress: '',
          travelMode: 'driving',
          pastedUrl: item.destinationPayload,
        });
      } else if (item.type === 'text') {
        setTextConfig({ text: item.destinationPayload });
      }
    }

    setCurrentTab('generator');
  };

  const handleDuplicateSavedCode = (item: SavedQRCode) => {
    const copy: SavedQRCode = {
      ...item,
      id: `code-${Date.now()}`,
      name: `${item.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSavedCodes([copy, ...savedCodes]);
  };

  const handleDeleteSavedCode = (id: string) => {
    setSavedCodes(savedCodes.filter((c) => c.id !== id));
  };

  const handleImportCodes = (imported: SavedQRCode[]) => {
    setSavedCodes([...imported, ...savedCodes]);
  };

  const destinationTabs: { id: DestinationType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'url', label: 'Website', icon: Globe },
    { id: 'maps', label: 'Google Maps', icon: MapPin },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { id: 'vcard', label: 'Contact card', icon: Contact },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'text', label: 'Plain text', icon: Type },
    { id: 'event', label: 'Event', icon: Calendar },
    { id: 'social', label: 'Social link', icon: Share2 },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Phone & SMS', icon: Phone },
    { id: 'file', label: 'File link', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenSpecs={() => setShowSpecsModal(true)}
        onNewCode={handleNewCode}
        savedCount={savedCodes.length}
        theme={theme}
        onCycleTheme={cycleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'generator' && (
          <div>
            {/* Mobile View Switcher (phones and portrait tablets) */}
            <div className="flex lg:hidden items-center p-1 bg-neutral-200/70 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg mb-5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMobileActiveView('edit')}
                className={`flex-1 py-2 text-center rounded-md transition-colors ${
                  mobileActiveView === 'edit'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                1. Destination & design
              </button>
              <button
                type="button"
                onClick={() => setMobileActiveView('preview')}
                className={`flex-1 py-2 text-center rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  mobileActiveView === 'preview'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <span>2. Preview & download</span>
                {validationResult.isValid && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Ready to download" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className={`lg:col-span-7 space-y-6 ${mobileActiveView === 'preview' ? 'hidden lg:block' : 'block'}`}>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-5 shadow-xs">
                  <div>
                    <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      What should the code open?
                    </h1>
                  </div>

                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800/80">
                    {destinationTabs.map(({ id, label, icon: Icon }) => {
                      const isSelected = destinationType === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setDestinationType(id)}
                          className={`flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px] ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-900'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    {destinationType === 'url' && (
                      <UrlForm
                        config={urlConfig}
                        onChange={setUrlConfig}
                        error={validationResult.error}
                      />
                    )}
                    {destinationType === 'maps' && (
                      <GoogleMapsForm
                        config={mapsConfig}
                        onChange={setMapsConfig}
                        error={validationResult.error}
                      />
                    )}
                    {destinationType === 'wifi' && (
                      <WifiForm
                        config={wifiConfig}
                        onChange={setWifiConfig}
                        error={validationResult.error}
                      />
                    )}
                    {destinationType === 'vcard' && (
                      <VCardForm
                        config={vCardConfig}
                        onChange={setVCardConfig}
                        error={validationResult.error}
                      />
                    )}
                    {destinationType === 'whatsapp' && (
                      <WhatsAppForm
                        config={whatsAppConfig}
                        onChange={setWhatsAppConfig}
                        error={validationResult.error}
                      />
                    )}
                    {destinationType === 'text' && (
                      <TextForm
                        config={textConfig}
                        onChange={setTextConfig}
                        error={validationResult.error}
                      />
                    )}
                    {destinationType === 'event' && (
                      <CalendarEventForm
                        config={calendarConfig}
                        onChange={setCalendarConfig}
                        error={validationResult.error}
                      />
                    )}
                    {destinationType === 'social' && (
                      <SocialForm
                        config={socialConfig}
                        onChange={setSocialConfig}
                        error={validationResult.error}
                      />
                    )}
                    {destinationType === 'email' && (
                      <CommunicationForm
                        type="email"
                        emailConfig={emailConfig}
                        phoneConfig={phoneConfig}
                        onEmailChange={setEmailConfig}
                        onPhoneChange={setPhoneConfig}
                        error={validationResult.error}
                      />
                    )}
                    {destinationType === 'phone' && (
                      <CommunicationForm
                        type="phone"
                        emailConfig={emailConfig}
                        phoneConfig={phoneConfig}
                        onEmailChange={setEmailConfig}
                        onPhoneChange={setPhoneConfig}
                        error={validationResult.error}
                      />
                    )}
                    {destinationType === 'file' && (
                      <MediaFileForm
                        config={fileConfig}
                        onChange={setFileConfig}
                        error={validationResult.error}
                      />
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-neutral-300" />
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Colors and shapes
                    </h2>
                  </div>

                  <StyleControls
                    style={styleOptions}
                    onChange={setStyleOptions}
                    onReset={handleResetDefaults}
                  />
                </div>

                {/* Mobile Jump to Preview Button */}
                <div className="block lg:hidden pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileActiveView('preview');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <span>View QR code preview & download</span>
                    {validationResult.isValid && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    )}
                  </button>
                </div>
              </div>

              <div className={`lg:col-span-5 sticky top-24 space-y-4 ${mobileActiveView === 'edit' ? 'hidden lg:block' : 'block'}`}>
                {/* Mobile Back to Edit Button */}
                <div className="block lg:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileActiveView('edit');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <span>← Back to destination & style</span>
                  </button>
                </div>

                <QRPreviewPanel
                  payload={validationResult.payload}
                  summary={validationResult.summary}
                  isValid={validationResult.isValid}
                  style={styleOptions}
                  onSaveToLibrary={handleOpenSaveDialog}
                />
              </div>
            </div>
          </div>
        )}

        {currentTab === 'batch' && <BatchGenerator style={styleOptions} />}

        {currentTab === 'library' && (
          <SavedLibrary
            codes={savedCodes}
            onLoadCode={handleLoadSavedCode}
            onDuplicateCode={handleDuplicateSavedCode}
            onDeleteCode={handleDeleteSavedCode}
            onCreateNew={() => setCurrentTab('generator')}
            onImportCodes={handleImportCodes}
          />
        )}
      </main>

      <SaveDialogModal
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        saveLabelInput={saveLabelInput}
        setSaveLabelInput={setSaveLabelInput}
        onConfirmSave={handleConfirmSave}
      />

      <StandardsModal
        isOpen={showSpecsModal}
        onClose={() => setShowSpecsModal(false)}
      />

      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 mt-12 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-400">QRForge</span>
            <span>·</span>
            <span>Runs in your browser. Follows the ISO/IEC 18004 spec.</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowSpecsModal(true)}
              className="hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors focus:outline-none focus:underline"
            >
              Print tips
            </button>
            <span>·</span>
            <a
              href="https://github.com/Devputta/QRForge"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors focus:outline-none focus:underline"
            >
              Source on GitHub
            </a>
            <span>·</span>
            <span>Runs completely offline</span>
            <span>·</span>
            <span>No data leaves your device</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
