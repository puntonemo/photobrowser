export async function test(session: any) {
    session.viewCount = (session.viewCount || 0) + 1;
    return {
        date: new Date().toISOString(),
        viewCount: session.viewCount, // lo devolvemos al cliente
    };
}
