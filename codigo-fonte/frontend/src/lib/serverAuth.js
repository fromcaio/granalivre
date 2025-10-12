import { cache } from 'react';
import { headers } from 'next/headers'; // Apenas headers é necessário aqui

const SERVER_SIDE_API_URL = process.env.API_URL;

export const validateSession = cache(async () => {
  console.log('--- Executando validateSession ---');
  
  // --- CORREÇÃO APLICADA AQUI ---
  // Primeiro, aguardamos para obter o objeto de cabeçalhos.
  const headerStore = await headers();
  // Então, usamos .get() no objeto resolvido.
  const cookieHeader = headerStore.get('cookie');
  // --- FIM DA CORREÇÃO ---

  if (!cookieHeader) {
    return null;
  }

  const userInfoUrl = `${SERVER_SIDE_API_URL}users/user-info/`;
  const refreshUrl = `${SERVER_SIDE_API_URL}users/refresh/`;

  // 1. Tenta validar com o token de acesso existente.
  try {
    const response = await fetch(userInfoUrl, {
      headers: { 'Cookie': cookieHeader },
      cache: 'no-store',
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('Sessão validada com sucesso com o token de acesso.');
      return userData;
    }

    if (response.status !== 401) {
      console.error(`Erro inesperado na validação da sessão: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('Falha na conexão durante a validação inicial:', error);
    return null;
  }

  // 2. Tenta renovar o token de acesso.
  try {
    console.log('Token de acesso inválido. Tentando renovar...');
    const refreshResponse = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 'Cookie': cookieHeader },
      cache: 'no-store',
    });

    if (!refreshResponse.ok) {
      console.log('Falha ao renovar o token. Sessão inválida.');
      return null;
    }

    const newCookieHeader = refreshResponse.headers.get('set-cookie');
    if (!newCookieHeader) {
      console.log('O backend não retornou um novo cookie de acesso.');
      return null;
    }

    console.log('Token renovado. Validando novamente com o novo token...');
    // 3. Tenta validar novamente com o novo token.
    const finalResponse = await fetch(userInfoUrl, {
      headers: { 'Cookie': newCookieHeader },
      cache: 'no-store',
    });

    if (finalResponse.ok) {
      const userData = await finalResponse.json();
      console.log('Sessão validada com sucesso após a renovação.');
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Falha na conexão durante a renovação do token:', error);
    return null;
  }
});