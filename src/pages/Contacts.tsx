import React, { useState, useEffect } from 'react';
import {
  Plus,
  Download,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { contactsService, ContactFilterParams } from '../services/contactsService';
import { Contact } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Avatar } from '../components/common/Avatar';
import { SearchBar } from '../components/common/SearchBar';
import { Pagination } from '../components/common/Pagination';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  const [newContact, setNewContact] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    jobTitle: '',
    location: 'Bengaluru, Karnataka',
  });

  const { showToast } = useToast();
  const { hasPermission } = useAuth();

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactsService.getContacts({
        search,
        status: statusFilter,
        page: currentPage,
        pageSize,
      });
      setContacts(res.data);
      setTotalContacts(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
      showToast('Failed to load contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, statusFilter, currentPage, pageSize]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contactsService.createContact({
        name: newContact.name,
        companyName: newContact.companyName,
        companyId: 'comp_1',
        email: newContact.email,
        phone: newContact.phone || '+91 98765 43210',
        jobTitle: newContact.jobTitle || 'Executive Contact',
        location: newContact.location,
        status: 'Active',
        ownerId: 'usr_3',
        ownerName: 'Vikramaditya Rao',
        lastActivityAt: new Date().toISOString(),
      });
      showToast('Contact created successfully!');
      setIsAddModalOpen(false);
      setNewContact({ name: '', companyName: '', email: '', phone: '', jobTitle: '', location: 'Bengaluru, Karnataka' });
      fetchContacts();
    } catch {
      showToast('Error creating contact', 'error');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!contactToDelete) return;
    try {
      await contactsService.deleteContact(contactToDelete);
      showToast('Contact deleted');
      setIsConfirmDeleteOpen(false);
      setContactToDelete(null);
      if (activeContact?.id === contactToDelete) setIsDetailOpen(false);
      fetchContacts();
    } catch {
      showToast('Error deleting contact', 'error');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Name,Company,JobTitle,Email,Phone,Location,Status'];
    const rows = contacts.map(c => `"${c.name}","${c.companyName}","${c.jobTitle}","${c.email}","${c.phone}","${c.location || ''}","${c.status}"`);
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_contacts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Exported contacts to CSV');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Customer Contacts
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {totalContacts} records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Stakeholder contacts, account decision makers, and communication channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          {hasPermission('contacts.create') && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search contacts by name, role, email..." />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
            type="button"
            onClick={fetchContacts}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSkeleton count={pageSize} />
        ) : contacts.length === 0 ? (
          <EmptyState
            title="No contacts found"
            description="Try changing your search keywords or clear current filters."
            actionLabel="Clear Search"
            onAction={() => setSearch('')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setActiveContact(contact);
                      setIsDetailOpen(true);
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={contact.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                            {contact.name}
                          </p>
                          <p className="text-slate-400 text-[11px]">{contact.jobTitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{contact.companyName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5 font-mono text-[11px]">
                        <p className="text-slate-700 dark:text-slate-300">{contact.email}</p>
                        <p className="text-slate-400">{contact.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {contact.location || 'India'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={contact.status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {contact.ownerName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveContact(contact);
                            setIsDetailOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasPermission('contacts.delete') && (
                          <button
                            type="button"
                            onClick={() => {
                              setContactToDelete(contact.id);
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
          totalItems={totalContacts}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Detail Drawer */}
      <Drawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={activeContact ? activeContact.name : 'Contact Profile'}
        width="md"
      >
        {activeContact && (
          <div className="space-y-6 text-xs">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Avatar name={activeContact.name} size="lg" />
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeContact.name}
                </h3>
                <p className="text-slate-500 font-medium">{activeContact.jobTitle}</p>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeContact.companyName}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <Mail className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Email</span>
                  <p className="font-mono text-slate-900 dark:text-white font-medium">{activeContact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <Phone className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Phone</span>
                  <p className="font-mono text-slate-900 dark:text-white font-medium">{activeContact.phone}</p>
                </div>
              </div>
            </div>

            {activeContact.notes && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Internal Account Notes:</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{activeContact.notes}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Customer Contact"
        subtitle="Register key stakeholder in customer accounts directory."
      >
        <form onSubmit={handleCreateContact} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Meenakshi Nanda"
              value={newContact.name}
              onChange={e => setNewContact({ ...newContact, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Organization *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acuity Legal Advocates"
              value={newContact.companyName}
              onChange={e => setNewContact({ ...newContact, companyName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Partner"
                value={newContact.jobTitle}
                onChange={e => setNewContact({ ...newContact, jobTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. New Delhi"
                value={newContact.location}
                onChange={e => setNewContact({ ...newContact, location: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="contact@company.com"
                value={newContact.email}
                onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91 98111 22233"
                value={newContact.phone}
                onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
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
              Save Contact
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Contact"
        message="Are you sure you want to remove this contact record from the CRM database?"
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
