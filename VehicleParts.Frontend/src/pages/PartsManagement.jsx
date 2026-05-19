import React, { useEffect, useState } from 'react';
import { getParts, addPart, updatePart, deletePart, getVendors } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const PartsManagement = () => {
    const [parts, setParts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form states
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        partName: '',
        sku: '',
        category: 'Engine',
        price: '',
        stockQuantity: '',
        vendorId: ''
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const categories = [
        'Engine', 
        'Brakes', 
        'Transmission', 
        'Suspension', 
        'Electrical', 
        'Exhaust', 
        'Body & Trim', 
        'Tires & Wheels', 
        'Fluids & Lubricants'
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [partsRes, vendorsRes] = await Promise.all([
                getParts(),
                getVendors()
            ]);
            setParts(partsRes.data);
            setVendors(vendorsRes.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load parts or supplier data");
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddClick = () => {
        setIsEditing(false);
        setFormData({
            partName: '',
            sku: '',
            category: 'Engine',
            price: '',
            stockQuantity: '',
            vendorId: vendors[0]?.id || ''
        });
        setShowModal(true);
    };

    const handleEditClick = (part) => {
        setIsEditing(true);
        setFormData({
            partName: part.partName,
            sku: part.sku,
            category: part.category || 'Engine',
            price: part.price.toString(),
            stockQuantity: part.stockQuantity.toString(),
            vendorId: part.vendorId.toString()
        });
        setCurrentId(part.id);
        setShowModal(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deletePart(deleteId);
            toast.success("Part deleted successfully!");
            setShowDeleteModal(false);
            setDeleteId(null);
            
            // Reload parts list
            const partsRes = await getParts();
            setParts(partsRes.data);
        } catch (error) {
            toast.error(error.message || "Failed to delete part");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.vendorId) {
            toast.error("Please select a registered supplier (Vendor)");
            return;
        }

        const payload = {
            partName: formData.partName,
            sku: formData.sku,
            category: formData.category,
            price: parseFloat(formData.price),
            stockQuantity: parseInt(formData.stockQuantity),
            vendorId: parseInt(formData.vendorId)
        };

        setFormLoading(true);
        try {
            if (isEditing) {
                await updatePart(currentId, payload);
                toast.success("Part updated in inventory successfully");
            } else {
                await addPart(payload);
                toast.success("Part registered in inventory successfully");
            }
            setShowModal(false);
            
            // Reload parts list
            const partsRes = await getParts();
            setParts(partsRes.data);
        } catch (error) {
            toast.error(error.message || "Operation failed");
        } finally {
            setFormLoading(false);
        }
    };

    const filteredParts = parts.filter(part => 
        (part.partName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.vendor?.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <DashboardLayout><div style={{ padding: '40px' }}><h2>Loading Parts Inventory...</h2></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Parts & Inventory Management</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>View, track, buy, and manage your vehicle parts stock</p>
                </div>
            </div>

            <div className="table-actions" style={{ display: 'flex', gap: '16px', marginBottom: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
                    <input 
                        type="text" 
                        placeholder="Search parts by name, category, SKU, or supplier..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                </div>
                <button onClick={handleAddClick} className="auth-button" style={{ width: 'auto', padding: '12px 24px' }}>
                    + Register New Part
                </button>
            </div>

            <div className="activity-card" style={{ padding: '0px', overflowX: 'auto', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                            <th style={{ padding: '16px' }}>Part Details</th>
                            <th style={{ padding: '16px' }}>SKU / Code</th>
                            <th style={{ padding: '16px' }}>Category</th>
                            <th style={{ padding: '16px' }}>Stock Qty</th>
                            <th style={{ padding: '16px' }}>Unit Price</th>
                            <th style={{ padding: '16px' }}>Supplier / Vendor</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredParts.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                    No parts found in inventory. Start by purchasing a part from a vendor!
                                </td>
                            </tr>
                        ) : (
                            filteredParts.map(part => (
                                <tr key={part.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{part.partName}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '13px' }}>{part.sku}</span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>{part.category}</span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ 
                                                fontWeight: '700', 
                                                color: part.stockQuantity === 0 ? '#ef4444' : part.stockQuantity <= 5 ? '#f59e0b' : '#22c55e'
                                            }}>
                                                {part.stockQuantity}
                                            </span>
                                            {part.stockQuantity === 0 && (
                                                <span style={{ fontSize: '11px', background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>Out of Stock</span>
                                            )}
                                            {part.stockQuantity > 0 && part.stockQuantity <= 5 && (
                                                <span style={{ fontSize: '11px', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>Low Stock</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b' }}>
                                        Rs. {part.price.toLocaleString()} / unit
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '500', color: '#475569' }}>
                                            🏢 {part.vendor?.vendorName || 'No Vendor'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            {part.vendor?.contactPerson}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button onClick={() => handleEditClick(part)} style={{ background: 'transparent', color: 'var(--primary)', border: 'none', marginRight: '16px', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                                        <button onClick={() => handleDeleteClick(part.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Part Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="auth-card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h2>{isEditing ? 'Edit Part Details' : 'Register New Part'}</h2>
                        <p className="subtitle">Fill in the part details and stock inventory specifications below</p>
                        
                        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            <div className="form-group">
                                <label>Part Name</label>
                                <input 
                                    type="text" 
                                    name="partName" 
                                    value={formData.partName} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="e.g. Brembo Ceramic Brake Pads"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>SKU / Part Code</label>
                                <input 
                                    type="text" 
                                    name="sku" 
                                    value={formData.sku} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="e.g. BR-4015B"
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Price (Rs.)</label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        value={formData.price} 
                                        onChange={handleInputChange} 
                                        min="0.01" 
                                        step="0.01" 
                                        required 
                                        placeholder="Rs."
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Initial Stock Quantity</label>
                                    <input 
                                        type="number" 
                                        name="stockQuantity" 
                                        value={formData.stockQuantity} 
                                        onChange={handleInputChange} 
                                        min="0" 
                                        required 
                                        placeholder="Qty"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Supplier / Vendor</label>
                                <select 
                                    name="vendorId" 
                                    value={formData.vendorId} 
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }}
                                >
                                    <option value="">-- Select Registered Vendor --</option>
                                    {vendors.map(vendor => (
                                        <option key={vendor.id} value={vendor.id}>{vendor.vendorName} ({vendor.contactPerson})</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="auth-button" disabled={formLoading}>
                                {formLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Register & Save Part')}
                            </button>
                            <button type="button" className="auth-button" onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none', marginTop: '8px' }}>
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="auth-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '50px', marginBottom: '16px' }}>⚠️</div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>Confirm Deletion</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                            Are you sure you want to delete this part from the inventory? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button 
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteId(null);
                                }} 
                                className="auth-button" 
                                style={{ 
                                    background: '#e2e8f0', 
                                    color: '#475569', 
                                    width: 'auto', 
                                    padding: '10px 24px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={confirmDelete} 
                                className="auth-button" 
                                style={{ 
                                    background: '#ef4444', 
                                    color: 'white', 
                                    width: 'auto', 
                                    padding: '10px 24px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default PartsManagement;
