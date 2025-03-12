import OrgList from '../components/OrgList';

export async function clientLoader() {
    return {
        title: "Orgs",
    };
}

export default function UserListPage({ loaderData }) {
    return <OrgList />
}
