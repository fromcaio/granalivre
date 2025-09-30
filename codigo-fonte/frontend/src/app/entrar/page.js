'use client'
import React from 'react';
import { useState } from 'react';
import { loginUser } from '@/utils/auth';

export default function loginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(email === '' || password === '') {
      alert("Preencha todos os campos");
      return;
    }
    try {
      await loginUser(email, password);
      alert("Usuário logado com sucesso!");
    }
    catch (error) {
      console.log(error);
      alert("Erro ao logar usuário");
    }
  }

  return (
    <div>
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}