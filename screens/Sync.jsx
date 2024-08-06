import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Bar} from 'react-native-progress';
import {connectDatabase} from '../db/db';
import {createProduct, deleteAllProducts} from '../db/produits';
import {createFDX, deleteAllFDX} from '../db/fdx';
import NetInfo from '@react-native-community/netinfo';

const base_url = 'https://tbg.comarbois.ma/suivi_fdx/api';

const Sync = ({route, navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSyncProducts = async () => {
    setProgress(0);
    const token = await AsyncStorage.getItem('userToken');
    setIsLoading(true);
    setModalVisible(true);
    try {
      const db = await connectDatabase();

      const res = await fetch(`${base_url}/abimes/list_produits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status !== 200) {
        setIsLoading(false);
        setModalVisible(false);
        Alert.alert(
          'Erreur',
          'Une erreur est survenue lors de la synchronisation des produits',
        );
        return;
      }

      const json = await res.json();
      const totalProducts = json.length;

      // Batch delete and insert
      await deleteAllProducts(db);

      const chunkSize = 1000; // Number of items to insert per transaction
      for (let i = 0; i < totalProducts; i += chunkSize) {
        const chunk = json.slice(i, i + chunkSize);
        await Promise.all(chunk.map(product => createProduct(db, product).then(res => {
          console.log(res);
        }).catch(err => {
          console.error(err);
        })));

        setProgress((i + chunk.length) / totalProducts);
      }

      setIsLoading(false);
      setModalVisible(false);
      Alert.alert('Succès', 'Synchronisation des produits réussie!');
    } catch (error) {
      setIsLoading(false);
      setModalVisible(false);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la synchronisation des produits',
      );
      console.log(error);
    }
  };

  const handleSyncFDX = async () => {
    setProgress(0);
    const token = await AsyncStorage.getItem('userToken');
    setIsLoading(true);
    setModalVisible(true);

    try {
      const db = await connectDatabase();
      const res = await fetch(`${base_url}/abimes/list_fdx`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status !== 200) {
        setIsLoading(false);
        setModalVisible(false);
        Alert.alert(
          'Erreur',
          'Une erreur est survenue lors de la synchronisation des FDX',
        );
        return;
      }

      const json = await res.json();
      const totalFDX = json.length;

      // Batch delete and insert
      await deleteAllFDX(db);

      const chunkSize = 1000; // Number of items to insert per transaction
      for (let i = 0; i < totalFDX; i += chunkSize) {
        const chunk = json.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(fdx =>
            createFDX(db, fdx).then(res => {
              console.log(res);
            }).catch(err => {
              console.error(err);
            })
          ),
        ); 
        setProgress((i + chunk.length) / totalFDX);
      }

      setIsLoading(false);
      setModalVisible(false);
      Alert.alert('Succès', 'Synchronisation des FDX réussie!');
    } catch (error) {
      setIsLoading(false);
      setModalVisible(false);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la synchronisation des FDX',
      );
      console.log(error);
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        Alert.alert('Erreur', 'Pas de connexion internet');
        navigation.goBack();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Synchronisation en cours...</Text>
            <Text style={styles.modalText}>{Math.round(progress * 100)}%</Text>
            <Bar progress={progress} width={200} color="#d32f2f" />
            <Text style={styles.smallText}>
              Merci de ne pas quitter cette ecran
            </Text>
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
  smallText: {
    fontSize: 12,
    color: '#777',
  },
});

export default Sync;
