import ReservationList from '../../components/ReservationList/ReservationList';

export async function clientLoader() {
    return {
        title: "Varaukset",
    };
}

export default function ReservationListPage({ loaderData }) {
    return <ReservationList />
}
