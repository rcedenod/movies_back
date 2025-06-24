const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

class DataBase {
    constructor(callback) {
        this.callback = callback || (() => {});
        this.Pool = Pool;
        this.query = {};
        this.connection = {};
        this.options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.TOKEN}`
            }
        };
        this.init();
    }

    async init() {
        try {
            await this.loadQueries();
            await this.loadConnection();
            await this.loadMovieGenres();
            await this.loadSeriesGenres();
            await this.loadMovies();
            await this.loadSeries();
            this.callback();
        } catch (error) {
            console.error("Error inicializando la base de datos:", error);
        }
    }

    async executeQuery(schema, queryId, params) {
        let connection;
        try {
            connection = await this.connectionPool.connect();
            let query = this.getQuery(schema, queryId);
            let response = await connection.query(query, params);
            return response;
        } catch (e) {
            console.error("Error ejecutando la consulta:", e.stack || e);
            throw e;
        } finally {
            if (connection) connection.release();
        }
    }

    async loadQueries() {
        try {
            const data = await fs.readFile(path.join(__dirname, "configs/queries.json"), 'utf8');
            this.query = JSON.parse(data);
        } catch (err) {
            console.error("Error cargando queries:", err);
            this.query = {};
        }
    }

    async loadConnection() {
        try {
            const data = await fs.readFile(path.join(__dirname, "configs/connections.json"), 'utf8');
            this.connection = JSON.parse(data);
            this.connectionPool = new this.Pool(this.connection.config[0]);
        } catch (err) {
            console.error("Error cargando conexión:", err);
        }
    }

    async loadMovies() {
        try {
            const resultAPI = await fetch('https://api.themoviedb.org/3/movie/popular?language=es-ES&page=1', this.options);
            
            if (!resultAPI.ok){
                throw new Error(`Error al hacer fetch de peliculas: ${resultAPI.status} ${resultAPI.statusText}`);
            }

            const data = await resultAPI.json();
            
            data.results.forEach(async movie => {

                const result = await this.executeQuery("public", "insertMovies", [
                    movie.id,
                    movie.title,
                    movie.overview,
                    movie.poster_path,
                    movie.release_date
                ]);

                if (!result || !result.rows) {
                    console.error("La consulta no devolvio resultados");
                    throw new Error(`Error al cargar la de pelicula: ${movie.title}`);
                }

                movie.genre_ids.forEach(async genre_id => {
                    const resultGenres = await this.executeQuery("public", "assignMovieGenre", [
                        movie.id,
                        genre_id
                    ]);

                    if (!resultGenres || !resultGenres.rows) {
                        console.error("La consulta no devolvio resultados");
                        throw new Error(`Error al cargar los generos de la pelicula: ${movie.title}`);
                    }
                })

                const resultCast = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?language=es-ES`, this.options);

                if (!resultCast.ok){
                    throw new Error(`Error al hacer fetch del cast de la pelicula ${movie.title}: ${resultCast.status} ${resultCast.statusText}`);
                }

                const castData = await resultCast.json();

                let count = 0;
                for (const person of castData.cast) {

                    if (count >= 6) break; 
                    
                    if (count === 5) {
                        const resultCasting = await this.executeQuery("public", "insertMovieCast", [
                            movie.id,
                            castData.crew[0].name,
                            "Director",
                            "Director",
                            castData.crew[0].id
                        ]);

                        if (!resultCasting || !resultCasting.rows) {
                            console.error("La consulta no devolvio resultados");
                            throw new Error(`Error al cargar el casting de la pelicula: ${movie.title}`);
                        }

                    } else {
                        const resultCasting = await this.executeQuery("public", "insertMovieCast", [
                            movie.id,
                            person.name,
                            person.character,
                            "Actor",
                            person.id
                        ]);

                        if (!resultCasting || !resultCasting.rows) {
                            console.error("La consulta no devolvio resultados");
                            throw new Error(`Error al cargar el casting de la pelicula: ${movie.title}`);
                        }
                    }

                    count++;
                }

            });

        } catch (err) {
            console.error("Error cargando peliculas:", err);
        }
    }

    async loadSeries() {
        try {
            const resultAPI = await fetch('https://api.themoviedb.org/3/tv/popular?language=es-ES&page=1', this.options);
            
            if (!resultAPI.ok){
                throw new Error(`Error al hacer fetch de series: ${resultAPI.status} ${resultAPI.statusText}`);
            }

            const data = await resultAPI.json();
            
            data.results.forEach(async series => {

                const result = await this.executeQuery("public", "insertSeries", [
                    series.id,
                    series.name,
                    series.overview ? series.overview : "N/A",
                    series.first_air_date,
                    series.poster_path
                ]);

                if (!result || !result.rows) {
                    console.error("La consulta no devolvio resultados");
                    throw new Error(`Error al cargar la serie: ${series.name}`);
                }

                series.genre_ids.forEach(async genre_id => {
                    const resultGenres = await this.executeQuery("public", "assignSeriesGenre", [
                        series.id,
                        genre_id
                    ]);

                    if (!resultGenres || !resultGenres.rows) {
                        console.error("La consulta no devolvio resultados");
                        throw new Error(`Error al cargar los generos de la serie: ${series.title}`);
                    }
                })

                const resultCast = await fetch(`https://api.themoviedb.org/3/tv/${series.id}/credits?language=es-ES`, this.options);

                if (!resultCast.ok){
                    throw new Error(`Error al hacer fetch del cast de la serie ${series.name}: ${resultCast.status} ${resultCast.statusText}`);
                }

                const castData = await resultCast.json();

                let count = 0;

                for (const person of castData.cast) {

                    if (count >= 6) break; 

                    const resultCasting = await this.executeQuery("public", "insertSeriesCast", [
                        series.id,
                        person.name,
                        person.character,
                        "Actor",
                        person.id
                    ]);

                    if (!resultCasting || !resultCasting.rows) {
                        console.error("La consulta no devolvio resultados");
                        throw new Error(`Error al cargar el casting de la serie: ${series.name}`);
                    }
                
                    count++;
                }

                for (const person of castData.crew) {

                    const resultCrew = await this.executeQuery("public", "insertSeriesCast", [
                        series.id,
                        person.name,
                        person.known_for_department,
                        person.job,
                        person.id
                    ]);

                    if (!resultCrew || !resultCrew.rows) {
                        console.error("La consulta no devolvio resultados");
                        throw new Error(`Error al cargar el casting de la serie: ${series.name}`);
                    }
                }
            });

        } catch (err) {
            console.error("Error cargando series:", err);
        }
    }

    async loadMovieGenres() {
        try {
            const resultAPI = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=es', this.options);
            
            if (!resultAPI.ok){
                throw new Error(`Error al hacer fetch de generos de peliculas: ${resultAPI.status} ${resultAPI.statusText}`);
            }

            const data = await resultAPI.json();

            data.genres.forEach(async genre => {
                const result = await this.executeQuery("public", "insertMovieGenre", [
                    genre.id,
                    genre.name
                ]);

                if (!result || !result.rows) {
                    console.error("La consulta no devolvio resultados");
                    throw new Error(`Error al cargar el genero de pelicula: ${genre.name}`);
                }
            });

        } catch (err) {
            console.error("Error cargando generos de peliculas:", err);
        }
    }

    async loadSeriesGenres() {
        try {
            const resultAPI = await fetch('https://api.themoviedb.org/3/genre/tv/list?language=es', this.options);
            
            if (!resultAPI.ok){
                throw new Error(`Error al hacer fetch de generos de series: ${resultAPI.status} ${resultAPI.statusText}`);
            }

            const data = await resultAPI.json();

            data.genres.forEach(async genre => {
                const result = await this.executeQuery("public", "insertSeriesGenre", [
                    genre.id,
                    genre.name
                ]);

                if (!result || !result.rows) {
                    console.error("La consulta no devolvio resultados");
                    throw new Error(`Error al cargar el genero de serie: ${genre.name}`);
                }
            });

        } catch (err) {
            console.error("Error cargando generos de series:", err);
        }
    }

    getQuery(schema, queryId) {
        if (!this.query || !this.query[schema] || !this.query[schema][queryId]) {
            throw new Error(`Consulta no encontrada: ${schema}.${queryId}`);
        }
        return this.query[schema][queryId];
    }
}

module.exports = DataBase;
