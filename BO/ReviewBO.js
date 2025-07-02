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
    console.log(params.genre_ids);
      try {
            if(params.type === 'movie') {
                const resultInsert = await database.executeQuery("public", "insertMovies", [
                    params.filmId,
                    params.title,
                    params.overview,
                    params.poster,
                    params.release_date
                ]);

                console.log(resultInsert);

                if (resultInsert) {
                    console.log("Pelicula insertada en la bdd");
                } else {
                    return { sts: false, msg: "No se pudo insertar la pelicula en la bdd" };
                }

                params.genre_ids.forEach(async genre_id => {
                    const resultGenres = await database.executeQuery("public", "assignMovieGenre", [
                        params.filmId,
                        genre_id.id
                    ]);

                    if (resultGenres) {
                        console.log("Genero insertado");
                    } else {
                        console.error("La consulta no devolvio resultados");
                        return { sts: false, msg: `Error al cargar los generos de la pelicula: ${params.title}`};
                    }
                })

                let count = 0;
                for (const person of params.actors) {

                    if (count >= 6) break; 
                    
                    const resultCasting = await database.executeQuery("public", "insertMovieCast", [
                            params.filmId,
                            person.name,
                            person.character,
                            "Actor",
                            person.id
                        ]);

                        if (resultCasting) {
                            console.log('casting insertado');
                        } else {
                            console.error("La consulta no devolvio resultados");
                            return { sts: false, msg:`Error al cargar el casting de la pelicula: ${params.title}`};
                        }

                    count++;
                }

                for (const person of params.directors) {

                    const resultCrew = await database.executeQuery("public", "insertMovieCast", [
                        params.filmId,
                        person.name,
                        person.job,
                        person.known_for_department,
                        person.id
                    ]);

                    if (resultCrew) {
                            console.log('crew insertado');
                        } else {
                            console.error("La consulta no devolvio resultados");
                            return { sts: false, msg:`Error al cargar el crew de la pelicula: ${params.title}`};
                        }

                    count++;
                }

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
                const resultInsert = await database.executeQuery("public", "insertSeries", [
                    params.filmId,
                    params.name,
                    params.overview,
                    params.first_air_date,
                    params.poster
                ]);

                if (resultInsert && resultInsert.rowCount > 0) {
                    console.log("Serie insertada en la bdd");
                } else {
                    return { sts: false, msg: "No se pudo insertar la serie en la bdd" };
                }


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