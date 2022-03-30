from fastapi import HTTPException, status


CredentialsException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
)

UserNotInDBException = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="user not in db"
)


