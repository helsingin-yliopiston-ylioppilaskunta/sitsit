import type { Route } from './+types/resources';
import Resource from '../../components/Resource/Resource';

export async function clientLoader({ params }: Route.LoaderArgs) {
    return {
        title: "Muokkaa resurssia",
        resourceId: params.resourceId,
    };
}

export default function UserPage({ loaderData }) {
    return <Resource resourceId={loaderData.resourceId} />
}
