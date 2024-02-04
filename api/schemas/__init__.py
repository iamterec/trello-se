from graphene import Schema

from .mutation import Mutation
from .query import Query
from .subscription import Subscription

schema = Schema(query=Query, mutation=Mutation, subscription=Subscription)
