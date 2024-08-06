export const createFDX = async (db, fdx) => {
  const query = `INSERT INTO list_fdx_inv (idProduit , designation, unite,  num_lot, solde, solde_p, fournisseur, qualite, categorie, famille)
                         VALUES (?,?,? ,?, ?,  ?, ?, ?, ?, ?)`;
  try {
    const result = await db.executeSql(query, [
      fdx.idProduit,
      fdx.designation,
      fdx.unite,
      fdx.num_lot,
      fdx.solde,
      fdx.solde_p,
      fdx.fournisseur,
      fdx.qualite,
      fdx.categorie,
      fdx.famille
    ]);

    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getFDXFiltered = async (db, filters) => {

  let chaine = '';
  if (filters.famille != '' && filters.famille != null) {
    chaine = `AND famille = '${filters.famille}'`;
  }
  if (filters.categorie != '' && filters.categorie != null) {
    chaine = chaine + ` AND categorie = '${filters.categorie}'`;
  }
  if (filters.fournisseur != '' && filters.fournisseur != null) {
    chaine = chaine + ` AND fournisseur = '${filters.fournisseur}'`;
  }
  if (filters.qualite != '' && filters.qualite != null) {
    chaine = chaine + ` AND qualite = '${filters.qualite}'`;
  }




  const query = ` SELECT *, designation || ' ' || num_lot AS fardaux FROM list_fdx_inv WHERE 1 ${chaine} ORDER BY fardaux`;

  const fdx = [];
  try {
    const results = await db.executeSql(query);
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        fdx.push(result.rows.item(index));
      }
    });
    return fdx;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

export const getFDX = async db => {
  const query = `SELECT * FROM list_fdx_inv`;
  const fdx = [];
  try {
    const results = await db.executeSql(query);
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        fdx.push(result.rows.item(index));
      }
    });
    return fdx;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const deleteAllFDX = async db => {
  const query = `DELETE FROM list_fdx_inv`;
  try {
    const result = await db.executeSql(query);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
