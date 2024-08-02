import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {openCamera, openPicker} from 'react-native-image-crop-picker';
import {getProductsFiltered, getProductsUnites} from '../../db/produits';
import {connectDatabase} from '../../db/db';
import {Dropdown} from 'react-native-element-dropdown';
import {getFDX, getFDXFiltered} from '../../db/fdx';
import { Circle } from 'react-native-svg';

const motifs = [
  {id: 1, motif: 'Accident'},
  {id: 2, motif: 'Fournisseur'},  
  {id: 3, motif: 'Client'},
  {id: 5, motif: 'Autres'},
];

const Abimes3 = ({route, navigation}) => {
  const {filters} = route.params;
  const [products, setProducts] = useState([]);
  const [fdxs, setFdxs] = useState([]);
  const [selectedSearch, setSelectedSearch] = useState('produit');
  const [idProduit, setIdProduit] = useState(0);
  const [Fdx, setFdx] = useState('');
  const [quantite, setQuantite] = useState(0);
  const [unite, setUnite] = useState('');
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [unites, setUnites] = useState([]);
  const [motif, setMotif] = useState('');

  const fetchProducts = async () => {
    try {
      const db = await connectDatabase();
      const productsCollection = await getProductsFiltered(db, filters);
      setProducts(productsCollection);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchFdx = async () => {
    try {
      const db = await connectDatabase();
      const fdxCollection = await getFDXFiltered(db, filters);
      console.log(fdxCollection);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProducts();
      await fetchUnites();
      if (filters.type_stock == 'lots') {
        await fetchFdx();
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log(selectedSearch);
  }, [selectedSearch]);

  const [images, setImages] = useState([]);
  const handleOpenCamera = () => {
    openCamera({
      width: 300,
      height: 400,
      cropping: false,
      multiple: true,
    })
      .then(image => {
        console.log(image);
        setImages([...images, image]);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleOpenGallery = () => {
    openPicker({
      width: 300,
      height: 400,
      cropping: false,
    })
      .then(image => {
        console.log(image);
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
              <TouchableOpacity
                style={[
                  styles.btn,
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
              {filters.type_stock == 'lots' && (
                <TouchableOpacity
                  style={[
                    styles.btn,
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
            </View>

            {selectedSearch == 'produit' && (
              <Dropdown
                data={products}
                labelField="designation"
                valueField={'designation'}
                onChange={value => {
                  setIdProduit(value.idProduit);
                  setUnite(value.unite);
                }}
                placeholder="Selectionner un produit"
                style={[styles.dropdown, {height:60}]}
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
                style={[styles.dropdown, {height:60}]}
                search
                searchField={['fardaux']}
                searchPlaceholder="Rechercher un fardeaux"
              />
            )}

            <Text style={styles.label}>Unite</Text>
            <Dropdown
              data={unites}
              labelField="unite"
              valueField={'unite'}
              onChange={value => setUnite(value.unite)}
              placeholder="Selectionner une unite"
              style={styles.dropdown}
            />

            <Text style={styles.label}>Quantite</Text>
            <TextInput
              style={styles.TextInput}
              keyboardType="numeric"
              onChangeText={value => setQuantite(value) }
            />
          
            <Text style={styles.label}>Motif</Text>
            <Dropdown
              data={motifs}
              labelField="motif"
              valueField={'motif'}
              onChange={value => setMotif(value.motif)}
              placeholder="Selectionner un motif"
              style={styles.dropdown}
            />


          </ScrollView>

          <TouchableOpacity style={styles.button}>
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
    backgroundColor: '#2e64e5',
    padding: 10,
    borderRadius: 5,
    marginTop: 40,
    alignItems: 'center',
    position: 'absolute',
    bottom: 1,
    left: 0,
    right: 0,
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
    borderBottomWidth: 2,
    borderBottomColor: '#555',
  },
  btnText: {
    color: '#020202',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
