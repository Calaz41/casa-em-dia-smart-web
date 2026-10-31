# Casa em Dia | Assistente de orçamento com IA

Site da Casa em Dia, empresa de manutenção residencial em Curitiba, feito no **Framer** e personalizado com **HTML, CSS e JavaScript**. O destaque é um assistente que lê o problema descrito pelo cliente, classifica com IA (Google Gemini) e entrega a mensagem pronta para o WhatsApp da empresa, registrando o pedido numa planilha.

**Site publicado:** https://silent-scone-402238.framer.app
**Vídeo pitch:** https://LINK-DO-VIDEO

> Projeto da disciplina Padrões Web para No Code e Low Code (Smart Web Experience).

---

## O problema

A empresa só tinha Instagram e WhatsApp. O cliente chegava com "oi, quanto custa?" e a atendente precisava de várias mensagens para descobrir qual era o serviço, o bairro e se era urgente. Muita gente desistia no meio do caminho, e pedido urgente se misturava com pedido que podia esperar.

## O que o site faz

- Apresenta os serviços (elétrica, hidráulica, pintura, montagem, instalações e pequenos reparos), a área atendida e as dúvidas frequentes.
- Mostra se a empresa está **atendendo agora** ou quando volta, sempre no horário de Brasília.
- **Assistente de orçamento:** o cliente escreve o problema com as palavras dele e recebe:
  - o serviço indicado;
  - a urgência (alta, média ou baixa);
  - um valor de referência, tirado da tabela da empresa (a IA não inventa preço);
  - cuidados de segurança quando é o caso (ex.: desligar o disjuntor);
  - a mensagem pronta para enviar ou copiar para o WhatsApp.
- Cada pedido classificado vai para uma **Planilha Google**, com os urgentes destacados em vermelho.
- Se a IA não responder em 25 segundos, o site faz uma **análise local** por palavras-chave. O cliente nunca fica sem resposta.

## Tecnologias e ferramentas

| Parte | Ferramenta |
| --- | --- |
| Site e layout responsivo | Framer (plano gratuito) |
| Código personalizado | HTML, CSS e JavaScript em componentes Embed |
| IA | Google Gemini API (plano gratuito): tenta 3.5 Flash-Lite, 3.6 Flash e 3.8 Flash, nessa ordem |
| Servidor intermediário | Cloudflare Workers (guarda a chave da API) |
| Automação | Google Apps Script + Planilhas Google |
| Integração final | Link `wa.me` do WhatsApp |

## Como o pedido percorre o sistema

```
Cliente digita o problema
        │
        ▼
Embed no Framer (HTML/CSS/JS) ──fetch──▶ Worker Cloudflare ──▶ Gemini
        │                                   │        (JSON: serviço, urgência,
        │                                   │         resumo, cuidados)
        │                                   └──▶ Apps Script ──▶ Planilha
        ▼
Resultado na tela + mensagem pronta ──▶ WhatsApp da empresa

Se o Worker falhar ou demorar: análise local no próprio navegador
```

## Personalizações com padrões web

**HTML**
- Formulário semântico com `<form>`, `<label for>` em todos os campos e `<textarea maxlength="600">`.
- Resultado em lista de definição (`<dl>`, `<dt>`, `<dd>`) e exemplos dentro de `<ul>`.
- `aria-live` no resultado e no contador, `role="alert"` no erro, `aria-busy` no botão durante a análise.

**CSS**
- Cores da marca em variáveis no `:root`.
- Grid de 3 colunas que vira 1 coluna abaixo de 600px; títulos com `clamp()`.
- `:focus-visible` com contorno de 3px para quem navega pelo teclado.
- `prefers-reduced-motion` desliga as animações para quem pediu menos movimento.
- Laranja da marca escurecido para `#b0561a` para atingir contraste AA com texto branco.

**JavaScript**
- Validação do texto antes do envio.
- `fetch` com `AbortController` (timeout de 25 s) e plano B local.
- Escape de HTML em tudo que vem da IA antes de entrar na página.
- Mensagem do WhatsApp montada com `encodeURIComponent` e botão de copiar com a Clipboard API.
- Selo de horário com `Intl.DateTimeFormat` no fuso `America/Sao_Paulo`.

## O recurso inteligente

A IA faz **triagem**: recebe o texto livre e devolve um JSON com `servico`, `urgencia`, `resumo` e `cuidados`. Algumas regras importantes:

- O modelo só pode escolher entre os códigos de serviço da empresa. Resposta fora do formato é descartada pelo Worker.
- Temperatura 0,2 e `responseMimeType: application/json`, para respostas previsíveis.
- Cheiro de gás é sempre "fora do que atendemos", com orientação para sair de casa e ligar 193.
- O texto do cliente vai delimitado e as instruções mandam ignorar comandos dentro dele.
- A chave da API fica como segredo no Worker, nunca no site.

## Estrutura do repositório

```
├── README.md
├── framer/
│   ├── assistente-embed.html   # assistente de orçamento (Embed do Framer)
│   └── status-embed.html       # selo "atendendo agora"
├── servidor/
│   ├── worker.js               # Cloudflare Worker que chama o Gemini
│   └── planilha-apps-script.gs # grava os pedidos na Planilha Google
└── prints/
```

## Prints

| Desktop | Celular |
| --- | --- |
| ![Site no desktop](prints/desktop.png) | ![Site no celular](prints/celular.png) |

| Resultado da IA | Teste do servidor (status 200) |
| --- | --- |
| ![Resultado da análise](prints/resultado-ia.png) | ![Teste do Worker](prints/teste-worker.png) |

![Código no Embed do Framer](prints/framer-embed.png)

## Como testar

1. Abra o site publicado (link no topo).
2. Vá até "Conta pra gente o que aconteceu".
3. Toque num dos exemplos ou escreva algo como *"a torneira da cozinha não para de pingar"*.
4. Clique em **Analisar meu pedido** e confira serviço, urgência e valor.
5. Teste também *"sinto cheiro de gás na cozinha"* para ver a regra de segurança.
6. Use **Copiar mensagem** ou **Enviar pelo WhatsApp**.
7. Para testar acessibilidade, navegue só com `Tab` e `Enter`.

Para testar o assistente fora do Framer, basta abrir `framer/assistente-embed.html` no navegador. Sem a URL do Worker configurada, ele roda com a análise local.

## Como rodar a sua própria versão

1. **Planilha:** crie a planilha, cole `servidor/planilha-apps-script.gs` em Extensões > Apps Script e implante como App da Web.
2. **Gemini:** gere uma API key no Google AI Studio.
3. **Worker:** crie um Worker na Cloudflare, cole `servidor/worker.js` e configure as variáveis:
   - `GEMINI_API_KEY` (segredo)
   - `SHEET_WEBHOOK_URL` (URL do Apps Script)
   - `GEMINI_MODEL` (opcional, se o modelo padrão mudar)
   - `ALLOWED_ORIGINS` (opcional, domínios liberados separados por vírgula)
4. **Framer:** em `framer/assistente-embed.html`, troque `API_URL` e `WHATSAPP`, cole num componente Embed (tipo HTML) e publique.

## Limitações conhecidas

- O Embed do Framer roda num iframe: o CSS não afeta o resto da página e a altura é fixa.
- Os scripts não rodam no preview do editor, só no site publicado.
- O plano gratuito do Gemini tem limite de requisições.
- A análise local é simples e pode errar frases ambíguas; por isso é só o plano B.

## Autor

Daniel Calazans · Projeto acadêmico, 2026
