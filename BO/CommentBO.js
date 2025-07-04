const CommentBO = class {

    constructor() {}
    
    async getReviewComments(params){
        try {
            if (params.type == 'movie') {
                const result = await database.executeQuery("public", "getMovieReviewComments", [
                    params.reviewId
                ]);
        
                if (!result || !result.rows) {
                return { sts: false, msg: "Error en getMovieReviewComments" };
                }
            
                return { sts: true, data: result.rows };

            } else if (params.type == 'series') {
                const result = await database.executeQuery("public", "getSeriesReviewComments", [
                    params.reviewId
                ]);
        
                if (!result || !result.rows) {
                return { sts: false, msg: "Error en getSeriesReviewComments" };
                }
            
                return { sts: true, data: result.rows };
            }
            
          } catch (error) {
            console.error("Error en getReviewComments:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async insertReviewComment(params) {
        try {
            if (params.type == 'movie') {
                const result = await database.executeQuery("public", "insertMovieReviewComment", [
                    params.reviewId,
                    ss.sessionObject.userId,
                    params.comment,
                    new Date(Date.now()).toISOString()

                ]);
                
                if (result && result.rowCount > 0) {
                    console.log("Comentario insertado en la bdd");
                    return { sts: true, msg: "Se pudo insertar el comentario en la review de la pelicula" };
                } else {
                    return { sts: false, msg: "No se pudo insertar el comentario en la review de la pelicula" };
                }


            } else if (params.type == 'series') {
                const result = await database.executeQuery("public", "insertSeriesReviewComment", [
                    params.reviewId,
                    ss.sessionObject.userId,
                    params.comment,
                    new Date(Date.now()).toISOString()
                ]);
        
                if (result && result.rowCount > 0) {
                    console.log("Comentario insertado en la bdd");
                    return { sts: true, msg: "Se pudo insertar el comentario en la review de la serie" };
                } else {
                    return { sts: false, msg: "No se pudo insertar el comentario en la review de la serie" };
                }
            
                return { sts: true, msg: "Comentario insertado en la review" };
            }
            
          } catch (error) {
            console.error("Error en insertReviewComment:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

}

module.exports = CommentBO;