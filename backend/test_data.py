import urllib.request
import urllib.parse
import json

data = json.dumps({"email":"produtor.premium@agrogemini.com", "senha":"Senha123!"}).encode("utf-8")
req = urllib.request.Request("http://localhost:8000/api/v1/auth/login", data=data, headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as response:
        login_resp = json.loads(response.read().decode())
        token = login_resp["access_token"]
        user_id = login_resp["user_id"]
        print(f"Logged in, user_id: {user_id}")

    req2 = urllib.request.Request("http://localhost:8000/api/v1/amostras/minhas", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req2) as response:
        amostras = json.loads(response.read().decode())
        print(f"Amostras: {len(amostras)}")
        
    req3 = urllib.request.Request(f"http://localhost:8000/api/v1/laudos/cliente/{user_id}", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req3) as response:
        laudos = json.loads(response.read().decode())
        print(f"Laudos: {len(laudos)}")
        
    req4 = urllib.request.Request("http://localhost:8000/api/v1/fazendas/", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req4) as response:
        fazendas = json.loads(response.read().decode())
        print(f"Fazendas: {len(fazendas)}")

except Exception as e:
    print("Error:", e)
    if hasattr(e, "read"):
        print(e.read().decode())
