import { useState, useEffect } from 'react';
import api from '../../api';

import { Link } from "react-router";

import './ReservationList.css'

import { components } from '../../schema';
import Status from "../../status";

interface ReservationRowProps {
    // To-do: If we had a way to get PublicReservationWithUser from the api,
    // that would probably be better? Unless we do filtering / sorting based
    // on times and resources?
    data: components["schemas"]["PublicReservationWithUserAndTimesAndResources"]
}

function ReservationRow(props: ReservationRowProps) {
    return (
        <ul className="ReservationRow Row" key={props.data.id}>
            <li>{props.data.name}</li>
            <li>{props.data.user ? props.data.user.username : "unset"}</li>
            <li><Link to={`/reservations/${props.data.id}`}>muokkaa</Link></li>
        </ul >
    )
}

function ReservationList() {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");

    const [reservations, setReservations] = useState<components["schemas"]["PublicReservationWithUserAndTimesAndResources"][]>([]);

    const { data, error: getError, isLoading } = api.useQuery(
        "get", "/reservations/"
    );

    useEffect(() => {
        if (isLoading) {
            setStatus(Status.Loading);
        }

    }, [isLoading])

    useEffect(() => {
        if (data) {
            setStatus(Status.Success)
            setReservations(data);
        }
    }, [data])

    useEffect(() => {
        if (getError) {
            setErrorMsg(JSON.stringify(getError));
        }
    }, [getError])

    return (
        <div className={`ReservationList status-${status}`}>
            <h3>Varaukset</h3>
            <div className="List">
                <ul className="Row header" key="header">
                    <li>Varaus</li>
                    <li>Käyttäjä</li>
                    <li>Muokkaa</li>
                </ul>
                {reservations.sort((a, b) => a.id - b.id).map((reservation) => (<ReservationRow data={reservation} key={reservation.id} />))}
            </div>
            <div>
                <Link className="button" to="/reservations/new">Luo uusi varaus</Link>
            </div>
            <div className="error">
                {errorMsg}
            </div>
        </div>
    )
}

export default ReservationList
