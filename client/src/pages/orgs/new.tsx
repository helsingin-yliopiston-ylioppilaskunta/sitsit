import type { Route } from './+types/orgs';
import Org from '../../components/Org/Org';

export async function clientLoader() {
    return {
        title: "Uusi organisaatio",
    };
}

export default function NewOrgPage() {
    return <Org />
}
