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
        
            }
            
          } catch (error) {
            console.error("Error en insertReviewComment:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async deleteComment(params) {
      try { 
        if (params.type == 'movie'){
            const result = await database.executeQuery("public", "deleteMovieReviewComment", [
                params.commentId,
            ]);
            if (result && result.rowCount > 0) {
            return { sts: true, msg: "Comentario eliminado correctamente (review pelicula)" };
            } else {
            return { sts: false, msg: "No se pudo eliminar el comentario (review pelicula)"};
            }

        } else if (params.type == 'series') {
            const result = await database.executeQuery("public", "deleteSeriesReviewComment", [
                params.commentId,
            ]);
            if (result && result.rowCount > 0) {
            return { sts: true, msg: "Comentario eliminado correctamente (review serie)" };
            } else {
            return { sts: false, msg: "No se pudo eliminar el comentario (review serie)" };
            }

        }
        
      } catch (error) {
        console.error("Error en deleteComment:", error);
        return { sts: false, msg: "Error al eliminar el comentario" };
      }
    }

    async editComment(params) {
        try {
            if (params.type == 'movie') {
                const result = await database.executeQuery("public", "editMovieReviewComment", [
                    params.reviewId,
                    params.comment,
                    params.date,
                    new Date(Date.now()).toISOString()
                ]);
                console.log(result);
                if (result && result.rowCount > 0) {
                    console.log("Comentario editado");
                    return { sts: true, msg: "Se pudo editar el comentario en la review de la pelicula" };
                } else {
                    return { sts: false, msg: "No se pudo editar el comentario en la review de la pelicula" };
                }


            } else if (params.type == 'series') {
                const result = await database.executeQuery("public", "editSeriesReviewComment", [
                    params.reviewId,
                    params.comment,
                    params.date,
                    new Date(Date.now()).toISOString()
                ]);
        
                if (result && result.rowCount > 0) {
                    console.log("Comentario editado");
                    return { sts: true, msg: "Se pudo editar el comentario en la review de la serie" };
                } else {
                    return { sts: false, msg: "No se pudo editar el comentario en la review de la serie" };
                }
        
            }
            
          } catch (error) {
            console.error("Error en insertReviewComment:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

}

module.exports = CommentBO;