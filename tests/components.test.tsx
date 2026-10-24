// @vitest-environment happy-dom
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { UrlForm } from '../src/components/DestinationForms/UrlForm';
import { GoogleMapsForm } from '../src/components/DestinationForms/GoogleMapsForm';
import { WifiForm } from '../src/components/DestinationForms/WifiForm';
import { VCardForm } from '../src/components/DestinationForms/VCardForm';
import { TextForm } from '../src/components/DestinationForms/TextForm';
import { WhatsAppForm } from '../src/components/DestinationForms/WhatsAppForm';
import { CalendarEventForm } from '../src/components/DestinationForms/CalendarEventForm';
import { CommunicationForm } from '../src/components/DestinationForms/CommunicationForm';
import { SocialForm } from '../src/components/DestinationForms/SocialForm';
import { MediaFileForm } from '../src/components/DestinationForms/MediaFileForm';
import { StyleControls } from '../src/components/StyleControls';
import { BatchGenerator } from '../src/components/BatchGenerator';
import { Header } from '../src/components/Header';
import { StandardsModal } from '../src/components/StandardsModal';
import { SavedLibrary } from '../src/components/SavedLibrary';
import { SEED_SAVED_CODES, DEFAULT_STYLE } from '../src/App';
import {
  UrlFormConfig,
  GoogleMapsConfig,
  WifiConfig,
  VCardConfig,
  TextConfig,
  WhatsAppConfig,
  CalendarEventConfig,
  EmailConfig,
  PhoneConfig,
  SocialConfig,
  FileConfig,
  StyleOptions,
} from '../src/types/qr';

function setNativeInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto =
    input instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  nativeSetter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('Component Tests', () => {
  it('renders UrlForm and handles URL input changes', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let currentConfig: UrlFormConfig = { url: '', utmSource: '', utmMedium: '', utmCampaign: '' };

    await act(async () => {
      root.render(
        <UrlForm
          config={currentConfig}
          onChange={(cfg) => {
            currentConfig = cfg;
          }}
        />
      );
    });

    const input = container.querySelector('#url-input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.placeholder).toBe('https://example.com/page');

    await act(async () => {
      setNativeInputValue(input, 'https://mysite.org');
    });

    expect(currentConfig.url).toBe('https://mysite.org');
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders GoogleMapsForm and switches between search, directions, and link modes', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let mapsConfig: GoogleMapsConfig = {
      mode: 'search',
      searchQuery: 'Central Park',
      destinationAddress: '',
      originAddress: '',
      travelMode: 'driving',
      pastedUrl: '',
    };

    await act(async () => {
      root.render(
        <GoogleMapsForm
          config={mapsConfig}
          onChange={(cfg) => {
            mapsConfig = cfg;
          }}
        />
      );
    });

    expect((container.querySelector('#maps-query') as HTMLInputElement).value).toBe('Central Park');

    const directionsBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Directions')
    );
    await act(async () => {
      directionsBtn?.click();
    });

    expect(mapsConfig.mode).toBe('directions');
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders WifiForm and toggles password visibility', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const config: WifiConfig = { ssid: 'CoffeeShop', password: 'secretpassword', encryption: 'WPA', hidden: false };

    await act(async () => {
      root.render(<WifiForm config={config} onChange={() => {}} />);
    });

    const passInput = container.querySelector('#wifi-pass') as HTMLInputElement;
    expect(passInput.type).toBe('password');

    const toggleBtn = container.querySelector('button[aria-label="Show password"]') as HTMLButtonElement;
    expect(toggleBtn).not.toBeNull();

    await act(async () => {
      toggleBtn.click();
    });

    expect(passInput.type).toBe('text');
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders VCardForm and updates contact fields', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let vcard: VCardConfig = {
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
    };

    await act(async () => {
      root.render(
        <VCardForm
          config={vcard}
          onChange={(cfg) => {
            vcard = cfg;
          }}
        />
      );
    });

    const fnameInput = container.querySelector('#vc-fname') as HTMLInputElement;
    await act(async () => {
      setNativeInputValue(fnameInput, 'Ada');
    });

    expect(vcard.firstName).toBe('Ada');
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders TextForm and updates character count display', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const config: TextConfig = { text: 'Station A-12 inspection complete' };

    await act(async () => {
      root.render(<TextForm config={config} onChange={() => {}} />);
    });

    expect(container.textContent).toContain('32 characters');
    const textarea = container.querySelector('#raw-text') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Station A-12 inspection complete');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders WhatsAppForm with international phone and message fields', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const config: WhatsAppConfig = { phoneNumber: '15551234567', message: 'Hello' };

    await act(async () => {
      root.render(<WhatsAppForm config={config} onChange={() => {}} />);
    });

    const phoneInput = container.querySelector('#wa-phone') as HTMLInputElement;
    expect(phoneInput.value).toBe('15551234567');
    const msgInput = container.querySelector('#wa-msg') as HTMLTextAreaElement;
    expect(msgInput.value).toBe('Hello');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders CalendarEventForm with date and time pickers', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const config: CalendarEventConfig = {
      title: 'Quarterly Review',
      location: 'Conference Room 1',
      description: 'Review OKRs',
      startDate: '2026-11-15T09:00',
      endDate: '2026-11-15T10:00',
      allDay: false,
    };

    await act(async () => {
      root.render(<CalendarEventForm config={config} onChange={() => {}} />);
    });

    const titleInput = container.querySelector('#evt-title') as HTMLInputElement;
    expect(titleInput.value).toBe('Quarterly Review');
    const startInput = container.querySelector('#evt-start') as HTMLInputElement;
    expect(startInput.type).toBe('datetime-local');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders CommunicationForm in both email and phone/SMS modes', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let emailCfg: EmailConfig = { recipient: 'team@example.com', subject: '', body: '' };
    let phoneCfg: PhoneConfig = { mode: 'tel', phoneNumber: '+15550199', smsMessage: '' };

    await act(async () => {
      root.render(
        <CommunicationForm
          type="email"
          emailConfig={emailCfg}
          phoneConfig={phoneCfg}
          onEmailChange={(c) => {
            emailCfg = c;
          }}
          onPhoneChange={(c) => {
            phoneCfg = c;
          }}
        />
      );
    });

    expect((container.querySelector('#email-rec') as HTMLInputElement).value).toBe('team@example.com');

    await act(async () => {
      root.render(
        <CommunicationForm
          type="phone"
          emailConfig={emailCfg}
          phoneConfig={phoneCfg}
          onEmailChange={(c) => {
            emailCfg = c;
          }}
          onPhoneChange={(c) => {
            phoneCfg = c;
          }}
        />
      );
    });

    const smsBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Text message (SMS)')
    );
    await act(async () => {
      smsBtn?.click();
    });
    expect(phoneCfg.mode).toBe('sms');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders SocialForm and switches platform prefixes', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let socialCfg: SocialConfig = { platform: 'linkedin', usernameOrUrl: 'janedoe' };

    await act(async () => {
      root.render(
        <SocialForm
          config={socialCfg}
          onChange={(c) => {
            socialCfg = c;
          }}
        />
      );
    });

    expect(container.textContent).toContain('linkedin.com/in/');
    const githubBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'GitHub'
    );
    await act(async () => {
      githubBtn?.click();
    });
    expect(socialCfg.platform).toBe('github');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders MediaFileForm and updates file URL', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let fileCfg: FileConfig = {
      fileUrl: '',
      fileName: 'Menu',
      fileType: 'PDF Document',
      accessNotice: '',
    };

    await act(async () => {
      root.render(
        <MediaFileForm
          config={fileCfg}
          onChange={(c) => {
            fileCfg = c;
          }}
        />
      );
    });

    const urlInput = container.querySelector('#file-url') as HTMLInputElement;
    await act(async () => {
      setNativeInputValue(urlInput, 'https://example.com/menu.pdf');
    });
    expect(fileCfg.fileUrl).toBe('https://example.com/menu.pdf');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders StyleControls, warns when logo has L/M error correction, and upgrades via Switch to Level H', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let currentStyle: StyleOptions = {
      ...DEFAULT_STYLE,
      errorCorrectionLevel: 'L',
      logoDataUrl: 'data:image/svg+xml;charset=utf-8,<svg></svg>',
      logoPresetName: 'Web Link',
    };
    let wasReset = false;

    await act(async () => {
      root.render(
        <StyleControls
          style={currentStyle}
          onChange={(s) => {
            currentStyle = s;
          }}
          onReset={() => {
            wasReset = true;
          }}
        />
      );
    });

    const warning = container.querySelector('[data-testid="logo-ec-warning"]');
    expect(warning).not.toBeNull();

    const switchBtn = container.querySelector('[data-testid="switch-to-h-button"]') as HTMLButtonElement;
    expect(switchBtn).not.toBeNull();
    await act(async () => {
      switchBtn.click();
    });
    expect(currentStyle.errorCorrectionLevel).toBe('H');

    const resetBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Reset to standard look')
    );
    await act(async () => {
      resetBtn?.click();
    });
    expect(wasReset).toBe(true);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders BatchGenerator with sample CSV rows and updates validation counts on edit', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<BatchGenerator style={DEFAULT_STYLE} />);
    });

    expect(container.textContent).toContain('Portfolio');
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();

    await act(async () => {
      setNativeInputValue(
        textarea,
        `Name,Type,Destination\nValid Site,url,https://example.com\nBad Row,unknownType,123`
      );
    });

    expect(container.textContent).toContain('Unsupported destination type');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders Header with navigation tabs, theme button, and GitHub button', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let activeTab = 'generator';
    let themeToggled = false;
    let newCodeTriggered = false;

    await act(async () => {
      root.render(
        <Header
          currentTab="generator"
          onTabChange={(tab) => {
            activeTab = tab;
          }}
          onOpenSpecs={() => {}}
          onNewCode={() => {
            newCodeTriggered = true;
          }}
          savedCount={3}
          theme="dark"
          onCycleTheme={() => {
            themeToggled = true;
          }}
        />
      );
    });

    expect(container.textContent).toContain('QRForge');
    expect(container.textContent).toContain('Library');
    expect(container.textContent).toContain('(3)');

    const githubLink = container.querySelector('a[aria-label="QRForge on GitHub"]') as HTMLAnchorElement;
    expect(githubLink).not.toBeNull();
    expect(githubLink.getAttribute('href')).toBe('https://github.com/Devputta/QRForge');

    const batchBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Batch export'
    );
    await act(async () => {
      batchBtn?.click();
    });
    expect(activeTab).toBe('batch');

    const themeBtn = container.querySelector('button[aria-label^="Current theme"]') as HTMLButtonElement;
    await act(async () => {
      themeBtn.click();
    });
    expect(themeToggled).toBe(true);

    const newBtn = container.querySelector('button[aria-label="Create new QR code"]') as HTMLButtonElement;
    await act(async () => {
      newBtn.click();
    });
    expect(newCodeTriggered).toBe(true);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders StandardsModal with print calculator formula (Distance / 10)', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let closed = false;

    await act(async () => {
      root.render(
        <StandardsModal
          isOpen={true}
          onClose={() => {
            closed = true;
          }}
        />
      );
    });

    expect(container.textContent).toContain('Print size calculator');
    expect(container.textContent).toContain('10 cm × 10 cm');

    const closeBtn = container.querySelector('button[aria-label="Close dialog"]') as HTMLButtonElement;
    await act(async () => {
      closeBtn.click();
    });
    expect(closed).toBe(true);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('renders SavedLibrary and filters items accurately by search query', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <SavedLibrary
          codes={SEED_SAVED_CODES}
          onLoadCode={() => {}}
          onDuplicateCode={() => {}}
          onDeleteCode={() => {}}
          onCreateNew={() => {}}
          onImportCodes={() => {}}
        />
      );
    });

    expect(container.textContent).toContain('Central Park meetup');
    expect(container.textContent).toContain('Guest Wi-Fi');
    expect(container.textContent).toContain('Personal website');

    const searchInput = container.querySelector('input[placeholder="Search saved codes..."]') as HTMLInputElement;
    await act(async () => {
      setNativeInputValue(searchInput, 'Central');
    });

    expect(container.textContent).toContain('Central Park meetup');
    expect(container.textContent).not.toContain('Guest Wi-Fi');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
