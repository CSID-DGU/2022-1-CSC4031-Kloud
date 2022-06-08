# Kloud API Server
Kloud의 백엔드 서버입니다.

상세 API 문서는 *{server-url}/docs* 혹은 *{server-url}/redoc* 을 참조하시기 바랍니다.

## Deployment
컨테이너 기반 배포를 상정하였습니다. 

Docker Compose 사용시 무시하여도 괜찮습니다.
### Environment Variables

#### REDIS_HOST
- Redis Host의 IP 주소, 혹은 도메인 네임을 설정합니다. (포트, 프로토콜 등은 기입하지 않습니다.)
- 값이 없을 시, docker-compose 실행을 상정하 *kloud_redis*로 설정됩니다.

#### JWT_SECRET_KEY
- JWT 비밀 키입니다. 
- 기입하지 않을시 기본값은 *wow_very_secret*입니다. 

#### IS_PRODUCTION
- *true*로 설정되었을 시, CORS가 활성화됩니다.
- *true*가 아니거나, 설정되지 않았다면 모든 origin을 허용합니다.

#### FRONT_END_URL
- 프론트엔드 주소입니다. *IS_PRODUCTION* 값이 *true*일 경우 필요합니다.
- *ex) https://something.com*

#### API_URL
- 서버의 주소입니다. *IS_PRODUCTION* 값이 *true*일 경우 필요합니다.
- *ex) https://api.something.com*
## boto3_wrappers
[README](boto3_wrappers/README.md)

## routers
[README](routers/README.md)

## auth.py
- 클라이언트-Kloud 서버 인증과 Kloud 서버 - AWS 인증에 필요한 모듈입니다.
- FastAPI의 의존성 주입(Depends)을 통해 사용됩니다.

## dependencies.py
- JWT access token을 입력받아 _user_id: str_, 혹은 _user_client: KloudClient_ 객체를 반환합니다.
- FastAPI의 의존성 주입(Depends)을 통해 사용됩니다.

## redis_req.py
- aioredis 라이브러리를 통해 redis와 통신합니다.