import ResourceTypeList from '../../components/ResourceTypeList/ResourceTypeList';

export async function clientLoader() {
    return {
        title: "Resurssityypit",
    };
}

export default function ResourceTypeListPage({ loaderData }) {
    return <ResourceTypeList />
}
