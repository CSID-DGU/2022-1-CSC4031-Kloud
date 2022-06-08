# server.app
FastAPI 애플리케이션 경로입니다.


## boto3_wrappers
[README](/server/app/boto3_wrappers/README.md)

## routers
[README](/server/app/routers/README.md)

## main.py
- FastAPI app 객체 선언, CORS 정책 설정, *routers* 패키지 아래의 라우터 객체 포함 등이 이루어집니다.

## auth.py
- 클라이언트-Kloud 서버 인증과 Kloud 서버 - AWS 인증에 필요한 모듈입니다.
- FastAPI의 의존성 주입(Depends)을 통해 사용됩니다.

## dependencies.py
- JWT access token을 입력받아 _user_id: str_, 혹은 _user_client: KloudClient_ 객체를 반환합니다.
- FastAPI의 의존성 주입(Depends)을 통해 사용됩니다.

## redis_req.py
- aioredis 라이브러리를 통해 redis와 통신합니다.
