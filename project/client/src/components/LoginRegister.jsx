import React from 'react';
import { useState } from 'react';
import '../style.css';

function LoginRegister() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isStrongPassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, role } = registerData;

    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters and include a number.');
      return;
    }

    if (!role) {
      setError('Please select a role.');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();
      if (res.status === 201) {
        setSuccess(data.message);
        setIsSignUp(false);
        setRegisterData({ name: '', email: '', password: '', role: '' });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Registration failed. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { email, password } = loginData;

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.status === 200) {
        localStorage.setItem('token', data.token);
        setSuccess(data.message);
        setLoginData({ email: '', password: '' });

        if (data.role === 'user') {
          window.location.href = '/user';
        } else if (data.role === 'organizer') {
          window.location.href = '/organizer';
        } else {
          setError('Unknown user role');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="full-page">
      <div className={`container ${isSignUp ? 'toggle' : ''}`}>
        <div className="container-form">
          <form className="sign-in" onSubmit={handleLogin}>
            <h2>Sign In</h2>
            <span>Use your email and password</span>
            <div className="container-input">
              <ion-icon name="mail-outline"></ion-icon>
              <input
                type="text"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
            <div className="container-input">
              <ion-icon name="lock-closed-outline"></ion-icon>
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            <button type="submit" className="button">SIGN IN</button>
          </form>
        </div>

        <div className="container-form">
          <form className="sign-up" onSubmit={handleRegister}>
            <h2>Register</h2>
            <span>Use your email to register</span>
            <div className="container-input">
              <ion-icon name="person-outline"></ion-icon>
              <input
                type="text"
                placeholder="Name"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              />
            </div>
            <div className="container-input">
              <ion-icon name="mail-outline"></ion-icon>
              <input
                type="text"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
            </div>
            <div className="container-input">
              <ion-icon name="lock-closed-outline"></ion-icon>
              <input
                type="password"
                placeholder="Password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </div>
            <div className="container-input">
              <select
                value={registerData.role}
                onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                required
              >
                <option value="">Select role</option>
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
              </select>
            </div>
            <button type="submit" className="button">REGISTER</button>
          </form>
        </div>

        <div className="container-welcome">
          <div className="welcome-sign-up welcome">
            <h2>GERAT</h2>
            <p>A web platform for the management of tourism activities</p>
            <p>Enter your personal data to access all the site features</p>
            <button className="button" onClick={() => setIsSignUp(true)}>Register</button>
          </div>
          <div className="welcome-sign-in welcome">
            <h2>GERAT</h2>
            <p>A web platform for the management of tourism activities</p>
            <p>Sign in with your personal data to access all the site features</p>
            <button className="button" onClick={() => setIsSignUp(false)}>Sign In</button>
          </div>
        </div>
      </div>

      {(error || success) && (
        <div style={{
          marginTop: '1rem',
          color: error ? 'crimson' : 'green',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {error || success}
        </div>
      )}
    </div>
  );
}

export default LoginRegister;
