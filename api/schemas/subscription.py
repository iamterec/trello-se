import asyncio
from graphene import ObjectType, Field
from .object_types import Section, subscriptions

SUBSCRIPTION_TIMEOUT = 3


class Subscription(ObjectType):
    section_added = Field(Section)

    async def subscribe_section_added(self, info):
        while True:
            if len(subscriptions["section_added"]):
                section = subscriptions["section_added"].pop()
                yield section
            await asyncio.sleep(SUBSCRIPTION_TIMEOUT)
