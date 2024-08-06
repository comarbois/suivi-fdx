import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  Modal,
  TouchableOpacity,
  Button,
  Image,
  Alert,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {connectDatabase} from '../../db/db';
import {envoyerCasses, getCasses} from '../../db/casses';
import {FlatList, GestureHandlerRootView} from 'react-native-gesture-handler';
import {getCassesImages} from '../../db/images';
import RNFS from 'react-native-fs';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const base_url = 'https://tbg.comarbois.ma/suivi_fdx/api';
const ListAbimes = ({route, navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [abimes, setAbimes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const getAbimes = async () => {
    try {
      const db = await connectDatabase();
      const abimes = await getCasses(db);
      for (const abime of abimes) {
        const abimeImages = await getCassesImages(db, abime.id);
        abime.images = [];
        for (const image of abimeImages) {
          if (image.uri) {
            image.uri = `file://${image.uri}`;
            abime.images.push(image);
          }
        }
      }
      setAbimes(abimes);
    } catch (error) {
      console.error(error);
    }
  };
  const checkInternet = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected;
  };

  const renderItem = ({item}) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.mouvement}</Text>
        <Text>{item.designation}</Text>
        <Text>{item.quantite}</Text>
        <Text
          style={item.envoye === 'oui' ? {color: 'green'} : {color: 'orange'}}>
          {item.envoye}
        </Text>
        <View style={styles.cardBtns}>
          <TouchableOpacity onPress={() => openModal(item.images)}>
            <Image
              source={require('../../assets/image.png')}
              style={{width:32, height:32}}
            />
          </TouchableOpacity>
          {item.envoye !== 'oui' && (
            <TouchableOpacity
            onPress={() => {
              syncAbime(item);
            }}>
            <Image
              source={require('../../assets/sync.png')}
              style={{width:32, height:32}}
            />
          </TouchableOpacity>
          )}
        
        </View>
      </View>
    );
  };

  const openModal = images => {
    setSelectedImages(images);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImages([]);
  };

  const syncAbime =  async (abime) => {
    try {
      setIsLoading(true);
      const isConnected = await checkInternet();
      const token = await AsyncStorage.getItem('userToken');
      console.log(token);
      if (!isConnected) {
        Alert.alert('Erreur', 'Pas de connexion internet');
        return;
      }
      // get images
      const images = abime.images;
      const imagesData = [];
      
      for (const image of images) {
        const path = image.uri;
        const data = await RNFS.readFile(path.replace('file://', ''), 'base64');
        imagesData.push({data, name: image.name});

      }
      
      const formData = {
        mouvement: abime.mouvement,
        designation: abime.designation,
        quantite: abime.quantite,
        images: imagesData,
        idProduit: abime.idProduit,
        fdx: abime.fdx,
        magasinier: abime.magasinier,
        depot: abime.depot,
        idCreate: abime.idCreate,
        dateCreate: abime.dateCreate,
        bl: abime.bl,
        commentaire: abime.commentaire,
        unite: abime.unite,
        motif: abime.motif,
      };
      const response = await fetch(`${base_url}/abimes/ajout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          
        },
        body: JSON.stringify(formData),
      });
      if (response.status !== 200) {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la synchronisation');
        return;
      }
      const json = await response.json();
      
      if (json.erreur) {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la synchronisation');
        console.log(json.erreur);
        return;
      }
      const db = await connectDatabase();
      const rs = await envoyerCasses(db, abime.id);
      await getAbimes();
      Alert.alert('Succès', 'Synchronisation réussie');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
    
  };

  useEffect(() => {
    const backAction = () => {
      // Custom back handler logic
      navigation.navigate('Home'); // Navigate to the Home screen
      return true; // Prevent default behavior (exit app)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Clean up the event listener
  }, []);
  useEffect(() => {

    // manage back handler
    const backAction = () => {
      navigation.replace('Home');
    };

    const loadData = async () => {
      setIsLoading(true);
      await getAbimes();
      setIsLoading(false);
    };
    loadData();
    BackHandler.addEventListener('hardwareBackPress', backAction);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View style={styles.flex}>
            <Text>{abimes.length} Enregistrements</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Abimes1');
              }}
              style={styles.btnAjouter}>
              <Image
                source={require('../../assets/add.png')}
                style={styles.btnIcon}
              />
              <Text style={styles.btnText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={abimes}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity onPress={closeModal} style={styles.btnClose}>
                  <Image
                    source={require('../../assets/close.png')}
                    style={styles.closeBtn}
                  />
                </TouchableOpacity>
                <FlatList
                  data={selectedImages}
                  keyExtractor={image => image.uri}
                  renderItem={({item}) => (
                    <ImageBackground
                      source={{uri: item.uri}}
                      style={styles.modalImage}
                    />
                  )}
                />
              </View>
            </View>
          </Modal>
        </>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    width: '100%',
    padding: 10,
  },
  btnAjouter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d32f2f',
    padding: 5,
    borderRadius: 5,
    width: 100,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
  },
  btnIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  cardBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  flex: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  modalImage: {
    width: 300,
    height: 200,
    aspectRatio: 16 / 9,
    marginBottom: 10,
  },
  btnClose: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
  },
});

export default ListAbimes;
