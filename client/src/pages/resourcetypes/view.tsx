import type { Route } from './+types/resources';
import ResourceType from '../../components/ResourceType/ResourceType';

export async function clientLoader({ params }: Route.LoaderArgs) {
    return {
        title: "Muokkaa resurssityyppiä",
        resourcetypeId: params.resourcetypeId,
    };
}

export default function UserPage({ loaderData }) {
    return <ResourceType resourceId={loaderData.resourcetypeId} />
}
