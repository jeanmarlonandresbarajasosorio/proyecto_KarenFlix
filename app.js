import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import rolRoutes from "./src/routes/rolRoutes.js";
import { seedRoles } from "./src/seed/rolSeeder.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger.js";
import rateLimit from "express-rate-limit";
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import categoriaRoutes from "./src/routes/categoriaRoutes.js";
import { seedCategorias } from "./src/seed/categoriaSeeder.js"; // 👈 nuevo
import peliculaRoutes from "./src/routes/peliculaRoutes.js";
import { seedPeliculas } from "./src/seed/peliculaSeeder.js";
import resenaRoutes from "./src/routes/resenaRoutes.js";
import { notificacionRoutes } from "./src/routes/notificacionRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { verificarToken } from "./src/middlewares/auth.js"; // tu middleware JWT


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Limiter global máximo 50 requests cada 15 min
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, 
  message: { msg: "Demasiadas peticiones, intenta de nuevo más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});


dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(limiter);

// Swagger UI docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use("/roles", rolRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/peliculas", peliculaRoutes);
app.use("/resenas", resenaRoutes);
app.use("/notificaciones", notificacionRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.resolve(__dirname, "login.html"));
});

// Middleware para servir estáticos (sin token)
app.use(express.static(path.join(__dirname, "public")));

// Arranque del servidor
async function startServer() {
  try {
    await connectDB();
    await seedRoles(); 
    await seedCategorias();
    await seedPeliculas();

    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📄 Documentación disponible en http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ Error al iniciar servidor:", err);
  }
}

startServer();
