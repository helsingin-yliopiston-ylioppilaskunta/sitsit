import type { Route } from './+types/users';
import User from '../components/User';

export async function clientLoader() {
    return {
        title: "New user",
    };
}

export default function UserPage() {
    return <User />
}
