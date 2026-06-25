import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// URL da MockAPI
const API_URL = 'https://6a2b348eb687a7d5cbc4f232.mockapi.io/api/v1/materiais';

import { validarRetirada } from './src/utils/validacoes';

export default function App() {
  // --- Estados da Aplicação ---
  const [materiais, setMateriais] = useState([]);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [loading, setLoading] = useState(false);
  const [valoresAjuste, setValoresAjuste] = useState({});
  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [busca, setBusca] = useState('');

  // --- Funções de Requisição e Efeitos ---

  // GET - Listar materiais
  const getMateriais = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setMateriais(data);
    } catch (err) {
      console.log("Erro no GET:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMateriais();
  }, []);

  // POST / PUT - Cadastrar ou Editar material
  const handleCadastro = async () => {
    if (!nome || !quantidade) {
      alert("Preencha todos os campos!");
      return;
    }

    if (isNaN(Number(quantidade)) || Number(quantidade) < 0) {
      alert("Digite uma quantidade válida!");
      return;
    }

    try {
      if (idEmEdicao) {
        // --- MODO EDIÇÃO (PUT) ---
        const response = await fetch(`${API_URL}/${idEmEdicao}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: nome, quantidade: Number(quantidade) })
        });

        if (response.ok) {
          alert("Material atualizado com sucesso!");
          setIdEmEdicao(null); // Sai do modo edição
          setNome('');
          setQuantidade('');
          getMateriais();
        }
      } else {
        // --- MODO CADASTRO (POST) ---
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: nome, quantidade: Number(quantidade) })
        });

        if (response.ok) {
          setNome('');
          setQuantidade('');
          alert("Material cadastrado com sucesso!");
          getMateriais();
        }
      }
    } catch (err) {
      console.log("Erro no salvar:", err);
    }
  };

  // DELETE - Excluir material
  const handleExcluir = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        getMateriais(); // Atualiza a lista automática após deletar
      }
    } catch (err) {
      console.log("Erro no DELETE:", err);
    }
  };

  // PUT - Registrar baixa/retirada de estoque (Sprint 2)
  const alterarQuantidade = async (item, valorInput) => {
    // Garante que se o input for vazio, nulo ou apenas espaços, assume 1 por padrão
    const quantidadeRetirar = (valorInput && valorInput.trim() !== '') ? Number(valorInput) : 1;

    // Utiliza a função pura obrigatória para validar a regra de negócio
    if (!validarRetirada(item.quantidade, quantidadeRetirar)) {
      alert("Operação inválida! Verifique o saldo disponível ou a quantidade informada.");
      return;
    }

    const novaQuantidade = item.quantidade - quantidadeRetirar;

    if (novaQuantidade === 0) {
      alert(`Atenção: O estoque do material "${item.nome}" acabou de zerar!`);
    }

    try {
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantidade: novaQuantidade
        })
      });

      if (response.ok) {
        getMateriais();
        // Limpa o input do item específico
        setValoresAjuste({ ...valoresAjuste, [item.id]: '' });
      }
    } catch (err) {
      console.log("Erro no PUT:", err);
    }
  };

  const materiaisFiltrados = materiais.filter(item =>
    item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>

      <Text style={styles.description}>
        Este template servirá para desenvolver o projeto responsável por modernizar o controle de insumos médicos do almoxarifado.
        Através desta interface conectada à API, é possível realizar o inventário em tempo real, cadastrar novos materiais e registrar baixas de estoque de forma ágil e segura.
      </Text>

      {/* Inputs de cadastro */}
      <View style={styles.form}>
        <TextInput
          testID="input-nome"
          style={styles.input}
          placeholder="Nome do Material"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          testID="input-quantidade"
          style={styles.input}
          placeholder="Quantidade"
          keyboardType="numeric"
          value={quantidade}
          onChangeText={(texto) => setQuantidade(texto.replace(/[^0-9]/g, ''))}
        />

        <TouchableOpacity
          testID="btn-cadastrar"
          style={styles.button}
          onPress={handleCadastro}
        >
          <Text style={styles.buttonText}>{idEmEdicao ? "Atualizar" : "Cadastrar"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput 
          testID="input-busca"
          style={styles.searchInput}
          placeholder="Buscar material..."
          placeholderTextColor="#718096"
          value={busca}
          onChangeText={setBusca}
        />
        <View style={styles.totalBadge}>
          <Text testID="total-itens" style={styles.totalText}>
            Total: {materiaisFiltrados.length}
          </Text>
        </View>
      </View>

      {/* Lista de estoque */}
      {loading && (
        <ActivityIndicator size="small" color="#000" style={{ marginBottom: 10 }} />
      )}

      <FlatList
        testID="lista-materials"
        data={materiaisFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Define a variável no escopo correto do renderItem
          const valorDigitado = valoresAjuste[item.id] || '';

          return (
            <View style={styles.itemRow}>
              {/* Lado Esquerdo: Nome e Quantidade de Estoque */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.itemText, { marginRight: 10, fontWeight: '500' }]}>{item.nome}</Text>

                  <TouchableOpacity
                    style={{ padding: 4 }}
                    onPress={() => {
                      setIdEmEdicao(item.id);
                      setNome(item.nome);
                      setQuantidade(String(item.quantidade));
                    }}
                  >
                    <FontAwesome name="pencil" size={16} color="#666" />
                  </TouchableOpacity>
                </View>

                <Text style={[
                  styles.itemText,
                  { fontSize: 14, marginTop: 4 },
                  item.quantidade === 0 && { color: 'red', fontWeight: 'bold' }
                ]}>
                  Estoque: {item.quantidade}
                </Text>
              </View>

              {/* Lado Direito: Controles de movimentação e Exclusão (Sprint 2) */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                {/* CONTRATO TÉCNICO: Input com testID="input-retirada" */}
                <TextInput
                  testID="input-retirada"
                  style={styles.inputQuantity}
                  keyboardType="numeric"
                  value={String(valoresAjuste[item.id] ?? '')}
                  placeholder="Qtd."
                  onChangeText={(texto) => {
                    const filtrado = texto.replace(/[^0-9]/g, '');
                    setValoresAjuste({ ...valoresAjuste, [item.id]: filtrado });
                  }}
                />

                {/* CONTRATO TÉCNICO: Botão Baixar com testID="btn-baixar" e parâmetro correto */}
                <TouchableOpacity
                  testID="btn-baixar"
                  style={styles.btnBaixar}
                  onPress={() => alterarQuantidade(item, valorDigitado)}
                >
                  <Text style={{ color: '#2b6cb0', fontWeight: 'bold', fontSize: 13 }}>Baixar</Text>
                </TouchableOpacity>

                {/* CONTRATO TÉCNICO: Botão Deletar com testID="btn-excluir" */}
                <TouchableOpacity
                  testID="btn-excluir"
                  style={{ padding: 4 }}
                  onPress={() => handleExcluir(item.id)}
                >
                  <FontAwesome name="trash" size={18} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    color: '#1a202c',
  },
  description: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
    color: '#2d3748',
  },
  button: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  itemRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  itemStock: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  inputQuantity: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    width: 48,
    borderRadius: 6,
    fontSize: 14,
    color: '#2d3748',
  },
  btnBaixar: {
    backgroundColor: '#ebf8ff', // Fundo azul bem clarinho e elegante
    borderWidth: 1,
    borderColor: '#bee3f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 6,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
    fontSize: 14,
    color: '#2d3748',
  },
  totalBadge: {
    backgroundColor: '#2b6cb0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  totalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});