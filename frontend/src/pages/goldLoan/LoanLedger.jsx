import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchLoanDetails } from '../../api/goldLoan.api';
import LoanDetailsView from './components/LoanDetailsView';

const LoanLedger = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isCustomerView = user?.role === 'CUSTOMER';

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetchLoanDetails(id);
        setLoanDetails(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch loan details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-dark-card rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-dark-border"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t('Loan Details')}</h1>
          <p className="text-sm text-gray-500">{t('Complete lifecycle history for Loan')}: {loanDetails?.loan?.loanNumber || id}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">{t('Loading details...')}</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 bg-red-50 rounded-2xl border border-red-100">{error}</div>
      ) : !loanDetails ? (
        <div className="text-center py-10 text-gray-500">{t('No details found.')}</div>
      ) : (
        <LoanDetailsView loanDetails={loanDetails} isCustomerView={isCustomerView} />
      )}
    </div>
  );
};

export default LoanLedger;
