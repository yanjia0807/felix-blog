import type { Core } from "@strapi/strapi";

interface AfterCreateEvent {
    result: any;
}

function emitEvent(eventName: string, event: AfterCreateEvent) {
    const { result } = event;
    const strapi = global.strapi as Core.Strapi;

    const socketService = strapi.service("api::socket.socket");
    (socketService as any).emit(eventName, result);
}
  
export { emitEvent, AfterCreateEvent };