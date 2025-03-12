import type { Route } from './+types/users';
import Org from '../components/Org';

export async function clientLoader() {
    return {
        title: "Uusi organisaatio",
    };
}

export default function UserPage() {
    return <Org />
}
