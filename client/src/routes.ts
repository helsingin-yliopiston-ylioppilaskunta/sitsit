import {
    type RouteConfig,
    route,
    prefix,
    index,
} from "@react-router/dev/routes";

export default [
    ...prefix("users", [
        index("./pages/userlist.tsx"),
        route(":userId?", "./pages/user.tsx"),
        route("new", "./pages/new_user.tsx"),
    ]),

    ...prefix("orgs", [
        index("./pages/orglist.tsx"),
        route(":orgId?", "./pages/org.tsx"),
        route("new", "./pages/new_org.tsx"),
    ]),

    route("*?", "catchall.tsx"),
] satisfies RouteConfig;
