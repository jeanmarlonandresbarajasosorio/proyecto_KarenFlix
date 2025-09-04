import express from "express";
import {
    crearNotificacion,
    listarNotificaciones,
    cambiarEstado,
} from "../controller/notificacionController.js";
import { auth, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();


router.post("/", auth, crearNotificacion);

router.get("/", auth, listarNotificaciones);

router.post("/estado", auth, cambiarEstado);
export default router;
