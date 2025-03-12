import CollectionList from '../../components/CollectionList/CollectionList';

export async function clientLoader() {
    return {
        title: "Collections",
    };
}

export default function CollectionListPage({ loaderData }) {
    return <CollectionList />
}
