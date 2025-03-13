import GroupList from '../../components/GroupList/GroupList';

export async function clientLoader() {
    return {
        title: "Groups",
    };
}

export default function GroupListPage({ loaderData }) {
    return <GroupList />
}
