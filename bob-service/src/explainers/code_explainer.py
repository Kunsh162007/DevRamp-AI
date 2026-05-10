from src.utils.bob_client import BobClient

class CodeExplainer:
    def __init__(self, client: BobClient):
        self.client = client

    async def explain(self, query: str, code_context: str, repository_id: str, user_level: str) -> dict:
        return await self.client.call("explain", {
            "query": query,
            "code_context": code_context,
            "repository_id": repository_id,
            "user_level": user_level,
        })
