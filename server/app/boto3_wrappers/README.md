# boto3_wrappers
- boto3 래퍼 클래스입니다. 

- *kloud_client.KloudClient* 클래스만 인스턴스로 사용됩니다. 다른 클래스는 모두 상속을 통해서만 활용됩니다.

- 모든 *boto3_wrappers* 패키지 하의 클래스는 *kloud_boto3_wrapper.KloudBoto3Wrapper* 를 상속받습니다.

- boto3 SDK의 *Client* 클래스 구조를 참조하여 1:1로 대응시켰으며, 한 종류 이상의 *Client* 객체가 필요한 작업(인프라 트리 구조도 생성 등)의 경우 다중상속을 통해 형성된 *kloud_client.KloudClient* 객체에서 처리합니다. 