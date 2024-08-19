export const insertCasse = async (db, casse) => {
    const query = `INSERT INTO casses_mouvements (
            idProduit,
            fdx,
            quantite,
            unite,
            depot,
            magasinier,
            mouvement,
            bl,
            motif,
            commentaire,
            idCreate,
            dateCreate,
            idModif,
            dateModif,
            envoye
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    try {
        const result = await db.executeSql(query, [
        casse.idProduit,
        casse.fdx,
        casse.quantite,
        casse.unite,
        casse.depot,
        casse.magasinier,
        casse.mouvement,
        casse.bl,
        casse.motif,
        casse.commentaire,
        casse.idCreate,
        casse.dateCreate,
        casse.idModif,
        casse.dateModif,
        casse.envoye,
        ]);
        return result;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

export const deleteAllCasses = async db => {    
    const query = `DELETE FROM casses_mouvements`;
    try {
        const result = await db.executeSql(query);
        return result;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}


export const getCasses = async db => {
    const query = `SELECT c.*, p.categorie , p.famille, p.fournisseur, p.designation FROM casses_mouvements c LEFT JOIN list_produits_inv p ON c.idProduit = p.idProduit ORDER BY c.dateCreate DESC`;
    const casses = [];
    try {
        const results = await db.executeSql(query);
        
        results?.forEach(result => {
            for (let index = 0; index < result.rows.length; index++) {
                casses.push(result.rows.item(index));
            }
        });
        return casses;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}


export const envoyerCasses = async (db, idCasse) => {
    const query = `UPDATE casses_mouvements SET envoye = ? WHERE id = ?`;
    try {
        const result = await db.executeSql(query, ['oui', idCasse]);
        return result;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}