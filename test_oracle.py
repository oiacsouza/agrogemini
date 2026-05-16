import asyncio
import urllib.parse
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_conn():
    user = "ADMIN"
    password = "AgrogeminiDeploy1"
    raw_dsn = "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.sa-saopaulo-1.oraclecloud.com))(connect_data=(service_name=gdd3b52175cd79b_blztgh1bxg2es6eq_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
    
    # Try 1: As host
    try:
        encoded_dsn = urllib.parse.quote_plus(raw_dsn)
        url1 = f"oracle+oracledb_async://{user}:{password}@{encoded_dsn}"
        engine1 = create_async_engine(url1)
        async with engine1.connect() as conn:
            res = await conn.execute(text("SELECT 1 FROM DUAL"))
            print("Try 1 (host quote_plus) SUCCESS")
            return
    except Exception as e:
        print("Try 1 failed:", type(e), str(e))

    # Try 2: As host without quote_plus but quote
    try:
        encoded_dsn = urllib.parse.quote(raw_dsn)
        url2 = f"oracle+oracledb_async://{user}:{password}@{encoded_dsn}"
        engine2 = create_async_engine(url2)
        async with engine2.connect() as conn:
            res = await conn.execute(text("SELECT 1 FROM DUAL"))
            print("Try 2 (host quote) SUCCESS")
            return
    except Exception as e:
        print("Try 2 failed:", type(e), str(e))

    # Try 3: As query param ?dsn=
    try:
        encoded_dsn = urllib.parse.quote_plus(raw_dsn)
        url3 = f"oracle+oracledb_async://{user}:{password}@/?dsn={encoded_dsn}"
        engine3 = create_async_engine(url3)
        async with engine3.connect() as conn:
            res = await conn.execute(text("SELECT 1 FROM DUAL"))
            print("Try 3 (?dsn= query param) SUCCESS")
            return
    except Exception as e:
        print("Try 3 failed:", type(e), str(e))

    # Try 4: using sqlalchemy.URL.create
    try:
        from sqlalchemy.engine.url import URL
        url4 = URL.create(
            "oracle+oracledb_async",
            username=user,
            password=password,
            host=raw_dsn
        )
        engine4 = create_async_engine(url4)
        async with engine4.connect() as conn:
            res = await conn.execute(text("SELECT 1 FROM DUAL"))
            print("Try 4 (URL create with host) SUCCESS")
            return
    except Exception as e:
        print("Try 4 failed:", type(e), str(e))

if __name__ == "__main__":
    asyncio.run(test_conn())
