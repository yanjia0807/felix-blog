import type { Core } from "@strapi/strapi";

function emitEvent(eventName: string, event: any) {
    const { result } = event;
    const strapi = global.strapi as Core.Strapi;

    const socketService = strapi.service("api::socket.socket");
    (socketService as any).emit(eventName, result);
}
  
export { emitEvent };