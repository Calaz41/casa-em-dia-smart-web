/**
 * Casa em Dia | Registro automático dos pedidos numa Planilha Google
 *
 * Como usar:
 * 1. Crie uma planilha e, na primeira linha, escreva:
 *    Data | Bairro | Serviço | Urgência | Resumo | Pedido do cliente
 * 2. Extensões > Apps Script, apague o que tiver e cole este código.
 * 3. Implantar > Nova implantação > tipo "App da Web"
 *    Executar como: Eu | Quem pode acessar: Qualquer pessoa
 * 4. Copie a URL gerada e cole na variável SHEET_WEBHOOK_URL do Worker.
 */

const NOMES = {
  eletrica: "Elétrica", hidraulica: "Hidráulica", pintura: "Pintura",
  montagem: "Montagem", instalacao: "Instalação", reparos: "Pequenos reparos", fora: "Fora do escopo"
};

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

  aba.appendRow([
    new Date(d.data),
    d.bairro || "-",
    NOMES[d.servico] || d.servico,
    d.urgencia,
    d.resumo,
    d.texto
  ]);

  // pedido urgente fica com a linha pintada, pra ninguém deixar passar
  if (d.urgencia === "alta") {
    aba.getRange(aba.getLastRow(), 1, 1, 6).setBackground("#fdecec");
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
