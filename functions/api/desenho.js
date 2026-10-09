import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

export async function onRequest(context) {
  const { request, env } = context;

  // 1. Ordem 1: Método (Contrato 405)
  if (request.method !== "POST") {
    return new Response("Método não permitido.", { status: 405 });
  }

  // 2. Ordem 2: Corpo (Contrato 400)
  let body;
  try {
    body = await request.json();
  } catch (erro) {
    return new Response("Corpo ausente ou JSON inválido.", { status: 400 });
  }

  const numero = body.numero;
  if (numero === undefined || !numeroValido(numero)) {
    return new Response("Número ausente, não inteiro ou fora do intervalo.", { status: 400 });
  }

  // 3. Ordem 3: Token (Contrato 401)
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Token ausente ou mal formatado.", { status: 401 });
  }
  
  const token = authHeader.split(" ")[1];
  
  // Validar com o Google (tokeninfo)
  const urlGoogle = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
  const respostaGoogle = await fetch(urlGoogle);

  if (!respostaGoogle.ok) {
    return new Response("Token inválido ou expirado.", { status: 401 });
  }

  const dadosToken = await respostaGoogle.json();

  if (dadosToken.aud !== env.GOOGLE_CLIENT_ID) {
    return new Response("O Client ID não corresponde.", { status: 401 });
  }

  if (dadosToken.email_verified !== "true") {
    return new Response("O e-mail não está verificado.", { status: 401 });
  }

  // 4. Sucesso: Gera o SVG (Contrato 200)
  const svgTexto = gerarDesenho(numero, dadosToken.email);

  return new Response(svgTexto, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml" }
  });
}