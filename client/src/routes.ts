import {
    type RouteConfig,
    route,
    prefix,
    index,
} from "@react-router/dev/routes";

export default [
    ...prefix("users", [
        index("./pages/users/list.tsx"),
        route(":userId?", "./pages/users/view.tsx"),
        route("new", "./pages/users/new.tsx"),
    ]),

    ...prefix("orgs", [
        index("./pages/orgs/list.tsx"),
        route(":orgId?", "./pages/orgs/view.tsx"),
        route("new", "./pages/orgs/new.tsx"),
    ]),

    ...prefix("collections", [
        index("./pages/collections/list.tsx"),
        route(":collectionId?", "./pages/collections/view.tsx"),
        route("new", "./pages/collections/new.tsx"),
    ]),

    route("*?", "catchall.tsx"),
] satisfies RouteConfig;
