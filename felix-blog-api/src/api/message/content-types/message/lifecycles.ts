import { emitEvent, AfterCreateEvent } from "../../../../utils/emitEvents";

export default {
    async afterUpdate(event: AfterCreateEvent) {
        emitEvent("message.updated", event);
    },
    async afterCreate(event: AfterCreateEvent) {
        emitEvent("message.created", event);
    },
    async afterDelete(event: AfterCreateEvent) {
        emitEvent("message.deleted", event);
    }, 
};
