import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Gem, Clock, ShieldCheck, CheckCircle, Wallet, History, AlertCircle, MapPin
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LoanDetailsView = ({ loanDetails, isCustomerView }) => {
  const { t } = useTranslation();

  if (!loanDetails || !loanDetails.loan) return null;

  const { loan, payments, ledgerEntries, histories, closedByUser, releasedByUser } = loanDetails;

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'PARTIALLY_PAID': return 'bg-blue-100 text-blue-700';
      case 'READY_FOR_CLOSURE': return 'bg-yellow-100 text-yellow-700';
      case 'CLOSED': 
      case 'LOAN_CLOSED': return 'bg-gray-100 text-gray-700';
      case 'ORNAMENT_RELEASED': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatName = (user) => user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : null;

  const calculateOutstanding = () => {
    const principal = parseFloat(loan.remainingPrincipal || 0);
    const interest = parseFloat(loan.interestAmount || 0); // Need proper calculation if accrued dynamically
    const penalty = parseFloat(loan.penaltyAmount || 0);
    return principal + interest + penalty;
  };

  // Timeline events assembly
  const timelineEvents = [];
  
  timelineEvents.push({
    title: t('Loan Created'),
    date: loan.createdAt,
    status: t('COMPLETED'),
    performedBy: isCustomerView ? t('System') : (formatName(loan.creator) || t('System'))
  });

  if (loan.approvedBy) {
    timelineEvents.push({
      title: t('Loan Approved'),
      date: loan.updatedAt, // Ideally approval date if tracked separately
      status: t('COMPLETED'),
      performedBy: isCustomerView ? t('System') : (formatName(loan.approver) || t('Admin'))
    });
  }

  payments.forEach(payment => {
    timelineEvents.push({
      title: t('Payment Received'),
      date: payment.paymentDate,
      status: t('COMPLETED'),
      performedBy: isCustomerView ? t('System') : (formatName(payment.creator) || t('System'))
    });
  });

  if (loan.loanClosed) {
    timelineEvents.push({
      title: t('Loan Closed'),
      date: loan.loanClosedDate,
      status: t('COMPLETED'),
      performedBy: isCustomerView ? t('System') : (formatName(closedByUser) || t('System'))
    });
  }

  if (loan.ornamentReleased) {
    timelineEvents.push({
      title: t('Ornament Released'),
      date: loan.ornamentReleaseDate,
      status: t('COMPLETED'),
      performedBy: isCustomerView ? t('System') : (formatName(releasedByUser) || t('System'))
    });
  }

  // Sort timeline chronologically
  timelineEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* SECTION 1: LOAN SUMMARY */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col p-6 md:p-8">
        <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
          <div className="p-2 bg-gold/10 rounded-xl text-gold">
            <FileText size={20} />
          </div>
          {t('Loan Summary')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Loan ID')}</p>
            <p className="font-bold">{loan.loanNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Customer Name')}</p>
            <p className="font-bold">{loan.customerName || (loan.customer?.firstName + ' ' + (loan.customer?.lastName || ''))}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Customer Code')}</p>
            <p className="font-bold">{loan.customer?.customerCode}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Mobile')}</p>
            <p className="font-bold">{loan.mobileNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Address')}</p>
            <p className="font-bold">{loan.customer?.address || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Loan Date')}</p>
            <p className="font-bold">{new Date(loan.loanDate || loan.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Loan Amount')}</p>
            <p className="font-bold text-lg">₹{parseFloat(loan.loanAmount).toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Status')}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(loan.status)}`}>
              {t(loan.status)}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Loan Type')}</p>
            <p className="font-bold">{t(loan.goldType)}</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: ORNAMENT DETAILS */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col p-6 md:p-8">
        <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
            <Gem size={20} />
          </div>
          {t('Ornament Details')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Ornament Name/Type')}</p>
            <p className="font-bold">{t(loan.ornamentType) || t('Gold Ornaments')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Gold Purity')}</p>
            <p className="font-bold">{t(loan.goldPurity)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Gross Weight')}</p>
            <p className="font-bold">{loan.goldWeight} {t('gram')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Net Weight')}</p>
            <p className="font-bold">{(loan.validatedGoldWeight || loan.goldWeight)} {t('gram')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-black text-gray-400">{t('Valuation Amount')}</p>
            <p className="font-bold text-lg">₹{parseFloat(loan.goldValue || 0).toLocaleString()}</p>
          </div>
        </div>
        {loan.jewelryDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs uppercase font-black text-gray-400 mb-2">{t('Description')}</p>
            <p className="text-sm">{loan.jewelryDetails}</p>
          </div>
        )}
      </div>

      {/* SECTION 4: PAYMENT SUMMARY */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col p-6 md:p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100">
        <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-emerald-800">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
            <Wallet size={20} />
          </div>
          {t('Payment Summary')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/60 p-4 rounded-2xl">
            <p className="text-xs uppercase font-black text-gray-500">{t('Loan Amount')}</p>
            <p className="font-black text-xl text-gray-800">₹{parseFloat(loan.loanAmount).toLocaleString()}</p>
          </div>
          <div className="bg-white/60 p-4 rounded-2xl">
            <p className="text-xs uppercase font-black text-gray-500">{t('Monthly Interest Rate')}</p>
            <p className="font-black text-xl text-gray-800">{parseFloat(loan.interestRate || 12) / 12}%</p>
          </div>
          <div className="bg-white/60 p-4 rounded-2xl">
            <p className="text-xs uppercase font-black text-gray-500">{t('Total Principal Paid')}</p>
            <p className="font-black text-xl text-emerald-600">₹{parseFloat(loan.totalPrincipalPaid || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/60 p-4 rounded-2xl">
            <p className="text-xs uppercase font-black text-gray-500">{t('Total Interest Paid')}</p>
            <p className="font-black text-xl text-emerald-600">₹{parseFloat(loan.totalInterestPaid || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/60 p-4 rounded-2xl">
            <p className="text-xs uppercase font-black text-gray-500">{t('Total Penalty Paid')}</p>
            <p className="font-black text-xl text-emerald-600">₹{parseFloat(loan.totalPenalty || 0).toLocaleString()}</p>
          </div>
          
          <div className="bg-white/60 p-4 rounded-2xl">
            <p className="text-xs uppercase font-black text-gray-500">{t('Outstanding Principal')}</p>
            <p className="font-black text-xl text-red-500">₹{parseFloat(loan.remainingPrincipal || 0).toLocaleString()}</p>
          </div>
          {/* Note: In a real scenario, Outstanding Interest and Penalty should be calculated live */}
          <div className="bg-white/60 p-4 rounded-2xl">
            <p className="text-xs uppercase font-black text-gray-500">{t('Current Month Interest')}</p>
            <p className="font-black text-xl text-amber-600">₹{parseFloat(loan.monthlyInterest || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/60 p-4 rounded-2xl">
            <p className="text-xs uppercase font-black text-gray-500">{t('Total Accrued Interest')}</p>
            <p className="font-black text-xl text-amber-600">₹{parseFloat(loan.totalAccruedInterest || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/60 p-4 rounded-2xl">
            <p className="text-xs uppercase font-black text-gray-500">{t('Remaining Interest Due')}</p>
            <p className="font-black text-xl text-red-500">₹{parseFloat(loan.interestAmount || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/60 p-4 rounded-2xl">
            <p className="text-xs uppercase font-black text-gray-500">{t('Outstanding Penalty')}</p>
            <p className="font-black text-xl text-red-500">₹{parseFloat(loan.penaltyAmount || 0).toLocaleString()}</p>
          </div>
          <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg">
            <p className="text-xs uppercase font-black text-emerald-200">{t('Total Outstanding')}</p>
            <p className="font-black text-2xl">₹{calculateOutstanding().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: PAYMENT HISTORY */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col p-6 md:p-8">
        <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <History size={20} />
          </div>
          {t('Payment History')}
        </h3>
        
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{t('No payments recorded yet.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Date')}</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Receipt No')}</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Method')}</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Principal Paid')}</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Interest Paid')}</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Penalty Paid')}</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Total Paid')}</th>
                  {!isCustomerView && <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Collected By')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-500">{payment.invoiceNumber || payment.transactionId || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold">{payment.paymentMethod}</span>
                    </td>
                    <td className="px-4 py-4 text-sm">₹{parseFloat(payment.principalAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm">₹{parseFloat(payment.interestAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm">₹{parseFloat(payment.penaltyAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-4 font-bold text-emerald-600">₹{parseFloat(payment.paymentAmount || 0).toLocaleString()}</td>
                    {!isCustomerView && <td className="px-4 py-4 text-xs text-gray-500">{formatName(payment.creator) || 'System'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 5 & 6: CLOSURE & RELEASE DETAILS */}
      {(loan.loanClosed || loan.ornamentReleased) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loan.loanClosed && (
            <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col p-6 md:p-8 bg-amber-50 border-amber-100">
              <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-amber-800">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                  <ShieldCheck size={20} />
                </div>
                {t('Loan Closure Details')}
              </h3>
              <div className="space-y-4">
                {!isCustomerView && (
                  <div>
                    <p className="text-xs uppercase font-black text-amber-600/70">{t('Closed By')}</p>
                    <p className="font-bold text-amber-900">{formatName(closedByUser) || t('System')}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase font-black text-amber-600/70">{t('Closure Date')}</p>
                  <p className="font-bold text-amber-900">{new Date(loan.loanClosedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-black text-amber-600/70">{t('Remarks')}</p>
                  <p className="font-medium text-sm text-amber-800">{loan.closureRemarks || t('Fully Paid')}</p>
                </div>
              </div>
            </div>
          )}

          {loan.ornamentReleased && (
            <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col p-6 md:p-8 bg-purple-50 border-purple-100">
              <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-purple-800">
                <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                  <Gem size={20} />
                </div>
                {t('Ornament Release Details')}
              </h3>
              <div className="space-y-4">
                {!isCustomerView && (
                  <div>
                    <p className="text-xs uppercase font-black text-purple-600/70">{t('Released By')}</p>
                    <p className="font-bold text-purple-900">{formatName(releasedByUser) || t('System')}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase font-black text-purple-600/70">{t('Release Date')}</p>
                  <p className="font-bold text-purple-900">{new Date(loan.ornamentReleaseDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-black text-purple-600/70">{t('Customer Received')}</p>
                  <p className="font-bold text-purple-900">{loan.receivedByCustomer ? t('YES') : t('NO')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-black text-purple-600/70">{t('Received Date')}</p>
                  <p className="font-bold text-purple-900">{loan.receivedDate ? new Date(loan.receivedDate).toLocaleDateString() : t('N/A')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-black text-purple-600/70">{t('Release Notes')}</p>
                  <p className="font-medium text-sm text-purple-800">{loan.releaseNotes || t('None')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 7: LOAN TIMELINE */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col p-6 md:p-8">
        <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
          <div className="p-2 bg-gray-100 rounded-xl text-gray-600">
            <Clock size={20} />
          </div>
          {t('Loan Timeline')}
        </h3>
        
        <div className="relative border-l-2 border-gray-100 dark:border-dark-border ml-4 md:ml-6 space-y-8 pb-4">
          {timelineEvents.map((event, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8 md:pl-10"
            >
              <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-gold border-4 border-white dark:border-dark-card shadow-sm"></div>
              
              <div className="bg-gray-50/50 dark:bg-dark-card/50 p-4 rounded-2xl border border-gray-100 dark:border-dark-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h4 className="font-bold text-gray-900 dark:text-white">{event.title}</h4>
                  <div className="text-xs font-bold text-gray-500">
                    {new Date(event.date).toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle size={14} className="text-green-500" />
                    {event.status}
                  </span>
                  {!isCustomerView && (
                    <span className="flex items-center gap-1 border-l pl-4">
                      {t('By')}: {event.performedBy}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default LoanDetailsView;
