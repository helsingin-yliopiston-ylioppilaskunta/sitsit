import type { Route } from './+types/users';
import User from '../components/User';

export async function clientLoader({ params }: Route.LoaderArgs) {
    return {
        title: "Users",
        userId: params.userId,
    };
}

export default function UserPage({ loaderData }) {
    if (loaderData.userId) {
        return <User userId={loaderData.userId} />
    } else {
        return <User />
    }
}
