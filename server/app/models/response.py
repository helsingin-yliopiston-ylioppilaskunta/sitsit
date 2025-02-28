from pydantic import BaseModel


class Response[T](BaseModel):
    """A generic model for responses

    status: Indicates wether the request was succesfull or not
    more_available: If the request was paginated, defines if there are
    more rows available or not
    items: List of items in the type T
    """

    status: bool
    more_available: bool
    items: list[T]
