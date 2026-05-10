from src.utils.bob_client import BobClient

class DocGenerator:
    def __init__(self, client: BobClient):
        self.client = client

    async def generate(self, repository_id: str, components: list) -> dict:
        return await self.client.call("generate_docs", {
            "repository_id": repository_id,
            "components": components,
        })
