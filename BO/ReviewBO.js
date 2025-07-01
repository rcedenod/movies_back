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

    async getClosestUserRating(params){
        try {
            const result = await database.executeQuery("public", "getClosestUserRating", [
                ss.sessionObject.userId,
                new Date(Date.now()).toISOString(),
                params.movieId
            ]);

            console.log("Estoy aqui");
            
        
            if (!result || !result.rows) {
              return { sts: false, msg: "Error al obtener ultimo review del usuario" };
            }
        
            return { sts: true, data: result.rows, rating: result.rows.rating };
          } catch (error) {
            console.error("Error en getClosestUserRating:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async getMovieReviews(params){
        try {
            console.log('Hola movie reviews');
            
            const result = await database.executeQuery("public", "getMovieReviews", [
                params.movieId
            ]);
        
            if (!result || !result.rows) {
              return { sts: false, msg: "Error al obtener reviews de la pelicula" };
            }

            console.log("Resultado reviews ", result.rows);
            
        
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
                ss.sessionObject.userId,
                new Date(Date.now()).toISOString()
            ]);

            if (!result || !result.rows) {
                return { sts: false, msg: "Error al obtener reviews de la pelicula" };
            }

            console.log("Informacion obtenida getMovieRatings:", result.rows);
            let sum = 0;
            let number = 0;
            let rating = 0.0;

            result.rows.forEach((element) => {
                rating = element.rating;

                if(parseInt(ss.sessionObject.profile == 8)) {
                    sum += ( parseFloat(rating) * 20 ) / 100;
                    number += 1;
                } else {
                    sum += parseFloat(rating);
                    number += 1;
                }
                
            })
            
            let ratingsend = 0;
            if(number == 0){
                ratingsend = "No hay ratings"
            }
            else {
                ratingsend = sum/number;
            }
            

            return { sts: true, msg: "Rating calculado con exito", rating: ratingsend}

        } catch (error) {
            console.error("Error en getMovieRatings:", error);
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
                const result = await database.executeQuery("public", "insertMovieReview", [
                    ss.sessionObject.userId,
                    params.filmId,
                    params.rating,
                    params.comment,
                    new Date(Date.now()).toISOString()
                    
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
                    params.comment,
                    new Date(Date.now()).toISOString()
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