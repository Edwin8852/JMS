import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COMPANY_NAME = "SDRS GOLD FINANCE & JEWELRY";
const COMPANY_ADDRESS = "123 Finance Plaza, Gold Bazaar, Chennai, TN";
const COMPANY_PHONE = "+91 98765 43210";

export const generateLoanInvoice = (loan, customer) => {
  const doc = jsPDF();
  const date = new Date().toLocaleDateString();

  // Branding
  doc.setFillColor(212, 175, 55); // Gold color
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_NAME, 105, 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(COMPANY_ADDRESS, 105, 28, { align: 'center' });
  doc.text(`Phone: ${COMPANY_PHONE}`, 105, 34, { align: 'center' });

  // Invoice Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text("LOAN DISBURSEMENT INVOICE", 15, 55);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: INV-${loan.id || 'TEMP'}`, 150, 55);
  doc.text(`Date: ${date}`, 150, 60);

  // Customer Info
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER DETAILS:", 15, 75);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${customer.firstName} ${customer.lastName}`, 15, 82);
  doc.text(`Customer ID: ${customer.customerCode}`, 15, 87);
  doc.text(`Phone: ${customer.phone || 'N/A'}`, 15, 92);

  // Table
  doc.autoTable({
    startY: 105,
    head: [['Description', 'Detail', 'Value']],
    body: [
      ['Ornament Type', loan.ornamentType, '-'],
      ['Net Weight', `${loan.weight} grams`, '-'],
      ['Purity', loan.purity, '-'],
      ['Market Rate', `Rs. ${loan.marketRate}/g`, '-'],
      ['Interest Rate', `${loan.interestRate}% P.A`, '-'],
      ['Duration', `${loan.duration} Months`, '-'],
      ['Total Loan Amount', '-', `Rs. ${parseFloat(loan.loanAmount).toLocaleString()}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [212, 175, 55] },
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY + 30;
  doc.setFont("helvetica", "bold");
  doc.text("Authorized Signature", 150, finalY);
  doc.line(140, finalY - 5, 200, finalY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("This is a computer-generated document. No physical signature required.", 105, 285, { align: 'center' });

  doc.save(`Invoice_${loan.id || 'New'}.pdf`);
};

export const generatePaymentReceipt = (payment, customer) => {
  const doc = jsPDF();
  // Simplified receipt for demo
  doc.setFontSize(18);
  doc.text("PAYMENT RECEIPT", 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Received from: ${customer.firstName}`, 20, 40);
  doc.text(`Amount: Rs. ${payment.amount}`, 20, 50);
  doc.text(`Method: ${payment.paymentMethod}`, 20, 60);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
  doc.save(`Receipt_${payment.id}.pdf`);
};
