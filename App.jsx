import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import React, { useCallback, useEffect } from 'react';

import Home from './screens/Home';
import Unsplash from './screens/Unsplash';
import Login from './screens/Login';
import Abimes from './screens/Abimes';
import { connectDatabase, createTables, getTableNames } from './db/db';
import Sync from './screens/Sync';
import { getProducts } from './db/produits';

const Stack = createNativeStackNavigator();



function App() {
  const loadData = useCallback(async () => {
    try {
      const db = await connectDatabase()
      await createTables(db)
      const tableNames = await getTableNames(db)
      console.log(tableNames)
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    loadData()
  }
  , [loadData])


  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Unsplash"
          component={Unsplash}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Abimes"
          component={Abimes}
          options={{
            title: 'Abimes',
            headerStyle: {
              backgroundColor: '#d32f2f',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },

          }}
        />
        <Stack.Screen
          name="Sync"
          component={Sync}
          options={{
            title: 'Mis à jour',
            headerStyle: {
              backgroundColor: '#d32f2f',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },

          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
