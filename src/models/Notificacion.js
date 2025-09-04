export class Notificacion {
    constructor(reseñaId, userId, message, estado) {
        this.reseñaId = reseñaId;
        this.userId = userId;
        this.message = message;
        this.estado = estado;
        this.fechaRegistro = new Date();
    }
  }
  