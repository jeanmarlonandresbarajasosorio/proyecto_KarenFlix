import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { Resena } from "../models/Resena.js";
import { crearNotificacion } from "./notificacionController.js";

// Listar reseñas por película
export const listarPorPelicula = async (req, res) => {
  try {
    const db = getDB();
    const { peliculaId } = req.params;
    const reseñas = await db.collection("resenas").find({ peliculaId: new ObjectId(peliculaId) }).toArray();
    res.json(reseñas);
  } catch (err) {
    res.status(500).json({ msg: "Error al obtener reseñas por película", error: err.message });
  }
};

// Listar reseñas por usuario
export const listarPorUsuario = async (req, res) => {
  try {
    const db = getDB();
    const { usuarioId } = req.params;
    const reseñas = await db.collection("resenas").find({ usuarioId: new ObjectId(usuarioId) }).toArray();
    res.json(reseñas);
  } catch (err) {
    res.status(500).json({ msg: "Error al obtener reseñas por usuario", error: err.message });
  }
};

// Crear reseña
export const crearResena = async (req, res) => {
  try {
    const db = getDB();
    const { peliculaId, titulo, comentario, calificacion } = req.body;

    const nuevaResena = new Resena(
      new ObjectId(peliculaId),
      new ObjectId(req.usuario.id), // del token
      titulo,
      comentario,
      calificacion
    );

    await db.collection("resenas").insertOne(nuevaResena);
    res.status(201).json({ msg: "Reseña creada", reseña: nuevaResena });
    crearNotificacion(nuevaResena._id)
  } catch (err) {
    res.status(500).json({ msg: "Error al crear reseña", error: err.message });
  }
};

// Editar reseña
export const editarResena = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { titulo, comentario, calificacion } = req.body;

    const reseña = await db.collection("resenas").findOne({ _id: new ObjectId(id) });

    if (!reseña) return res.status(404).json({ msg: "Reseña no encontrada" });

    // Solo el autor o un admin puede editar
    if (reseña.usuarioId.toString() !== req.usuario.id && req.usuario.rol !== "Administrador") {
      return res.status(403).json({ msg: "No puedes editar esta reseña" });
    }

    await db.collection("resenas").updateOne(
      { _id: new ObjectId(id) },
      { $set: { titulo, comentario, calificacion } }
    );

    res.json({ msg: "Reseña actualizada" });
  } catch (err) {
    res.status(500).json({ msg: "Error al editar reseña", error: err.message });
  }
};

// Eliminar reseña
export const eliminarResena = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const reseña = await db.collection("resenas").findOne({ _id: new ObjectId(id) });

    if (!reseña) return res.status(404).json({ msg: "Reseña no encontrada" });

    // Solo el autor o un admin puede eliminar
    if (reseña.usuarioId.toString() !== req.usuario.id && req.usuario.rol !== "Administrador") {
      return res.status(403).json({ msg: "No puedes eliminar esta reseña" });
    }

    await db.collection("resenas").deleteOne({ _id: new ObjectId(id) });
    res.json({ msg: "Reseña eliminada" });
  } catch (err) {
    res.status(500).json({ msg: "Error al eliminar reseña", error: err.message });
  }
};

// Cantidad de reseñas por película
export const cantidadPorPelicula = async (req, res) => {
  try {
    const db = getDB();
    const { peliculaId } = req.params;

    const count = await db.collection("resenas").countDocuments({ peliculaId: new ObjectId(peliculaId) });
    res.json({ peliculaId, cantidadResenas: count });
  } catch (err) {
    res.status(500).json({ msg: "Error al contar reseñas", error: err.message });
  }
};

// Promedio de calificación por película
export const promedioCalificacion = async (req, res) => {
  try {
    const db = getDB();
    const { peliculaId } = req.params;

    const pipeline = [
      { $match: { peliculaId: new ObjectId(peliculaId) } },
      { $group: { _id: "$peliculaId", promedio: { $avg: "$calificacion" } } }
    ];

    const result = await db.collection("resenas").aggregate(pipeline).toArray();
    const promedio = result.length > 0 ? result[0].promedio : 0;

    res.json({ peliculaId, promedio });
  } catch (err) {
    res.status(500).json({ msg: "Error al calcular promedio", error: err.message });
  }
};

// Dar like a una reseña
export const darLike = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const userId = new ObjectId(req.usuario.id);

    const reseña = await db.collection("resenas").findOne({ _id: new ObjectId(id) });
    if (!reseña) return res.status(404).json({ msg: "Reseña no encontrada" });

    // Quitar dislike si existía y añadir like si no existe
    await db.collection("resenas").updateOne(
      { _id: new ObjectId(id) },
      {
        $addToSet: { likes: userId }, // Evita duplicados
        $pull: { dislikes: userId }   // Elimina dislike si estaba
      }
    );

    res.json({ msg: "Like agregado a la reseña" });
  } catch (err) {
    res.status(500).json({ msg: "Error al dar like", error: err.message });
  }
};

// Dar dislike a una reseña
export const darDislike = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const userId = new ObjectId(req.usuario.id);

    const reseña = await db.collection("resenas").findOne({ _id: new ObjectId(id) });
    if (!reseña) return res.status(404).json({ msg: "Reseña no encontrada" });

    // Quitar like si existía y añadir dislike si no existe
    await db.collection("resenas").updateOne(
      { _id: new ObjectId(id) },
      {
        $addToSet: { dislikes: userId },
        $pull: { likes: userId }
      }
    );

    res.json({ msg: "Dislike agregado a la reseña" });
  } catch (err) {
    res.status(500).json({ msg: "Error al dar dislike", error: err.message });
  }
};
