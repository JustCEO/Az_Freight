// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

interface ShipmentData {
  referenceNumber: string;
  transportType: string;
  status: string;
  currency: string;
  originCountry: string;
  originCity: string;
  originAddress?: string | null;
  destinationCountry: string;
  destinationCity: string;
  destinationAddress?: string | null;
  cargoDescription?: string | null;
  weightKg?: unknown;
  volumeCbm?: unknown;
  packageCount?: number | null;
  hsCode?: string | null;
  incoterms?: string | null;
  containerNumber?: string | null;
  blNumber?: string | null;
  vesselName?: string | null;
  tirNumber?: string | null;
  truckPlate?: string | null;
  awbNumber?: string | null;
  notes?: string | null;
  eta?: Date | string | null;
  atd?: Date | string | null;
  createdAt: Date | string;
  client?: { companyName: string; taxId?: string; address?: string; city?: string; country?: string; phone?: string } | null;
  carrier?: { companyName: string; taxId?: string; country?: string; phone?: string } | null;
  tenant?: { name: string } | null;
}

function drawBox(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, label: string, value: string) {
  doc.rect(x, y, w, h).stroke();
  doc.fontSize(7).fillColor('#666').text(label, x + 4, y + 3, { width: w - 8 });
  doc.fontSize(9).fillColor('#000').text(value || '', x + 4, y + 14, { width: w - 8, height: h - 18 });
}

export function generateCMR(data: ShipmentData): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 30 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const w = 535;
    const col = w / 2;

    // Header
    doc.fontSize(16).fillColor('#000').text('CMR — INTERNATIONAL CONSIGNMENT NOTE', 30, 30, { align: 'center', width: w });
    doc.fontSize(8).fillColor('#666').text('Convention on the Contract for the International Carriage of Goods by Road (CMR)', 30, 50, { align: 'center', width: w });
    doc.moveDown(0.5);

    const startY = 70;

    // Box 1 — Sender (Consignor)
    drawBox(doc, 30, startY, col, 60, '1. Sender (Consignor)', `${data.tenant?.name || ''}\n${data.client?.companyName || ''}\n${data.client?.address || ''} ${data.client?.city || ''}, ${data.client?.country || ''}\nTel: ${data.client?.phone || ''}`);

    // Box 16 — Carrier
    drawBox(doc, 30 + col, startY, col, 60, '16. Carrier', `${data.carrier?.companyName || ''}\n${data.carrier?.country || ''}\nTel: ${data.carrier?.phone || ''}`);

    // Box 2 — Consignee
    drawBox(doc, 30, startY + 60, col, 50, '2. Consignee', `${data.destinationAddress || ''}\n${data.destinationCity}, ${data.destinationCountry}`);

    // Box 17 — Successive carriers
    drawBox(doc, 30 + col, startY + 60, col, 50, '17. Successive Carriers', '');

    // Box 3 — Place of delivery
    drawBox(doc, 30, startY + 110, col, 40, '3. Place of Delivery', `${data.destinationCity}, ${data.destinationCountry}\n${data.destinationAddress || ''}`);

    // Box 18 — Reservations
    drawBox(doc, 30 + col, startY + 110, col, 40, '18. Reservations and Observations', data.notes || '');

    // Box 4 — Place/date of taking over
    drawBox(doc, 30, startY + 150, col, 40, '4. Place and Date of Taking Over', `${data.originCity}, ${data.originCountry}\n${data.atd ? new Date(data.atd).toLocaleDateString() : new Date(data.createdAt).toLocaleDateString()}`);

    // Box 19 — Special agreements
    drawBox(doc, 30 + col, startY + 150, col, 40, '19. Special Agreements', data.incoterms ? `Incoterms: ${data.incoterms}` : '');

    // Box 5 — Documents attached
    drawBox(doc, 30, startY + 190, w, 30, '5. Documents Attached', `Reference: ${data.referenceNumber}  |  HS Code: ${data.hsCode || 'N/A'}  |  TIR: ${data.tirNumber || 'N/A'}  |  Truck: ${data.truckPlate || 'N/A'}`);

    // Cargo table header
    const tableY = startY + 230;
    doc.rect(30, tableY, w, 20).fill('#f1f5f9').stroke();
    doc.fillColor('#000').fontSize(7);
    doc.text('6. Marks & Numbers', 34, tableY + 6, { width: 80 });
    doc.text('7. Number of Packages', 120, tableY + 6, { width: 70 });
    doc.text('8. Method of Packing', 196, tableY + 6, { width: 70 });
    doc.text('9. Nature of Goods', 272, tableY + 6, { width: 110 });
    doc.text('10. Stat. No.', 388, tableY + 6, { width: 50 });
    doc.text('11. Gross Weight (kg)', 444, tableY + 6, { width: 60 });
    doc.text('12. Volume (m³)', 510, tableY + 6, { width: 55 });

    // Cargo row
    doc.rect(30, tableY + 20, w, 60).stroke();
    doc.fontSize(9);
    doc.text(data.referenceNumber, 34, tableY + 26, { width: 80 });
    doc.text(data.packageCount ? String(data.packageCount) : '', 120, tableY + 26, { width: 70 });
    doc.text('', 196, tableY + 26, { width: 70 });
    doc.text(data.cargoDescription || '', 272, tableY + 26, { width: 110, height: 50 });
    doc.text(data.hsCode || '', 388, tableY + 26, { width: 50 });
    doc.text(data.weightKg ? String(data.weightKg) : '', 444, tableY + 26, { width: 60 });
    doc.text(data.volumeCbm ? String(data.volumeCbm) : '', 510, tableY + 26, { width: 55 });

    // Box 13 — Sender's instructions
    drawBox(doc, 30, tableY + 90, w, 40, '13. Sender\'s Instructions for Customs', `ETA: ${data.eta ? new Date(data.eta).toLocaleDateString() : 'TBD'}`);

    // Signature boxes
    const sigY = tableY + 140;
    drawBox(doc, 30, sigY, w / 3, 70, '22. Signature and Stamp of Sender', `\n\n\nDate: ${new Date(data.createdAt).toLocaleDateString()}`);
    drawBox(doc, 30 + w / 3, sigY, w / 3, 70, '23. Signature and Stamp of Carrier', '\n\n\nDate:');
    drawBox(doc, 30 + (2 * w) / 3, sigY, w / 3, 70, '24. Signature and Stamp of Consignee', '\n\n\nDate:');

    // Footer
    doc.fontSize(7).fillColor('#888').text(
      `Generated by AzFreight  |  Ref: ${data.referenceNumber}  |  ${new Date().toISOString().slice(0, 10)}`,
      30, sigY + 80, { align: 'center', width: w }
    );

    doc.end();
  });
}

export function generateBL(data: ShipmentData): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 30 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const w = 535;
    const col = w / 2;

    // Header
    doc.fontSize(18).fillColor('#1e3a5f').text('BILL OF LADING', 30, 30, { align: 'center', width: w });
    doc.fontSize(9).fillColor('#666').text('Non-Negotiable Unless Consigned "To Order"', 30, 52, { align: 'center', width: w });

    doc.moveTo(30, 68).lineTo(565, 68).stroke('#1e3a5f');

    const y0 = 78;

    // B/L Number
    drawBox(doc, 30, y0, col, 35, 'B/L Number', data.blNumber || data.referenceNumber);
    drawBox(doc, 30 + col, y0, col, 35, 'Booking Reference', data.referenceNumber);

    // Shipper
    drawBox(doc, 30, y0 + 35, col, 55, 'Shipper / Exporter', `${data.client?.companyName || ''}\n${data.client?.address || ''}\n${data.client?.city || ''}, ${data.client?.country || ''}\nTax ID: ${data.client?.taxId || 'N/A'}`);

    // Carrier info
    drawBox(doc, 30 + col, y0 + 35, col, 55, 'Carrier', `${data.carrier?.companyName || ''}\n${data.carrier?.country || ''}\nTel: ${data.carrier?.phone || ''}`);

    // Consignee
    drawBox(doc, 30, y0 + 90, col, 50, 'Consignee', `${data.destinationAddress || ''}\n${data.destinationCity}, ${data.destinationCountry}`);

    // Notify party
    drawBox(doc, 30 + col, y0 + 90, col, 50, 'Notify Party', data.client?.phone ? `Tel: ${data.client.phone}` : '');

    // Vessel / Port info
    drawBox(doc, 30, y0 + 140, col / 2, 35, 'Vessel Name', data.vesselName || '');
    drawBox(doc, 30 + col / 2, y0 + 140, col / 2, 35, 'Voyage No.', '');
    drawBox(doc, 30 + col, y0 + 140, col / 2, 35, 'Port of Loading', `${data.originCity}, ${data.originCountry}`);
    drawBox(doc, 30 + col + col / 2, y0 + 140, col / 2, 35, 'Port of Discharge', `${data.destinationCity}, ${data.destinationCountry}`);

    // Container info
    drawBox(doc, 30, y0 + 175, col / 2, 30, 'Container Number', data.containerNumber || '');
    drawBox(doc, 30 + col / 2, y0 + 175, col / 2, 30, 'Seal Number', '');
    drawBox(doc, 30 + col, y0 + 175, col / 2, 30, 'Place of Receipt', data.originCity || '');
    drawBox(doc, 30 + col + col / 2, y0 + 175, col / 2, 30, 'Place of Delivery', data.destinationCity || '');

    // Cargo table header
    const tY = y0 + 215;
    doc.rect(30, tY, w, 18).fill('#1e3a5f');
    doc.fillColor('#fff').fontSize(7);
    doc.text('Marks & Numbers', 34, tY + 5, { width: 80 });
    doc.text('No. of Pkgs', 120, tY + 5, { width: 60 });
    doc.text('Description of Goods', 186, tY + 5, { width: 140 });
    doc.text('HS Code', 332, tY + 5, { width: 60 });
    doc.text('Gross Weight', 398, tY + 5, { width: 70 });
    doc.text('Volume (CBM)', 474, tY + 5, { width: 90 });

    // Cargo row
    doc.rect(30, tY + 18, w, 80).stroke();
    doc.fillColor('#000').fontSize(9);
    doc.text(data.referenceNumber, 34, tY + 24, { width: 80 });
    doc.text(data.packageCount ? String(data.packageCount) : '', 120, tY + 24, { width: 60 });
    doc.text(data.cargoDescription || '', 186, tY + 24, { width: 140, height: 70 });
    doc.text(data.hsCode || '', 332, tY + 24, { width: 60 });
    doc.text(data.weightKg ? `${data.weightKg} KG` : '', 398, tY + 24, { width: 70 });
    doc.text(data.volumeCbm ? `${data.volumeCbm} CBM` : '', 474, tY + 24, { width: 90 });

    // Freight
    const fY = tY + 108;
    drawBox(doc, 30, fY, col, 30, 'Freight & Charges', data.incoterms ? `Incoterms: ${data.incoterms}  |  Currency: ${data.currency}` : `Currency: ${data.currency}`);
    drawBox(doc, 30 + col, fY, col, 30, 'Number of Original B/Ls', 'THREE (3)');

    // Declaration
    drawBox(doc, 30, fY + 30, w, 40, 'Declared Value / Additional Info', `ETA: ${data.eta ? new Date(data.eta).toLocaleDateString() : 'TBD'}\n${data.notes || ''}`);

    // Signatures
    const sY = fY + 80;
    drawBox(doc, 30, sY, col, 60, 'Shipped on Board\nDate:', `\n\n${data.atd ? new Date(data.atd).toLocaleDateString() : ''}`);
    drawBox(doc, 30 + col, sY, col, 60, 'Signed for the Carrier\n(as agent)', '\n\n\n____________________________');

    // Footer
    doc.fontSize(7).fillColor('#888').text(
      `Generated by AzFreight  |  B/L: ${data.blNumber || data.referenceNumber}  |  ${new Date().toISOString().slice(0, 10)}`,
      30, sY + 68, { align: 'center', width: w }
    );

    doc.end();
  });
}
