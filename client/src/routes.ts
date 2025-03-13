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

    ...prefix("groups", [
        index("./pages/groups/list.tsx"),
        route(":groupId?", "./pages/groups/view.tsx"),
        route("new", "./pages/groups/new.tsx"),
    ]),

    ...prefix("resources", [
        index("./pages/resources/list.tsx"),
        route(":resourceId?", "./pages/resources/view.tsx"),
        route("new", "./pages/resources/new.tsx"),
    ]),


    route("*?", "catchall.tsx"),
] satisfies RouteConfig;
