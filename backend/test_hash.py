import bcrypt
hash_in_db = b"$2b$12$ZqI5oO/x8VpI0n1Ld2Ff1.2pQkC4XqL9U6gT1O3X5zY4W2v1b8F/O"
print("Result:", bcrypt.checkpw(b"Senha123!", hash_in_db))
