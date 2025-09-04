import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { Notificacion } from "../models/Notificacion.js";

export const crearNotificacion = async (req, res) => {
    try {
        const { resenaId } = req.body;

        // Validar que el ID sea un ObjectId válido
        if (!ObjectId.isValid(resenaId)) {
            return res.status(400).json({ msg: "El ID de la reseña no es válido" });
        }

        const db = getDB();

        // Verificar que la categoría exista
        const resena = await db
            .collection("resenas")
            .findOne({ _id: new ObjectId(resenaId) });

        if (!resena) {
            return res.status(400).json({ msg: "La reseña especificada no existe" });
        }

        const userId = req.usuario.id;
        const mensaje = "El usuario ha creado una reseña"
        const estado = "pendiente"

        const newNotificacion = new Notificacion(
            new ObjectId(resenaId),
            new ObjectId(userId),
            mensaje,
            estado
        );

        const result = await db.collection("notificaciones").insertOne(newNotificacion);

        res
            .status(201)
            .json({ msg: "Notificacion creada", id: result.insertedId });
    } catch (error) {
        console.error("Error al crear la Notificacion:", error);
        res
            .status(500)
            .json({ msg: "Error al crear la Notificacion", error: error.message });
    }
};


export const listarNotificaciones = async (req, res) => {
    try {
        const db = getDB();
        const notis = await db.collection("notificaciones").find().toArray();
        res.json(notis);
    } catch (err) {
        res.status(500).json({ msg: "Error al obtener reseñas por película", error: err.message });
    }
};


// Cambiar estado )
export const cambiarEstado = async (req, res) => {
    try {
      const db = getDB();
      const { estado } = req.body;
  
      const result = await db.collection("notificaciones").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { estado } }
      );
      
      if (estado != "pendiente" || estado != "leida") {
        return res.status(404).json({ msg: "Coloque un estado valido (pendiente / leida)" });
      }

      if (result.matchedCount === 0) {
        return res.status(404).json({ msg: "Película/Serie no encontrada" });
      }
  
      res.json({ msg: `Estado de aprobación actualizado a ${estado}` });
    } catch (error) {
      res.status(500).json({ msg: "Error al cambiar estado de aprobación", error });
    }
  };