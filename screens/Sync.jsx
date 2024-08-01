import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bar } from 'react-native-progress';
import { connectDatabase } from '../db/db';
import { createProduct, deleteAllProducts } from '../db/produits';
import { createFDX, deleteAllFDX } from '../db/fdx';

const base_url = 'http://10.0.0.250:8075/tbg/suivi_fdx/api';

const Sync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSyncProducts = async () => {
    const token = await AsyncStorage.getItem('userToken');
    setIsLoading(true);
    setModalVisible(true);
    try {
      const db = await connectDatabase();
      

      const res = await fetch(`${base_url}/abimes/list_produits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status !== 200) {
        setIsLoading(false);
        setModalVisible(false);
        Alert.alert('Erreur', 'Une erreur est survenue lors de la synchronisation des produits');
        return;
      }

      const json = await res.json();
      const totalProducts = json.length;
      let insertedCount = 0;
      const resDelete = await deleteAllProducts(db);
      
      

      for (const product of json) {
        try {
          const result = await createProduct(db, product);
          console.log(result);
          insertedCount++;
          setProgress(insertedCount / totalProducts);
        } catch (error) {
          console.log(error);
        }
      }

      setIsLoading(false);
      setModalVisible(false);
      Alert.alert('Succès', 'Synchronisation des produits réussie!');
    } catch (error) {
      setIsLoading(false);
      setModalVisible(false);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la synchronisation des produits');
      console.log(error);
    }
  };

  const handleSyncFDX = async () => {
    const token = await AsyncStorage.getItem('userToken');
    setIsLoading(true);
    setModalVisible(true);

    try {
        const db = await connectDatabase();
        const res = await fetch(`${base_url}/abimes/list_fdx`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            }
        });
    
        if (res.status !== 200) {
            setIsLoading(false);
            setModalVisible(false);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la synchronisation des FDX');
            return;
        }
    
        const json = await res.json();
        const totalFDX = json.length;
        let insertedCount = 0;
        await deleteAllFDX(db);
    
        for (const fdx of json) {
            try {
            await createFDX(db, fdx);
            insertedCount++;
            setProgress(insertedCount / totalFDX);
            } catch (error) {
            console.log(error);
            }
        }
    
        setIsLoading(false);
        setModalVisible(false);
        Alert.alert('Succès', 'Synchronisation des FDX réussie!');
    }catch(error) {
      console.log(error);
    }

  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleSyncProducts}>
        <Image style={styles.image} source={require('../assets/sync.png')} />
        <Text style={styles.text}>Mis à jour Produits</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSyncFDX}>
        <Image style={styles.image} source={require('../assets/sync.png')} />
        <Text style={styles.text}>Mis à jour FDX</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Synchronisation en cours...</Text>
            <Bar progress={progress} width={200} color="#d32f2f" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderColor: '#d32f2f',
    borderWidth: 1,
    padding: 20,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 15,
  },
  image: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default Sync;
