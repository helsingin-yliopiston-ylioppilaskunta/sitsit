import type { Route } from './+types/collections';
import Resource from '../../components/Resource/Resource';

export async function clientLoader() {
    return {
        title: "Uusi resurssi",
    };
}

export default function ResourcePage() {
    return <Resource />
}
