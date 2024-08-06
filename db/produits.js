export const createProduct = async (db, product) => {
  const query = `INSERT INTO list_produits_inv (idProduit , designation, unit_vente, unit_achat, qualite, type_stock, imp_loc, fournisseur, longueur, largeur, epaisseur, section, famille, categorie)
                       VALUES (?,?,? ,?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
  try {
    const result = await db.executeSql(query, [
      product.idProduit,
      product.designation,
      product.unit_vente,
      product.unit_achat,
      product.qualite,
      product.type_stock,
      product.imp_loc,
      product.fournisseur,
      product.longueur,
      product.largeur,
      product.epaisseur,
      product.section,
      product.famille,
      product.categorie
    ]);

    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getProducts = async db => {
  const query = `SELECT * FROM list_produits_inv`;
  const products = [];
  try {
    const results = await db.executeSql(query);
    
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        products.push(result.rows.item(index));
      }
    });
    return products;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getProductsFiltered = async (db, filters) => {
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
  const query = `SELECT * FROM list_produits_inv WHERE 1 ${chaine}`;

  const products = [];
  try {
    const results = await db.executeSql(query);
    console.log(results);
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        products.push(result.rows.item(index));
      }
    });
    return products;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const deleteAllProducts = async db => {
  const query = `DELETE FROM list_produits_inv`;
  try {
    const result = await db.executeSql(query);
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getProductsFamille = async db => {
  query = `SELECT DISTINCT famille FROM list_produits_inv ORDER BY famille`;
  const products = [];
  try {
    const results = await db.executeSql(query);
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        products.push(result.rows.item(index));
      }
    });

    return products;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getProductsCategories = async (db, famille) => {
  let chaine = '';
  if (famille != '' && famille != null) {
    chaine = `AND famille = '${famille}'`;
  }

  query = `SELECT DISTINCT categorie, type_stock FROM list_produits_inv WHERE 1 ${chaine} ORDER BY categorie`;
  const products = [];
  try {
    const results = await db.executeSql(query);
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        products.push(result.rows.item(index));
      }
    });

    return products;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getProductsFournisseurs = async (db, famille, categorie) => {
  let chaine = '';
  if (famille != '' && famille != null) {
    chaine = `AND famille = '${famille}'`;
  }
  if (categorie != '' && categorie != null) {
    chaine = chaine + ` AND categorie = '${categorie}'`;
  }

  query = `SELECT DISTINCT fournisseur FROM list_produits_inv WHERE 1 ${chaine} ORDER BY fournisseur`;
  const products = [];
  try {
    const results = await db.executeSql(query);
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        products.push(result.rows.item(index));
      }
    });

    return products;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

export const getProductsQualites = async (db, famille, categorie, fournisseur) => {
  let chaine = '';
  if (famille != '' && famille != null) {
    chaine = `AND famille = '${famille}'`;
  }
  if (categorie != '' && categorie != null) {
    chaine = chaine + ` AND categorie = '${categorie}'`;
  }
  if (fournisseur != '' && fournisseur != null) {
    chaine = chaine + ` AND fournisseur = '${fournisseur}'`;
  }

  query = `SELECT DISTINCT qualite FROM list_produits_inv WHERE qualite IS NOT NULL AND qualite != '' ${chaine} ORDER BY qualite`;
  const products = [];
  try {
    const results = await db.executeSql(query);
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        products.push(result.rows.item(index));
      }
    });

    return products;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getProductsUnites = async db => {
  query = `SELECT DISTINCT unit_vente as unite FROM list_produits_inv ORDER BY unit_vente`;
  const products = [];
  try {
    const results = await db.executeSql(query);
    results?.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        products.push(result.rows.item(index));
      }
    });

    return products;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}


