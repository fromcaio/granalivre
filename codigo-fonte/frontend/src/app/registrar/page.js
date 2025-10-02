'use client'
import React from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser, loginUser } from '@/utils/auth';
import { formStyles } from '@/utils/variables';
import Link from 'next/link';

export default function registerPage() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(userName === '' || email === '' || password === '') {
      alert("Preencha todos os campos");
      return;
    }
    try {
      await registerUser(email, userName, password);
      alert("Usuário registrado com sucesso!");
      // Auto-login after registration
      await loginUser(email, password);
      router.push(redirectPath);
    }
    catch (error) {
      console.log(error);
      alert("Erro ao registrar usuário");
    }
  }

  return (
    <div className={formStyles.container}>
      <div className={formStyles.formWrapper}>
        <h1 className={formStyles.title}>Registrar</h1>
        <form onSubmit={handleSubmit} className={formStyles.form}>
          <input
            type="text"
            placeholder="Username"
            value={userName}
            required
            onChange={(e) => setUserName(e.target.value)}
            className={formStyles.input}
          />
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
          <button type="submit" className={formStyles.registerButton}>
            Registrar
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/entrar" className="text-blue-600 hover:text-blue-700 font-semibold">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}