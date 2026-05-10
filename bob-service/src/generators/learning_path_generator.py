from src.utils.bob_client import BobClient

class LearningPathGenerator:
    def __init__(self, client: BobClient):
        self.client = client

    async def generate(self, repository_id: str, complexity: str, language: str, difficulty: str) -> dict:
        return await self.client.call("generate_path", {
            "repository_id": repository_id,
            "complexity": complexity,
            "language": language,
            "difficulty": difficulty,
        })
