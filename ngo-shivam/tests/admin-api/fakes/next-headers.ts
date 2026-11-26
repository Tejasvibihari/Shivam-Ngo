/** Test double: server components are not exercised by the API tests. */
export async function cookies() {
    return { get: () => undefined };
}
