import React, { useEffect, useState } from 'react';
import { getMyPartRequests, submitPartRequest } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const inputStyle = { padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', width: '100%' };

const CustomerPartRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ partName: '', vehicleMakeModel: '', description: '' });

    const load = () => {
        setLoading(true);
        getMyPartRequests()
            .then(res => setRequests(res.data || []))
            .catch(() => toast.error('Failed to load part requests'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.partName.trim()) {
            toast.error('Part name is required');
            return;
        }
        try {
            await submitPartRequest(form);
            toast.success('Part request submitted');
            setForm({ partName: '', vehicleMakeModel: '', description: '' });
            setShowForm(false);
            load();
        } catch (err) {
            toast.error(err.message || 'Failed to submit request');
        }
    };

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Part Requests</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Request parts that are currently unavailable</p>
                </div>
            </div>

            <div className="activity-card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: showForm ? 16 : 0 }}>
                    <h3 style={{ margin: 0 }}>Your Requests</h3>
                    <button className="auth-button" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Request'}
                    </button>
                </div>
                {showForm && (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', maxWidth: '500px', marginTop: '16px' }}>
                        <input type="text" placeholder="Part name *" value={form.partName} onChange={e => setForm({ ...form, partName: e.target.value })} style={inputStyle} required />
                        <input type="text" placeholder="Vehicle make/model" value={form.vehicleMakeModel} onChange={e => setForm({ ...form, vehicleMakeModel: e.target.value })} style={inputStyle} />
                        <textarea placeholder="Additional details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} />
                        <button type="submit" className="auth-button" style={{ width: 'auto', padding: '10px 24px' }}>Submit Request</button>
                    </form>
                )}
            </div>

            <div className="activity-card">
                {loading ? <p>Loading...</p> : requests.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>No part requests yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {requests.map(r => (
                            <div key={r.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>{r.partName}</strong>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '10px', background: '#fef3c7', color: '#b45309' }}>{r.status}</span>
                                </div>
                                {r.vehicleMakeModel && <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px' }}>Vehicle: {r.vehicleMakeModel}</p>}
                                {r.description && <p style={{ margin: '4px 0', color: '#334155', fontSize: '14px' }}>{r.description}</p>}
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomerPartRequests;
