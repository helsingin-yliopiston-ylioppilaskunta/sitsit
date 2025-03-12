import type { Route } from './+types/collections';
import Collection from '../../components/Collection/Collection';

export async function clientLoader({ params }: Route.LoaderArgs) {
    return {
        title: "Muokkaa kokoelmaa",
        collectionId: params.collectionId,
    };
}

export default function UserPage({ loaderData }) {
    return <Collection collectionId={loaderData.collectionId} />
}
