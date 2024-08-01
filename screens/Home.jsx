import {
  View,
  Text,
  BackHandler,
  Alert,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {verifyToken} from '../hooks/verifyToken';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({route, navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({});

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

  useEffect(() => {
    checkLogin();

    const handleBackPress = () => {
      if (navigation.isFocused()) {
        Alert.alert('Quitter', "Voulez vous quitter l'application ?", [
          {
            text: 'Non',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'Oui',
            onPress: () => {
              AsyncStorage.clear()
                .then(() => {
                  BackHandler.exitApp();
                })
                .catch(error => {
                  console.error('Error clearing AsyncStorage:', error);
                });
            },
          },
        ]);
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  const data = [
    {
      id: 1,
      title: 'Déclarer Abîmés',
      color: '#FF4500',
      members: 8,
      image: require('../assets/abimes.png'),
      view: 'Abimes',
    },
    {
      id: 2,
      title: 'Liste des abîmés',
      color: '#FF4500',
      members: 8,
      image: require('../assets/list.png'),
      view: 'Abimes',
    },
    {
      id: 3,
      title: 'Mis à jour',
      color: '#FF4500',
      members: 8,
      image: require('../assets/sync.png'),
      view: 'Sync',
    },
  ];

  const [options, setOptions] = useState(data);

 

  return isLoading ? (
    <View style={{flex: 1, alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  ) : (
    <View style={styles.container}>
      <Text style={styles.hello}>
        Bonjour <Text style={{color: '#d32f2f'}}>{user.fullname}</Text>{' '}
      </Text>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContainer}
        data={options}
        horizontal={false}
        numColumns={2}
        keyExtractor={item => {
          return item.id;
        }}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              style={[styles.card]}
              onPress={() => {
                navigation.navigate(item.view);
              }}>
              <Image style={styles.cardImage} source={item.image} />
              <Text style={styles.title}>{item.title}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E6E6',
    justifyContent: 'center',
    width: '100%',
  },
  hello: {
    fontSize: 20,
    textAlign: 'center',
    margin: 15,
    fontWeight: 'bold',
  },
  list: {
    marginTop: 30,
  },
  listContainer: {
    alignItems: 'flex-start',
    alignSelf: 'center',
  },
  /******** card **************/
  card: {
    marginHorizontal: 2,
    marginVertical: 4,
    paddingVertical: 10,
    flexBasis: '40%',
    backgroundColor: '#FFF',
    elevation: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },

  cardImage: {
    height: 70,
    width: 70,
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    flex: 1,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Home;
