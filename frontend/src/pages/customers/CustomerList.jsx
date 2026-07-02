import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, deleteCustomer } from '../../store/slices/customerSlice';
import { toast } from 'react-toastify';
import Table from '../../components/ui/Table';
import { 
  Search, 
  UserPlus, 
  Filter, 
  Download, 
  MoreVertical, 
  User, 
  Mail, 
  Phone 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddCustomerModal from './AddCustomerModal';
import CustomerDetailsModal from './CustomerDetailsModal';
import EditCustomerModal from './EditCustomerModal';
import { useTranslation } from 'react-i18next';

const CustomerList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Customers | SDRS Gold Finance";
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await dispatch(deleteCustomer(id)).unwrap();
        toast.success('Customer deleted successfully');
        setIsDetailsModalOpen(false);
      } catch (error) {
        toast.error(error || 'Failed to delete customer');
      }
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobileNumber?.includes(searchTerm) ||
        c.customerCode?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesFilter = filterStatus === 'ALL' || c.kycStatus === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [customers, searchTerm, filterStatus]);

  const columns = [
    {
      header: t('Customer Name'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold font-bold">
            {row.firstName?.[0] || 'W'}{row.lastName?.[0] || ''}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold">{row.firstName} {row.lastName}</p>
              {row.customerType === 'WALK_IN' && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[9px] font-black uppercase tracking-wider">{t('Walk-in')}</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{t('ID:')} {row.customerCode || 'CUST-001'}</p>
          </div>
        </div>
      )
    },
    { 
      header: t('Contact'), 
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail size={12} /> {row.email || 'N/A'}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone size={12} /> {row.mobileNumber || 'N/A'}
          </div>
        </div>
      )
    },
    { header: t('City'), accessor: 'city' },
    {
      header: t('KYC Status'),
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
          row.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
        }`}>
          {row.kycStatus || 'PENDING'}
        </span>
      )
    },
    {
      header: t('Actions'),
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); handleViewDetails(row); }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition-colors"
        >
          <MoreVertical size={18} className="text-gray-400" />
        </button>
      )
    }
  ];

  const handleExport = () => {
    if (!filteredCustomers || filteredCustomers.length === 0) return;
    
    // Create CSV content
    const headers = ['Customer ID', 'First Name', 'Last Name', 'Email', 'Phone', 'City', 'KYC Status', 'Customer Type'];
    const csvRows = [headers.join(',')];
    
    filteredCustomers.forEach(c => {
      const row = [
        c.customerCode || 'N/A',
        c.firstName || '',
        c.lastName || '',
        c.email || '',
        c.mobileNumber || '',
        c.city || '',
        c.kycStatus || 'PENDING',
        c.customerType || ''
      ];
      // Escape commas and quotes for CSV safely
      csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'customers_export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">{t('Customers')}</h1>
          <p className="text-gray-500 mt-1">{t('Manage and track your customer database.')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download size={18} /> {t('Export')}
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-gold flex items-center gap-2"
          >
            <UserPlus size={18} /> {t('Add Customer')}
          </button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={18} />
            <input
              type="text"
              placeholder={t('Search by name, email, or ID...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 md:flex-none appearance-none flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-dark-card rounded-2xl text-gray-500 hover:text-gold transition-colors outline-none cursor-pointer pr-10 border border-transparent focus:border-gold"
            >
              <option value="ALL">{t('All Status')}</option>
              <option value="VERIFIED">{t('Verified')}</option>
              <option value="PENDING">{t('Pending')}</option>
              <option value="REJECTED">{t('Rejected')}</option>
            </select>
            <Filter size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <Table 
          columns={columns} 
          data={filteredCustomers} 
          loading={loading}
          onRowClick={(row) => handleViewDetails(row)}
        />
        
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 text-red-500 rounded-2xl text-center text-sm font-bold">
            {error}
          </div>
        )}
      </div>

      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <CustomerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        customer={selectedCustomer}
        onEdit={() => { setIsDetailsModalOpen(false); setIsEditModalOpen(true); }}
        onDelete={() => handleDeleteCustomer(selectedCustomer?.id)}
      />

      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default CustomerList;

