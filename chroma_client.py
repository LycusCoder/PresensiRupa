try:
    import chromadb
    from chromadb.config import Settings
    CHROMA_AVAILABLE = True
except Exception:
    chromadb = None
    CHROMA_AVAILABLE = False

import threading

class ChromaClient:
    """Simple wrapper. If chromadb is available, use it; otherwise fallback to in-memory index.

    Methods:
    - add(id, vector, metadata)
    - query(vector, n_results)
    """

    def __init__(self, collection_name="default"):
        self.collection_name = collection_name
        if CHROMA_AVAILABLE:
            self.client = chromadb.Client(Settings())
            try:
                self.col = self.client.get_collection(collection_name)
            except Exception:
                self.col = self.client.create_collection(collection_name)
        else:
            self.lock = threading.Lock()
            self.store = {}  # id -> (vector, metadata)

    def add(self, id: str, vector: list, metadata: dict = None):
        if CHROMA_AVAILABLE:
            self.col.add(ids=[id], metadatas=[metadata or {}], vectors=[vector])
        else:
            with self.lock:
                self.store[id] = (vector, metadata or {})

    def query(self, vector: list, n_results: int = 3):
        if CHROMA_AVAILABLE:
            res = self.col.query(query_embeddings=[vector], n_results=n_results)
            # chroma returns dicts of ids/distances/metadatas
            out = []
            for idx, vid in enumerate(res["ids"][0]):
                out.append({
                    "id": vid,
                    "distance": res["distances"][0][idx],
                    "metadata": res["metadatas"][0][idx],
                })
            return out
        else:
            # brute-force euclidean
            import math
            best = []
            with self.lock:
                for k, (vec, meta) in self.store.items():
                    if len(vec) != len(vector):
                        continue
                    s = 0.0
                    for a, b in zip(vec, vector):
                        d = (a - b)
                        s += d * d
                    dist = math.sqrt(s)
                    best.append((dist, k, meta))
            best.sort(key=lambda x: x[0])
            out = []
            for dist, k, meta in best[:n_results]:
                out.append({"id": k, "distance": dist, "metadata": meta})
            return out
