import createClient from "openapi-fetch";
import type { paths, components } from "./schema";

const client = createClient<paths>({ baseUrl: "http://localhost:8000/" });

async function fetch_user(id: int) {
    const { data, error } = await client.GET("/users/{user_id}", {
        params: {
            path: { user_id: id }
        }
    })

    if (data) {
        return data.items[0]
    } else {
        return error
    }
}

export {
    fetch_user
}

