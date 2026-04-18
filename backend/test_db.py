import asyncio
from app.db.database import init_db_pool, get_db_connection

async def main():
    try:
        pool = await init_db_pool()
        print("Pool init success")
        gen = get_db_connection()
        conn = await gen.__anext__()
        print("Connection acquired", conn)
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 FROM DUAL")
            print("Query success", cursor.fetchone())
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
