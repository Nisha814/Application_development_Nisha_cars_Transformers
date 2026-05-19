import React, { useEffect, useState } from 'react';
import { getInvoices, createInvoice, getParts, getVendors } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const InvoicesManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [parts, setParts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // View Details Modal
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Create Invoice Wizard Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [selectedVendorId, setSelectedVendorId] = useState('');
    const [invoiceStatus, setInvoiceStatus] = useState('Paid');
    const [invoiceItems, setInvoiceItems] = useState([
        { partId: '', quantity: 1, unitPrice: '' }
    ]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [invoicesRes, partsRes, vendorsRes] = await Promise.all([
                getInvoices(),
                getParts(),
                getVendors()
            ]);
            setInvoices(invoicesRes.data);
            setParts(partsRes.data);
            setVendors(vendorsRes.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load invoices and inventory details");
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        const today = new Date().toISOString().split('T')[0];
        setInvoiceNumber(`VP-INV-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`);
        setInvoiceDate(today);
        setSelectedVendorId(vendors[0]?.id || '');
        setInvoiceStatus('Paid');
        setInvoiceItems([{ partId: '', quantity: 1, unitPrice: '' }]);
        setShowCreateModal(true);
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...invoiceItems];
        updatedItems[index][field] = value;

        // Auto-fill Unit Price when Part is selected
        if (field === 'partId') {
            const part = parts.find(p => p.id === parseInt(value));
            if (part) {
                updatedItems[index].unitPrice = part.price.toString();
            }
        }
        setInvoiceItems(updatedItems);
    };

    const handleAddItemLine = () => {
        setInvoiceItems([...invoiceItems, { partId: '', quantity: 1, unitPrice: '' }]);
    };

    const handleRemoveItemLine = (index) => {
        if (invoiceItems.length === 1) {
            toast.error("An invoice must contain at least one item line");
            return;
        }
        const updatedItems = invoiceItems.filter((_, i) => i !== index);
        setInvoiceItems(updatedItems);
    };

    const calculateRunningTotal = () => {
        return invoiceItems.reduce((acc, item) => {
            const qty = parseInt(item.quantity) || 0;
            const price = parseFloat(item.unitPrice) || 0;
            return acc + (qty * price);
        }, 0);
    };

    const handleViewInvoiceDetails = (invoice) => {
        setSelectedInvoice(invoice);
        setShowDetailsModal(true);
    };

    const handleSubmitInvoice = async (e) => {
        e.preventDefault();

        if (!selectedVendorId) {
            toast.error("Please select a Vendor");
            return;
        }

        // Validate items
        const invalidItem = invoiceItems.some(item => !item.partId || parseInt(item.quantity) <= 0 || parseFloat(item.unitPrice) <= 0);
        if (invalidItem) {
            toast.error("Please make sure all items are selected and have valid positive quantities and unit prices");
            return;
        }

        const payload = {
            invoiceNumber,
            invoiceDate: new Date(invoiceDate).toISOString(),
            vendorId: parseInt(selectedVendorId),
            status: invoiceStatus,
            items: invoiceItems.map(item => ({
                partId: parseInt(item.partId),
                quantity: parseInt(item.quantity),
                unitPrice: parseFloat(item.unitPrice)
            }))
        };

        setFormLoading(true);
        try {
            await createInvoice(payload);
            toast.success("Purchase invoice created and stock levels updated successfully!");
            setShowCreateModal(false);
            
            // Reload all data
            const [invoicesRes, partsRes] = await Promise.all([
                getInvoices(),
                getParts()
            ]);
            setInvoices(invoicesRes.data);
            setParts(partsRes.data);
        } catch (error) {
            toast.error(error.message || "Failed to create invoice");
        } finally {
            setFormLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(inv => 
        (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.vendor?.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.status || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter parts that belong to the currently selected Vendor to guarantee supplier integrity
    const filteredPartsForSelectedVendor = parts.filter(p => p.vendorId === parseInt(selectedVendorId));

    if (loading) return <DashboardLayout><div style={{ padding: '40px' }}><h2>Loading Purchase Invoices...</h2></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Purchase Invoices & Stock Ingestions</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Create purchase invoices to update part stock quantities automatically</p>
                </div>
            </div>

            <div className="table-actions" style={{ display: 'flex', gap: '16px', marginBottom: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
                    <input 
                        type="text" 
                        placeholder="Search invoices by invoice number, supplier, or status..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                </div>
                <button onClick={handleCreateClick} className="auth-button" style={{ width: 'auto', padding: '12px 24px' }}>
                    + Record Purchase Invoice
                </button>
            </div>

            <div className="activity-card" style={{ padding: '0px', overflowX: 'auto', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                            <th style={{ padding: '16px' }}>Invoice No</th>
                            <th style={{ padding: '16px' }}>Purchase Date</th>
                            <th style={{ padding: '16px' }}>Supplier / Vendor</th>
                            <th style={{ padding: '16px' }}>Items Count</th>
                            <th style={{ padding: '16px' }}>Total Amount</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                    No purchase invoices found. Click "Record Purchase Invoice" to ingest new part stock!
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map(invoice => (
                                <tr key={invoice.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{invoice.invoiceNumber}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {new Date(invoice.invoiceDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: '500', color: '#475569' }}>
                                        🏢 {invoice.vendor?.vendorName}
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: '600' }}>
                                        {invoice.items?.length || 0} items
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: '700', color: '#1e293b' }}>
                                        Rs. {invoice.totalAmount.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ 
                                            background: invoice.status === 'Paid' ? '#dcfce7' : '#fef3c7', 
                                            color: invoice.status === 'Paid' ? '#15803d' : '#b45309', 
                                            padding: '4px 10px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px', 
                                            fontWeight: '600' 
                                        }}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button onClick={() => handleViewInvoiceDetails(invoice)} style={{ background: 'transparent', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Purchase Invoice Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="auth-card" style={{ width: '100%', maxWidth: '750px', padding: '30px' }}>
                        <h2 style={{ marginBottom: '4px' }}>Record Purchase Invoice</h2>
                        <p className="subtitle" style={{ marginBottom: '24px' }}>Buy parts from suppliers to update stock levels automatically</p>

                        <form onSubmit={handleSubmitInvoice}>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Invoice Number</label>
                                    <input 
                                        type="text" 
                                        value={invoiceNumber} 
                                        onChange={(e) => setInvoiceNumber(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Invoice Date</label>
                                    <input 
                                        type="date" 
                                        value={invoiceDate} 
                                        onChange={(e) => setInvoiceDate(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Supplier / Vendor</label>
                                    <select 
                                        value={selectedVendorId} 
                                        onChange={(e) => {
                                            setSelectedVendorId(e.target.value);
                                            // Reset item lines when vendor changes to ensure proper supplier validation
                                            setInvoiceItems([{ partId: '', quantity: 1, unitPrice: '' }]);
                                        }}
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }}
                                    >
                                        <option value="">-- Select Supplier --</option>
                                        {vendors.map(v => (
                                            <option key={v.id} value={v.id}>{v.vendorName} ({v.contactPerson})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Payment Status</label>
                                    <select 
                                        value={invoiceStatus} 
                                        onChange={(e) => setInvoiceStatus(e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }}
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>Purchased Parts (Invoice Items)</h3>
                                
                                {invoiceItems.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ flex: 3 }}>
                                            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Select Vehicle Part</label>
                                            <select 
                                                value={item.partId} 
                                                onChange={(e) => handleItemChange(index, 'partId', e.target.value)}
                                                required
                                                disabled={!selectedVendorId}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
                                            >
                                                <option value="">-- Choose Part --</option>
                                                {filteredPartsForSelectedVendor.map(p => (
                                                    <option key={p.id} value={p.id}>{p.partName} (SKU: {p.sku})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ flex: 1.2 }}>
                                            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Quantity</label>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={item.quantity} 
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                required
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            />
                                        </div>

                                        <div style={{ flex: 1.5 }}>
                                            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Unit Price (Rs.)</label>
                                            <input 
                                                type="number" 
                                                min="0.01" 
                                                step="0.01" 
                                                value={item.unitPrice} 
                                                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                required
                                                placeholder="Price"
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            />
                                        </div>

                                        <div style={{ flex: 1.5, textAlign: 'right' }}>
                                            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Total</label>
                                            <div style={{ padding: '10px 0', fontWeight: '600' }}>
                                                Rs. {((parseInt(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toLocaleString()}
                                            </div>
                                        </div>

                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveItemLine(index)} 
                                            style={{ marginTop: '20px', background: 'transparent', color: '#ef4444', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <button 
                                    type="button" 
                                    onClick={handleAddItemLine} 
                                    disabled={!selectedVendorId}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
                                >
                                    + Add Another Part Line
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                                <span style={{ fontWeight: '600', color: '#475569' }}>Total Invoice Amount:</span>
                                <span style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Rs. {calculateRunningTotal().toLocaleString()}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="auth-button" disabled={formLoading}>
                                    {formLoading ? 'Submitting...' : 'Submit & Ingest Stock'}
                                </button>
                                <button type="button" className="auth-button" onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none', width: 'auto' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Invoice Details Modal */}
            {showDetailsModal && selectedInvoice && (
                <div className="modal-overlay">
                    <div className="auth-card" style={{ width: '100%', maxWidth: '650px', padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Purchase Invoice Details</h2>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Invoice No: <strong style={{ color: '#1e293b' }}>{selectedInvoice.invoiceNumber}</strong></p>
                            </div>
                            <span style={{ 
                                background: selectedInvoice.status === 'Paid' ? '#dcfce7' : '#fef3c7', 
                                color: selectedInvoice.status === 'Paid' ? '#15803d' : '#b45309', 
                                padding: '6px 12px', 
                                borderRadius: '20px', 
                                fontSize: '12px', 
                                fontWeight: '700' 
                            }}>
                                {selectedInvoice.status}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', fontSize: '14px' }}>
                            <div>
                                <h4 style={{ color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Supplier / Vendor Details:</h4>
                                <p style={{ fontWeight: '700', color: '#1e293b', margin: '0 0 2px 0' }}>{selectedInvoice.vendor?.vendorName}</p>
                                <p style={{ margin: '0 0 2px 0' }}>👤 {selectedInvoice.vendor?.contactPerson}</p>
                                <p style={{ margin: '0 0 2px 0' }}>✉️ {selectedInvoice.vendor?.email}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h4 style={{ color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Purchase Dates:</h4>
                                <p style={{ margin: '0 0 2px 0' }}><strong>Invoice Date:</strong> {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                                <p style={{ margin: '0 0 2px 0' }}><strong>Created At:</strong> {new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '24px', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                                    <th style={{ padding: '12px' }}>Part Details</th>
                                    <th style={{ padding: '12px' }}>SKU</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Quantity</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Unit Price</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedInvoice.items?.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px', fontWeight: '600' }}>{item.part?.partName}</td>
                                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>{item.part?.sku}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700' }}>{item.quantity}</td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>Rs. {item.unitPrice.toLocaleString()}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Rs. {(item.quantity * item.unitPrice).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #e2e8f0', paddingTop: '16px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ color: '#64748b', marginRight: '12px' }}>Grand Total Paid:</span>
                                <span style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Rs. {selectedInvoice.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            className="auth-button" 
                            onClick={() => {
                                setShowDetailsModal(false);
                                setSelectedInvoice(null);
                            }}
                            style={{ marginTop: '24px' }}
                        >
                            Close Details View
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default InvoicesManagement;
