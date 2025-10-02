'use client'
import React from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/utils/auth';
import { formStyles } from '@/utils/variables';

export default function loginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(email === '' || password === '') {
      alert("Preencha todos os campos");
      return;
    }
    try {
      await loginUser(email, password);
      alert("Usuário logado com sucesso!");
      router.push(redirectPath);
    }
    catch (error) {
      console.log(error);
      alert("Erro ao logar usuário");
    }
  }

  return (
    <div className={formStyles.container}>
      <div className={formStyles.formWrapper}>
        <h1 className={formStyles.title}>Login</h1>
        <form onSubmit={handleSubmit} className={formStyles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className={formStyles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className={formStyles.input}
          />
          <button type="submit" className={formStyles.loginButton}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}