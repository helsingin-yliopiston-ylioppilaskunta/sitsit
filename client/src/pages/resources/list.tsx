import ResourceList from '../../components/ResourceList/ResourceList';

export async function clientLoader() {
    return {
        title: "Resurssit",
    };
}

export default function ResourceListPage({ loaderData }) {
    return <ResourceList />
}
