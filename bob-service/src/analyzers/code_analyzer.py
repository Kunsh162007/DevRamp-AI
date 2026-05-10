from src.utils.bob_client import BobClient

class CodeAnalyzer:
    def __init__(self, client: BobClient):
        self.client = client

    async def analyze(self, repository_url: str, branch: str) -> dict:
        return await self.client.call("analyze", {
            "repository_url": repository_url,
            "branch": branch,
        })
