import oracledb

def run_app():
    try:
        # Hardcoded to bypass any .env loading issues
        user = "ADMIN"
        password = "AgroGemini_2026_Deploy#"
        dsn = "(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.sa-saopaulo-1.oraclecloud.com))(connect_data=(service_name=gdd3b52175cd79b_blztgh1bxg2es6eq_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
        
        print("Tentando conectar com hardcoded password...")
        
        conn = oracledb.connect(
            user=user,
            password=password,
            dsn=dsn
        )
        
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 FROM DUAL")
            result = cursor.fetchone()
            if result:
                print(f"SUCESSO! Conectado e executou query: {result[0]}")
    except oracledb.Error as e:
        print(f"FALHA: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_app()
