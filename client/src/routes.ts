import {
    type RouteConfig,
    route,
} from "@react-router/dev/routes";

export default [
    route("/users/:userId?", "./pages/user.tsx"),
    route("/users/new", "./pages/new_user.tsx"),
    route("/users/", "./pages/userlist.tsx"),

    route("*?", "catchall.tsx"),
] satisfies RouteConfig;
