import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {openCamera, openPicker} from 'react-native-image-crop-picker';
import {getProductsFiltered, getProductsUnites} from '../../db/produits';
import {
  beginTransaction,
  commitTransaction,
  connectDatabase,
  rollbackTransaction,
} from '../../db/db';
import {Dropdown} from 'react-native-element-dropdown';
import {getFDXFiltered} from '../../db/fdx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';
import moment from 'moment';
import {insertCasse} from '../../db/casses';
import {insertCasseImage} from '../../db/images';

const motifs = [
  {id: 1, motif: 'Accident'},
  {id: 2, motif: 'Fournisseur'},
  {id: 3, motif: 'Client'},
  {id: 5, motif: 'Autres'},
];

const base_url = 'https://tbg.comarbois.ma/suivi_fdx/api';

const Abimes3 = ({route, navigation}) => {
  const {filters} = route.params;
  const [products, setProducts] = useState([]);
  const [fdxs, setFdxs] = useState([]);
  const [selectedSearch, setSelectedSearch] = useState('produit');
  const [idProduit, setIdProduit] = useState(0);
  const [fdx, setFdx] = useState('');
  const [quantite, setQuantite] = useState(0);
  const [unite, setUnite] = useState('P');
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [unites, setUnites] = useState([]);
  const [motif, setMotif] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [bl, setBl] = useState('');

  const fetchProducts = async () => {
    try {
      const db = await connectDatabase();
      const productsCollection = await getProductsFiltered(db, filters);
      setProducts(productsCollection);
    } catch (err) {
      console.log(err);
    }
  };

  const checkInternet = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  };

  const fetchFdx = async () => {
    try {
      const db = await connectDatabase();
      const fdxCollection = await getFDXFiltered(db, filters);

      setFdxs(fdxCollection);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUnites = async () => {
    try {
      const db = await connectDatabase();
      const unites = await getProductsUnites(db);
      setUnites(unites);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    const connected = await checkInternet();

    if (selectedSearch == 'produit' && idProduit == 0) {
      Alert.alert('Erreur', 'Veuillez selectionner un produit');
      return;
    }
    if (filters.type_stock == 'lots' && fdx == '') {
      Alert.alert('Erreur', 'Veuillez selectionner un fardeaux');
      return;
    }
    if (quantite == 0) {
      Alert.alert('Erreur', 'Veuillez saisir une quantite');
      return;
    }
    if (unite == '') {
      Alert.alert('Erreur', 'Veuillez selectionner une unite');
      return;
    }
    if (motif == '') {
      Alert.alert('Erreur', 'Veuillez selectionner un motif');
      return;
    }
    if (images.length == 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins une image');
      return;
    }
    const data = {
      mouvement: filters.movement,
      depot: filters.depot,
      idProduit,
      quantite,
      unite,
      motif,
      commentaire,
      magasinier: user.fullname,
      idCreate: user.user_id,
      fdx,
      bl,
      dateCreate: moment().format('YYYY-MM-DD HH:mm:ss'),
      envoye: 'non',
    };

    if (connected) {
      // images to base64
      const imagesData = [];
      for (const image of images) {
        const path = image.path;
        const data = await RNFS.readFile(path.replace('file://', ''), 'base64');
        imagesData.push({data});
      }
      const formData = {
        ...data,
        images: imagesData,
      };

      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${base_url}/abimes/ajout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        const json = await response.json();
        if (response.status === 200) {
          if (json.erreur) {
            console.error(json.erreur);
          } else {
            data.envoye = 'oui';
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    const db = await connectDatabase();
    try {
      await beginTransaction(db);
      const result = await insertCasse(db, data);
      console.log(result[0].insertId);
      const lastId = result[0].insertId;
      for (const image of images) {
        await saveImages(image, lastId);
      }
      await commitTransaction(db);
      Alert.alert(
        'Succes',
        data.envoye == 'oui'
          ? 'Synchronisation reussie'
          : 'Enregistrement Local , Synchronisation en attente',
      );
      navigation.replace('ListAbimes');
    } catch (err) {
      Alert.alert('Erreur', "Une erreur est survenue lors de l'enregistrement");
      await rollbackTransaction(db);
      console.log(err);
    }
  };

  const saveImages = async (img, lastId) => {
    const filename = img.path.split('/').pop();
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    console.log(path);

    await RNFS.moveFile(img.path, path);
    const data = {
      idCasse: lastId,
      uri: path,
    };
    try {
      const db = await connectDatabase();
      await insertCasseImage(db, data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const user = await JSON.parse(await AsyncStorage.getItem('user'));
      setUser(user);
      await fetchProducts();
      await fetchUnites();
      if (filters.type_stock == 'lots') {
        await fetchFdx();
      }
      setLoading(false);
    };
    if (filters.type_stock == 'lots') {
      setSelectedSearch('fdx');
    }
    fetchData();
  }, []);

  const [images, setImages] = useState([]);
  const handleOpenCamera = () => {
    openCamera({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(image => {
        setImages([...images, image]);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleOpenGallery = () => {
    openPicker({
      width: 1000,
      height: 700,
      cropping: true,
    })
      .then(image => {
        setImages([...images, image]);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#d32f2f" />
      ) : (
        <>
          <ScrollView>
            <View style={styles.btnsContainer}>
              {filters.type_stock == 'lots' && (
                <TouchableOpacity
                  style={[
                    styles.btn,
                    {borderBottomWidth: 2, borderBottomColor: '#555'},
                    selectedSearch == 'fdx' && {borderBottomColor: '#d32f2f'},
                  ]}
                  onPress={() => setSelectedSearch('fdx')}>
                  <Text
                    style={[
                      styles.btnText,
                      selectedSearch == 'fdx' && {color: '#d32f2f'},
                    ]}>
                    Fardeaux
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.btn,
                  {borderBottomWidth: 2, borderBottomColor: '#555'},
                  selectedSearch == 'produit' && {borderBottomColor: '#d32f2f'},
                ]}
                onPress={() => setSelectedSearch('produit')}>
                <Text
                  style={[
                    styles.btnText,
                    selectedSearch == 'produit' && {color: '#d32f2f'},
                  ]}>
                  Produit
                </Text>
              </TouchableOpacity>
            </View>

            {selectedSearch == 'produit' && (
              <Dropdown
                data={products}
                labelField="designation"
                valueField={'designation'}
                onChange={value => {
                  setIdProduit(value.idProduit);
                }}
                placeholder="Selectionner un produit"
                style={[styles.dropdown, {height: 60}]}
                search
                searchField={['designation']}
                searchPlaceholder="Rechercher un produit"
              />
            )}

            {selectedSearch == 'fdx' && (
              <Dropdown
                data={fdxs}
                labelField="fardaux"
                valueField={'fardaux'}
                onChange={value => {
                  setFdx(value.num_lot);
                  setIdProduit(value.idProduit);
                  setUnite(value.unite);
                }}
                placeholder="Selectionner un fardeaux"
                style={[styles.dropdown, {height: 60}]}
                search
                searchField={['fardaux']}
                searchPlaceholder="Rechercher un fardeaux"
              />
            )}

            {selectedSearch == 'produit' && filters.type_stock == 'lots' && (
              <>
                <Text style={styles.label}>Fardeaux</Text>
                <TextInput
                  style={styles.TextInput}
                  onChangeText={value => setFdx(value)}
                />
              </>
            )}

            <Text style={styles.label}>Unite</Text>
            <Dropdown
              data={unites}
              labelField="unite"
              valueField={'unite'}
              onChange={value => setUnite(value.unite)}
              placeholder="Selectionner une unite"
              style={styles.dropdown}
              value={'P'}
            />

            <Text style={styles.label}>Quantite</Text>
            <TextInput
              style={styles.TextInput}
              keyboardType="numeric"
              onChangeText={value => setQuantite(value)}
            />

            {filters.movement == 'ms' && (
              <>
                <Text style={styles.label}>Bon de livraison</Text>
                <TextInput
                  style={styles.TextInput}
                  onChangeText={value => setBl(value)}
                />
              </>
            )}

            <Text style={styles.label}>Motif</Text>
            <Dropdown
              data={motifs}
              labelField="motif"
              valueField={'motif'}
              onChange={value => setMotif(value.motif)}
              placeholder="Selectionner un motif"
              style={styles.dropdown}
            />
            <Text style={styles.label}>Commentaire</Text>
            <TextInput
              style={[styles.TextInput, {height: 65}]}
              multiline
              onChangeText={value => setCommentaire(value)}
            />

            <View style={{flexDirection: 'row', marginTop: 20}}>
              <TouchableOpacity style={styles.btn} onPress={handleOpenCamera}>
                <Image
                  source={require('../../assets/camera.png')}
                  style={styles.image}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleOpenGallery}>
                <Image
                  source={require('../../assets/gallery.png')}
                  style={styles.image}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 20}}>
              {images.map((image, index) => (
                <ImageBackground
                  key={index}
                  source={{uri: image.path}}
                  style={{
                    width: 100,
                    height: 100,
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                />
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Enregistrer</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Abimes3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fefefe',
    height: '100%',
    paddingBottom: 100,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'start',
    marginTop: 10,
  },
  dropdown: {
    height: 45,
    backgroundColor: 'transparent',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 5,
    marginTop: 10,
    padding: 5,
    color: 'black',
  },

  button: {
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  TextInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    width: '100%',
    borderRadius: 5,
  },

  btn: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#020202',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
    marginBottom: 10,
  },
});
