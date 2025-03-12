import type { Route } from './+types/orgs';
import Org from '../components/Org';

export async function clientLoader({ params }: Route.LoaderArgs) {
    return {
        title: "Muokkaa organisaatiota",
        orgId: params.orgId,
    };
}

export default function UserPage({ loaderData }) {
    return <Org orgId={loaderData.orgId} />
}
