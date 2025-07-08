const UserBO = class {
    constructor() {}
  
    async getUsers(params) {
      try {
        const result = await database.executeQuery("security", "getUsers", []);
        if (!result || !result.rows) {
          console.error("La consulta no devolvió resultados");
          return { sts: false, msg: "Error al obtener usuarios" };
        }

        const formattedRows = result.rows.map(user => ({
            ...user,
            birth_date: user.birth_date
              ? user.birth_date.toISOString().split("T")[0]
              : null
          }));

        return { sts: true, data: formattedRows };
      } catch (error) {
        console.error("Error en getUsers:", error);
        return { sts: false, msg: "Error al ejecutar la consulta" };
      }
    }
  

    async createUser(params) {
      try {
        // Validar que existan todos los datos obligatorios
        const { name, lastName, birthDate, email, password, userName} = params;
        
        if (!name || !lastName || !birthDate || !email || !password || !userName) {
          return { sts: false, msg: "Faltan datos obligatorios" };
        }
        console.log(params);
        
        
        // Insertar la persona en la tabla public.person
        const personResult = await database.executeQuery("public", "createPerson", [
          name,
          lastName,
          birthDate
        ]);
        if (!personResult || !personResult.rows || personResult.rows.length === 0) {
          console.error("No se pudo crear la persona");
          return { sts: false, msg: "No se pudo crear la persona" };
        }
        
        // Obtener el id_person generado
        const id_person = personResult.rows[0].id_person;
        console.log(`Persona creada con id_person: ${id_person}`);
        
        // Insertar el usuario en la tabla security.user
        const userResult = await database.executeQuery("security", "createUser", [
          email,
          password,
          userName,
          id_person
        ]);
        if (!(userResult && userResult.rowCount > 0)) {
          return { sts: false, msg: "No se pudo crear el usuario" };
        }
  
        // Obtener el id del usuario recién creado
        const id_user = userResult.rows[0].id_user;
  
        // Insertar en la tabla user_profile para asignar los perfiles al usuario
        let allInserted = true;
        for (let profileId of id_profile) {
          const userProfileResult = await database.executeQuery("security", "createUserProfile", [
            id_user,
            profileId
          ]);
          if (!(userProfileResult && userProfileResult.rowCount > 0)) {
            allInserted = false;
            console.error(`No se pudo asignar el perfil ${profileId} al usuario ${email}`);
          }
        }
        if (allInserted) {
          console.log(`El usuario: ${email} fue creado y asignado a los perfiles correctamente`);
          return { sts: true, msg: "Usuario creado correctamente" };
        } else {
          return { sts: false, msg: "Usuario creado, pero no se pudo asignar uno o más perfiles" };
        }
      } catch (error) {
        console.error("Error en createUser:", error);
        return { sts: false, msg: "Error al crear el usuario" };
      }
    }
  
    async updateUser(params) {
      try {
        // Se espera recibir los siguientes parámetros:
        const { id_user, id_person, name, lastName, email, password, username } = params;
        if (!id_user || !id_person || !name || !lastName || !email || !password || !username) {
          console.log("params: ", params);
          return { sts: false, msg: "Faltan datos obligatorios" };
        }
        
        // Actualizar la persona en la tabla public.person
        const personResult = await database.executeQuery("public", "updatePerson", [
          name,
          lastName,
          id_person
        ]);
        if (!personResult || personResult.rowCount === 0) {
          console.error("No se pudo actualizar la persona");
          return { sts: false, msg: "No se pudo actualizar la persona" };
        }
    
        // Actualizar el usuario en la tabla security.user
        const userResult = await database.executeQuery("security", "updateUser", [
          email,
          password,
          username,
          id_user
        ]);
        if (!userResult || userResult.rowCount === 0) {
          console.error("No se pudo actualizar el usuario");
          return { sts: false, msg: "No se pudo actualizar el usuario" };
        }
    
        return { sts: true, msg: "Usuario actualizado correctamente" };
      } catch (error) {
        console.error("Error en updateUser:", error);
        return { sts: false, msg: "Error al actualizar el usuario" };
      }
    }    
  
async deleteUsers(params) {
  try {
    const { userId, personId } = params;
    if (!userId || !personId) {
      console.log("deleteUsers recibió params incorrectos:", params);
      return { sts: false, msg: "Faltan datos obligatorios" };
    }

    const movReviewsResult = await database.executeQuery(
      "public",
      "getMovieReviewsByUser",
      [userId]
    );
    if (!movReviewsResult || !movReviewsResult.rows) {
      return { sts: false, msg: "Error al obtener las reviews de peliculas del usuario" };
    }
    const movReviewsIds = movReviewsResult.rows.map(r => r.id_review); 
    console.log(`movreviews ${movReviewsIds}`);

    if (movReviewsIds.length > 0) {
      console.log('si movies');
      const pgMovReviewsIds = `{${movReviewsIds.join(",")}}`;

      await database.executeQuery(
        "public",
        "deleteMovieReviewComments",
        [pgMovReviewsIds]
      );

      await database.executeQuery(
        "public",
        "deleteMovieReviews",
        [pgMovReviewsIds]
      );
    }

    const serReviewsResult = await database.executeQuery(
      "public",
      "getSeriesReviewsByUser",
      [userId]
    );
    if (!serReviewsResult || !serReviewsResult.rows) {
      return { sts: false, msg: "Error al obtener las reviews de peliculas del usuario" };
    }
    const serReviewsIds = serReviewsResult.rows.map(r => r.id_review);

    console.log(`serrreviews ${serReviewsIds}`);

    if (serReviewsIds.length > 0) {
      console.log('si series');
      const pgSerReviewsIds = `{${serReviewsIds.join(",")}}`;

      await database.executeQuery(
        "public",
        "deleteSeriesReviewComments",
        [pgSerReviewsIds]
      );

      await database.executeQuery(
        "public",
        "deleteSeriesReviews",
        [pgSerReviewsIds]
      );
    }

    await database.executeQuery(
      "security",
      "deleteAuditByUser",
      [userId]
    );

    await database.executeQuery(
      "security",
      "deleteUserProfileByUserId",
      [userId]
    );

    await database.executeQuery(
      "security",
      "deleteUser",
      [userId]
    );

    await database.executeQuery(
      "public",
      "deletePerson",
      [personId]
    );
 
    return { sts: true, msg: "Usuario y sus dependencias eliminados correctamente" };
  } catch (error) {
    console.error("Error en deleteUsers:", error);
    return { sts: false, msg: "Error al eliminar el usuario y sus datos" };
  }
}
};
  
  module.exports = UserBO;
  