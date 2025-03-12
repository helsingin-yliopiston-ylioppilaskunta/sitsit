import type { Route } from './+types/collections';
import Collection from '../../components/Collection/Collection';

export async function clientLoader() {
    return {
        title: "Uusi kokoelma",
    };
}

export default function UserPage() {
    return <Collection />
}
