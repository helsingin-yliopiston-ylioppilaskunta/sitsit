import { useState, useEffect } from 'react';
import api from '../../api';

import './Reservation.css'

import { components } from '../../schema';

import { Link, useNavigate } from "react-router";
import Status from "../../status";

function utcStringToDateTimeLocal(utcString: string): string {
    const date = new Date(utcString);

    const pad = (n: number) => n.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

interface ReservationProps {
    reservationId?: number;
}

function Reservation(props: ReservationProps) {
    const [status, setStatus] = useState(Status.Loading);
    const [errorMsg, setErrorMsg] = useState("");
    const [modified, setModified] = useState(false);

    const [reservationname, setReservationname] = useState("");
    const [contactinfo, setContactinfo] = useState("");
    const [description, setDescription] = useState("");

    const [times, setTimes] = useState<components["schemas"]["PublicReservationTime"][]>([]);
    const [newStartTime, setNewStartTime] = useState<string>("");
    const [newEndTime, setNewEndTime] = useState<string>("");

    const [user, setUser] = useState<number>(1);
    const [users, setUsers] = useState<components["schemas"]["PublicUserWithOrg"][]>([]);

    const navigate = useNavigate();

    const { data, error: getError, isLoading } = props.reservationId ?
        api.useQuery(
            "get", "/reservations/{reservation_id}", {
            params: {
                path: { reservation_id: props.reservationId }
            }
        }) : { data: undefined, error: undefined, isLoading: false };

    const { data: userResponse, error: userError, isLoading: userLoading } = api.useQuery(
        "get", "/users/"
    );

    const { mutate: updateReservation, isPending: updating } =
        api.useMutation(
            "patch", "/reservations/{reservation_id}", {
            params: {
                path: { reservation_id: props.reservationId }
            },
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success)
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(JSON.stringify(error));
            }
        }
        );

    const { mutate: createReservation, isPending: creating } =
        api.useMutation(
            "post", "/reservations/", {
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/reservations/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const { mutate: deleteReservation, isPending: deleting } =
        api.useMutation(
            "delete", "/reservations/{reservation_id}", {
            params: {
                path: { reservation_id: props.reservationId }
            },
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                navigate("/reservations/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(`${error.detail}`)
            }
        }
        );

    const { mutate: updateTime, isPending: isUpdatingTime } =
        api.useMutation(
            "patch", "/reservationTimes/{reservationTime_id}", {
            onSuccess: () => {
                console.log("Updating?")
                setModified(false);
                setStatus(Status.Success);
                navigate("/reservations");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error);
                setErrorMsg(JSON.stringify(error));
            }
        }
        );

    const { mutate: createTime, isPending: isCreatingTime } =
        api.useMutation(
            "post", "/reservationTimes/", {
            onSuccess: () => {
                setModified(false);
                setStatus(Status.Success);
                // navigate("/reservations/");
            },
            onError: (error: { detail?: components["schemas"]["ValidationError"][] }) => {
                setStatus(Status.Error)
                setErrorMsg(JSON.stringify(error));
            }
        }
        );

    const handleUpdateReservation = () => {
        const reservation = {
            name: reservationname,
            user_id: user,
            contact_info: contactinfo,
            description: description
        };

        if (props.reservationId) {
            updateReservation({
                params: {
                    path: { reservation_id: props.reservationId || -1 }
                },
                body: reservation
            });
        } else {
            createReservation({
                body: reservation
            })
        }

        times.forEach((time) => {
            const payload = {
                start: time.start,
                end: time.end,
                reservation_id: time.reservation_id,
            };

            updateTime({
                params: { path: { reservationTime_id: time.id } },
                body: payload,
            })
        })
    };

    const removeReservation = () => {
        deleteReservation({ params: { path: { reservation_id: props.reservationId || -1 } } })
    }


    enum TimeType {
        Start,
        End
    }

    function handleUpdateTime(id: number, type: TimeType, newTime: string) {
        setTimes(prev =>
            prev.map(time =>
                time.id === id
                    ? { ...time, [type === TimeType.Start ? "start" : "end"]: newTime }
                    : time
            )
        );
        setModified(true);
    }

    function createNewTime() {
        const payload = {
            start: newStartTime,
            end: newEndTime,
            reservation_id: props.reservationId
        }
        createTime({ body: payload });
    }

    const isAnyLoading = isLoading || userLoading || creating || updating || deleting || isUpdatingTime || isCreatingTime;

    const combinedError = getError || userError;

    useEffect(() => {
        if (isAnyLoading) {
            setStatus(Status.Loading);
        } else if (combinedError) {
            setStatus(Status.Error);
            setErrorMsg(combinedError.toString());
        } else if (data) {
            setStatus(Status.Success);
        }
    }, [isAnyLoading, combinedError, data]);

    useEffect(() => {
        if (data) {
            setReservationname(data.name)
            setUser(data.user.id);
            setContactinfo(data.contact_info || "");
            setDescription(data.description || "");
            setTimes(data.times);
        }
    }, [data])

    useEffect(() => {
        if (userResponse) {
            setUsers(userResponse);
        }
    }, [userResponse]);

    return (
        <div className={`Reservation status-${status}`}>
            <h3>{props.reservationId ? "Muokkaa varausta" : "Uusi varaus"}</h3>
            <Link to="/reservations/">Palaa</Link>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateReservation();
            }}>
                <div className="row">
                    <input type="hidden" disabled={true} value={props.reservationId} />
                </div>
                <div className="row">
                    <label>Nimi</label>
                    <input type="text" value={reservationname} onChange={(e) => {
                        setReservationname(e.target.value);
                        setModified(true);
                    }} />
                </div>
                <div className="row">
                    <label>Kuvaus</label>
                    <input type="text" value={description} onChange={(e) => {
                        setDescription(e.target.value);
                        setModified(true);
                    }} />
                </div>
                <div className="row">
                    <label>Yhteystieto</label>
                    <input type="text" value={contactinfo} onChange={(e) => {
                        setContactinfo(e.target.value);
                        setModified(true);
                    }} />
                </div>
                <div className="row">
                    <label>User</label>
                    <select name="user" id="user"
                        value={user}
                        onChange={(e) => {
                            setUser(parseInt(e.target.value));
                            setModified(true);
                        }}
                    >
                        {users?.map((user) => (
                            <option value={user.id} key={user.id} >{user.username}</option>
                        ))}
                    </select>
                </div>
                <div className="row">
                    Times:
                    <ul>
                        {times.map((time) => {
                            return (
                                <li key={time.id}>
                                    <input type="datetime-local"
                                        value={utcStringToDateTimeLocal(time.start)}
                                        onChange={(e) => {
                                            console.log(e.target.value);
                                            handleUpdateTime(time.id, TimeType.Start, e.target.value)
                                        }}
                                    />
                                    <span> - </span>
                                    <input type="datetime-local"
                                        value={utcStringToDateTimeLocal(time.end)}
                                        onChange={(e) => {
                                            console.log(e.target.value);
                                            handleUpdateTime(time.id, TimeType.End, e.target.value)
                                        }}
                                    />
                                </li>
                            )
                        })
                        }
                    </ul>
                </div>
                <div className="row">
                    Lisää uusi aika:
                    <input type="datetime-local"
                        value={newStartTime}
                        onChange={(e) => {
                            setNewStartTime(e.target.value);
                        }}
                    />
                    <span> - </span>
                    <input type="datetime-local"
                        value={newEndTime}
                        onChange={(e) => {
                            setNewEndTime(e.target.value)
                        }}
                    />
                    <input type="button" value="Lisää aika"
                        onClick={() => {
                            createNewTime();
                        }}
                    />
                </div>
                <div className="row">
                    <input type="submit" disabled={!modified} value="Tallenna" />
                    <input type="button" value="Poista ryhmä"
                        onClick={(e) => {
                            e.preventDefault();
                            removeReservation();
                        }}
                    />
                </div>
            </form>
            <div className="error">
                {errorMsg}
            </div>
        </div>
    )
}

export default Reservation
