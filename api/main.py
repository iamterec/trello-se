from fastapi import FastAPI
# import graphene
# from schemas import Query, Mutation, Subscription
# from schemas import Query
from schemas import schema
from models import db_session
from starlette_graphene3 import GraphQLApp, make_graphiql_handler
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost*",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


# schema = graphene.Schema(query=Query)
# schema = graphene.Schema(query=Query, mutation=Mutation, subscription=Subscription)
app.mount("/", GraphQLApp(schema, on_get=make_graphiql_handler(),context_value={'session': db_session}))
