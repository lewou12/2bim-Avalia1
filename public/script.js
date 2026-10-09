const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let svgAtual = "";
let tokenAtual = null;

window.tratarLoginGoogle = (resposta) => {
    tokenAtual = resposta.credential;
    mensagem.style.color = "var(--destaque)";
    mensagem.textContent = "Login efetuado! Pode gerar o desenho.";
};

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";
  mensagem.style.color = "var(--erro)";
  area.innerHTML = "";
  botaoBaixar.hidden = true;

  const numero = Number(campoNumero.value);

  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Digite um inteiro entre 1 e 100.";
    return;
  }

  if (!tokenAtual) {
    mensagem.textContent = "Faça login com o Google para assinar.";
    return;
  }

  try {
    const resposta = await fetch("/api/desenho", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenAtual}`
        },
        body: JSON.stringify({ numero: numero })
    });

    if (!resposta.ok) {
        const erroMsg = await resposta.text();
        mensagem.textContent = `Erro ${resposta.status}: ${erroMsg}`;
        return;
    }

    svgAtual = await resposta.text();
    area.innerHTML = svgAtual;
    botaoBaixar.hidden = false;
  } catch (erro) {
    mensagem.textContent = "Erro de rede ao contactar o servidor.";
  }
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});