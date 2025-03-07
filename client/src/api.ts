import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./schema";

const fetchClient = createFetchClient<paths>({
    baseUrl: "http://localhost:8000/",
    headers: {
        "Content-Type": "application/json"
    }
});
const api = createClient(fetchClient);

export default api

