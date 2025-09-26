'use client'
import React from 'react';
import { useState } from 'react';
import { registerUser } from '@/utils/auth';

export default function registerPage() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(userName === '' || email === '' || password === '') {
      alert("Preencha todos os campos");
      return;
    }
    try {
      await registerUser(email, userName, password);
      alert("Usuário registrado com sucesso!");
    }
    catch (error) {
      console.log(error);
      alert("Erro ao registrar usuário");
    }
  }

  return (
    <div>
      <h1>Register Page</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={userName}
          required
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Registrar</button>
      </form>
    </div>
  )
}