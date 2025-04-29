import requests

BASE_URL = "http://localhost:8000"

# 1. Register a new user
register_data = {"username": "root2", "password": "root2"}
res = requests.post(f"{BASE_URL}/register", json=register_data)
print("REGISTER:", res.status_code, res.json())

# 2. Login to get JWT token
login_data = {"username": "root2", "password": "root2"}
res = requests.post(f"{BASE_URL}/login", data=login_data)
token = res.json().get("access_token")
print("LOGIN:", res.status_code, token)

# Headers for protected routes
headers = {"Authorization": f"Bearer {token}"}

# 3. Create a blog post
post_data = {
    "title": "First Blog Post",
    "content": "This is my first blog post on Blogi!",
}
res = requests.post(f"{BASE_URL}/posts", json=post_data, headers=headers)
print("CREATE POST:", res.status_code, res.json())
post_id = res.json()["id"]

# 4. Get all blog posts (with pagination + search)
res = requests.get(f"{BASE_URL}/posts?search=Blogi&limit=10&skip=0")
print("ALL POSTS:", res.status_code, res.json())

# 5. Update the blog post
update_data = {
    "title": "Updated Blog Post",
    "content": "I've updated my first blog!",
}
res = requests.put(f"{BASE_URL}/posts/{post_id}", json=update_data, headers=headers)
print("UPDATE POST:", res.status_code, res.json())

# 6. Delete the blog post
res = requests.delete(f"{BASE_URL}/posts/{post_id}", headers=headers)
print("DELETE POST:", res.status_code, res.text)
