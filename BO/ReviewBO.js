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
            if(params.isMovie){
                const result = await database.executeQuery("public", "getClosestMovieRating", [
                    ss.sessionObject.userId,
                    new Date(Date.now()).toISOString(),
                    params.movieId
                ]);

                if (!result || !result.rows) {
                    return { sts: false, msg: "Error al obtener ultimo review del usuario de la pelicula" };
                }

                return { sts: true, data: result.rows, rating: result.rows.rating };

            } else {
                const result = await database.executeQuery("public", "getClosestSeriesRating", [
                    ss.sessionObject.userId,
                    new Date(Date.now()).toISOString(),
                    params.movieId
                ]);

                if (!result || !result.rows) {
                    return { sts: false, msg: "Error al obtener ultimo review del usuario de la serie" };
                }  

                return { sts: true, data: result.rows, rating: result.rows.rating };
            }

          } catch (error) {
            console.error("Error en getClosestUserRating:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async getMovieReviews(params){
        try { 
            if(params.isMovie) {
                const result = await database.executeQuery("public", "getMovieReviews", [
                    params.movieId
                ]);
            
                if (!result || !result.rows) {
                    return { sts: false, msg: "Error al obtener reviews de la pelicula" };
                }

                return { sts: true, data: result.rows };
                
            } else {
                const result = await database.executeQuery("public", "getSeriesReviews", [
                    params.movieId
                ]);
            
                if (!result || !result.rows) {
                    return { sts: false, msg: "Error al obtener reviews de la serie" };
                }
                
                return { sts: true, data: result.rows };
            }

          } catch (error) {
            console.error("Error en getMovieReviews:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async getMovieRating(params) {
        try {
            
            if(params.isMovie) {
                const result = await database.executeQuery("public", "getMovieRating", [
                    params.movieId,
                    new Date(Date.now()).toISOString()
                ]);

                if (!result || !result.rows) {
                    return { sts: false, msg: "Error al obtener reviews de la pelicula" };
                }

                let sum = 0;
                let number = 0;
                let rating = 0.0;

                for (const element of result.rows) {
                    rating = element.rating;

                    const resultUser = await database.executeQuery("security", "getUserByIdSingle", [
                        element.fk_id_user
                    ]);

                    const resultProfile = await database.executeQuery("security", "getUserProfiles", [
                        resultUser.rows[0].email
                    ]);

                    const pid = parseInt(resultProfile.rows[0].fk_id_profile, 10);
                    if (pid === 8) {
                        sum += (parseFloat(rating) * 20) / 100;
                    } else {
                        sum += parseFloat(rating);
                    }
                    number += 1;
                }

                const ratingsend = number === 0
                    ? "No hay ratings"
                    : sum / number;

                return { sts: true, msg: "Rating de la pelicula calculado con exito", rating: ratingsend };

            } else {
                const result = await database.executeQuery("public", "getSeriesRating", [
                    params.movieId,
                    new Date(Date.now()).toISOString()
                ]);

                if (!result || !result.rows) {
                    return { sts: false, msg: "Error al obtener reviews de la serie" };
                }

                let sum = 0;
                let number = 0;
                let rating = 0.0;

                for (const element of result.rows) {
                    rating = element.rating;

                    const resultUser = await database.executeQuery("security", "getUserByIdSingle", [
                        element.fk_id_user
                    ]);

                    const resultProfile = await database.executeQuery("security", "getUserProfiles", [
                        resultUser.rows[0].email
                    ]);

                    const pid = parseInt(resultProfile.rows[0].fk_id_profile, 10);
                    if (pid === 8) {
                        sum += (parseFloat(rating) * 20) / 100;
                    } else {
                        sum += parseFloat(rating);
                    }
                    number += 1;
                }

                const ratingsend = number === 0
                    ? "No hay ratings"
                    : sum / number;

                return { sts: true, msg: "Rating de la serie calculado con exito", rating: ratingsend };
            }

        } catch (error) {
            console.error("Error en getMovieRatings:", error);
            return { sts: false, msg: "Error al ejecutar la funcion getMovieReviews" };
        }
    }

    async insertReview(params) {
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

                if (resultInsert) {
                    console.log("Serie insertada en la bdd");

                } else {
                    return { sts: false, msg: "No se pudo insertar la serie en la bdd" };
                }


                const result = await database.executeQuery("public", "insertSeriesReview", [
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

    async deleteReview(params) {
      try { 
        if (params.type == 'movie'){
            const resultComment = await database.executeQuery("public", "deleteMovieReviewCommentById", [
                params.reviewId,
            ]);
            if (resultComment && resultComment.rowCount > 0) {
                console.log("eliminado correctamente comentarios de la review pelicula");
            } else {
                return { sts: false, msg: "No se pudo eliminar los comentarios de la review pelicula"};
            }

            const result = await database.executeQuery("public", "deleteMovieReview", [
                params.reviewId,
            ]);
            if (result && result.rowCount > 0) {
                return { sts: true, msg: "eliminado correctamente (review pelicula)" };
            } else {
                return { sts: false, msg: "No se pudo eliminar el (review pelicula)"};
            }

        } else if (params.type == 'series') {
            const resultComment = await database.executeQuery("public", "deleteSeriesReviewCommentById", [
                params.reviewId,
            ]);
            if (resultComment && resultComment.rowCount > 0) {
                console.log("eliminado correctamente comentarios de la review series");
            } else {
                return { sts: false, msg: "No se pudo eliminar los comentarios de la review series"};
            }

            const result = await database.executeQuery("public", "deleteSeriesReview", [
                params.reviewId,
            ]);
            if (result && result.rowCount > 0) {
                return { sts: true, msg: "eliminado correctamente (review serie)" };
            } else {
                return { sts: false, msg: "No se pudo eliminar el (review serie)" };
            }

        }
        
      } catch (error) {
        console.error("Error en deleteReview:", error);
        return { sts: false, msg: "Error al eliminar el review" };
      }
    }

    async getUserReview(params) {
        const userID = params.userId;
        try {
            console.log("El userid: ", userID);
            
            const result = await database.executeQuery("public", "getUserMoviesReview", [userID]);

            if (!result || !result.rows) {
              return { sts: false, msg: "Error al obtener reviews" };
            }
        
            return { sts: true, data: result.rows };
          } catch (error) {
            console.error("Error en getUserReview:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async getUserSeriesReview(params) {
        const userID = params.userId;
        try {
            const result = await database.executeQuery("public", "getUserSeriesReview", [userID]);

            if (!result || !result.rows) {
              return { sts: false, msg: "Error al obtener reviews" };
            }
        
            return { sts: true, data: result.rows };
          } catch (error) {
            console.error("Error en getUserReview:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }
}

module.exports = ReviewBO;