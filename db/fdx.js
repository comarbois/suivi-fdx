export const createFDX = async (db, fdx) => {
  const query = `INSERT INTO list_fdx_inv (idProduit , designation, unite, quantite, num_lot, solde, solde_p, fournisseur)
                         VALUES (?,?,? ,?, ?, ?, ?, ?)`;
  try {
    const result = await db.executeSql(query, [
      fdx.idProduit,
      fdx.designation,
      fdx.unite,
      fdx.quantite,
      fdx.num_lot,
      fdx.solde,
      fdx.solde_p,
      fdx.fournisseur,
    ]);

    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

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
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
