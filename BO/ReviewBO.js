const ReviewBO = class {

    constructor() {}
    
    async getReviews(params){
        try {
            const result = await database.executeQuery("public", "getReviews", []);
        
            if (!result || !result.rows) {
              return { sts: false, msg: "Error al obtener reviews" };
            }
        
            return { sts: true, data: result.rows };
          } catch (error) {
            console.error("Error en getReviews:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async getUserReviews(params){
        try {
            const result = await database.executeQuery("public", "getUserReviews", [
                params.userId
            ]);
        
            if (!result || !result.rows) {
              return { sts: false, msg: "Error al obtener reviews del usuario" };
            }
        
            return { sts: true, data: result.rows };
          } catch (error) {
            console.error("Error en getUserReviews:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async getMovieReviews(params){
        try {
            const result = await database.executeQuery("public", "getMovieReviews", [
                params.movieId
            ]);
        
            if (!result || !result.rows) {
              return { sts: false, msg: "Error al obtener reviews de la pelicula" };
            }
        
            return { sts: true, data: result.rows };

          } catch (error) {
            console.error("Error en getMovieReviews:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async getMovieRating(params) {
        try {
            const result = await database.executeQuery("public", "getMovieRating", [
                params.movieId,
                params.userId,
                new Date(Date.now()).toISOString()
            ]);

            if (!result || !result.rows) {
                console.error("Informacion obtenida getMovieRatings:", result);
                return { sts: false, msg: "Error al obtener reviews de la pelicula" };
            }

            console.log("Informacion obtenida getMovieRatings:", result);
            const list = result.rows;
            const sum = 0;
            const number = 0;

            list.forEach((element) => {
                sum += element.rating;
                number += 1;
            })

            return { sts: true, msg: "Rating calculado con exito", rating: sum/number}

        } catch (error) {
            console.error("Error en getMovieReviews:", error);
            return { sts: false, msg: "Error al ejecutar la funcion getMovieReviews" };
        }
    }

    async getSeriesRating(params) {
        try {
            const result = await database.executeQuery("public", "getSeriesRating", [
                params.seriesId,
                params.userId,
                new Date(Date.now()).toISOString()
            ]);

            if (!result || !result.rows) {
                console.error("Informacion obtenida getSeriesRatings:", result);
                return { sts: false, msg: "Error al obtener reviews de la pelicula" };
            }

            console.log("Informacion obtenida getSeriesRatings:", result);
            const list = result.rows;
            const sum = 0;
            const number = 0;

            list.forEach((element) => {
                sum += element.rating;
                number += 1;
            })

            return { sts: true, msg: "Rating calculado con exito", rating: sum/number}

        } catch (error) {
            console.error("Error en getMovieReviews:", error);
            return { sts: false, msg: "Error al ejecutar la funcion getMovieReviews" };
        }
    }

    async getSeriesReviews(params){
        try {
            const result = await database.executeQuery("public", "getSeriesReviews", [
                params.seriesId
            ]);
        
            if (!result || !result.rows) {
              return { sts: false, msg: "Error al obtener reviews de la serie" };
            }
        
            return { sts: true, data: result.rows };
          } catch (error) {
            console.error("Error en getSeriesReviews:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async insertReview(params) {
      try {
            if(params.type === 'movie') {
                const result = await database.executeQuery("public", "insertMovieRating", [
                    ss.sessionObject.userId,
                    params.filmId,
                    params.rating,
                    params.comment
                ]);

                if (result && result.rowCount > 0) {
                    console.log("Review insertado en la pelicula");
                } else {
                    return { sts: false, msg: "No se pudo insertar el review en la pelicula" };
                }
            }

            if(params.type === 'series') {
                const result = await database.executeQuery("public", "insertSeriesRating", [
                    ss.sessionObject.userId,
                    params.filmId,
                    params.rating,
                    params.comment
                ]);

                if (result && result.rowCount > 0) {
                    console.log("Review insertado en la serie");
                } else {
                    return { sts: false, msg: "No se pudo insertar el review en la serie" };
                }
            }
          
        return { sts: true, msg: "Review insertada en la base de datos" };
        
      } catch (error) {
        console.error("Error en insertReview:", error);
        return { sts: false, msg: "Error al insertar review" };
      }
    }

}

module.exports = ReviewBO;