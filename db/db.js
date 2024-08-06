import {enablePromise, openDatabase} from 'react-native-sqlite-storage';
import {Alert} from 'react-native';

enablePromise(true);

export const connectDatabase = async() => {
    return openDatabase(
        {
          name: 'tbg.db',
          location: 'default',
        },
        () => {
          console.log('Database opened');
        },
        error => {
          console.error(error);
          throw Error('Could not connect to database');
        },
      );
}

export const createTables = async (db) => {
  const productsQuerey = `
        CREATE TABLE IF NOT EXISTS list_produits_inv (
            idProduit INTEGER,
            designation TEXT,
            unit_vente TEXT,
            unit_achat TEXT,
            qualite TEXT,
            categorie TEXT,
            type_stock TEXT,
            imp_loc TEXT,
            fournisseur TEXT,
            longueur DOUBLE,
            largeur DOUBLE,
            epaisseur DOUBLE,
            section TEXT,
            famille TEXT
        )`;

  const fdxQuery = `
        CREATE TABLE IF NOT EXISTS list_fdx_inv (
            idProduit INTEGER ,
            designation TEXT,
            unite TEXT,
            num_lot TEXT,
            solde DOUBLE,
            solde_p DOUBLE,
            fournisseur TEXT,
            qualite TEXT,
            categorie TEXT,
            famille TEXT
        )`;
    
const cassesQuery = `
            CREATE TABLE IF NOT EXISTS casses_mouvements(
                id INTEGER PRIMARY KEY,
                idProduit INTEGER,
                fdx TEXT,
                quantite DOUBLE,
                unite TEXT,
                depot TEXT,
                magasinier TEXT,
                mouvement TEXT,
                bl TEXT,
                motif TEXT,
                commentaire TEXT,
                valid TEXT,
                idCreate INTEGER,
                dateCreate TEXT,
                idModif INTEGER,
                dateModif TEXT,
                idValid INTEGER,
                dateValid TEXT,
                envoye INTEGER
            )`;

  const casseImagesQuery = `
            CREATE TABLE IF NOT EXISTS casse_images(
                id INTEGER PRIMARY KEY,
                idCasse INTEGER,
                uri TEXT
            )`;
              

  try {
    await db.executeSql(productsQuerey);
    await db.executeSql(fdxQuery);
    await db.executeSql(cassesQuery);
    await db.executeSql(casseImagesQuery);
    console.log('Tables created');
  } catch (error) {
    console.error(error);
    throw Error('Could not create tables');
  }
};

export const getTableNames = async (db) => {
    try {
      const tableNames= []
      const results = await db.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      )
      results?.forEach((result) => {
        for (let index = 0; index < result.rows.length; index++) {
          tableNames.push(result.rows.item(index).name)
        }
      })
      return tableNames
    } catch (error) {
      console.error(error)
      throw Error("Failed to get table names from database")
    }
}


// Function to begin a transaction
export const beginTransaction = async (db) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'BEGIN TRANSACTION;',
        [],
        () => {
          console.log('Transaction started');
          resolve();
        },
        (_, error) => {
          console.error('Error starting transaction:', error);
          reject(error);
        }
      );
    });
  });
};

// Function to commit a transaction
export const commitTransaction = async (db) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'COMMIT;',
        [],
        () => {
          console.log('Transaction committed');
          resolve();
        },
        (_, error) => {
          console.error('Error committing transaction:', error);
          reject(error);
        }
      );
    });
  });
};

// Function to rollback a transaction
export const rollbackTransaction = async (db) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'ROLLBACK;',
        [],
        () => {
          console.log('Transaction rolled back');
          resolve();
        },
        (_, error) => {
          console.error('Error rolling back transaction:', error);
          reject(error);
        }
      );
    });
  });
};
// Compare this snippet from screens/Unsplash.jsx:
