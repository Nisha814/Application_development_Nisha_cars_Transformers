import React, { useEffect, useState } from 'react';
import {
    getInventoryItems, stockIn, stockOut, reportDamaged, createInventoryItem,
    getWarehouses, getInventoryValuation, deleteInventoryItem
} from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const inputStyle = { padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', width: '100%' };

const StockTracking = () => {
    const [items, setItems] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [valuation, setValuation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('movement');
    const [movement, setMovement] = useState({ partId: '', quantity: '', reference: '', notes: '' });
    const [damaged, setDamaged] = useState({ partId: '', quantity: '', reason: '' });
    const [newItem, setNewItem] = useState({ name: '', partNumber: '', price: '', unitCost: '', initialStock: '', minStockLevel: '10', warehouseId: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const userRole = localStorage.getItem('role') || 'Admin';

    const handleDeleteItem = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteInventoryItem(id);
                toast.success('Item deleted successfully');
                load();
            } catch (err) {
                toast.error(err.message || 'Failed to delete item');
            }
        }
    };

    const load = () => {
        setLoading(true);
        Promise.all([getInventoryItems(), getWarehouses(), getInventoryValuation()])
            .then(([itemsRes, whRes, valRes]) => {
                setItems(itemsRes.data || []);
                setWarehouses(whRes.data || []);
                setValuation(valRes.data);
            })
            .catch(() => toast.error('Failed to load inventory'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleStockIn = async (e) => {
        e.preventDefault();
        try {
            await stockIn({ partId: parseInt(movement.partId, 10), quantity: parseInt(movement.quantity, 10), reference: movement.reference, notes: movement.notes });
            toast.success('Stock added');
            setMovement({ partId: '', quantity: '', reference: '', notes: '' });
            load();
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    const handleStockOut = async (e) => {
        e.preventDefault();
        try {
            await stockOut({ partId: parseInt(movement.partId, 10), quantity: parseInt(movement.quantity, 10), reference: movement.reference, notes: movement.notes });
            toast.success('Stock removed');
            setMovement({ partId: '', quantity: '', reference: '', notes: '' });
            load();
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    const handleDamaged = async (e) => {
        e.preventDefault();
        try {
            await reportDamaged({ partId: parseInt(damaged.partId, 10), quantity: parseInt(damaged.quantity, 10), reason: damaged.reason });
            toast.success('Damaged stock recorded');
            setDamaged({ partId: '', quantity: '', reason: '' });
            load();
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            await createInventoryItem({
                name: newItem.name,
                partNumber: newItem.partNumber,
                price: parseFloat(newItem.price),
                unitCost: parseFloat(newItem.unitCost) || parseFloat(newItem.price) * 0.6,
                initialStock: parseInt(newItem.initialStock, 10) || 0,
                minStockLevel: parseInt(newItem.minStockLevel, 10) || 10,
                warehouseId: newItem.warehouseId ? parseInt(newItem.warehouseId, 10) : null
            });
            toast.success('Item created');
            setNewItem({ name: '', partNumber: '', price: '', unitCost: '', initialStock: '', minStockLevel: '10', warehouseId: '' });
            load();
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    const filteredItems = items.filter(p => {
        const term = searchQuery.toLowerCase();
        return (
            (p.name && p.name.toLowerCase().includes(term)) ||
            (p.partNumber && p.partNumber.toLowerCase().includes(term))
        );
    });

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Stock Tracking</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Stock in/out, damaged goods, and product management</p>
                </div>
            </div>

            {valuation && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
                    <div className="activity-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Cost Value</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>${valuation.totalCostValue?.toFixed(2)}</div>
                    </div>
                    <div className="activity-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Retail Value</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>${valuation.totalRetailValue?.toFixed(2)}</div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {['movement', 'damaged', 'new'].map(t => (
                    <button key={t} onClick={() => setTab(t)} className="auth-button"
                        style={{ width: 'auto', padding: '8px 16px', background: tab === t ? 'var(--primary)' : '#e2e8f0', color: tab === t ? 'white' : '#64748b' }}>
                        {t === 'movement' ? 'Stock In/Out' : t === 'damaged' ? 'Damaged Stock' : 'Add Product'}
                    </button>
                ))}
            </div>

            {tab === 'movement' && (
                <div className="activity-card" style={{ marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 16 }}>Record Stock Movement</h3>
                    <form style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
                        <select value={movement.partId} onChange={e => setMovement({ ...movement, partId: e.target.value })} style={inputStyle} required>
                            <option value="">Select part</option>
                            {items.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
                        </select>
                        <input type="number" placeholder="Quantity" value={movement.quantity} onChange={e => setMovement({ ...movement, quantity: e.target.value })} style={inputStyle} min="1" required />
                        <input type="text" placeholder="Reference (e.g. PO-001)" value={movement.reference} onChange={e => setMovement({ ...movement, reference: e.target.value })} style={inputStyle} />
                        <textarea placeholder="Notes" value={movement.notes} onChange={e => setMovement({ ...movement, notes: e.target.value })} style={{ ...inputStyle, minHeight: 60 }} />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={handleStockIn} className="auth-button" style={{ width: 'auto', background: '#22c55e' }}>Stock In</button>
                            <button type="button" onClick={handleStockOut} className="auth-button" style={{ width: 'auto', background: '#ef4444' }}>Stock Out</button>
                        </div>
                    </form>
                </div>
            )}

            {tab === 'damaged' && (
                <div className="activity-card" style={{ marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 16 }}>Report Damaged Stock</h3>
                    <form onSubmit={handleDamaged} style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
                        <select value={damaged.partId} onChange={e => setDamaged({ ...damaged, partId: e.target.value })} style={inputStyle} required>
                            <option value="">Select part</option>
                            {items.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="number" placeholder="Damaged quantity" value={damaged.quantity} onChange={e => setDamaged({ ...damaged, quantity: e.target.value })} style={inputStyle} min="1" required />
                        <textarea placeholder="Reason for damage" value={damaged.reason} onChange={e => setDamaged({ ...damaged, reason: e.target.value })} style={{ ...inputStyle, minHeight: 80 }} required />
                        <button type="submit" className="auth-button" style={{ width: 'auto' }}>Report Damaged</button>
                    </form>
                </div>
            )}

            {tab === 'new' && (
                <div className="activity-card" style={{ marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 16 }}>Add New Product</h3>
                    <form onSubmit={handleCreateItem} style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
                        <input type="text" placeholder="Part name *" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={inputStyle} required />
                        <input type="text" placeholder="Part number" value={newItem.partNumber} onChange={e => setNewItem({ ...newItem, partNumber: e.target.value })} style={inputStyle} />
                        <input type="number" step="0.01" placeholder="Retail price *" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} style={inputStyle} required />
                        <input type="number" step="0.01" placeholder="Unit cost" value={newItem.unitCost} onChange={e => setNewItem({ ...newItem, unitCost: e.target.value })} style={inputStyle} />
                        <input type="number" placeholder="Initial stock" value={newItem.initialStock} onChange={e => setNewItem({ ...newItem, initialStock: e.target.value })} style={inputStyle} />
                        <input type="number" placeholder="Min stock level" value={newItem.minStockLevel} onChange={e => setNewItem({ ...newItem, minStockLevel: e.target.value })} style={inputStyle} />
                        <select value={newItem.warehouseId} onChange={e => setNewItem({ ...newItem, warehouseId: e.target.value })} style={inputStyle}>
                            <option value="">Warehouse (optional)</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                        <button type="submit" className="auth-button" style={{ width: 'auto' }}>Create Product</button>
                    </form>
                </div>
            )}

            <div className="activity-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <h3 style={{ margin: 0 }}>Current Inventory</h3>
                    <input 
                        type="text" 
                        placeholder="Search by name or part number..." 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        style={{ ...inputStyle, width: '280px', padding: '8px 12px' }} 
                    />
                </div>
                {loading ? <p>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ color: '#64748b', textAlign: 'left' }}>
                                <th style={{ padding: '8px 0' }}>Part</th>
                                <th style={{ padding: '8px 0' }}>Part Number</th>
                                <th style={{ padding: '8px 0' }}>Stock</th>
                                <th style={{ padding: '8px 0' }}>Min Level</th>
                                <th style={{ padding: '8px 0' }}>Unit Cost</th>
                                <th style={{ padding: '8px 0' }}>Valuation</th>
                                <th style={{ padding: '8px 0' }}>Status</th>
                                {userRole === 'Admin' && <th style={{ padding: '8px 0', textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(p => (
                                <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{p.name}</td>
                                    <td style={{ padding: '10px 0', color: '#64748b' }}>{p.partNumber || '-'}</td>
                                    <td style={{ padding: '10px 0' }}>{p.stockQuantity}</td>
                                    <td style={{ padding: '10px 0' }}>{p.minStockLevel}</td>
                                    <td style={{ padding: '10px 0' }}>${p.unitCost?.toFixed(2)}</td>
                                    <td style={{ padding: '10px 0' }}>${p.valuation?.toFixed(2)}</td>
                                    <td style={{ padding: '10px 0' }}>
                                        <span style={{ padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 'bold',
                                            background: p.stockQuantity === 0 ? '#fee2e2' : p.isLowStock ? '#fef3c7' : '#dcfce7',
                                            color: p.stockQuantity === 0 ? '#b91c1c' : p.isLowStock ? '#b45309' : '#166534' }}>
                                            {p.stockQuantity === 0 ? 'Out of Stock' : p.isLowStock ? 'Low Stock' : 'OK'}
                                        </span>
                                    </td>
                                    {userRole === 'Admin' && (
                                        <td style={{ padding: '10px 0', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => handleDeleteItem(p.id, p.name)}
                                                style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                                                onMouseOver={e => e.currentTarget.style.background = '#fca5a5'}
                                                onMouseOut={e => e.currentTarget.style.background = '#fee2e2'}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={userRole === 'Admin' ? 8 : 7} style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8' }}>
                                        No matching items found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StockTracking;
