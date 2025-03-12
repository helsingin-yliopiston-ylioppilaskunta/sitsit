import OrgList from '../../components/OrgList/OrgList';

export async function clientLoader() {
    return {
        title: "Orgs",
    };
}

export default function OrgListPage({ loaderData }) {
    return <OrgList />
}
