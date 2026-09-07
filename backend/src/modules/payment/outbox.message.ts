export function serializeOutboxPayload(
    payload: unknown,
): Buffer {
    return Buffer.from(
        JSON.stringify(payload),
        "utf-8",
    );
}