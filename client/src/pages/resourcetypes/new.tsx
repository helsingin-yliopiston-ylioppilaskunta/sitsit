import type { Route } from './+types/collections';
import ResourceType from '../../components/ResourceType/ResourceType';

export async function clientLoader() {
    return {
        title: "Uusi resurssityyppi",
    };
}

export default function ResourceTypePage() {
    return <ResourceType />
}
