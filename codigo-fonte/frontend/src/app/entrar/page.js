'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser, getUserInfo } from '@/utils/auth';
import { formStyles } from '@/utils/variables';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // ✅ Check if user is already logged in on page load
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await getUserInfo();
        if (user) {
          alert('Termine sua sessão atual antes de entrar novamente.');
          router.push('/');
        }
      } catch (err) {
        // Not logged in — silently continue
      }
    };
    checkLoginStatus();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email === '' || password === '') {
      alert("Preencha todos os campos");
      return;
    }

    try {
      await loginUser(email, password);
      alert("Usuário logado com sucesso!");
      router.push(redirectPath);
    } catch (error) {
      console.error(error);
      alert("Erro ao logar usuário");
    }
  };

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
        <div className="mt-4 text-center">
          <a
            href={`/cadastrar?redirect=${encodeURIComponent(redirectPath)}`}
            className="text-sm text-gray-600 hover:underline"
          >
            Não tem uma conta? Cadastre-se
          </a>
        </div>
      </div>
    </div>
  );
}