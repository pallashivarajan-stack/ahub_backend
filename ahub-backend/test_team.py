import urllib.request, json

print("=== Image Serving Test ===")
for name in [
    "group_photo_of_team_members.png",
    "syed_junaid_ahmed_technical_manager_a-hub_.jpg",
    "vinay_kumar_tadla_intern_.png",
]:
    url = f"http://localhost:8000/api/public/media/team/{name}"
    resp = urllib.request.urlopen(urllib.request.Request(url))
    print(f"  {name}: {resp.status} ({len(resp.read())} bytes)")

print("\n=== Team Members ===")
req = urllib.request.Request("http://localhost:8000/api/public/team")
team = json.loads(urllib.request.urlopen(req).read())
for m in team:
    print(f"  {m['name']}: {m['image_url']}")

print("\n=== Team Page ===")
req = urllib.request.Request("http://localhost:8000/api/public/team-page")
page = json.loads(urllib.request.urlopen(req).read())
print(f"  {json.dumps(page, indent=2)}")

print("\n=== Admin Team Page ===")
req = urllib.request.Request(
    "http://localhost:8000/api/v1/auth/login",
    data=json.dumps({"email": "admin@ahub.in", "password": "admin123"}).encode(),
    headers={"Content-Type": "application/json"},
)
token = json.loads(urllib.request.urlopen(req).read())["access_token"]
req2 = urllib.request.Request(
    "http://localhost:8000/api/admin/team-page",
    headers={"Authorization": f"Bearer {token}"},
)
page = json.loads(urllib.request.urlopen(req2).read())
print(f"  {json.dumps(page, indent=2)}")

print("\nAll tests passed!")
