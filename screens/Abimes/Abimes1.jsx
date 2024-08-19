import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Dropdown} from 'react-native-element-dropdown';


const movements = [
  {id: 1, nom: 'Recenser', val : 'me'},
  {id: 2, nom: 'Livrer', val : 'ms'},
];

const depots = [
  {id: 18, nom: 'TIT MELLIL'},
  {id: 17, nom: 'ZENATA'},
  {id: 12, nom: 'AGENCE AGADIR'},
  {id: 15, nom: 'TACHFINE'},
  {id: 21, nom: 'AGENCE AGADIR'},
];

const Abimes1 = ({route, navigation}) => {
  const [selectedDepot, setSelectedDepot] = useState(0);
  const [selectedMovement,setSelectedMovement] = useState('');

  const handleSuivant = () => {
    if(selectedDepot == 0){
        Alert.alert("Erreur" , "Le champ Depot est obligatoire !");
        return;
    }
    if(selectedMovement == ''){
        Alert.alert("Erreur", "Le champ Mouvement est obligatoire !")
        return 
    }

    navigation.navigate("Abimes2", {
        depot: selectedDepot,
        movement: selectedMovement
    });



  }
  return (
    <View style={styles.container}>
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
          setSelectedMovement(value.val);
        }}
        placeholder="Selectionner un mouvement"
        style={styles.dropdown}
      />
      <TouchableOpacity style={styles.button} onPress={handleSuivant}>
        <Text style={styles.buttonText}>Suivant</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Abimes1;

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
});
