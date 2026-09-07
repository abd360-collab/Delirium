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


    async claimPendingEvents(
        limit: number,
        db: PrismaClient = prisma,
    ) {
        return db.$queryRaw<
            Array<{
                id: string;
                eventType: string;
                aggregateType: string;
                aggregateId: string;
                payload: unknown;
                status: string;
                attempts: number;
                availableAt: Date;
                processedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            }>
        >`
            UPDATE "OutboxEvent"
            SET
                "status" = 'PROCESSING',
                "attempts" = "attempts" + 1,
                "updatedAt" = NOW()
            WHERE "id" IN (
                SELECT "id"
                FROM "OutboxEvent"
                WHERE
                    "status" = 'PENDING'
                    AND "availableAt" <= NOW()
                ORDER BY "createdAt"
                FOR UPDATE SKIP LOCKED
                LIMIT ${limit}
            )
            RETURNING
                "id",
                "eventType",
                "aggregateType",
                "aggregateId",
                "payload",
                "status",
                "attempts",
                "availableAt",
                "processedAt",
                "createdAt",
                "updatedAt"
        `;
    },



    markPublished(
    eventId: string,
    db: OutboxDb = prisma,
) {
    return db.outboxEvent.updateMany({
        where: {
            id: eventId,
            status: "PROCESSING",
        },
        data: {
            status: "PUBLISHED",
            processedAt: new Date(),
        },
    });
},


    markFailed(
    eventId: string,
    availableAt: Date,
    db: OutboxDb = prisma,
) {
    return db.outboxEvent.updateMany({
        where: {
            id: eventId,
            status: "PROCESSING",
        },
        data: {
            status: "FAILED",
            availableAt,
        },
    });
},
   
     requeueFailedEvents(
    db: OutboxDb = prisma,
) {
    return db.outboxEvent.updateMany({
        where: {
            status: "FAILED",
            availableAt: {
                lte: new Date(),
            },
        },
        data: {
            status: "PENDING",
        },
    });
},

requeueStaleProcessingEvents(
    processingTimeoutMs: number,
    db: OutboxDb = prisma,
) {
    const staleBefore = new Date(
        Date.now() - processingTimeoutMs,
    );

    return db.outboxEvent.updateMany({
        where: {
            status: "PROCESSING",
            updatedAt: {
                lt: staleBefore,
            },
        },
        data: {
            status: "PENDING",
        },
    });
},



};