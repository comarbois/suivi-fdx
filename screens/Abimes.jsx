import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {verifyToken} from '../hooks/verifyToken';
import {Dropdown} from 'react-native-element-dropdown';
import {connectDatabase} from '../db/db';
import {
  getProductsCategories,
  getProductsFamille,
  getProductsFournisseurs,
  getProductsQualites,
} from '../db/produits';

const base_url = 'http://10.0.0.250:8075/tbg/suivi_fdx/api';
const movements = [
  {id: 1, nom: 'Entrer'},
  {id: 2, nom: 'Sortie'},
];

const Abimes = ({route, navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({});
  const [depots, setDepots] = useState([]);
  const [selectedDepot, setSelectedDepot] = useState(0);
  const [selectedMovement, setSelectedMovement] = useState('');

  const [familles, setFamilles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [qualites, setQualites] = useState([]);
  const [selectedFamille, setSelectedFamille] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [selectedQualite, setSelectedQualite] = useState('');

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

  const fetchDepots = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await fetch(`${base_url}/depots/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      Alert.alert('Erreur', 'Session expirée, veuillez vous reconnecter', [
        {
          text: 'Ok',
          onPress: () => {
            AsyncStorage.clear()
              .then(() => {
                navigation.navigate('Login');
              })
              .catch(error => {
                console.error('Error clearing AsyncStorage:', error);
              });
          },
        },
      ]);
    }
    const json = await res.json();
    setDepots(json.depots);
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
      console.log(fournisseurs);
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

  useEffect(() => {
    checkLogin();

    const fetchData = async () => {
      setIsLoading(true);
      await fetchDepots();
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
    console.log(selectedCategorie);
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
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Depot</Text>
      <Dropdown
        data={depots}
        labelField="nom"
        valueField="id"
        onChange={value => {
          setSelectedDepot(value.id);
        }}
        search
        searchField={['nom']}
        searchPlaceholder="Rechercher un depot"
        placeholder="Selectionner un depot"
        style={styles.dropdown}
      />
      <Text style={styles.label}>Mouvement</Text>
      <Dropdown
        data={movements}
        labelField="nom"
        valueField={'nom'}
        onChange={value => {
          setSelectedMovement(value.nom);
        }}
        placeholder="Selectionner un mouvement"
        style={styles.dropdown}
      />

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
        dropdownPosition='top'
      />
    </ScrollView>
  );
};

export default Abimes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fefefe',
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
});
