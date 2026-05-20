import React, { useEffect, useState } from 'react';
import { getMyReviews, submitReview } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const inputStyle = { padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', width: '100%' };

const CustomerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ rating: 5, comment: '' });

    const load = () => {
        setLoading(true);
        getMyReviews()
            .then(res => setReviews(res.data || []))
            .catch(() => toast.error('Failed to load reviews'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitReview({ rating: parseInt(form.rating, 10), comment: form.comment });
            toast.success('Review submitted');
            setForm({ rating: 5, comment: '' });
            setShowForm(false);
            load();
        } catch (err) {
            toast.error(err.message || 'Failed to submit review');
        }
    };

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>My Reviews</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Share your experience with our service center</p>
                </div>
            </div>

            <div className="activity-card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: showForm ? 16 : 0 }}>
                    <h3 style={{ margin: 0 }}>Your Reviews</h3>
                    <button className="auth-button" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Write Review'}
                    </button>
                </div>
                {showForm && (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', maxWidth: '500px', marginTop: '16px' }}>
                        <label>Rating (1-5)</label>
                        <select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} style={inputStyle}>
                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} stars</option>)}
                        </select>
                        <textarea placeholder="Your feedback..." value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} style={{ ...inputStyle, minHeight: '100px' }} />
                        <button type="submit" className="auth-button" style={{ width: 'auto', padding: '10px 24px' }}>Submit Review</button>
                    </form>
                )}
            </div>

            <div className="activity-card">
                {loading ? <p>Loading...</p> : reviews.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>No reviews yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {reviews.map(r => (
                            <div key={r.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ color: '#f59e0b', fontWeight: '700' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                                <p style={{ margin: '8px 0 0', color: '#334155' }}>{r.comment || '(No comment)'}</p>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomerReviews;
