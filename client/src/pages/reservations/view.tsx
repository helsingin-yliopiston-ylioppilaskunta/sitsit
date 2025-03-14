import type { Route } from './+types/users';
import Reservation from '../../components/Reservation/Reservation';

export async function clientLoader({ params }: Route.LoaderArgs) {
    return {
        title: "Muokkaa varausta",
        reservationId: params.reservationId,
    };
}

export default function ReservationPage({ loaderData }) {
    return <Reservation reservationId={loaderData.reservationId} />
}
