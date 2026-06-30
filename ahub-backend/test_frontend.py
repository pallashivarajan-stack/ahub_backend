import urllib.request
try:
    r = urllib.request.urlopen("http://localhost:8080/", timeout=5)
    print(f"Status: {r.status}")
    print(f"Content-Type: {r.headers.get('Content-Type')}")
except Exception as e:
    print(f"Error: {e}")
