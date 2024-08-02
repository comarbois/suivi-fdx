import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {verifyToken} from '../../hooks/verifyToken';
import {Dropdown} from 'react-native-element-dropdown';
import {connectDatabase} from '../../db/db';
import {
  getProductsCategories,
  getProductsFamille,
  getProductsFournisseurs,
  getProductsQualites,
} from '../../db/produits';






const Abimes2 = ({route, navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({});



  const [familles, setFamilles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [qualites, setQualites] = useState([]);
  const [selectedFamille, setSelectedFamille] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [selectedQualite, setSelectedQualite] = useState('');
  const [typeStock, setTypeStock] = useState('');

  const checkLogin = async () => {
    setIsLoading(true);
    const res = await verifyToken();
    if (res) {
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      setUser(user);
    } else {
      navigation.navigate('Login');
    }
    setIsLoading(false);
  };

  const fetchFamilles = async () => {
    try {
      const db = await connectDatabase();
      const familleCollection = await getProductsFamille(db);
      setFamilles(familleCollection);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategories([]);
      const db = await connectDatabase();
      const categories = await getProductsCategories(db, selectedFamille);
      setCategories(categories);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const db = await connectDatabase();
      const fournisseurs = await getProductsFournisseurs(
        db,
        selectedFamille,
        selectedCategorie,
      );
      setFournisseurs(fournisseurs);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchQualites = async () => {
    try {
      const db = await connectDatabase();
      const qualites = await getProductsQualites(
        db,
        selectedFamille,
        selectedCategorie,
        selectedFournisseur,
      );

      setQualites(qualites);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSuivant = () => {
    if (selectedFamille == '') {
      Alert.alert('Erreur', 'Le champ Famille est obligatoire !');
      return;
    }
    if (selectedCategorie == '') {
      Alert.alert('Erreur', 'Le champ Categorie est obligatoire !');
      return;
    }


    const {depot, movement} = route.params;
    console.log('depot', depot);
    console.log('movement', movement);

    const filters = { 
      depot: depot,
      movement: movement,
      famille: selectedFamille,
      categorie: selectedCategorie,
      fournisseur: selectedFournisseur,
      qualite: selectedQualite,
      type_stock: typeStock,
    };


    navigation.navigate('Abimes3', {filters: filters});


    


  }

  useEffect(() => {
    checkLogin();
    const fetchData = async () => {
      setIsLoading(true);
      await fetchFamilles();
      await fetchCategories();
      await fetchFournisseurs();
      await fetchQualites();
      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchCategories();
      await fetchFournisseurs();
      await fetchQualites();
    };
    if (selectedFamille) {
      fetchData();
    }
  }, [selectedFamille]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchFournisseurs();
      await fetchQualites();
    };
    if (selectedCategorie) {
      fetchData();
    }
  }, [selectedCategorie]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchQualites();
    };
    if (selectedFournisseur) {
      fetchData();
    }
  }, [selectedFournisseur]);

  return isLoading ? (
    <View style={{flex: 1, height: '100%', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  ) : (
    <View style={styles.container}>
      <Text style={styles.label}>Famille</Text>
      <Dropdown
        data={familles}
        labelField="famille"
        valueField={'famille'}
        onChange={value => {
          setSelectedFamille(value.famille);
        }}
        placeholder="Selectionner une famille"
        style={styles.dropdown}
        search
        searchField={['famille']}
        searchPlaceholder="Rechercher une famille"
      />

      <Text style={styles.label}>Categorie</Text>
      <Dropdown
        data={categories}
        labelField="categorie"
        valueField={'categorie'}
        onChange={value => {
          setSelectedCategorie(value.categorie);
          setTypeStock(value.type_stock);
          console.log(value);
        }}
        placeholder="Selectionner une categorie"
        style={styles.dropdown}
        search
        searchField={['categorie']}
        searchPlaceholder="Rechercher une categorie"
      />

      <Text style={styles.label}>Fournisseur</Text>
      <Dropdown
        data={fournisseurs}
        labelField="fournisseur"
        valueField={'fournisseur'}
        onChange={value => {
          setSelectedFournisseur(value.fournisseur);
          console.log(value);
        }}
        placeholder="Selectionner un fournisseur"
        style={styles.dropdown}
        search
        searchField={['fournisseur']}
        searchPlaceholder="Rechercher un fournisseur"
      />

      <Text style={styles.label}>Qualite</Text>
      <Dropdown
        data={qualites}
        labelField="qualite"
        valueField={'qualite'}
        onChange={value => {
          setSelectedQualite(value.qualite);
          console.log(value);
        }}
        placeholder="Selectionner une qualite"
        style={styles.dropdown}
        search
        searchField={['qualite']}
        searchPlaceholder="Rechercher une qualite"
      />


      <TouchableOpacity style={styles.button} onPress={handleSuivant} >
        <Text style={styles.buttonText}>Suivant</Text>
      </TouchableOpacity>
      
    </View>
  );
};

export default Abimes2;

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
    height: 50,
    backgroundColor: 'transparent',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 5,
    marginTop: 10,
    padding: 10,
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
});
