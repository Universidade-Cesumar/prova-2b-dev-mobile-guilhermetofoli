import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// URL da MockAPI
const API_URL = 'https://6a2b348eb687a7d5cbc4f232.mockapi.io/api/v1/materiais';

// --- Função Pura Obrigatória para o Autograding (Sprint 2) ---
export function validarRetirada(estoqueAtual, quantidadeRetirada) {
  const estoque = Number(estoqueAtual);
  const retirada = Number(quantidadeRetirada);

  // Se não for um número válido, for negativo ou maior que o estoque atual, invalida (false)
  if (isNaN(retirada) || retirada <= 0 || retirada > estoque) {
    return false;
  }
  return true;
}

export default function App() {
  // --- Estados da Aplicação ---
  const [materiais, setMateriais] = useState([]);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [loading, setLoading] = useState(false);
  const [valoresAjuste, setValoresAjuste] = useState({});
  const [idEmEdicao, setIdEmEdicao] = useState(null);

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
    // Se o campo estiver vazio, assume 1 por padrão
    const quantidadeRetirar = valorInput ? Number(valorInput) : 1;

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
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

{/* Lista de estoque */}
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <FlatList
          testID="lista-materiais"
          data={materiais}
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
                    style={{ 
                      borderWidth: 1, 
                      borderColor: '#ccc', 
                      textAlign: 'center', 
                      padding: 4, 
                      width: 55, 
                      marginHorizontal: 6, 
                      borderRadius: 3,
                      fontSize: 14
                    }}
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
                    style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#007bff', borderRadius: 3, marginRight: 15 }}
                    onPress={() => alterarQuantidade(item, valorDigitado)}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Baixar</Text>
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
  }
});