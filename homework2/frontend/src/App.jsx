import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:4000/api';

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', number: '' });
  const [age, setAge] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${API_BASE}/users`);
    const data = await res.json();
    setUsers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUser) {
      await fetch(`${API_BASE}/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setForm({ name: '', email: '', number: '' });
    setSelectedUser(null);
    fetchUsers();
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setForm({ name: user.name, email: user.email, number: user.number });
    setAge(null);
    setPosts([]);
  };

  const handleDelete = async (id) => {
    await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
    fetchUsers();
    if (selectedUser?._id === id) {
      setSelectedUser(null);
      setAge(null);
      setPosts([]);
    }
  };

  const handleDetails = async (user) => {
    const ageRes = await fetch(`${API_BASE}/age/${user.name}`);
    const ageData = await ageRes.json();
    setAge(ageData.age);

    const postRes = await fetch(`${API_BASE}/posts/${user.number}`);
    const postData = await postRes.json();
    setPosts(postData);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>User Analyzer</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Number"
          type="number"
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
          required
        />
        <button type="submit">{selectedUser ? 'Update' : 'Create'}</button>
      </form>

      <hr />

      <ul>
        {users.map((user) => (
          <li key={user._id}>
            <strong>{user.name}</strong> ({user.email}) - #{user.number}{' '}
            <button onClick={() => handleEdit(user)}>Edit</button>{' '}
            <button onClick={() => handleDelete(user._id)}>Delete</button>{' '}
            <button onClick={() => handleDetails(user)}>Details</button>
          </li>
        ))}
      </ul>

      {selectedUser && <div>Editing: {selectedUser.name}</div>}

      {age && (
        <div>
          <div>Estimated Age: {age}</div>
        </div>
      )}

      {posts.length > 0 && (
        <div>
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <strong>{post.title}</strong>
                <p>{post.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;