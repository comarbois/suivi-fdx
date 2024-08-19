export const insertCasseImage = async (db, casse) => {
    const query = `INSERT INTO casse_images (
            idCasse,
            uri
        ) VALUES (?,?)`;
    try {
        const result = await db.executeSql(query, [
        casse.idCasse,
        casse.uri
        ]);
        return result;
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

export const deleteCasseImage = async (db, idCasse) => {
    const query = `DELETE FROM casse_images`;
    try {
        const result = await db.executeSql(query);
        return result;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}



export const getCassesImages = async (db, idCasse) => {
    const query = `SELECT * FROM casse_images WHERE idCasse = ${idCasse}`;
    const images = [];
    try {
        const results = await db.executeSql(query);
        
        results?.forEach(result => {
            for (let index = 0; index < result.rows.length; index++) {
                images.push(result.rows.item(index));
            }
        });
        console.log(images);
        return images;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}