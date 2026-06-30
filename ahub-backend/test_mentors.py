import urllib.request, json

print("=== Public Mentors ===")
req = urllib.request.Request("http://localhost:8000/api/public/mentors")
resp = json.loads(urllib.request.urlopen(req).read())
print(f"Count: {len(resp)}")
for m in resp:
    print(f"  {m['name']}: {m['image_url']}")

print("\n=== Admin Mentors ===")
req = urllib.request.Request(
    "http://localhost:8000/api/v1/auth/login",
    data=json.dumps({"email": "admin@ahub.in", "password": "admin123"}).encode(),
    headers={"Content-Type": "application/json"},
)
token = json.loads(urllib.request.urlopen(req).read())["access_token"]
req2 = urllib.request.Request(
    "http://localhost:8000/api/admin/mentors",
    headers={"Authorization": f"Bearer {token}"},
)
admin = json.loads(urllib.request.urlopen(req2).read())
print(f"Count: {len(admin)}")

print("\n=== Images ===")
for m in resp:
    url = f"http://localhost:8000/{m['image_url']}"
    resp_img = urllib.request.urlopen(urllib.request.Request(url))
    print(f"  {m['name']}: {resp_img.status} ({len(resp_img.read())} bytes)")

print("\nAll OK!")
