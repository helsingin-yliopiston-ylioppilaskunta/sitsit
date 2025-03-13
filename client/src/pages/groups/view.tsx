import type { Route } from './+types/groups';
import Group from '../../components/Group/Group';

export async function clientLoader({ params }: Route.LoaderArgs) {
    return {
        title: "Update a group",
        groupId: params.groupId,
    };
}

export default function GroupPage({ loaderData }) {
    return <Group groupId={loaderData.groupId} />
}
