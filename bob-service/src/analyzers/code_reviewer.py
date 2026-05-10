from src.utils.bob_client import BobClient

class CodeReviewer:
    def __init__(self, client: BobClient):
        self.client = client

    async def review(self, code: str, language: str, context: dict) -> dict:
        return await self.client.call("review", {
            "code": code,
            "language": language,
            "context": context,
        })
