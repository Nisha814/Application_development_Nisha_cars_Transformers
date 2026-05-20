import React, { useEffect, useState } from 'react';
import { getMyAppointments, bookAppointment, getMyVehicles } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const inputStyle = { padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', width: '100%' };

const StatusBadge = ({ status }) => {
    const bg = { Pending: '#fef3c7', Confirmed: '#dbeafe', Completed: '#dcfce7', Cancelled: '#fee2e2' };
    const fg = { Pending: '#b45309', Confirmed: '#1d4ed8', Completed: '#166534', Cancelled: '#b91c1c' };
    return (
        <span style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', background: bg[status] || '#f1f5f9', color: fg[status] || '#64748b' }}>
            {status}
        </span>
    );
};

const CustomerAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', serviceDate: '', serviceType: '', notes: '' });
    const [editingAppt, setEditingAppt] = useState(null);

    const load = () => {
        setLoading(true);
        Promise.all([getMyAppointments(), getMyVehicles()])
            .then(([apptRes, vehRes]) => {
                setAppointments(apptRes.data || []);
                setVehicles(vehRes.data || []);
            })
            .catch(() => toast.error('Failed to load appointments'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.serviceDate || !form.serviceType.trim()) {
            toast.error('Service date and type are required');
            return;
        }
        try {
            await bookAppointment({
                vehicleId: form.vehicleId ? parseInt(form.vehicleId, 10) : null,
                serviceDate: new Date(form.serviceDate).toISOString(),
                serviceType: form.serviceType,
                notes: form.notes
            });
            toast.success('Appointment booked');
            setForm({ vehicleId: '', serviceDate: '', serviceType: '', notes: '' });
            setShowForm(false);
            load();
        } catch (err) {
            toast.error(err.message || 'Failed to book appointment');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await cancelAppointment(id);
            toast.success('Appointment cancelled');
            load();
        } catch (err) {
            toast.error(err.message || 'Failed to cancel appointment');
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingAppt.serviceDate || !editingAppt.serviceType.trim()) {
            toast.error('Service date and type are required');
            return;
        }
        try {
            await updateAppointment(editingAppt.id, {
                vehicleId: editingAppt.vehicleId ? parseInt(editingAppt.vehicleId, 10) : null,
                serviceDate: new Date(editingAppt.serviceDate).toISOString(),
                serviceType: editingAppt.serviceType,
                notes: editingAppt.notes
            });
            toast.success('Appointment updated');
            setEditingAppt(null);
            load();
        } catch (err) {
            toast.error(err.message || 'Failed to update appointment');
        }
    };

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>My Appointments</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Book and manage your service appointments</p>
                </div>
            </div>

            {showForm && (
                <div className="activity-card" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Book New Appointment</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', maxWidth: '500px' }}>
                        <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} style={inputStyle}>
                            <option value="">No vehicle (optional)</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} ({v.licensePlate})</option>
                            ))}
                        </select>
                        <input type="datetime-local" value={form.serviceDate} onChange={e => setForm({ ...form, serviceDate: e.target.value })} style={inputStyle} required />
                        <input type="text" placeholder="Service type (e.g. Oil Change)" value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })} style={inputStyle} required />
                        <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} />
                        <button type="submit" className="auth-button" style={{ width: 'auto', padding: '10px 24px' }}>Submit Booking</button>
                    </form>
                </div>
            )}

            {editingAppt && (
                <div className="activity-card" style={{ marginBottom: '20px', border: '1px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '16px' }}>Reschedule / Edit Appointment</h3>
                    <form onSubmit={handleUpdateSubmit} style={{ display: 'grid', gap: '12px', maxWidth: '500px' }}>
                        <select value={editingAppt.vehicleId || ''} onChange={e => setEditingAppt({ ...editingAppt, vehicleId: e.target.value })} style={inputStyle}>
                            <option value="">No vehicle (optional)</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} ({v.licensePlate})</option>
                            ))}
                        </select>
                        <input type="datetime-local" value={editingAppt.serviceDate ? new Date(new Date(editingAppt.serviceDate).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ''} onChange={e => setEditingAppt({ ...editingAppt, serviceDate: e.target.value })} style={inputStyle} required />
                        <input type="text" placeholder="Service type" value={editingAppt.serviceType} onChange={e => setEditingAppt({ ...editingAppt, serviceType: e.target.value })} style={inputStyle} required />
                        <textarea placeholder="Notes" value={editingAppt.notes || ''} onChange={e => setEditingAppt({ ...editingAppt, notes: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="submit" className="auth-button" style={{ width: 'auto', padding: '10px 24px' }}>Save Changes</button>
                            <button type="button" className="auth-button" style={{ width: 'auto', padding: '10px 24px', background: '#e2e8f0', color: '#1e293b' }} onClick={() => setEditingAppt(null)}>Cancel Edit</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="activity-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>All Appointments</h3>
                    <button className="auth-button" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => { setShowForm(!showForm); setEditingAppt(null); }}>
                        {showForm ? 'Cancel' : '+ Book Appointment'}
                    </button>
                </div>
                {loading ? <p>Loading...</p> : appointments.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>No appointments yet. Book your first service above.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {appointments.map(a => (
                            <div key={a.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{a.serviceType}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                                            {new Date(a.serviceDate).toLocaleString()}{a.vehicle ? ` - ${a.vehicle}` : ''}
                                        </div>
                                        {a.notes && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{a.notes}</div>}
                                        {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                                <button onClick={() => setEditingAppt({
                                                    id: a.id,
                                                    vehicleId: a.vehicleId,
                                                    serviceDate: a.serviceDate,
                                                    serviceType: a.serviceType,
                                                    notes: a.notes
                                                })} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', padding: 0, fontWeight: '600' }}>
                                                    ✏️ Edit / Reschedule
                                                </button>
                                                <button onClick={() => handleCancel(a.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', padding: 0, fontWeight: '600' }}>
                                                    ❌ Cancel Booking
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <StatusBadge status={a.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomerAppointments;
