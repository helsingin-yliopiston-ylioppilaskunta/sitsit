import { useState, useEffect } from 'react';
import api from '../../api';

import './Reservation.css'

import { components } from '../../schema';

import { Link, useNavigate } from "react-router";
import Status from "../../status";
import DateTime from "../DateTime/DateTime";

import DTPicker from '../DateTime/DTPicker';


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

    const [newTimes, setNewTimes] =
        useState<{ start: Date, end: Date }[]>([]);

    const [user, setUser] = useState<number>(1);
    const [users, setUsers] = useState<components["schemas"]["PublicUserWithOrg"][]>([]);

    type updatedTimesType = { [id: number]: components["schemas"]["PublicReservationTime"] }
    const [updatedTimes, setUpdatedTimes] = useState<updatedTimesType>(
        {} as updatedTimesType
    );

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

        console.log("Updated times:", updatedTimes)
        Object.entries(updatedTimes).forEach(([, time]) => {
            console.log(time)
            const newTime = {
                end: time.end,
                start: time.start,
                reservation_id: time.reservation_id
            }


            updateTime({
                params: {
                    path: { reservationTime_id: time.id }
                },
                body: newTime
            })
        })

        newTimes.forEach(time => {
            const newTime = {
                end: time.end,
                start: time.start,
                reservation_id: props.reservationId || -1 // To-do: this needs to be filled even if the props is not there
                // probably we should update times only after reservation has
                // been created?
            }

            createTime({
                body: newTime
            })
        })

        setNewTimes([]);
    };

    const removeReservation = () => {
        deleteReservation({ params: { path: { reservation_id: props.reservationId || -1 } } })
    }


    enum TimeType {
        Start,
        End
    }

    function handleUpdateTime(id: number, type: TimeType, newTime: string) {
        console.log("Hei!", updatedTimes)
        for (const time of times) {
            console.log(time)
            if (time.id == id) {
                const newTimes = { ...updatedTimes };
                if (type == TimeType.Start) {
                    if (id in newTimes) {
                        newTimes[id] = { ...newTimes[id], start: newTime }
                    } else {
                        newTimes[id] = { ...time, start: newTime };
                    }
                } else if (type == TimeType.End) {
                    if (id in newTimes) {
                        newTimes[id] = { ...newTimes[id], end: newTime };
                    } else {
                        newTimes[id] = { ...time, end: newTime }
                    }
                }
                setUpdatedTimes(newTimes)
            }
        }
    }

    function handleUpdateNewTime(id: number, type: TimeType, newTime: Date) {
        console.log("newTime: ", newTime);
        setNewTimes(newTimes.map((time, i) => {
            if (id === i) {
                if (type == TimeType.Start) {
                    const a = { ...time, start: newTime }
                    return a;
                } else {
                    return { ...time, end: newTime }
                }
            } else {
                return time
            }
        }))
    }

    function addNewTime() {
        const start = new Date(Date.now());
        start.setMinutes(0, 0, 0);

        const end = new Date(Date.now());
        end.setMinutes(59, 0, 0);

        setNewTimes([...newTimes, { start: start, end: end }])
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
            <input
                type="datetime-local"
                step="60"
                value="2025-04-23T14:30"
            />
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
                                    updateTime
                                    <DateTime
                                        value={time.start}
                                        onDateUpdate={(t: string) => {
                                            console.log("Testi?");
                                            handleUpdateTime(time.id, TimeType.Start, t)
                                        }}
                                        onInputChange={() => setModified(true)}
                                    />
                                    <span> - </span>
                                    <DateTime
                                        value={time.end}
                                        onDateUpdate={(t: string) => handleUpdateTime(time.id, TimeType.End, t)}
                                        onInputChange={() => setModified(true)}
                                    />
                                </li>
                            )
                        })
                        }
                    </ul>
                    <ul>
                        {
                            newTimes.map((newTime, id) => (
                                <li key={id}>
                                    <DTPicker
                                        time={newTime.start}
                                        onChange={(t: Date) => {
                                            handleUpdateNewTime(id, TimeType.Start, t)
                                        }}
                                    />
                                    <DTPicker
                                        time={newTime.end}
                                        onChange={(t: Date) => {
                                            handleUpdateNewTime(id, TimeType.Start, t)
                                        }}
                                    />
                                </li>
                            ))
                        }
                    </ul>
                    <input type="button" value="Lisää aika"
                        onClick={() => {
                            addNewTime();
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
