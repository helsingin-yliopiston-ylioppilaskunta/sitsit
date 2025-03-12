import UserList from '../../components/UserList/UserList';

export async function clientLoader() {
    return {
        title: "Users",
    };
}

export default function UserListPage({ loaderData }) {
    return <UserList />
}
