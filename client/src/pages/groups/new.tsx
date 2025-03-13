import type { Route } from './+types/groups';
import Group from '../../components/Group/Group';

export async function clientLoader() {
    return {
        title: "New group",
    };
}

export default function GroupPage() {
    return <Group />
}
