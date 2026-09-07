import { prisma } from "../../lib/prisma.js";
import type { PrismaClient } from "../../generated/prisma/client.js";

type OutboxDb = Pick<
    PrismaClient,
    "outboxEvent"
>;

export interface CreateOutboxEventData {
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    payload: object;
}

export const outboxRepository = {

    createEvent(
        data: CreateOutboxEventData,
        db: OutboxDb = prisma,
    ) {
        return db.outboxEvent.create({
            data: {
                eventType: data.eventType,
                aggregateType: data.aggregateType,
                aggregateId: data.aggregateId,
                payload: data.payload,
            },
        });
    },

};