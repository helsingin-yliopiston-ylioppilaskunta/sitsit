import type { Route } from './+types/users';
import User from '../components/User';

export async function clientLoader({ params }: Route.LoaderArgs) {
    return {
        title: "Update a user",
        userId: params.userId,
    };
}

export default function UserPage({ loaderData }) {
    return <User userId={loaderData.userId} />
}
