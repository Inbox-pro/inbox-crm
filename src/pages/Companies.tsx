import React, { useState, useEffect } from 'react';
import {
  Plus,
  Download,
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Users2,
  Eye,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { companiesService } from '../services/companiesService';
import { Company } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchBar } from '../components/common/SearchBar';
import { Pagination } from '../components/common/Pagination';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Companies: React.FC = () => {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: 'Enterprise Software & Cloud',
    website: 'https://example.com',
    location: 'Bengaluru, Karnataka',
    employees: '250-500',
    phone: '+91 80 4000 1234',
    email: 'contact@company.com',
  });

  const { showToast } = useToast();
  const { hasPermission } = useAuth();

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await companiesService.getCompanies({
        search,
        industry: industryFilter,
        page: currentPage,
        pageSize,
      });
      setCompanies(res.data);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
      showToast('Error loading accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, industryFilter, currentPage, pageSize]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await companiesService.createCompany({
        name: newCompany.name,
        industry: newCompany.industry,
        website: newCompany.website,
        location: newCompany.location,
        employees: newCompany.employees,
        phone: newCompany.phone,
        email: newCompany.email,
        status: 'Prospect',
        ownerId: 'usr_3',
        ownerName: 'Vikramaditya Rao',
      });
      showToast('Company created!');
      setIsAddModalOpen(false);
      setNewCompany({
        name: '',
        industry: 'Enterprise Software & Cloud',
        website: 'https://example.com',
        location: 'Bengaluru, Karnataka',
        employees: '250-500',
        phone: '+91 80 4000 1234',
        email: 'contact@company.com',
      });
      fetchCompanies();
    } catch {
      showToast('Failed to create account', 'error');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!companyToDelete) return;
    try {
      await companiesService.deleteCompany(companyToDelete);
      showToast('Account deleted');
      setIsConfirmDeleteOpen(false);
      setCompanyToDelete(null);
      if (activeCompany?.id === companyToDelete) setIsDetailOpen(false);
      fetchCompanies();
    } catch {
      showToast('Failed to delete account', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('companies.title', 'Enterprise Accounts & Companies')}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {total} {t('common.details', 'accounts')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('companies.subtitle', 'Directory of client organizations, corporate entities, and tier accounts.')}
          </p>
        </div>

        {hasPermission('companies.create') && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('companies.new_company', 'Add Company')}</span>
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder={t('companies.search', 'Search companies by name, vertical, city...')} />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="All">{t('companies.all_industries', 'All Industries')}</option>
            <option value="Enterprise Software & Cloud">{t('companies.software_cloud', 'Software & Cloud')}</option>
            <option value="Financial & Banking Infrastructure">{t('companies.fintech_banking', 'Fintech & Banking')}</option>
            <option value="Healthcare & Life Sciences">{t('companies.healthcare', 'Healthcare')}</option>
            <option value="Manufacturing & Industrial Dynamics">{t('companies.manufacturing', 'Manufacturing')}</option>
            <option value="Logistics & Supply Chain Networks">{t('companies.logistics', 'Logistics')}</option>
            <option value="Retail & Consumer Goods">{t('companies.retail', 'Retail')}</option>
          </select>
          <button
            type="button"
            onClick={fetchCompanies}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title={t('common.refresh', 'Refresh list')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSkeleton count={pageSize} />
        ) : companies.length === 0 ? (
          <EmptyState
            title={t('companies.no_companies', 'No companies found')}
            description={t('companies.no_companies_desc', 'Try changing your search keywords or clear current filters.')}
            actionLabel={t('contacts.clear_search', 'Clear Search')}
            onAction={() => setSearch('')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">{t('companies.name_col', 'Company Name')}</th>
                  <th className="py-3 px-4">{t('companies.industry_col', 'Industry Vertical')}</th>
                  <th className="py-3 px-4">{t('contacts.location_col', 'Location')}</th>
                  <th className="py-3 px-4">{t('companies.employees_col', 'Employee Scale')}</th>
                  <th className="py-3 px-4">{t('common.status', 'Status')}</th>
                  <th className="py-3 px-4">{t('companies.owner_col', 'Account Owner')}</th>
                  <th className="py-3 px-4 text-right">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {companies.map((comp) => (
                  <tr
                    key={comp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setActiveCompany(comp);
                      setIsDetailOpen(true);
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                            {comp.name}
                          </p>
                          <a
                            href={comp.website}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 text-[11px] hover:underline"
                          >
                            {comp.website.replace('https://', '')}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {comp.industry}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{comp.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {comp.employees} team
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={comp.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {comp.ownerName}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCompany(comp);
                            setIsDetailOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasPermission('companies.delete') && (
                          <button
                            type="button"
                            onClick={() => {
                              setCompanyToDelete(comp.id);
                              setIsConfirmDeleteOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Details Drawer */}
      <Drawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={activeCompany ? activeCompany.name : 'Account Profile'}
        width="md"
      >
        {activeCompany && (
          <div className="space-y-6 text-xs">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeCompany.name}
                </h3>
                <p className="text-slate-500 font-medium">{activeCompany.industry}</p>
                <div className="mt-2">
                  <StatusBadge status={activeCompany.status} size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-medium">Website</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
                  <a href={activeCompany.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    {activeCompany.website}
                  </a>
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Headquarters</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{activeCompany.location}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Company Size</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{activeCompany.employees} Employees</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Primary Contact Email</span>
                <p className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5">{activeCompany.email}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Account Owner</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{activeCompany.ownerName}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Onboarded Since</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {new Date(activeCompany.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Company Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Enterprise Account"
        subtitle="Register new corporate entity into company records."
      >
        <form onSubmit={handleCreateCompany} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Industrial Dynamics"
              value={newCompany.name}
              onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Industry Vertical</label>
            <select
              value={newCompany.industry}
              onChange={e => setNewCompany({ ...newCompany, industry: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="Enterprise Software & Cloud">Enterprise Software & Cloud</option>
              <option value="Financial & Banking Infrastructure">Financial & Banking</option>
              <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
              <option value="Manufacturing & Industrial Dynamics">Manufacturing & Industrial</option>
              <option value="Logistics & Supply Chain Networks">Logistics & Supply Chain</option>
              <option value="Retail & Consumer Goods">Retail & Consumer Goods</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input
                type="text"
                placeholder="https://company.com"
                value={newCompany.website}
                onChange={e => setNewCompany({ ...newCompany, website: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Maharashtra"
                value={newCompany.location}
                onChange={e => setNewCompany({ ...newCompany, location: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Employee Size</label>
              <select
                value={newCompany.employees}
                onChange={e => setNewCompany({ ...newCompany, employees: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="1-50">1-50 employees</option>
                <option value="51-250">51-250 employees</option>
                <option value="251-1000">251-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Official Phone</label>
              <input
                type="text"
                placeholder="+91 22 6123 4567"
                value={newCompany.phone}
                onChange={e => setNewCompany({ ...newCompany, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Company Account"
        message="Are you sure you want to remove this company? Any associated contacts and deals will remain intact."
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
