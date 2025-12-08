import React, { useState } from 'react';
import { registerUser } from '@/api/auth';
import './Register.css';

const Register = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    surname: '',
    phoneNumber: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const user = await registerUser(form);
      setMessage(`A confirmation email has been sent to ${user.email}.`);
    } catch (err) {
      setError(err.response?.data || 'Registration failed.');
    }
  };

  return (
    
      <div className="register-container">
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Create Account</h2>
          {message && <p className="success-msg">{message}</p>}
          {error && <p className="error-msg">{error}</p>}

          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
          <input name="name" placeholder="First Name" value={form.name} onChange={handleChange} required />
          <input name="surname" placeholder="Last Name" value={form.surname} onChange={handleChange} required />
          <input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} />

          <button type="submit">Register</button>
        </form>
      </div>
    
  );
};

export default Register;
