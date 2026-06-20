import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { VIBECART_URI } from '../../commoncomponents/service';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('customerToken');
    const stored = sessionStorage.getItem('customerInfo');
    if (token && stored) {
      setIsLoggedIn(true);
      setCustomer(JSON.parse(stored));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${VIBECART_URI}/api/v1/vibe-cart/accounts/validate?type=customer`,
        { email, password }
      );
      const token = data.message || data.token || data.data?.token;
      if (!token) throw new Error('Invalid credentials');
      sessionStorage.setItem('customerToken', token);
      sessionStorage.setItem('customerInfo', JSON.stringify({
        name: data.name || data.firstName || email,
        email: data.email || email,
        id: data.id || data.customerId,
      }));
      setCustomer({
        name: data.name || data.firstName || email,
        email: data.email || email,
        id: data.id || data.customerId,
      });
      setIsLoggedIn(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('customerToken');
    sessionStorage.removeItem('customerInfo');
    setIsLoggedIn(false);
    setCustomer(null);
    setEmail('');
    setPassword('');
  };

  if (isLoggedIn && customer) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-avatar">
            {(customer.name || customer.email)[0].toUpperCase()}
          </div>
          <div className="profile-name">{customer.name}</div>
          <div className="profile-email">{customer.email}</div>
          <div className="profile-actions">
            <button className="profile-btn-outline" onClick={() => navigate('/orders')}>
              My Orders
            </button>
            <button className="profile-btn-outline" onClick={() => navigate('/cart')}>
              My Cart
            </button>
          </div>
          <button className="profile-btn-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-logo">
          <span className="profile-logo-bold">VIBE</span>CART
        </div>
        <p className="profile-subtitle">Sign in to your account</p>
        <form onSubmit={handleLogin}>
          <div className="profile-field">
            <label className="profile-label">Email</label>
            <input
              type="email"
              className="profile-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
          <div className="profile-field">
            <label className="profile-label">Password</label>
            <input
              type="password"
              className="profile-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="profile-error">{error}</div>}
          <button type="submit" className="profile-btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
