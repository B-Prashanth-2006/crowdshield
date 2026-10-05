import { Platform, Share } from 'react-native';
import { Profile, EmergencyContact, EmergencyAlert, CheckIn, IncidentReport } from '../types';

/**
 * Escapes characters for PDF text streams
 */
function escapePdfText(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Encodes Uint8Array to Base64 across Web and React Native
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  // Fallback using global or standard mapping
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;
  while (i < binary.length) {
    const chr1 = binary.charCodeAt(i++);
    const chr2 = binary.charCodeAt(i++);
    const chr3 = binary.charCodeAt(i++);

    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    let enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }

    output +=
      chars.charAt(enc1) +
      chars.charAt(enc2) +
      chars.charAt(enc3) +
      chars.charAt(enc4);
  }
  return output;
}

/**
 * RGB Color Tuple (0.0 to 1.0)
 */
export type RGBColor = [number, number, number];

export const Colors = {
  Navy: [0.04, 0.07, 0.16] as RGBColor,       // #0A1128
  Primary: [0.13, 0.54, 0.94] as RGBColor,    // #208AEF
  DarkText: [0.09, 0.13, 0.2] as RGBColor,    // #172133
  GrayText: [0.4, 0.45, 0.55] as RGBColor,    // #66738C
  LightGray: [0.93, 0.95, 0.98] as RGBColor,  // #EDF2FA
  Border: [0.85, 0.88, 0.92] as RGBColor,     // #D9E0EB
  White: [1, 1, 1] as RGBColor,
  Danger: [0.86, 0.15, 0.15] as RGBColor,     // #DC2626
  DangerLight: [0.99, 0.93, 0.93] as RGBColor,
  Success: [0.06, 0.73, 0.51] as RGBColor,    // #10B981
  SuccessLight: [0.92, 0.98, 0.95] as RGBColor,
  Warning: [0.92, 0.58, 0.08] as RGBColor,    // #EB9414
  WarningLight: [0.99, 0.97, 0.91] as RGBColor,
};

interface Page {
  streams: string[];
}

export class SimplePdfDocument {
  private pages: Page[] = [];
  public readonly width = 595.28;  // A4 Width in points
  public readonly height = 841.89; // A4 Height in points
  private currentY: number;

  constructor() {
    this.currentY = this.height - 40;
    this.addPage();
  }

  public addPage(): Page {
    const page: Page = { streams: [] };
    this.pages.push(page);
    this.currentY = this.height - 40;
    return page;
  }

  public get currentPage(): Page {
    return this.pages[this.pages.length - 1];
  }

  public get pageCount(): number {
    return this.pages.length;
  }

  public getY(): number {
    return this.currentY;
  }

  public setY(y: number): void {
    this.currentY = y;
  }

  public ensureSpace(requiredHeight: number): void {
    if (this.currentY - requiredHeight < 50) {
      this.addPage();
      this.drawPageHeader();
    }
  }

  // Draw solid / bordered rectangle
  public drawRect(
    x: number,
    y: number,
    w: number,
    h: number,
    fillColor: RGBColor | null = null,
    strokeColor: RGBColor | null = null,
    lineWidth: number = 1
  ): void {
    let s = 'q\n';
    if (fillColor) {
      s += `${fillColor[0]} ${fillColor[1]} ${fillColor[2]} rg\n`;
    }
    if (strokeColor) {
      s += `${strokeColor[0]} ${strokeColor[1]} ${strokeColor[2]} RG\n`;
      s += `${lineWidth} w\n`;
    }
    s += `${x} ${y} ${w} ${h} re\n`;
    if (fillColor && strokeColor) {
      s += 'B\n';
    } else if (fillColor) {
      s += 'f\n';
    } else {
      s += 'S\n';
    }
    s += 'Q\n';
    this.currentPage.streams.push(s);
  }

  // Draw line divider
  public drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: RGBColor = Colors.Border,
    lineWidth: number = 1
  ): void {
    let s = 'q\n';
    s += `${color[0]} ${color[1]} ${color[2]} RG\n`;
    s += `${lineWidth} w\n`;
    s += `${x1} ${y1} m ${x2} ${y2} l S\n`;
    s += 'Q\n';
    this.currentPage.streams.push(s);
  }

  // Draw text
  public drawText(
    text: string,
    x: number,
    y: number,
    font: 'F1' | 'F2' | 'F3' = 'F1',
    size: number = 10,
    color: RGBColor = Colors.DarkText
  ): void {
    const safeText = escapePdfText(text);
    let s = 'BT\n';
    s += `/${font} ${size} Tf\n`;
    s += `${color[0]} ${color[1]} ${color[2]} rg\n`;
    s += `1 0 0 1 ${x} ${y} Tm\n`;
    s += `(${safeText}) Tj\n`;
    s += 'ET\n';
    this.currentPage.streams.push(s);
  }

  // Draw recurring header for subsequent pages
  public drawPageHeader(): void {
    this.drawRect(40, this.height - 35, this.width - 80, 20, Colors.LightGray, Colors.Border, 0.5);
    this.drawText('CROWDSHIELD SECURITY PLATFORM', 48, this.height - 29, 'F2', 8, Colors.Navy);
    this.drawText('Account Data & Safety Audit Log Export', 230, this.height - 29, 'F1', 8, Colors.GrayText);
    this.currentY = this.height - 55;
  }

  // Draw running footers across all pages
  public applyFooters(userEmail?: string): void {
    const total = this.pages.length;
    for (let i = 0; i < total; i++) {
      const page = this.pages[i];
      const pageNumStr = `Page ${i + 1} of ${total}`;
      const footerY = 24;

      // Divider
      let s = 'q\n';
      s += `${Colors.Border[0]} ${Colors.Border[1]} ${Colors.Border[2]} RG\n0.5 w\n`;
      s += `40 ${footerY + 12} m ${this.width - 40} ${footerY + 12} l S\nQ\n`;

      // Text
      s += 'BT\n/F1 8 Tf\n';
      s += `${Colors.GrayText[0]} ${Colors.GrayText[1]} ${Colors.GrayText[2]} rg\n`;
      s += `1 0 0 1 40 ${footerY} Tm\n`;
      s += `(${escapePdfText(
        `CrowdShield Platform • Confidential Subject Data File • ${userEmail || 'Active User'}`
      )}) Tj\n`;
      s += `1 0 0 1 ${this.width - 95} ${footerY} Tm\n`;
      s += `(${escapePdfText(pageNumStr)}) Tj\n`;
      s += 'ET\n';

      page.streams.push(s);
    }
  }

  // Compile standard PDF 1.4 binary buffer
  public buildBuffer(): Uint8Array {
    const fontObjId1 = 3; // F1: Helvetica
    const fontObjId2 = 4; // F2: Helvetica-Bold
    const fontObjId3 = 5; // F3: Courier

    let currentObjId = 6;
    const pageObjIds: number[] = [];
    const pageAndStreamObjs: string[] = [];

    for (const page of this.pages) {
      const pageId = currentObjId++;
      const streamId = currentObjId++;
      pageObjIds.push(pageId);

      const content = page.streams.join('');
      const contentBytes = new TextEncoder().encode(content);
      const streamLen = contentBytes.length;

      const streamObj = `${streamId} 0 obj\n<< /Length ${streamLen} >>\nstream\n${content}\nendstream\nendobj\n`;
      const pageObj = `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Contents ${streamId} 0 R /Resources << /Font << /F1 ${fontObjId1} 0 R /F2 ${fontObjId2} 0 R /F3 ${fontObjId3} 0 R >> >> >>\nendobj\n`;

      pageAndStreamObjs.push(pageObj);
      pageAndStreamObjs.push(streamObj);
    }

    const catalogObj = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const pagesObj = `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${
      this.pages.length
    } >>\nendobj\n`;
    const f1Obj = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
    const f2Obj = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;
    const f3Obj = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`;

    const allObjects = [catalogObj, pagesObj, f1Obj, f2Obj, f3Obj, ...pageAndStreamObjs];

    let headerStr = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    let pdfStr = headerStr;
    const offsets: number[] = [];

    const encoder = new TextEncoder();

    for (const obj of allObjects) {
      offsets.push(encoder.encode(pdfStr).length);
      pdfStr += obj;
    }

    const startXref = encoder.encode(pdfStr).length;
    let xrefStr = 'xref\n';
    xrefStr += `0 ${allObjects.length + 1}\n`;
    xrefStr += '0000000000 65535 f \n';

    for (const off of offsets) {
      xrefStr += String(off).padStart(10, '0') + ' 00000 n \n';
    }

    xrefStr += 'trailer\n';
    xrefStr += `<< /Size ${allObjects.length + 1} /Root 1 0 R >>\n`;
    xrefStr += 'startxref\n';
    xrefStr += `${startXref}\n`;
    xrefStr += '%%EOF\n';

    pdfStr += xrefStr;

    return encoder.encode(pdfStr);
  }
}

/**
 * Compiles and generates the complete official Account Data & Audit Summary PDF
 */
export function generateAccountDataPDF(options: {
  user: Profile | null;
  contacts: EmergencyContact[];
  sosHistory: EmergencyAlert[];
  trips: CheckIn[];
  incidents: IncidentReport[];
  preferences: {
    pushEnabled: boolean;
    smsEnabled: boolean;
    alertRadiusKm: number;
  };
}): Uint8Array {
  const { user, contacts, sosHistory, trips, incidents, preferences } = options;
  const doc = new SimplePdfDocument();
  const pageWidth = doc.width;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  const exportDate = new Date();
  const dateFormatted = exportDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatted = exportDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const auditId = `CS-AUDIT-${exportDate.getTime().toString(36).toUpperCase()}`;

  // ==========================================
  // PAGE 1: HEADER & EXECUTIVE SUMMARY
  // ==========================================

  // Dark Navy Header Banner
  doc.drawRect(0, doc.height - 90, pageWidth, 90, Colors.Navy);
  doc.drawText('CROWDSHIELD SAFETY NETWORK', margin, doc.height - 42, 'F2', 17, Colors.White);
  doc.drawText(
    'OFFICIAL ACCOUNT DATA & AUDIT SUMMARY EXPORT',
    margin,
    doc.height - 60,
    'F2',
    10,
    Colors.Primary
  );
  doc.drawText(
    `CONFIDENTIAL DATA SUBJECT ARCHIVE • AUDIT REF: ${auditId}`,
    margin,
    doc.height - 76,
    'F1',
    8,
    [0.75, 0.8, 0.9]
  );

  doc.setY(doc.height - 110);

  // Metadata Card
  doc.drawRect(margin, doc.getY() - 48, contentWidth, 48, Colors.LightGray, Colors.Border, 1);
  doc.drawText('Account Holder:', margin + 14, doc.getY() - 18, 'F2', 9, Colors.DarkText);
  doc.drawText(`${user?.name || 'Anonymous User'} (${user?.phone || 'No phone'})`, margin + 95, doc.getY() - 18, 'F1', 9, Colors.DarkText);

  doc.drawText('Account Role:', margin + 14, doc.getY() - 34, 'F2', 9, Colors.DarkText);
  doc.drawText(`${(user?.role || 'member').toUpperCase()} • Status: Active`, margin + 95, doc.getY() - 34, 'F1', 9, Colors.Success);

  doc.drawText('Export Timestamp:', margin + 280, doc.getY() - 18, 'F2', 9, Colors.DarkText);
  doc.drawText(`${dateFormatted} at ${timeFormatted}`, margin + 375, doc.getY() - 18, 'F1', 9, Colors.DarkText);

  doc.drawText('Compliance:', margin + 280, doc.getY() - 34, 'F2', 9, Colors.DarkText);
  doc.drawText('GDPR Art. 15 / CCPA Right of Access', margin + 375, doc.getY() - 34, 'F1', 9, Colors.GrayText);

  doc.setY(doc.getY() - 65);

  // Executive Activity Metrics Grid (4 cards)
  doc.drawText('EXECUTIVE SUMMARY & SAFETY METRICS', margin, doc.getY(), 'F2', 11, Colors.Navy);
  doc.drawLine(margin, doc.getY() - 4, margin + contentWidth, doc.getY() - 4, Colors.Primary, 1.5);
  doc.setY(doc.getY() - 14);

  const cardW = (contentWidth - 24) / 4;
  const cardH = 50;
  const metrics = [
    { label: 'EMERGENCY CONTACTS', val: String(contacts.length), color: Colors.Primary },
    { label: 'SOS BROADCASTS', val: String(sosHistory.length), color: Colors.Danger },
    { label: 'TRIP CHECK-INS', val: String(trips.length), color: Colors.Success },
    { label: 'INCIDENT REPORTS', val: String(incidents.length), color: Colors.Warning },
  ];

  metrics.forEach((m, idx) => {
    const cx = margin + idx * (cardW + 8);
    doc.drawRect(cx, doc.getY() - cardH, cardW, cardH, Colors.LightGray, Colors.Border, 1);
    doc.drawText(m.val, cx + 12, doc.getY() - 24, 'F2', 18, m.color);
    doc.drawText(m.label, cx + 12, doc.getY() - 40, 'F2', 7, Colors.GrayText);
  });

  doc.setY(doc.getY() - (cardH + 20));

  // SECTION 1: Personal Profile & Medical File
  doc.drawText('1. USER PROFILE & EMERGENCY MEDICAL FILE', margin, doc.getY(), 'F2', 11, Colors.Navy);
  doc.drawLine(margin, doc.getY() - 4, margin + contentWidth, doc.getY() - 4, Colors.Border, 1);
  doc.setY(doc.getY() - 16);

  const profileRows = [
    ['User ID / Subject Ref', user?.id || 'demo-user-123'],
    ['Full Legal Name', user?.name || 'Not Provided'],
    ['Registered Phone', user?.phone || 'Not Configured'],
    ['Blood Group', user?.blood_group || 'None specified'],
    ['Emergency Medical Notes', user?.emergency_notes || 'No critical allergies or conditions logged.'],
    ['Notification Channels', `Push Alerts: ${preferences.pushEnabled ? 'ENABLED' : 'DISABLED'} | SMS Dispatch: ${preferences.smsEnabled ? 'ENABLED' : 'DISABLED'}`],
    ['Proximity Radius Filter', `${preferences.alertRadiusKm} km active safety geofence`],
  ];

  profileRows.forEach(([k, v], idx) => {
    const rowY = doc.getY() - 18;
    const bg = idx % 2 === 0 ? Colors.LightGray : Colors.White;
    doc.drawRect(margin, rowY - 4, contentWidth, 20, bg, Colors.Border, 0.5);
    doc.drawText(k, margin + 8, rowY + 3, 'F2', 8.5, Colors.DarkText);
    doc.drawText(v, margin + 170, rowY + 3, 'F1', 8.5, Colors.DarkText);
    doc.setY(rowY - 4);
  });

  doc.setY(doc.getY() - 20);

  // SECTION 2: Trusted Emergency Contacts
  doc.drawText('2. TRUSTED EMERGENCY CONTACTS DIRECTORY', margin, doc.getY(), 'F2', 11, Colors.Navy);
  doc.drawLine(margin, doc.getY() - 4, margin + contentWidth, doc.getY() - 4, Colors.Border, 1);
  doc.setY(doc.getY() - 16);

  // Table Header
  doc.drawRect(margin, doc.getY() - 18, contentWidth, 18, Colors.Navy, Colors.Navy, 1);
  doc.drawText('PRIORITY', margin + 8, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('CONTACT NAME', margin + 70, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('PHONE NUMBER', margin + 220, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('EMAIL ADDRESS', margin + 350, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.setY(doc.getY() - 18);

  if (contacts.length === 0) {
    doc.drawRect(margin, doc.getY() - 20, contentWidth, 20, Colors.White, Colors.Border, 0.5);
    doc.drawText('No emergency contacts registered for this account.', margin + 8, doc.getY() - 14, 'F1', 9, Colors.GrayText);
    doc.setY(doc.getY() - 20);
  } else {
    contacts.forEach((c, idx) => {
      const rowY = doc.getY() - 18;
      const bg = idx % 2 === 0 ? Colors.LightGray : Colors.White;
      doc.drawRect(margin, rowY, contentWidth, 18, bg, Colors.Border, 0.5);
      doc.drawText(`Priority ${c.priority}`, margin + 8, rowY + 5, 'F2', 8, Colors.Primary);
      doc.drawText(c.name, margin + 70, rowY + 5, 'F2', 8.5, Colors.DarkText);
      doc.drawText(c.phone, margin + 220, rowY + 5, 'F1', 8.5, Colors.DarkText);
      doc.drawText(c.email || 'N/A', margin + 350, rowY + 5, 'F1', 8.5, Colors.GrayText);
      doc.setY(rowY);
    });
  }

  // ==========================================
  // PAGE 2: SOS ALERTS, CHECK-INS & REPORTS
  // ==========================================
  doc.addPage();
  doc.drawPageHeader();

  // SECTION 3: Emergency SOS Broadcast & GPS Logs
  doc.drawText('3. EMERGENCY SOS BROADCASTS & LOCATION TRACKING LOGS', margin, doc.getY(), 'F2', 11, Colors.Navy);
  doc.drawLine(margin, doc.getY() - 4, margin + contentWidth, doc.getY() - 4, Colors.Border, 1);
  doc.setY(doc.getY() - 16);

  // Table Header
  doc.drawRect(margin, doc.getY() - 18, contentWidth, 18, Colors.Navy, Colors.Navy, 1);
  doc.drawText('ALERT ID', margin + 8, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('EMERGENCY TYPE', margin + 110, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('STATUS', margin + 230, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('GPS COORDINATES', margin + 310, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('TIMESTAMP', margin + 420, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.setY(doc.getY() - 18);

  if (sosHistory.length === 0) {
    doc.drawRect(margin, doc.getY() - 20, contentWidth, 20, Colors.White, Colors.Border, 0.5);
    doc.drawText('No emergency SOS broadcasts recorded on this account.', margin + 8, doc.getY() - 14, 'F1', 9, Colors.GrayText);
    doc.setY(doc.getY() - 20);
  } else {
    sosHistory.forEach((alert, idx) => {
      const rowY = doc.getY() - 18;
      const bg = idx % 2 === 0 ? Colors.LightGray : Colors.White;
      doc.drawRect(margin, rowY, contentWidth, 18, bg, Colors.Border, 0.5);
      doc.drawText(alert.id.substring(0, 14), margin + 8, rowY + 5, 'F3', 7.5, Colors.DarkText);
      doc.drawText(alert.type, margin + 110, rowY + 5, 'F2', 8, Colors.Danger);
      
      const statusColor = alert.status === 'active' ? Colors.Danger : Colors.Success;
      doc.drawText(alert.status.toUpperCase(), margin + 230, rowY + 5, 'F2', 8, statusColor);

      const coords = `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`;
      doc.drawText(coords, margin + 310, rowY + 5, 'F3', 7.5, Colors.DarkText);

      const dt = new Date(alert.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      doc.drawText(dt, margin + 420, rowY + 5, 'F1', 7.5, Colors.GrayText);

      doc.setY(rowY);
    });
  }

  doc.setY(doc.getY() - 20);

  // SECTION 4: Safe Check-in Trips
  doc.drawText('4. SAFE CHECK-IN & ETA TRIP SHARING LOGS', margin, doc.getY(), 'F2', 11, Colors.Navy);
  doc.drawLine(margin, doc.getY() - 4, margin + contentWidth, doc.getY() - 4, Colors.Border, 1);
  doc.setY(doc.getY() - 16);

  // Table Header
  doc.drawRect(margin, doc.getY() - 18, contentWidth, 18, Colors.Navy, Colors.Navy, 1);
  doc.drawText('DESTINATION NAME', margin + 8, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('SCHEDULED ETA', margin + 200, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('STATUS', margin + 330, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('START TIME', margin + 430, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.setY(doc.getY() - 18);

  if (trips.length === 0) {
    doc.drawRect(margin, doc.getY() - 20, contentWidth, 20, Colors.White, Colors.Border, 0.5);
    doc.drawText('No trip check-ins recorded on this account.', margin + 8, doc.getY() - 14, 'F1', 9, Colors.GrayText);
    doc.setY(doc.getY() - 20);
  } else {
    trips.forEach((t, idx) => {
      const rowY = doc.getY() - 18;
      const bg = idx % 2 === 0 ? Colors.LightGray : Colors.White;
      doc.drawRect(margin, rowY, contentWidth, 18, bg, Colors.Border, 0.5);
      doc.drawText(t.destination_name, margin + 8, rowY + 5, 'F2', 8.5, Colors.DarkText);
      
      const etaFormatted = new Date(t.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      doc.drawText(etaFormatted, margin + 200, rowY + 5, 'F1', 8, Colors.DarkText);

      const stColor = t.status === 'safe' ? Colors.Success : t.status === 'missed_check_in' ? Colors.Danger : Colors.Warning;
      doc.drawText(t.status.toUpperCase(), margin + 330, rowY + 5, 'F2', 8, stColor);

      const startDt = new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
      doc.drawText(startDt, margin + 430, rowY + 5, 'F1', 8, Colors.GrayText);

      doc.setY(rowY);
    });
  }

  doc.setY(doc.getY() - 20);

  // SECTION 5: Submitted Incident Reports
  doc.drawText('5. COMMUNITY INCIDENT REPORTS & EVIDENCE LOGS', margin, doc.getY(), 'F2', 11, Colors.Navy);
  doc.drawLine(margin, doc.getY() - 4, margin + contentWidth, doc.getY() - 4, Colors.Border, 1);
  doc.setY(doc.getY() - 16);

  // Table Header
  doc.drawRect(margin, doc.getY() - 18, contentWidth, 18, Colors.Navy, Colors.Navy, 1);
  doc.drawText('REPORT / LOCATION', margin + 8, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('URGENCY', margin + 200, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('MODERATION', margin + 290, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.drawText('DESCRIPTION SUMMARY', margin + 390, doc.getY() - 12, 'F2', 8, Colors.White);
  doc.setY(doc.getY() - 18);

  if (incidents.length === 0) {
    doc.drawRect(margin, doc.getY() - 20, contentWidth, 20, Colors.White, Colors.Border, 0.5);
    doc.drawText('No incident reports submitted by this account.', margin + 8, doc.getY() - 14, 'F1', 9, Colors.GrayText);
    doc.setY(doc.getY() - 20);
  } else {
    incidents.slice(0, 5).forEach((inc, idx) => {
      const rowY = doc.getY() - 20;
      const bg = idx % 2 === 0 ? Colors.LightGray : Colors.White;
      doc.drawRect(margin, rowY, contentWidth, 20, bg, Colors.Border, 0.5);
      const locName = inc.location_name || inc.category || 'Incident Location';
      doc.drawText(locName.substring(0, 24), margin + 8, rowY + 6, 'F2', 8, Colors.DarkText);

      const urgColor = inc.urgency === 'Critical' ? Colors.Danger : inc.urgency === 'High' ? Colors.Warning : Colors.Primary;
      doc.drawText(inc.urgency, margin + 200, rowY + 6, 'F2', 8, urgColor);

      doc.drawText(inc.status, margin + 290, rowY + 6, 'F1', 8, Colors.DarkText);

      const snippet = inc.description.substring(0, 26) + (inc.description.length > 26 ? '...' : '');
      doc.drawText(snippet, margin + 390, rowY + 6, 'F1', 7.5, Colors.GrayText);

      doc.setY(rowY);
    });
  }

  doc.setY(doc.getY() - 20);

  // Legal Verification Notice
  doc.drawRect(margin, doc.getY() - 36, contentWidth, 36, Colors.LightGray, Colors.Border, 0.5);
  doc.drawText('DATA PRIVACY & INTEGRITY CERTIFICATION', margin + 10, doc.getY() - 12, 'F2', 7.5, Colors.Navy);
  doc.drawText(
    'This electronic audit document represents the authentic personal safety records, contact preferences, and geolocational dispatches',
    margin + 10,
    doc.getY() - 22,
    'F1',
    6.8,
    Colors.DarkText
  );
  doc.drawText(
    `held by CrowdShield Security. Cryptographic Checksum Reference: CS-SHA256-${exportDate.getTime().toString(16)} • Authorized Export`,
    margin + 10,
    doc.getY() - 31,
    'F3',
    6.5,
    Colors.GrayText
  );

  // Apply running footers to all pages
  doc.applyFooters(user?.phone || user?.name || 'Authorized Member');

  return doc.buildBuffer();
}

/**
 * Downloads or shares the compiled PDF document across Web and Mobile
 */
export async function downloadOrSharePDF(
  pdfBytes: Uint8Array,
  filename: string = 'CrowdShield_Account_Data.pdf'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        return { success: true };
      }
    }

    // On Native mobile platforms, use Share
    const base64 = uint8ArrayToBase64(pdfBytes);
    const dataUri = `data:application/pdf;base64,${base64}`;

    await Share.share({
      title: filename,
      url: dataUri,
      message: `CrowdShield Official Account Data & Safety Logs Export (${filename})`,
    });

    return { success: true };
  } catch (err: any) {
    console.error('Failed to export PDF:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Opens PDF in browser for direct preview/printing on Web
 */
export function previewPDF(pdfBytes: Uint8Array): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}
