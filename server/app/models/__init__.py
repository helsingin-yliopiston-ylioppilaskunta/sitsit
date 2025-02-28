from __future__ import annotations

from app.models.user import (
    BaseUser,
    DBUser,
    CreateUser,
    UpdateUser,
    PublicUser,
    PublicUserWithOrg,
)
from app.models.org import (
    BaseOrg,
    DBOrg,
    CreateOrg,
    UpdateOrg,
    PublicOrg,
    PublicOrgWithUsers,
)
from app.models.response import Response

DBUser.model_rebuild()
DBOrg.model_rebuild()

Response[PublicUserWithOrg].model_rebuild()
Response[PublicOrgWithUsers].model_rebuild()
