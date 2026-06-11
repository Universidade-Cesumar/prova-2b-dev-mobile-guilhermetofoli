import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';

// URL da MockAPI
const API_URL = 'https://6a2b348eb687a7d5cbc4f232.mockapi.io/api/v1/materiais';

export default function App() {
  // --- Estados da Aplicação ---
  const [materiais, setMateriais] = useState([]);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [loading, setLoading] = useState(false);
  const [valoresAjuste, setValoresAjuste] = useState({});

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

 // POST - Cadastrar material
  const handleCadastro = async () => {
    if (!nome || !quantidade) {
      alert("Preencha todos os campos!");
      return;
    }

    if (isNaN(Number(quantidade))) {
      alert("A quantidade deve ser apenas números!");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: nome,
          quantidade: Number(quantidade) // Força virar número pra API
        })
      });

      if (response.ok) {
        setNome('');
        setQuantidade('');
        getMateriais(); // Atualiza a lista após postar
      }
    } catch (err) {
      console.log("Erro no POST:", err);
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

 // PUT - Alterar a quantidade com valor dinâmico
  const alterarQuantidade = async (item, mudanca, valorInput) => {
    // Se o campo estiver vazio, assume 1 por padrão. Senão, pega o número digitado.
    const multiplicador = valorInput ? Number(valorInput) : 1;
    
    if (isNaN(multiplicador) || multiplicador <= 0) {
      alert("Digite um valor válido para movimentar!");
      return;
    }

    // Calcula a nova quantidade multiplicando o sinal (+1 ou -1) pelo valor digitado
    const novaQuantidade = item.quantidade + (mudanca * multiplicador);

    // Evita que o estoque fique abaixo de zero nas saídas
    if (novaQuantidade < 0) {
      alert("A quantidade de saída é maior do que o estoque disponível!");
      return;
    }

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
            const valorDigitado = valoresAjuste[item.id] || '1'; // Padrão é 1 se tiver vazio

            return (
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemText}>{item.nome}</Text>
                  <Text style={[
                    styles.itemText, 
                    { fontSize: 14, marginTop: 4 },
                    item.quantidade === 0 && { color: 'red', fontWeight: 'bold' }
                  ]}>
                    Estoque: {item.quantidade}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Botão de Diminuir (-) */}
                  <TouchableOpacity 
                    style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#eee', borderRadius: 3 }}
                    onPress={() => alterarQuantidade(item, -1, valorDigitado)}
                  >
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>-</Text>
                  </TouchableOpacity>

                  {/* Input do valor do ajuste em tempo real */}
                  <TextInput
                    style={{ 
                      borderWidth: 1, 
                      borderColor: '#ccc', 
                      textAlign: 'center', 
                      padding: 4, 
                      width: 45, 
                      marginHorizontal: 6, 
                      borderRadius: 3,
                      fontSize: 14
                    }}
                    keyboardType="numeric"
                    value={String(valoresAjuste[item.id] ?? '')}
                    placeholder="1"
                    onChangeText={(texto) => {
                      const filtrado = texto.replace(/[^0-9]/g, '');
                      setValoresAjuste({ ...valoresAjuste, [item.id]: filtrado });
                    }}
                  />

                  {/* Botão de Aumentar (+) */}
                  <TouchableOpacity 
                    style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#eee', borderRadius: 3, marginRight: 15 }}
                    onPress={() => alterarQuantidade(item, 1, valorDigitado)}
                  >
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>+</Text>
                  </TouchableOpacity>
                  
                  {/* Botão de exclusão */}
                  <TouchableOpacity onPress={() => handleExcluir(item.id)}>
                    <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 16 }}>X</Text>
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