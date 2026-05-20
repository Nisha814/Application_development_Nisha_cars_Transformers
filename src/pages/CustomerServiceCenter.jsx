import React, { useEffect, useState } from 'react';
import { getServiceCenter } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const CustomerServiceCenter = () => {
    const [center, setCenter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getServiceCenter()
            .then(res => setCenter(res.data))
            .catch(() => toast.error('Failed to load service center info'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <p style={{ padding: '40px' }}>Loading...</p>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Service Center</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Location, hours, and contact information</p>
                </div>
            </div>
            <div className="activity-card" style={{ maxWidth: '600px' }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>{center?.name}</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                    <InfoRow icon="📍" label="Address" value={center?.address} />
                    <InfoRow icon="📞" label="Phone" value={center?.phone} />
                    <InfoRow icon="✉️" label="Email" value={center?.email} />
                    <InfoRow icon="🕐" label="Hours" value={center?.hours} />
                    <InfoRow icon="🔧" label="Services" value={center?.services} />
                </div>
            </div>
        </DashboardLayout>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: '15px', color: '#334155' }}>{value}</div>
        </div>
    </div>
);

export default CustomerServiceCenter;
