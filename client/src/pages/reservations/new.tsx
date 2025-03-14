import type { Route } from './+types/groups';
import Reservation from '../../components/Reservation/Reservation';

export async function clientLoader() {
    return {
        title: "Uusi varaus",
    };
}

export default function ReservationPage() {
    return <Reservation />
}
