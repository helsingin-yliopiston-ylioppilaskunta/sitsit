import {
    type RouteConfig,
    route,
} from "@react-router/dev/routes";

export default [
    route("/users/:userId?", "./pages/users.tsx"),
    route("*?", "catchall.tsx"),
] satisfies RouteConfig;
