import chromadb

# Path to your manually created file
filename = "knowledge_base.txt"

with open(filename, "r") as f:
    text_data = f.read()

# Connect to ChromaDB
client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_or_create_collection(name="cybersecurity")

collection.add(
    documents=[text_data],
    ids=["doc_001"]  # You can update this ID if you want to overwrite
)

print(f"✅ Added {filename} to ChromaDB!")
