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
          onChangeText={setQuantidade}
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
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>{item.nome}</Text>
              <Text style={styles.itemText}>Qtd: {item.quantidade}</Text>
            </View>
          )}
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