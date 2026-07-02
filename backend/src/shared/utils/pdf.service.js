const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const I18N = {
  en: {
    COMPANY_NAME: 'SDRS GOLD FINANCE',
    COMPANY_SUBTITLE: 'Pledge & RePledge',
    COMPANY_ADDRESS_1: '1/12, Maruthamalai Main Road, Opp Ramraj Cotton Showroom,',
    COMPANY_ADDRESS_2: 'Near High School Stop, Vadavalli, Coimbatore - 641 041.',
    COMPANY_PHONE: 'Phone: 98432 57757',
    
    INVOICE: 'INVOICE',
    INVOICE_NUMBER: 'Invoice Number',
    INVOICE_DATE: 'Invoice Date',
    INVOICE_TYPE: 'Invoice Type',
    
    CUSTOMER_DETAILS: 'Customer Details',
    CUSTOMER_NAME: 'Customer Name',
    CUSTOMER_CODE: 'Customer Code',
    MOBILE_NUMBER: 'Mobile Number',
    
    LOAN_DETAILS: 'Loan Details',
    LOAN_NUMBER: 'Loan Number',
    LOAN_STATUS: 'Loan Status',
    INTEREST_RATE: 'Interest Rate',
    
    ORNAMENT_DETAILS: 'Ornament Details',
    ORNAMENT_TYPE: 'Ornament Type',
    PURITY: 'Purity',
    WEIGHT: 'Weight',
    ESTIMATED_VALUE: 'Estimated Value',
    
    FINANCIAL_SUMMARY: 'FINANCIAL SUMMARY',
    PAYMENT_BREAKDOWN: 'PAYMENT BREAKDOWN',
    
    ORIGINAL_LOAN_AMOUNT: 'Original Loan Amount',
    DISBURSED_AMOUNT: 'Disbursed Amount',
    TOTAL_PAID_TILL_DATE: 'Total Paid Till Date',
    OUTSTANDING_PRINCIPAL: 'Outstanding Principal',
    OUTSTANDING_INTEREST: 'Outstanding Interest',
    OUTSTANDING_PENALTY: 'Outstanding Penalty',
    TOTAL_OUTSTANDING: 'Total Outstanding',
    CURRENT_MONTH_INTEREST: 'Current Month Interest',
    TOTAL_ACCRUED_INTEREST: 'Total Accrued Interest',
    MONTHLY_INTEREST_RATE: 'Monthly Interest Rate',
    REMAINING_INTEREST_DUE: 'Remaining Interest Due',
    TOTAL_SETTLEMENT_AMOUNT: 'Total Settlement Amount',
    
    CURRENT_PAYMENT: 'Collection Amount',
    PRINCIPAL_PAID: 'Principal Component Paid',
    INTEREST_PAID: 'Interest Component Paid',
    PENALTY_PAID: 'Penalty Component Paid',
    REMAINING_PRINCIPAL_BREAKDOWN: 'Remaining Principal',
    TOTAL_COLLECTED: 'Total Collected',
    
    THANK_YOU_TITLE: 'THANK YOU FOR CHOOSING',
    THANK_YOU_SUBTITLE: 'Your Trust Is Our Greatest Asset',
    THANK_YOU_MESSAGE: 'We sincerely appreciate your trust and confidence in our services.',
    
    AUTHORIZED_SIGNATORY: 'Authorized Signatory',
    
    // Chit specific
    SCHEME_DETAILS: 'Scheme Details',
    SCHEME_NAME: 'Scheme Name',
    TOTAL_SCHEME_AMOUNT: 'Total Scheme Amount',
    TICKET_NUMBER: 'Ticket Number',
    MONTHLY_INSTALLMENT: 'Monthly Installment',
    CHIT_SUMMARY: 'GOLD ACCUMULATION SUMMARY',
    CURRENT_GOLD_RATE: 'Live Gold Rate (22K)',
    INSTALLMENTS_PAID: 'Installments Paid',
    TOTAL_PAID_AMOUNT: 'Total Paid Amount',
    EQUIVALENT_GOLD_WEIGHT: 'Accumulated Gold Weight',
    MATURITY_VALUE: 'Estimated Maturity Value',
    PAYMENT_HISTORY: 'PAYMENT HISTORY',
    DATE: 'Date',
    INVOICE_NO: 'Invoice No',
    AMOUNT: 'Amount',
    PAYMENT_METHOD: 'Method',
    
    // Payment Methods
    CASH: 'Cash',
    UPI: 'UPI',
    BANK_TRANSFER: 'Bank Transfer',
    CHEQUE: 'Cheque',
    CARD: 'Card',
    ONLINE: 'Online Payment'
  },
  ta: {
    COMPANY_NAME: 'எஸ்.டி.ஆர்.எஸ் கோல்டு பைனான்ஸ்',
    COMPANY_SUBTITLE: 'அடகு & மீள் அடகு',
    COMPANY_ADDRESS_1: '1/12, மருதமலை மெயின் ரோடு, ராம்ராஜ் காட்டன் ஷோரூம் எதிரில்,',
    COMPANY_ADDRESS_2: 'உயர்நிலைப்பள்ளி நிறுத்தம் அருகில், வடவள்ளி, கோயம்புத்தூர் - 641041.',
    COMPANY_PHONE: 'தொலைபேசி: 98432 57757',
    
    INVOICE: 'விலைப்பட்டியல்',
    INVOICE_NUMBER: 'விலைப்பட்டியல் எண்',
    INVOICE_DATE: 'தேதி',
    INVOICE_TYPE: 'வகை',
    
    CUSTOMER_DETAILS: 'வாடிக்கையாளர் விவரங்கள்',
    CUSTOMER_NAME: 'வாடிக்கையாளர் பெயர்',
    CUSTOMER_CODE: 'வாடிக்கையாளர் எண்',
    MOBILE_NUMBER: 'மொபைல் எண்',
    
    LOAN_DETAILS: 'கடன் விவரங்கள்',
    LOAN_NUMBER: 'கடன் எண்',
    LOAN_STATUS: 'கடன் நிலை',
    INTEREST_RATE: 'வட்டி விகிதம்',
    
    ORNAMENT_DETAILS: 'நகை விவரங்கள்',
    ORNAMENT_TYPE: 'நகை வகை',
    PURITY: 'தரம்',
    WEIGHT: 'எடை',
    ESTIMATED_VALUE: 'மதிப்பீட்டு தொகை',
    
    FINANCIAL_SUMMARY: 'நிதி சுருக்கம்',
    PAYMENT_BREAKDOWN: 'பணம் செலுத்திய விவரங்கள்',
    
    ORIGINAL_LOAN_AMOUNT: 'கடன் தொகை',
    DISBURSED_AMOUNT: 'வழங்கப்பட்ட தொகை',
    TOTAL_PAID_TILL_DATE: 'மொத்தம் செலுத்தியது',
    OUTSTANDING_PRINCIPAL: 'நிலுவை அசல்',
    OUTSTANDING_INTEREST: 'நிலுவை வட்டி',
    OUTSTANDING_PENALTY: 'நிலுவை அபராதம்',
    TOTAL_OUTSTANDING: 'மொத்த நிலுவை',
    CURRENT_MONTH_INTEREST: 'இந்த மாத வட்டி',
    TOTAL_ACCRUED_INTEREST: 'மொத்த சேர்ந்த வட்டி',
    MONTHLY_INTEREST_RATE: 'மாதாந்திர வட்டி விகிதம்',
    REMAINING_INTEREST_DUE: 'மீதமுள்ள வட்டி',
    TOTAL_SETTLEMENT_AMOUNT: 'மொத்த தீர்வு தொகை',
    
    CURRENT_PAYMENT: 'வசூல் தொகை',
    PRINCIPAL_PAID: 'அசல் செலுத்தியது',
    INTEREST_PAID: 'வட்டி செலுத்தியது',
    PENALTY_PAID: 'அபராதம் செலுத்தியது',
    REMAINING_PRINCIPAL_BREAKDOWN: 'மீதமுள்ள அசல்',
    TOTAL_COLLECTED: 'மொத்தம் வசூலிக்கப்பட்டது',
    
    THANK_YOU_TITLE: 'நன்றி',
    THANK_YOU_SUBTITLE: 'உங்கள் நம்பிக்கையே எங்களின் மிகப்பெரிய சொத்து',
    THANK_YOU_MESSAGE: 'எங்களின் சேவையை தேர்வு செய்ததற்கு நன்றி.',
    
    AUTHORIZED_SIGNATORY: 'அங்கீகரிக்கப்பட்ட கையொப்பம்',
    
    // Chit specific
    SCHEME_DETAILS: 'திட்ட விவரங்கள்',
    SCHEME_NAME: 'திட்டத்தின் பெயர்',
    TOTAL_SCHEME_AMOUNT: 'மொத்த சேமிப்பு தொகை',
    TICKET_NUMBER: 'டிக்கெட் எண்',
    MONTHLY_INSTALLMENT: 'மாத தவணை',
    CHIT_SUMMARY: 'தங்க சேமிப்பு சுருக்கம்',
    CURRENT_GOLD_RATE: 'தற்போதைய தங்கம் விலை (22 கேரட்)',
    INSTALLMENTS_PAID: 'செலுத்திய தவணைகள்',
    TOTAL_PAID_AMOUNT: 'மொத்தம் செலுத்திய தொகை',
    EQUIVALENT_GOLD_WEIGHT: 'சேகரிக்கப்பட்ட தங்கத்தின் எடை',
    MATURITY_VALUE: 'முதிர்வு மதிப்பு',
    PAYMENT_HISTORY: 'பணம் செலுத்திய வரலாறு',
    DATE: 'தேதி',
    INVOICE_NO: 'ரசீது எண்',
    AMOUNT: 'தொகை',
    PAYMENT_METHOD: 'முறை',

    // Status and Type translations
    LOAN_DISBURSEMENT: 'கடன் பட்டுவாடா',
    LOAN_REPAYMENT: 'கடன் திருப்பிச் செலுத்துதல்',
    ACTIVE: 'செயலில் உள்ளது',
    CLOSED: 'மூடப்பட்டது',
    READY_FOR_CLOSURE: 'மூட தயாராக உள்ளது',
    LOAN_CLOSED: 'கடன் மூடப்பட்டது',
    
    // Payment Methods
    CASH: 'ரொக்கம்',
    UPI: 'UPI',
    BANK_TRANSFER: 'வங்கி பரிமாற்றம்',
    CHEQUE: 'காசோலை',
    CARD: 'அட்டை',
    ONLINE: 'ஆன்லைன் கட்டணம்'
  }
};

class PDFService {
  _getTranslatedPaymentMethod(lang, method) {
    console.log(`\n--- DEBUG PAYMENT METHOD ---`);
    console.log(`Payment Method Raw Value: ${method}`);
    if (!method) return this._t(lang, 'CASH');
    
    // Normalize to NFC for robust database matching
    const m = method.normalize('NFC').toLowerCase().trim();
    let normalized = 'CASH';
    
    if (m === 'cash' || m === 'ரொக்கம்') normalized = 'CASH';
    else if (m === 'upi' || m === 'யு.பி.ஐ') normalized = 'UPI';
    else if (m === 'bank_transfer' || m === 'bank transfer' || m === 'வங்கி பரிமாற்றம்') normalized = 'BANK_TRANSFER';
    else if (m === 'cheque' || m === 'காசோலை') normalized = 'CHEQUE';
    else if (m === 'card' || m === 'card payment' || m === 'அட்டை') normalized = 'CARD';
    else if (m === 'online' || m === 'online payment' || m === 'ஆன்லைன் கட்டணம்') normalized = 'ONLINE';
    else normalized = method.toUpperCase();
    
    const translated = this._t(lang, normalized);
    console.log(`Payment Method Translated Value: ${translated}`);
    return translated;
  }

  _t(lang, key) {
    if (!key) return '';
    let val = key;
    if (I18N[lang] && I18N[lang][key]) {
      val = I18N[lang][key];
    } else if (I18N['en'] && I18N['en'][key]) {
      val = I18N['en'][key];
    }
    
    // PDFKit doesn't support complex text shaping for Tamil composite vowels (like 0xBCA).
    // Normalizing to NFD strictly breaks them down into base consonants + vowel signs (e.g. 0xBC6 + 0xBBE), 
    // which PDFKit handles flawlessly, preventing the square boxes (□□□).
    if (lang === 'ta' && typeof val === 'string') {
      return val.normalize('NFD');
    }
    
    return val;
  }

  _checkSpace(doc, requiredHeight) {
    const bottomLimit = doc.page.height - doc.page.margins.bottom;
    if (doc.y + requiredHeight > bottomLimit) {
      doc.addPage({ margin: 40, size: 'A4' });
      return true;
    }
    return false;
  }

  async generateLoanInvoice(invoice, loan, customer, payment = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4', autoFirstPage: true });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Register Fonts
        const tamilFontPath = path.join(__dirname, '../../assets/fonts/NotoSansTamil-Regular.ttf');
        if (!fs.existsSync(tamilFontPath)) {
          throw new Error(`CRITICAL FONT ERROR: Tamil Unicode Font missing at path: ${tamilFontPath}`);
        }
        doc.registerFont('Tamil', tamilFontPath);

        // Define colors
        const maroonDark = '#4A0000';
        const maroonLight = '#800000';
        const dustyRose = '#D5A6A6';
        const lightRose = '#F4E8E8';

        // ==========================================================
        // PAGE 1: ENGLISH VERSION
        // ==========================================================
        console.log(`[PDF Gen] Starting English Version...`);
        this.generateEnglishHeader(doc, maroonDark);
        this.generateEnglishInvoiceInfo(doc, invoice, payment);
        this.generateEnglishCustomerLoanInfo(doc, customer, loan, maroonDark, maroonLight);
        this.generateEnglishFinancialSummary(doc, invoice, loan, payment, dustyRose, lightRose);
        this.generateEnglishThankYouCard(doc, maroonDark, maroonLight, lightRose);
        this.generateSimpleFooter(doc, 'en');

        // ==========================================================
        // PAGE 2: TAMIL VERSION
        // ==========================================================
        console.log(`[PDF Gen] Starting Tamil Version...`);
        doc.addPage({ margin: 40, size: 'A4' });
        this.generateTamilHeader(doc, maroonDark);
        this.generateTamilInvoiceInfo(doc, invoice, payment);
        this.generateTamilCustomerLoanInfo(doc, customer, loan, maroonDark, maroonLight);
        this.generateTamilFinancialSummary(doc, invoice, loan, payment, dustyRose, lightRose);
        this.generateTamilThankYouCard(doc, maroonDark, maroonLight, lightRose);
        this.generateSimpleFooter(doc, 'ta');

        doc.end();
        console.log(`[PDF Gen] Finished generating PDF successfully.`);
      } catch (error) {
        reject(error);
      }
    });
  }

  _getNumericValue(val) {
    if (val === null || val === undefined || val === '') return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  }

  _getOrnamentType(loan) {
    const type = loan.ornamentType || loan.ornament_type || loan.jewelry_details?.type || loan.gold_type || 'Gold Ornaments';
    return type;
  }

  _translateOrnamentType(typeStr) {
    if (!typeStr) return 'தங்க நகைகள்';
    const lower = typeStr.toLowerCase();
    
    if (lower.includes('chain')) return 'தங்க சங்கிலி';
    if (lower.includes('ring')) return 'தங்க மோதிரம்';
    if (lower.includes('necklace')) return 'தங்க நெக்லஸ்';
    if (lower.includes('bangle')) return 'தங்க வளையல்கள்';
    if (lower.includes('bangel')) return 'தங்க வளையல்கள்';
    if (lower.includes('coin')) return 'தங்க நாணயம்';
    if (lower.includes('earring')) return 'தங்க காதணிகள்';
    if (lower.includes('bracelet')) return 'தங்க காப்பு';
    if (lower.includes('anklet')) return 'தங்க கொலுசு';
    
    return 'தங்க நகைகள்';
  }

  // Pure numeric formatting to avoid font corruption with rupee symbols
  _formatCurrency(amount) {
    if (amount === null || amount === undefined || amount === '') return 'N/A';
    return Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  _getLoanAmount(loan) {
    const approved = this._getNumericValue(loan.approvedAmount || loan.approved_amount);
    if (approved > 0) return approved;
    const loanAmt = this._getNumericValue(loan.loanAmount || loan.loan_amount);
    if (loanAmt > 0) return loanAmt;
    const principal = this._getNumericValue(loan.principalAmount || loan.principal_amount);
    if (principal > 0) return principal;
    return 0;
  }

  _drawMixedText(doc, text, x, y, defaultFont = 'Helvetica', defaultSize = 9, options = {}) {
    if (!text) return 0;
    
    // Convert to string safely
    const str = String(text);
    const tamilRegex = /[஀-௿]+/;
    
    // Debug Trace
    // console.log(`[PDF-Render] Attempting mixed text rendering for: "${str}" at x:${x}, y:${y}`);

    if (!tamilRegex.test(str)) {
      // Fast path: No Tamil characters
      let fontToUse = defaultFont;
      if (defaultFont === 'Tamil') fontToUse = 'Helvetica';
      
      doc.font(fontToUse).fontSize(defaultSize);
      const calculatedWidth = doc.widthOfString(str, options);
      console.log(`[PDF Engine] Render Font: ${fontToUse} | Render Text: ${str} | Calculated Width: ${calculatedWidth}`);
      doc.text(str, x, y, options);
      return calculatedWidth;
    }

    // Mixed path: Split by Tamil blocks
    const segments = str.split(/([஀-௿]+)/g).filter(Boolean);
    let currentX = x;
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isTamil = tamilRegex.test(segment);
      
      let fontToUse = defaultFont;
      if (isTamil) {
        fontToUse = 'Tamil';
      } else {
        if (defaultFont === 'Tamil') fontToUse = 'Helvetica'; 
      }
      doc.font(fontToUse).fontSize(defaultSize);
      const segWidth = doc.widthOfString(segment);
      console.log(`[PDF Engine] Render Font: ${fontToUse} | Render Text: ${segment} | Calculated Width: ${segWidth}`);
      
      const isLast = (i === segments.length - 1);
      
      if (!isLast) {
        doc.text(segment, currentX, y, { ...options, lineBreak: false, continued: false });
        currentX += segWidth;
      } else {
        doc.text(segment, currentX, y, { ...options, lineBreak: false });
      }
    }
    
    return currentX + doc.widthOfString(segments[segments.length - 1]) - x; // Total width
  }

  _measureMixedTextWidth(doc, text, defaultFont = 'Helvetica', defaultSize = 9) {
    if (!text) return 0;
    const str = String(text);
    const tamilRegex = /[஀-௿]+/;
    if (!tamilRegex.test(str)) {
      doc.font(defaultFont).fontSize(defaultSize);
      return doc.widthOfString(str);
    }
    const segments = str.split(/([஀-௿]+)/g).filter(Boolean);
    let totalWidth = 0;
    for (const segment of segments) {
      const isTamil = tamilRegex.test(segment);
      let fontToUse = defaultFont;
      if (isTamil) {
        fontToUse = 'Tamil';
      } else {
        if (defaultFont === 'Tamil') fontToUse = 'Helvetica';
      }
      doc.font(fontToUse).fontSize(defaultSize);
      totalWidth += doc.widthOfString(segment);
    }
    return totalWidth;
  }

  _drawTwoColumnRow(doc, labelFont, labelSize, label, valueFont, valueSize, value, x, y, labelWidth, valueWidth = 130) {
    doc.fillColor('#333333');
    const measuredLabelWidth = this._measureMixedTextWidth(doc, label, labelFont, labelSize);
    console.log(`[PDF Engine] Row Label Width Calculated: ${measuredLabelWidth} for "${label}"`);
    
    const finalLabelWidth = Math.max(labelWidth, measuredLabelWidth + 5);
    this._drawMixedText(doc, label, x, y, labelFont, labelSize, { width: finalLabelWidth });
    
    doc.fillColor('#111111');
    this._drawMixedText(doc, value, x + finalLabelWidth, y, valueFont, valueSize, { width: valueWidth });
  }

  // -----------------------------------------------------------
  // ENGLISH METHODS
  // -----------------------------------------------------------
  
  generateEnglishHeader(doc, maroonDark) {
    const logoPath = path.join(__dirname, '../../../../frontend/src/assets/new_sdrs_logo2.png');
    const centerX = doc.page.width / 2;
    
    if (fs.existsSync(logoPath)) {
      doc.save();
      doc.circle(centerX, 55, 30).clip();
      doc.image(logoPath, centerX - 30, 25, { width: 60 });
      doc.restore();
    }

    doc
      .fillColor(maroonDark)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(this._t('en', 'COMPANY_NAME'), 0, 95, { align: 'center' })
      .fillColor('#D4AF37')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(this._t('en', 'COMPANY_SUBTITLE'), 0, 120, { align: 'center' })
      .fillColor('#333333')
      .fontSize(9)
      .font('Helvetica')
      .text(this._t('en', 'COMPANY_ADDRESS_1'), 0, 140, { align: 'center' })
      .text(this._t('en', 'COMPANY_ADDRESS_2'), 0, 153, { align: 'center' })
      .text(this._t('en', 'COMPANY_PHONE'), 0, 166, { align: 'center' });
      
    doc.strokeColor('#333333').lineWidth(1.5).moveTo(40, 190).lineTo(550, 190).stroke();
    doc.y = 205;
  }

  generateEnglishInvoiceInfo(doc, invoice, payment = null) {
    let top = doc.y;
    doc.fillColor('#222222').fontSize(16).font('Helvetica-Bold').text(this._t('en', 'INVOICE'), 40, top);
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(40, top + 20).lineTo(550, top + 20).stroke();

    top += 35;
    const labelWidth = 100;
    
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'INVOICE_NUMBER'), 'Helvetica-Bold', 9, `: ${invoice.invoiceNumber || 'N/A'}`, 40, top, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'INVOICE_DATE'), 'Helvetica-Bold', 9, `: ${new Date(invoice.generatedDate || new Date()).toLocaleDateString()}`, 40, top + 15, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'INVOICE_TYPE'), 'Helvetica-Bold', 9, `: ${(this._t('en', invoice.invoiceType) || '').replace('_', ' ')}`, 40, top + 30, labelWidth);
    
    const paymentMethod = payment?.paymentMethod || invoice?.paymentMethod;
    if (paymentMethod) {
      this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'PAYMENT_METHOD'), 'Helvetica-Bold', 9, `: ${this._getTranslatedPaymentMethod('en', paymentMethod)}`, 40, top + 45, labelWidth);
      doc.y = top + 65;
    } else {
      doc.y = top + 50;
    }
  }

  generateEnglishCustomerLoanInfo(doc, customer, loan, maroonDark, maroonLight) {
    this._checkSpace(doc, 180); // Ensure enough space for this section
    let top = doc.y;
    const leftX = 40;
    const rightX = 300;
    const labelWidth = 100;
    const lineHeight = 18;

    doc.font('Helvetica-Bold').fontSize(10).fillColor(maroonDark).text(this._t('en', 'CUSTOMER_DETAILS'), leftX, top);
    doc.moveTo(leftX, top + 12).lineTo(leftX + 240, top + 12).strokeColor(maroonLight).lineWidth(0.5).stroke();
    
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'CUSTOMER_NAME'), 'Helvetica-Bold', 9, `: ${customer.firstName} ${customer.lastName || ''}`.trim(), leftX, top + 20, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'CUSTOMER_CODE'), 'Helvetica-Bold', 9, `: ${customer.customerCode || 'N/A'}`, leftX, top + 20 + lineHeight, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'MOBILE_NUMBER'), 'Helvetica-Bold', 9, `: ${customer.mobileNumber || 'N/A'}`, leftX, top + 20 + lineHeight*2, labelWidth);

    doc.font('Helvetica-Bold').fontSize(10).fillColor(maroonDark).text(this._t('en', 'LOAN_DETAILS'), rightX, top);
    doc.moveTo(rightX, top + 12).lineTo(rightX + 240, top + 12).strokeColor(maroonLight).lineWidth(0.5).stroke();

    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'LOAN_NUMBER'), 'Helvetica-Bold', 9, `: ${loan.loanNumber || 'N/A'}`, rightX, top + 20, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'LOAN_STATUS'), 'Helvetica-Bold', 9, `: ${this._t('en', loan.status) || 'N/A'}`, rightX, top + 20 + lineHeight, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'INTEREST_RATE'), 'Helvetica-Bold', 9, `: ${loan.interestRate || 0}% P.A.`, rightX, top + 20 + lineHeight*2, labelWidth);

    const ornTop = top + 85;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(maroonDark).text(this._t('en', 'ORNAMENT_DETAILS'), leftX, ornTop);
    doc.moveTo(leftX, ornTop + 12).lineTo(leftX + 240, ornTop + 12).strokeColor(maroonLight).lineWidth(0.5).stroke();

    const ornType = this._getOrnamentType(loan);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'ORNAMENT_TYPE'), 'Helvetica-Bold', 9, `: ${ornType}`, leftX, ornTop + 20, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'PURITY'), 'Helvetica-Bold', 9, `: ${loan.goldPurity || 'N/A'}`, leftX, ornTop + 20 + lineHeight, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'WEIGHT'), 'Helvetica-Bold', 9, `: ${loan.goldWeight || 0}g`, leftX, ornTop + 20 + lineHeight*2, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'ESTIMATED_VALUE'), 'Helvetica-Bold', 9, `: ${this._formatCurrency(loan.goldValue)}`, leftX, ornTop + 20 + lineHeight*3, labelWidth);

    doc.y = ornTop + 20 + lineHeight*4 + 10;
  }

  generateEnglishFinancialSummary(doc, invoice, loan, payment, dustyRose, lightRose) {
    this._checkSpace(doc, 160); // Check space for Financial Summary
    let top = doc.y;
    
    const gradLeft = doc.linearGradient(40, top, 275, top);
    gradLeft.stop(0, dustyRose).stop(1, lightRose);
    const gradRight = doc.linearGradient(285, top, 550, top);
    gradRight.stop(0, dustyRose).stop(1, lightRose);

    doc.rect(40, top, 235, 18).fill(gradLeft);
    doc.rect(285, top, 265, 18).fill(gradRight);

    doc.fillColor('#111111').font('Helvetica-Bold').fontSize(9);
    doc.text(this._t('en', 'FINANCIAL_SUMMARY'), 45, top + 5, { lineBreak: false });
    doc.text(this._t('en', 'PAYMENT_BREAKDOWN'), 290, top + 5, { lineBreak: false });

    const dataTop = top + 25;
    const lineHeight = 18;
    const loanAmt = this._getLoanAmount(loan);
    const totalPaid = this._getNumericValue(loan.totalPaid || loan.total_paid);
    const remPrincipal = this._getNumericValue(loan.remainingPrincipal || loan.remaining_principal);
    const intAmount = this._getNumericValue(loan.interestAmount || loan.interest_amount);
    const penAmount = this._getNumericValue(loan.penaltyAmount || loan.penalty_amount);
    const totalOutstanding = remPrincipal + intAmount + penAmount;
    const monthlyInterest = this._getNumericValue(loan.monthlyInterest || loan.monthly_interest);
    const totalAccrued = this._getNumericValue(loan.totalAccruedInterest || loan.total_accrued_interest);
    
    let y = dataTop;
    const drawSummaryRow = (label, value) => {
      doc.fillColor('#333333').font('Helvetica').fontSize(9).text(label, 40, y, { lineBreak: false });
      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(9).text(value, 150, y, { width: 120, align: 'right', lineBreak: false });
      y += lineHeight;
    };

    const intPaidTotal = this._getNumericValue(loan.totalInterestPaid || loan.total_interest_paid);

    drawSummaryRow(this._t('en', 'ORIGINAL_LOAN_AMOUNT'), this._formatCurrency(loanAmt));
    drawSummaryRow(this._t('en', 'TOTAL_PAID_TILL_DATE'), this._formatCurrency(totalPaid));
    drawSummaryRow(this._t('en', 'OUTSTANDING_PRINCIPAL'), this._formatCurrency(remPrincipal));
    drawSummaryRow(this._t('en', 'MONTHLY_INTEREST_RATE'), `${this._getNumericValue(loan.interestRate || loan.interest_rate || 12) / 12}%`);
    drawSummaryRow(this._t('en', 'CURRENT_MONTH_INTEREST'), this._formatCurrency(monthlyInterest));
    drawSummaryRow(this._t('en', 'INTEREST_PAID'), this._formatCurrency(intPaidTotal));
    drawSummaryRow(this._t('en', 'REMAINING_INTEREST_DUE'), this._formatCurrency(intAmount));
    drawSummaryRow(this._t('en', 'OUTSTANDING_PENALTY'), this._formatCurrency(penAmount));
    drawSummaryRow(this._t('en', 'TOTAL_SETTLEMENT_AMOUNT'), this._formatCurrency(totalOutstanding));

    let rightY = dataTop;
    const drawPaymentRow = (label, value) => {
      doc.fillColor('#333333').font('Helvetica').fontSize(9).text(label, 285, rightY, { lineBreak: false });
      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(9).text(value, 400, rightY, { width: 140, align: 'right', lineBreak: false });
      rightY += lineHeight;
    };

    const curPaid = this._getNumericValue(invoice.paidAmount);
    const prinPaid = this._getNumericValue(payment?.principalPaid || payment?.principal_paid);
    const intPaid = this._getNumericValue(payment?.interestPaid || payment?.interest_paid);
    const penPaid = this._getNumericValue(payment?.penaltyPaid || payment?.penalty_paid);

    drawPaymentRow(this._t('en', 'CURRENT_PAYMENT'), this._formatCurrency(curPaid));
    drawPaymentRow(this._t('en', 'PENALTY_PAID'), this._formatCurrency(penPaid));
    drawPaymentRow(this._t('en', 'INTEREST_PAID'), this._formatCurrency(intPaid));
    drawPaymentRow(this._t('en', 'PRINCIPAL_PAID'), this._formatCurrency(prinPaid));
    drawPaymentRow(this._t('en', 'REMAINING_PRINCIPAL_BREAKDOWN'), this._formatCurrency(remPrincipal));

    doc.y = Math.max(y, rightY) + 15;
  }

  generateEnglishThankYouCard(doc, maroonDark, maroonLight, lightRose) {
    const requiredSpace = 165; // Thank you card (130) + Footer (35)
    this._checkSpace(doc, requiredSpace);
    let top = doc.y;
    
    doc.roundedRect(40, top, 510, 130, 5).fillAndStroke(lightRose, '#D4AF37');
    
    doc.fillColor(maroonDark).fontSize(10).font('Helvetica-Bold').text(this._t('en', 'THANK_YOU_TITLE'), 40, top + 15, { align: 'center', width: 510, characterSpacing: 1 });
    doc.fontSize(14).text(this._t('en', 'COMPANY_NAME'), 40, top + 30, { align: 'center', width: 510 });
    
    doc.fillColor('#D4AF37').fontSize(11).text(this._t('en', 'THANK_YOU_SUBTITLE'), 40, top + 55, { align: 'center', width: 510 });
    
    doc.fillColor('#333333').fontSize(9).font('Helvetica').text(this._t('en', 'THANK_YOU_MESSAGE'), 40, top + 75, { align: 'center', width: 510 });

    doc.moveTo(350, top + 100).lineTo(500, top + 100).strokeColor(maroonDark).lineWidth(0.5).stroke();
    doc.fillColor('#111111').fontSize(9).font('Helvetica-Bold').text(this._t('en', 'AUTHORIZED_SIGNATORY'), 350, top + 105, { width: 150, align: 'center', lineBreak: false });
    doc.fillColor('#333333').fontSize(8).font('Helvetica').text('SDRS Gold Finance', 350, top + 118, { width: 150, align: 'center', lineBreak: false });
    
    doc.y = top + 130 + 10;
  }

  // -----------------------------------------------------------
  // TAMIL METHODS
  // -----------------------------------------------------------

  generateTamilHeader(doc, maroonDark) {
    const logoPath = path.join(__dirname, '../../../../frontend/src/assets/new_sdrs_logo2.png');
    const centerX = doc.page.width / 2;
    
    if (fs.existsSync(logoPath)) {
      doc.save();
      doc.circle(centerX, 55, 30).clip();
      doc.image(logoPath, centerX - 30, 25, { width: 60 });
      doc.restore();
    }

    doc
      .fillColor(maroonDark)
      .fontSize(20)
      .font('Tamil')
      .text(this._t('ta', 'COMPANY_NAME'), 0, 95, { align: 'center' })
      .fillColor('#D4AF37')
      .fontSize(11)
      .font('Tamil')
      .text(this._t('ta', 'COMPANY_SUBTITLE'), 0, 120, { align: 'center' })
      .fillColor('#333333')
      .fontSize(9)
      .font('Tamil')
      .text(this._t('ta', 'COMPANY_ADDRESS_1'), 0, 140, { align: 'center' })
      .text(this._t('ta', 'COMPANY_ADDRESS_2'), 0, 153, { align: 'center' })
      .text(this._t('ta', 'COMPANY_PHONE'), 0, 166, { align: 'center' });
      
    doc.strokeColor('#333333').lineWidth(1.5).moveTo(40, 190).lineTo(550, 190).stroke();
    doc.y = 205;
  }

  generateTamilInvoiceInfo(doc, invoice, payment = null) {
    let top = doc.y;
    doc.fillColor('#222222').fontSize(16).font('Tamil').text(this._t('ta', 'INVOICE'), 40, top);
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(40, top + 20).lineTo(550, top + 20).stroke();

    top += 35;
    const labelWidth = 110;
    
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'INVOICE_NUMBER'), 'Helvetica-Bold', 9, `: ${invoice.invoiceNumber || 'N/A'}`, 40, top, labelWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'INVOICE_DATE'), 'Helvetica-Bold', 9, `: ${new Date(invoice.generatedDate || new Date()).toLocaleDateString()}`, 40, top + 15, labelWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'INVOICE_TYPE'), 'Tamil', 9, `: ${(this._t('ta', invoice.invoiceType) || '').replace('_', ' ')}`, 40, top + 30, labelWidth);
    
    const paymentMethod = payment?.paymentMethod || invoice?.paymentMethod;
    if (paymentMethod) {
      this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'PAYMENT_METHOD'), 'Tamil', 9, `: ${this._getTranslatedPaymentMethod('ta', paymentMethod)}`, 40, top + 45, labelWidth);
      doc.y = top + 65;
    } else {
      doc.y = top + 50;
    }
  }

  generateTamilCustomerLoanInfo(doc, customer, loan, maroonDark, maroonLight) {
    this._checkSpace(doc, 180);
    let top = doc.y;
    const leftX = 40;
    const rightX = 300;
    const labelWidth = 110;
    const valWidth = 130;
    const lineHeight = 18;

    doc.font('Tamil').fontSize(10).fillColor(maroonDark).text(this._t('ta', 'CUSTOMER_DETAILS'), leftX, top);
    doc.moveTo(leftX, top + 12).lineTo(leftX + 240, top + 12).strokeColor(maroonLight).lineWidth(0.5).stroke();
    
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'CUSTOMER_NAME'), 'Helvetica-Bold', 9, `: ${customer.firstName} ${customer.lastName || ''}`.trim(), leftX, top + 20, labelWidth, valWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'CUSTOMER_CODE'), 'Helvetica-Bold', 9, `: ${customer.customerCode || 'N/A'}`, leftX, top + 20 + lineHeight, labelWidth, valWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'MOBILE_NUMBER'), 'Helvetica-Bold', 9, `: ${customer.mobileNumber || 'N/A'}`, leftX, top + 20 + lineHeight*2, labelWidth, valWidth);

    doc.font('Tamil').fontSize(10).fillColor(maroonDark).text(this._t('ta', 'LOAN_DETAILS'), rightX, top);
    doc.moveTo(rightX, top + 12).lineTo(rightX + 240, top + 12).strokeColor(maroonLight).lineWidth(0.5).stroke();

    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'LOAN_NUMBER'), 'Helvetica-Bold', 9, `: ${loan.loanNumber || 'N/A'}`, rightX, top + 20, labelWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'LOAN_STATUS'), 'Tamil', 9, `: ${this._t('ta', loan.status) || 'N/A'}`, rightX, top + 20 + lineHeight, labelWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'INTEREST_RATE'), 'Helvetica-Bold', 9, `: ${loan.interestRate || 0}% P.A.`, rightX, top + 20 + lineHeight*2, labelWidth);

    const ornTop = top + 85;
    doc.font('Tamil').fontSize(10).fillColor(maroonDark).text(this._t('ta', 'ORNAMENT_DETAILS'), leftX, ornTop);
    doc.moveTo(leftX, ornTop + 12).lineTo(leftX + 240, ornTop + 12).strokeColor(maroonLight).lineWidth(0.5).stroke();

    const ornType = this._getOrnamentType(loan);
    const tamilOrnType = this._translateOrnamentType(ornType);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'ORNAMENT_TYPE'), 'Tamil', 9, `: ${tamilOrnType}`, leftX, ornTop + 20, labelWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'PURITY'), 'Helvetica-Bold', 9, `: ${loan.goldPurity || 'N/A'}`, leftX, ornTop + 20 + lineHeight, labelWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'WEIGHT'), 'Helvetica-Bold', 9, `: ${loan.goldWeight || 0}g`, leftX, ornTop + 20 + lineHeight*2, labelWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'ESTIMATED_VALUE'), 'Helvetica-Bold', 9, `: ${this._formatCurrency(loan.goldValue)}`, leftX, ornTop + 20 + lineHeight*3, labelWidth);
    
    doc.y = ornTop + 20 + lineHeight*4 + 10;
  }

  generateTamilFinancialSummary(doc, invoice, loan, payment, dustyRose, lightRose) {
    this._checkSpace(doc, 160);
    let top = doc.y;
    
    const gradLeft = doc.linearGradient(40, top, 275, top);
    gradLeft.stop(0, dustyRose).stop(1, lightRose);
    const gradRight = doc.linearGradient(285, top, 550, top);
    gradRight.stop(0, dustyRose).stop(1, lightRose);

    doc.rect(40, top, 235, 18).fill(gradLeft);
    doc.rect(285, top, 265, 18).fill(gradRight);

    doc.fillColor('#111111').font('Tamil').fontSize(9);
    doc.text(this._t('ta', 'FINANCIAL_SUMMARY'), 45, top + 5, { lineBreak: false });
    doc.text(this._t('ta', 'PAYMENT_BREAKDOWN'), 290, top + 5, { lineBreak: false });

    const dataTop = top + 25;
    const lineHeight = 18;
    const loanAmt = this._getLoanAmount(loan);
    const totalPaid = this._getNumericValue(loan.totalPaid || loan.total_paid);
    const remPrincipal = this._getNumericValue(loan.remainingPrincipal || loan.remaining_principal);
    const intAmount = this._getNumericValue(loan.interestAmount || loan.interest_amount);
    const penAmount = this._getNumericValue(loan.penaltyAmount || loan.penalty_amount);
    const totalOutstanding = remPrincipal + intAmount + penAmount;
    const monthlyInterest = this._getNumericValue(loan.monthlyInterest || loan.monthly_interest);
    const totalAccrued = this._getNumericValue(loan.totalAccruedInterest || loan.total_accrued_interest);
    
    let y = dataTop;
    const drawSummaryRow = (label, value) => {
      doc.fillColor('#333333').font('Tamil').fontSize(9).text(label, 40, y, { lineBreak: false });
      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(9).text(value, 150, y, { width: 120, align: 'right', lineBreak: false });
      y += lineHeight;
    };

    const intPaidTotal = this._getNumericValue(loan.totalInterestPaid || loan.total_interest_paid);

    drawSummaryRow(this._t('ta', 'ORIGINAL_LOAN_AMOUNT'), this._formatCurrency(loanAmt));
    drawSummaryRow(this._t('ta', 'TOTAL_PAID_TILL_DATE'), this._formatCurrency(totalPaid));
    drawSummaryRow(this._t('ta', 'OUTSTANDING_PRINCIPAL'), this._formatCurrency(remPrincipal));
    drawSummaryRow(this._t('ta', 'MONTHLY_INTEREST_RATE'), `${this._getNumericValue(loan.interestRate || loan.interest_rate || 12) / 12}%`);
    drawSummaryRow(this._t('ta', 'CURRENT_MONTH_INTEREST'), this._formatCurrency(monthlyInterest));
    drawSummaryRow(this._t('ta', 'INTEREST_PAID'), this._formatCurrency(intPaidTotal));
    drawSummaryRow(this._t('ta', 'REMAINING_INTEREST_DUE'), this._formatCurrency(intAmount));
    drawSummaryRow(this._t('ta', 'OUTSTANDING_PENALTY'), this._formatCurrency(penAmount));
    drawSummaryRow(this._t('ta', 'TOTAL_SETTLEMENT_AMOUNT'), this._formatCurrency(totalOutstanding));

    let rightY = dataTop;
    const drawPaymentRow = (label, value) => {
      doc.fillColor('#333333').font('Tamil').fontSize(9).text(label, 285, rightY, { lineBreak: false });
      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(9).text(value, 400, rightY, { width: 140, align: 'right', lineBreak: false });
      rightY += lineHeight;
    };

    const curPaid = this._getNumericValue(invoice.paidAmount);
    const prinPaid = this._getNumericValue(payment?.principalPaid || payment?.principal_paid);
    const intPaid = this._getNumericValue(payment?.interestPaid || payment?.interest_paid);
    const penPaid = this._getNumericValue(payment?.penaltyPaid || payment?.penalty_paid);

    drawPaymentRow(this._t('ta', 'CURRENT_PAYMENT'), this._formatCurrency(curPaid));
    drawPaymentRow(this._t('ta', 'PENALTY_PAID'), this._formatCurrency(penPaid));
    drawPaymentRow(this._t('ta', 'INTEREST_PAID'), this._formatCurrency(intPaid));
    drawPaymentRow(this._t('ta', 'PRINCIPAL_PAID'), this._formatCurrency(prinPaid));
    drawPaymentRow(this._t('ta', 'REMAINING_PRINCIPAL_BREAKDOWN'), this._formatCurrency(remPrincipal));

    doc.y = Math.max(y, rightY) + 15;
  }

  generateTamilThankYouCard(doc, maroonDark, maroonLight, lightRose) {
    const requiredSpace = 165; 
    this._checkSpace(doc, requiredSpace);
    let top = doc.y;
    
    doc.roundedRect(40, top, 510, 130, 5).fillAndStroke(lightRose, '#D4AF37');
    
    doc.fillColor(maroonDark).fontSize(12).font('Tamil').text(this._t('ta', 'THANK_YOU_TITLE'), 40, top + 15, { align: 'center', width: 510, characterSpacing: 1 });
    doc.fontSize(14).text(this._t('ta', 'COMPANY_NAME'), 40, top + 30, { align: 'center', width: 510 });
    
    doc.fillColor('#D4AF37').fontSize(11).font('Tamil').text(this._t('ta', 'THANK_YOU_SUBTITLE'), 40, top + 55, { align: 'center', width: 510 });
    
    doc.fillColor('#333333').fontSize(9).font('Tamil').text(this._t('ta', 'THANK_YOU_MESSAGE'), 40, top + 75, { align: 'center', width: 510 });

    doc.moveTo(350, top + 100).lineTo(500, top + 100).strokeColor(maroonDark).lineWidth(0.5).stroke();
    doc.fillColor('#111111').fontSize(9).font('Tamil').text(this._t('ta', 'AUTHORIZED_SIGNATORY'), 350, top + 105, { width: 150, align: 'center', lineBreak: false });
    doc.fillColor('#333333').fontSize(8).font('Tamil').text('எஸ்.டி.ஆர்.எஸ் கோல்டு பைனான்ஸ்', 350, top + 118, { width: 150, align: 'center', lineBreak: false });
    
    doc.y = top + 130 + 10;
  }

  // Common Footer generator, accepts language flag to fetch localized strings
  

  // =========================================================================
  // CHIT / GOLD SCHEME INVOICE METHODS
  // =========================================================================

  async generateChitInvoice(payment, subscriber, scheme, customer, paymentHistory, currentGoldRate) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4', autoFirstPage: true });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Register Fonts
        const tamilFontPath = path.join(__dirname, '../../assets/fonts/NotoSansTamil-Regular.ttf');
        if (!fs.existsSync(tamilFontPath)) {
          throw new Error(`CRITICAL FONT ERROR: Tamil Unicode Font missing at path: ${tamilFontPath}`);
        }
        doc.registerFont('Tamil', tamilFontPath);

        // Define colors
        const maroonDark = '#4A0000';
        const maroonLight = '#800000';
        const dustyRose = '#D5A6A6';
        const lightRose = '#F4E8E8';

        // ==========================================================
        // PAGE 1: ENGLISH VERSION
        // ==========================================================
        console.log(`[PDF Gen] Starting English Chit Version...`);
        this.generateEnglishHeader(doc, maroonDark);
        this.generateEnglishChitInvoiceInfo(doc, payment);
        this.generateEnglishCustomerChitInfo(doc, customer, subscriber, scheme, maroonDark, maroonLight);
        this.generateEnglishChitSummary(doc, payment, subscriber, scheme, paymentHistory, currentGoldRate, dustyRose, lightRose);
        this.generateEnglishThankYouCard(doc, maroonDark, maroonLight, lightRose);
        this.generateSimpleFooter(doc, 'en');

        // ==========================================================
        // PAGE 2: TAMIL VERSION
        // ==========================================================
        console.log(`[PDF Gen] Starting Tamil Chit Version...`);
        doc.addPage({ margin: 40, size: 'A4' });
        this.generateTamilHeader(doc, maroonDark);
        this.generateTamilChitInvoiceInfo(doc, payment);
        this.generateTamilCustomerChitInfo(doc, customer, subscriber, scheme, maroonDark, maroonLight);
        this.generateTamilChitSummary(doc, payment, subscriber, scheme, paymentHistory, currentGoldRate, dustyRose, lightRose);
        this.generateTamilThankYouCard(doc, maroonDark, maroonLight, lightRose);
        this.generateSimpleFooter(doc, 'ta');

        doc.end();
        console.log(`[PDF Gen] Finished generating Chit PDF successfully.`);
      } catch (error) {
        reject(error);
      }
    });
  }

  generateEnglishChitInvoiceInfo(doc, payment) {
    let top = doc.y;
    doc.fillColor('#222222').fontSize(16).font('Helvetica-Bold').text(this._t('en', 'INVOICE'), 40, top);
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(40, top + 20).lineTo(550, top + 20).stroke();

    top += 35;
    const labelWidth = 120;
    const valWidth = 300;
    
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'INVOICE_NUMBER'), 'Helvetica-Bold', 9, `: ${payment.invoiceNumber || 'INV-CHIT-' + payment.id.split('-')[0].toUpperCase()}`, 40, top, labelWidth, valWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'INVOICE_DATE'), 'Helvetica-Bold', 9, `: ${new Date(payment.paymentDate || new Date()).toLocaleDateString()}`, 40, top + 15, labelWidth, valWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'PAYMENT_METHOD'), 'Helvetica-Bold', 9, `: ${this._getTranslatedPaymentMethod('en', payment.paymentMethod) || 'N/A'}`, 40, top + 30, labelWidth, valWidth);
    
    doc.y = top + 50;
  }

  generateEnglishCustomerChitInfo(doc, customer, subscriber, scheme, maroonDark, maroonLight) {
    this._checkSpace(doc, 180);
    let top = doc.y;
    const leftX = 40;
    const rightX = 300;
    const labelWidth = 130;
    const lineHeight = 18;

    doc.font('Helvetica-Bold').fontSize(10).fillColor(maroonDark).text(this._t('en', 'CUSTOMER_DETAILS'), leftX, top);
    doc.moveTo(leftX, top + 12).lineTo(leftX + 240, top + 12).strokeColor(maroonLight).lineWidth(0.5).stroke();
    
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'CUSTOMER_NAME'), 'Helvetica-Bold', 9, `: ${customer.firstName} ${customer.lastName || ''}`.trim(), leftX, top + 20, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'CUSTOMER_CODE'), 'Helvetica-Bold', 9, `: ${customer.customerCode || 'N/A'}`, leftX, top + 20 + lineHeight, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'MOBILE_NUMBER'), 'Helvetica-Bold', 9, `: ${customer.mobileNumber || 'N/A'}`, leftX, top + 20 + lineHeight*2, labelWidth);

    doc.font('Helvetica-Bold').fontSize(10).fillColor(maroonDark).text(this._t('en', 'SCHEME_DETAILS'), rightX, top);
    doc.moveTo(rightX, top + 12).lineTo(rightX + 240, top + 12).strokeColor(maroonLight).lineWidth(0.5).stroke();

    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'SCHEME_NAME'), 'Helvetica-Bold', 9, `: ${scheme.schemeName || 'N/A'}`, rightX, top + 20, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'TICKET_NUMBER'), 'Helvetica-Bold', 9, `: #${subscriber.ticketNumber || 'N/A'}`, rightX, top + 20 + lineHeight, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'TOTAL_SCHEME_AMOUNT'), 'Helvetica-Bold', 9, `: Rs. ${this._formatCurrency(scheme.totalAmount)}`, rightX, top + 20 + lineHeight*2, labelWidth);
    this._drawTwoColumnRow(doc, 'Helvetica', 9, this._t('en', 'MONTHLY_INSTALLMENT'), 'Helvetica-Bold', 9, `: Rs. ${this._formatCurrency(scheme.monthlyInstallment)}`, rightX, top + 20 + lineHeight*3, labelWidth);

    doc.y = top + 20 + lineHeight*4 + 10;
  }

  generateEnglishChitSummary(doc, payment, subscriber, scheme, paymentHistory, currentGoldRate, dustyRose, lightRose) {
    this._checkSpace(doc, 200);
    let top = doc.y;
    
    // Background box
    doc.roundedRect(40, top, 510, 110, 8).fill(lightRose);
    doc.fillColor('#111111').fontSize(11).font('Helvetica-Bold').text(this._t('en', 'CHIT_SUMMARY'), 55, top + 15);
    doc.strokeColor(dustyRose).lineWidth(1).moveTo(55, top + 32).lineTo(535, top + 32).stroke();
    
    let dataTop = top + 45;
    const lineHeight = 18;
    let y = dataTop;
    let rightY = dataTop;

    const drawSummaryRow = (label, value) => {
      doc.fillColor('#333333').font('Helvetica').fontSize(9).text(label, 55, y, { lineBreak: false });
      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(9).text(value, 150, y, { width: 120, align: 'right', lineBreak: false });
      y += lineHeight;
    };

    const drawPaymentRow = (label, value) => {
      doc.fillColor('#333333').font('Helvetica').fontSize(9).text(label, 300, rightY, { lineBreak: false });
      doc.fillColor('#111111').font('Helvetica-Bold').fontSize(9).text(value, 400, rightY, { width: 130, align: 'right', lineBreak: false });
      rightY += lineHeight;
    };

    const goldRateValue = currentGoldRate ? this._getNumericValue(currentGoldRate.gold22k) : 0;
    const totalPaid = this._getNumericValue(subscriber.totalPaidAmount || subscriber.totalPaid);

    drawSummaryRow(this._t('en', 'INSTALLMENTS_PAID'), `${subscriber.completedInstallments || paymentHistory.length || 0} / ${scheme.durationMonths}`);
    drawSummaryRow(this._t('en', 'MONTHLY_INSTALLMENT'), `Rs. ${this._formatCurrency(scheme.monthlyInstallment)}`);
    drawSummaryRow(this._t('en', 'TOTAL_PAID_AMOUNT'), `Rs. ${this._formatCurrency(totalPaid)}`);

    drawPaymentRow(this._t('en', 'CURRENT_GOLD_RATE'), `Rs. ${this._formatCurrency(goldRateValue)}`);
    drawPaymentRow(this._t('en', 'TOTAL_SCHEME_AMOUNT'), `Rs. ${this._formatCurrency(scheme.totalAmount)}`);
    drawPaymentRow(this._t('en', 'MATURITY_VALUE'), `Rs. ${this._formatCurrency(scheme.totalAmount)}`);

    // Add Payment History Table
    doc.y = top + 130;
    this._checkSpace(doc, 100);
    
    doc.fillColor('#222222').fontSize(12).font('Helvetica-Bold').text(this._t('en', 'PAYMENT_HISTORY'), 40, doc.y);
    doc.moveDown(0.5);

    let ty = doc.y;
    // Table Header
    doc.rect(40, ty, 510, 20).fill('#f1f5f9');
    doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold');
    doc.text(this._t('en', 'DATE'), 50, ty + 6, { width: 80 });
    doc.text(this._t('en', 'INVOICE_NO'), 140, ty + 6, { width: 150 });
    doc.text(this._t('en', 'PAYMENT_METHOD'), 300, ty + 6, { width: 100 });
    doc.text(this._t('en', 'AMOUNT'), 420, ty + 6, { width: 120, align: 'right' });
    
    ty += 20;
    
    let count = 0;
    for (const hist of paymentHistory) {
      if (count > 8) break;
      this._checkSpace(doc, 20);
      
      doc.fillColor('#111111');
      this._drawMixedText(doc, new Date(hist.paymentDate || hist.createdAt).toLocaleDateString(), 50, ty + 6, 'Helvetica', 9);
      this._drawMixedText(doc, hist.invoiceNumber || `INV-${hist.id.split('-')[0].toUpperCase()}`, 140, ty + 6, 'Helvetica', 9);
      this._drawMixedText(doc, this._getTranslatedPaymentMethod('en', hist.paymentMethod), 300, ty + 6, 'Helvetica', 9);
      doc.font('Helvetica').fontSize(9).text(`Rs. ${this._formatCurrency(hist.amountPaid)}`, 420, ty + 6, { width: 120, align: 'right', lineBreak: false });
      
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, ty + 20).lineTo(550, ty + 20).stroke();
      ty += 20;
      doc.y = ty;
      count++;
    }
    
    doc.y = ty + 15;
  }

  generateTamilChitInvoiceInfo(doc, payment) {
    let top = doc.y;
    doc.fillColor('#222222').fontSize(16).font('Tamil').text(this._t('ta', 'INVOICE'), 40, top);
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(40, top + 20).lineTo(550, top + 20).stroke();

    top += 35;
    const labelWidth = 120;
    const valWidth = 300;
    
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'INVOICE_NUMBER'), 'Helvetica-Bold', 9, `: ${payment.invoiceNumber || 'INV-CHIT-' + payment.id.split('-')[0].toUpperCase()}`, 40, top, labelWidth, valWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'INVOICE_DATE'), 'Helvetica-Bold', 9, `: ${new Date(payment.paymentDate || new Date()).toLocaleDateString()}`, 40, top + 15, labelWidth, valWidth);
    
    // Explicitly enforce Tamil Font for the Payment Method value (User Request)
    const rawVal = payment.paymentMethod || 'CASH';
    const transVal = this._getTranslatedPaymentMethod('ta', rawVal);
    console.log(`\n--- HEADER ---`);
    console.log(`Payment Method Raw Value: ${rawVal}`);
    console.log(`Payment Method Translated Value: ${transVal}`);
    console.log(`Current Font Name: Tamil`);
    
    doc.fillColor('#333333');
    this._drawMixedText(doc, this._t('ta', 'PAYMENT_METHOD'), 40, top + 30, 'Tamil', 9, { width: labelWidth, lineBreak: false });
    doc.fillColor('#111111');
    this._drawMixedText(doc, `: ${transVal}`, 40 + labelWidth, top + 30, 'Tamil', 9, { width: valWidth, lineBreak: false });
    
    doc.y = top + 50;
  }

  generateTamilCustomerChitInfo(doc, customer, subscriber, scheme, maroonDark, maroonLight) {
    this._checkSpace(doc, 180);
    let top = doc.y;
    const leftX = 40;
    const rightX = 295;
    const labelWidth = 125;
    const valWidth = 130;
    const lineHeight = 18;

    doc.font('Tamil').fontSize(10).fillColor(maroonDark).text(this._t('ta', 'CUSTOMER_DETAILS'), leftX, top);
    doc.moveTo(leftX, top + 12).lineTo(leftX + 240, top + 12).strokeColor(maroonLight).lineWidth(0.5).stroke();
    
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'CUSTOMER_NAME'), 'Helvetica-Bold', 9, `: ${customer.firstName} ${customer.lastName || ''}`.trim(), leftX, top + 20, labelWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'CUSTOMER_CODE'), 'Helvetica-Bold', 9, `: ${customer.customerCode || 'N/A'}`, leftX, top + 20 + lineHeight, labelWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'MOBILE_NUMBER'), 'Helvetica-Bold', 9, `: ${customer.mobileNumber || 'N/A'}`, leftX, top + 20 + lineHeight*2, labelWidth);

    doc.font('Tamil').fontSize(10).fillColor(maroonDark).text(this._t('ta', 'SCHEME_DETAILS'), rightX, top);
    doc.moveTo(rightX, top + 12).lineTo(rightX + 240, top + 12).strokeColor(maroonLight).lineWidth(0.5).stroke();

    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'SCHEME_NAME'), 'Helvetica-Bold', 9, `: ${scheme.schemeName || 'N/A'}`, rightX, top + 20, labelWidth, valWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'TICKET_NUMBER'), 'Helvetica-Bold', 9, `: #${subscriber.ticketNumber || 'N/A'}`, rightX, top + 20 + lineHeight, labelWidth, valWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'TOTAL_SCHEME_AMOUNT'), 'Helvetica-Bold', 9, `: Rs. ${this._formatCurrency(scheme.totalAmount)}`, rightX, top + 20 + lineHeight*2, labelWidth, valWidth);
    this._drawTwoColumnRow(doc, 'Tamil', 9, this._t('ta', 'MONTHLY_INSTALLMENT'), 'Helvetica-Bold', 9, `: Rs. ${this._formatCurrency(scheme.monthlyInstallment)}`, rightX, top + 20 + lineHeight*3, labelWidth, valWidth);

    doc.y = top + 20 + lineHeight*4 + 10;
  }

  generateTamilChitSummary(doc, payment, subscriber, scheme, paymentHistory, currentGoldRate, dustyRose, lightRose) {
    this._checkSpace(doc, 200);
    let top = doc.y;
    
    // Background box
    doc.roundedRect(40, top, 510, 110, 8).fill(lightRose);
    doc.fillColor('#111111').fontSize(11).font('Tamil').text(this._t('ta', 'CHIT_SUMMARY'), 55, top + 15);
    doc.strokeColor(dustyRose).lineWidth(1).moveTo(55, top + 32).lineTo(535, top + 32).stroke();
    
    let dataTop = top + 45;
    const lineHeight = 18;
    let y = dataTop;
    let rightY = dataTop;

    const drawSummaryRow = (label, value) => {
      doc.fillColor('#333333');
      const calculatedLabelWidth = this._measureMixedTextWidth(doc, label, 'Tamil', 9);
      const finalLeftX = 55;
      this._drawMixedText(doc, label, finalLeftX, y, 'Tamil', 9);
      
      const dynamicValX = Math.max(190, finalLeftX + calculatedLabelWidth + 10);
      doc.fillColor('#111111');
      this._drawMixedText(doc, value, dynamicValX, y, 'Helvetica-Bold', 9);
      y += lineHeight;
    };

    const drawPaymentRow = (label, value) => {
      doc.fillColor('#333333');
      const calculatedLabelWidth = this._measureMixedTextWidth(doc, label, 'Tamil', 9);
      const finalRightX = 295;
      this._drawMixedText(doc, label, finalRightX, rightY, 'Tamil', 9);
      
      const dynamicValX = Math.max(430, finalRightX + calculatedLabelWidth + 10);
      doc.fillColor('#111111');
      this._drawMixedText(doc, value, dynamicValX, rightY, 'Helvetica-Bold', 9);
      rightY += lineHeight;
    };

    const goldRateValue = currentGoldRate ? this._getNumericValue(currentGoldRate.gold22k) : 0;
    const totalPaid = this._getNumericValue(subscriber.totalPaidAmount || subscriber.totalPaid);

    drawSummaryRow(this._t('ta', 'INSTALLMENTS_PAID'), `${subscriber.completedInstallments || paymentHistory.length || 0} / ${scheme.durationMonths}`);
    drawSummaryRow(this._t('ta', 'MONTHLY_INSTALLMENT'), `Rs. ${this._formatCurrency(scheme.monthlyInstallment)}`);
    drawSummaryRow(this._t('ta', 'TOTAL_PAID_AMOUNT'), `Rs. ${this._formatCurrency(totalPaid)}`);

    drawPaymentRow(this._t('ta', 'CURRENT_GOLD_RATE'), `Rs. ${this._formatCurrency(goldRateValue)}`);
    drawPaymentRow(this._t('ta', 'TOTAL_SCHEME_AMOUNT'), `Rs. ${this._formatCurrency(scheme.totalAmount)}`);
    drawPaymentRow(this._t('ta', 'MATURITY_VALUE'), `Rs. ${this._formatCurrency(scheme.totalAmount)}`);

    // Add Payment History Table
    doc.y = top + 130;
    this._checkSpace(doc, 100);
    
    doc.fillColor('#222222').fontSize(12).font('Tamil').text(this._t('ta', 'PAYMENT_HISTORY'), 40, doc.y);
    doc.moveDown(0.5);

    let ty = doc.y;
    // Table Header
    doc.rect(40, ty, 510, 20).fill('#f1f5f9');
    doc.fillColor('#334155').fontSize(9).font('Tamil');
    doc.text(this._t('ta', 'DATE'), 45, ty + 6, { width: 75, lineBreak: false });
    doc.text(this._t('ta', 'INVOICE_NO'), 125, ty + 6, { width: 155, lineBreak: false });
    doc.text(this._t('ta', 'PAYMENT_METHOD'), 285, ty + 6, { width: 115, lineBreak: false });
    doc.text(this._t('ta', 'AMOUNT'), 405, ty + 6, { width: 135, align: 'right', lineBreak: false });
    
    ty += 20;
    
    let count = 0;
    for (const hist of paymentHistory) {
      if (count > 8) break;
      this._checkSpace(doc, 20);
      
      doc.fillColor('#111111');
      this._drawMixedText(doc, new Date(hist.paymentDate || hist.createdAt).toLocaleDateString(), 45, ty + 6, 'Helvetica', 9);
      this._drawMixedText(doc, hist.invoiceNumber || `INV-${hist.id.split('-')[0].toUpperCase()}`, 125, ty + 6, 'Helvetica', 9);
      
      const rawVal = hist.paymentMethod || 'CASH';
      const transVal = this._getTranslatedPaymentMethod('ta', rawVal);
      console.log(`Payment Method Raw Value: ${rawVal}`);
      console.log(`Payment Method Translated Value: ${transVal}`);
      console.log(`Current Font Name: Tamil`);
      
      this._drawMixedText(doc, transVal, 285, ty + 6, 'Tamil', 9, { width: 115, lineBreak: false });
      
      doc.font('Helvetica').fontSize(9).text(`Rs. ${this._formatCurrency(hist.amountPaid)}`, 405, ty + 6, { width: 135, align: 'right', lineBreak: false });
      
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, ty + 20).lineTo(550, ty + 20).stroke();
      ty += 20;
      doc.y = ty;
      count++;
    }
    
    doc.y = ty + 15;
  }


  generateSimpleFooter(doc, lang = 'en') {
    let footerY = doc.y + 5; // Start drawing just below current content
    
    const fontName = lang === 'ta' ? 'Tamil' : 'Helvetica-Bold';
    const subFont = lang === 'ta' ? 'Tamil' : 'Helvetica';

    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(40, footerY).lineTo(550, footerY).stroke();
    doc.fillColor('#111111').fontSize(10).font(fontName).text(this._t(lang, 'COMPANY_NAME'), 40, footerY + 10, { lineBreak: false });
    doc.fontSize(10).font(subFont).text(this._t(lang, 'COMPANY_PHONE'), 40, footerY + 10, { align: 'right', width: 510, lineBreak: false });
    
    doc.y = footerY + 25;
  }
}

module.exports = new PDFService();
