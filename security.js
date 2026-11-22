/* BACH AI 4.0 — triagem heurística de possíveis golpes.
 * Sinais não provam fraude; a análise não substitui confirmação pelo canal oficial.
 */

const SIGNALS = [
  [/urgente|imediatamente|última chance|ultima chance|bloqueio hoje|conta será bloqueada|conta sera bloqueada/i, "pressão para agir rapidamente"],

  [/senha|token|código de acesso|codigo de acesso|código sms|codigo sms|cvv|código de verificação|codigo de verificacao/i, "pedido de senha, token ou código de segurança"],

  [/pix|taxa de liberação|taxa de liberacao|pague para receber|depósito antecipado|deposito antecipado/i, "pedido de pagamento antecipado ou transferência"],

  [/prêmio|premio|ganhou|ganhador|sorteio|brinde grátis|brinde gratis/i, "promessa de prêmio ou benefício inesperado"],

  [/instale|baix(e|ar)|acesso remoto|anydesk|teamviewer/i, "pedido para instalar aplicativo ou permitir acesso remoto"],

  [/whatsapp.*suporte|suporte.*whatsapp|fale com.*whatsapp/i, "contato de suposto suporte por canal não confirmado"]
];

function handle(text) {
  const raw = String(text || "").trim();

  const explicit = raw.match(
    /^(?:\/golpe|isso é golpe\??|isso e golpe\??|analise (?:esse|esta|essa) (?:link|mensagem)|verifique (?:esse|esta|essa) (?:link|mensagem))\s*:?\s*([\s\S]*)$/i
  );

  if (!explicit) return null;

  const sample = explicit[1].trim();

  if (!sample) {
    return "🔒 Cole a mensagem ou o link suspeito depois de /golpe para eu procurar sinais de risco.";
  }

  const found = SIGNALS
    .filter(([pattern]) => pattern.test(sample))
    .map(([, label]) => label);

  const urls = sample.match(/https?:\/\/[^\s]+/gi) || [];

  if (urls.some(url => /bit\.ly|tinyurl|t\.co|cutt\.ly|is\.gd/i.test(url))) {
    found.push("link encurtado que esconde o destino final");
  }

  if (urls.some(url => !/^https:\/\//i.test(url))) {
    found.push("endereço sem HTTPS");
  }

  if (!found.length) {
    return "🔎 Não encontrei os sinais mais comuns nesta amostra. Isso NÃO confirma que seja seguro.\n\nNão clique nem informe dados até confirmar o remetente por um canal oficial que você já conheça.";
  }

  return "⚠️ ENCONTREI SINAIS DE RISCO:\n" +
    [...new Set(found)].map(x => "• " + x).join("\n") +

    "\n\nIsso é uma triagem automática, não uma prova definitiva. Não abra o link, não instale aplicativos e não informe senha, token ou código. Confirme diretamente no aplicativo ou site oficial digitado por você.";
}

export const Security = { handle };
