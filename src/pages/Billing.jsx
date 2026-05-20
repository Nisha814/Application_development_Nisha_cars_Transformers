import React, { useState, useEffect } from 'react';
import { searchCustomers, getParts, createSale } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const Billing = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    
    const [parts, setParts] = useState([]);
    const [cart, setCart] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState('Paid');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchParts();
    }, []);

    const fetchParts = async () => {
        try {
            const res = await getParts();
            setParts(res.data);
        } catch (error) {
            toast.error("Failed to load inventory parts");
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        try {
            const res = await searchCustomers(searchTerm);
            setCustomers(res.data);
            if (res.data.length === 0) toast.error("No customers found");
        } catch (error) {
            toast.error("Failed to search customers");
        }
    };

    const addToCart = (part) => {
        if (part.stockQuantity <= 0) {
            toast.error("Out of stock!");
            return;
        }
        const existing = cart.find(item => item.partId === part.id);
        if (existing) {
            if (existing.quantity >= part.stockQuantity) {
                toast.error("Cannot exceed available stock");
                return;
            }
            setCart(cart.map(item => item.partId === part.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { partId: part.id, name: part.name, price: part.price, quantity: 1, maxStock: part.stockQuantity }]);
        }
    };

    const removeFromCart = (partId) => {
        setCart(cart.filter(item => item.partId !== partId));
    };

    const updateQuantity = (partId, delta) => {
        setCart(cart.map(item => {
            if (item.partId === partId) {
                const newQ = item.quantity + delta;
                if (newQ > 0 && newQ <= item.maxStock) {
                    return { ...item, quantity: newQ };
                }
            }
            return item;
        }));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (!selectedCustomer) {
            toast.error("Please select a customer first");
            return;
        }
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                customerId: selectedCustomer.id,
                paymentStatus: paymentStatus,
                items: cart.map(item => ({ partId: item.partId, quantity: item.quantity }))
            };
            
            await createSale(payload);
            toast.success("Sale completed successfully!");
            
            // Reset
            setCart([]);
            setSelectedCustomer(null);
            setSearchTerm('');
            setCustomers([]);
            fetchParts(); // Refresh stock
        } catch (error) {
            toast.error(error.message || "Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Point of Sale / Billing</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Process new sales and manage customer billing</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Left Side: Search & Inventory */}
                <div>
                    {/* Customer Selection */}
                    <div className="activity-card" style={{ marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>1. Select Customer</h3>
                        {!selectedCustomer ? (
                            <>
                                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search by name, email, or phone..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ flex: 1, padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    />
                                    <button type="submit" className="auth-button" style={{ width: 'auto', padding: '10px 20px' }}>Search</button>
                                </form>
                                {customers.length > 0 && (
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        {customers.map(c => (
                                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', alignItems: 'center' }}>
                                                <div>
                                                    <strong style={{ display: 'block' }}>{c.fullName}</strong>
                                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{c.email} • {c.phoneNumber}</span>
                                                </div>
                                                <button onClick={() => setSelectedCustomer(c)} className="auth-button" style={{ width: 'auto', padding: '6px 12px', background: '#3b82f6' }}>Select</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '10px', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Active Customer</span>
                                    <strong style={{ display: 'block', fontSize: '18px', marginTop: '4px' }}>{selectedCustomer.fullName}</strong>
                                    <span style={{ fontSize: '14px', color: '#64748b' }}>{selectedCustomer.email}</span>
                                </div>
                                <button onClick={() => { setSelectedCustomer(null); setCustomers([]); setSearchTerm(''); }} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Change</button>
                            </div>
                        )}
                    </div>

                    {/* Inventory Selection */}
                    <div className="activity-card">
                        <h3 style={{ marginBottom: '15px' }}>2. Add Parts</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                            {parts.map(part => (
                                <div key={part.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0' }}>{part.name}</h4>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>PN: {part.partNumber}</p>
                                        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: 'var(--primary)' }}>${part.price.toFixed(2)}</p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: part.stockQuantity > 0 ? '#16a34a' : '#dc2626' }}>
                                            {part.stockQuantity} in stock
                                        </span>
                                        <button 
                                            onClick={() => addToCart(part)}
                                            disabled={part.stockQuantity <= 0}
                                            style={{ 
                                                background: part.stockQuantity > 0 ? 'var(--primary)' : '#cbd5e1', 
                                                color: 'white', 
                                                border: 'none', 
                                                padding: '6px 12px', 
                                                borderRadius: '6px', 
                                                cursor: part.stockQuantity > 0 ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Cart / Checkout */}
                <div>
                    <div className="activity-card" style={{ position: 'sticky', top: '20px' }}>
                        <h3 style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                            Current Order
                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontSize: '14px' }}>{cart.length} items</span>
                        </h3>
                        
                        {cart.length === 0 ? (
                            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🛒</div>
                                Cart is empty
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                                {cart.map(item => (
                                    <div key={item.partId} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #e2e8f0' }}>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{item.name}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>${item.price.toFixed(2)} each</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <button onClick={() => updateQuantity(item.partId, -1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>-</button>
                                            <span style={{ width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.partId, 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>+</button>
                                            <button onClick={() => removeFromCart(item.partId)} style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: '5px', cursor: 'pointer' }}>✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '15px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                                <span>Total:</span>
                                <span>${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Payment Method</label>
                            <select 
                                value={paymentStatus} 
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="Paid">Cash / Card (Paid Now)</option>
                                <option value="Credit">Store Credit (Pay Later)</option>
                            </select>
                        </div>

                        <button 
                            className="auth-button" 
                            onClick={handleCheckout}
                            disabled={loading || cart.length === 0 || !selectedCustomer}
                            style={{ 
                                opacity: (loading || cart.length === 0 || !selectedCustomer) ? 0.7 : 1,
                                height: '50px',
                                fontSize: '16px'
                            }}
                        >
                            {loading ? 'Processing...' : 'Complete Sale'}
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Billing;
