// --- Função Pura Obrigatória para o Autograding (Sprint 2) ---
function validarRetirada(estoqueAtual, quantidadeRetirada) {
  const estoque = Number(estoqueAtual);
  const retirada = Number(quantidadeRetirada);

  // Se não for um número válido, for negativo ou maior que o estoque atual, invalida (false)
  if (isNaN(retirada) || retirada <= 0 || retirada > estoque) {
    return false;
  }
  return true;
}

module.exports = {
  validarRetirada
};