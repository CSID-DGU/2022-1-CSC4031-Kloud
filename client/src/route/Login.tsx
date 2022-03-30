import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../api";
import { useSetRecoilState } from "recoil";
import { userIdAtom, accessTokenAtom } from "../atoms";
import styled from "styled-components";

interface IForm {
  public_key: string;
  secret_key: string;
  region: string;
}
const Container = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 30%;
`;
const KeyInput = styled.input`
  margin-bottom: 10px;
`;
const LoginButton = styled.button`
  height: 30px;
  background-color: ${(props) => props.theme.accentColor};
`;
const ErrorMessage = styled.span`
  color: red;
`;

const Login = () => {
  const setUserId = useSetRecoilState(userIdAtom);
  const [publicKey, setPublicKey] = useState("");
  const [secret, setSecret] = useState("");
  const [region, setRegion] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IForm>();

  useEffect(() => {
    (async () => {
      let response = null;
      if (region) {
        // region 까지 들어오면 요청 날림
        response = await login(publicKey, secret, region);
      }
      // 로그인 성공 / 실패 처리 나누기 필요
      if (response !== null) {
        const loginResponse = response?.data;
        localStorage.setItem("access_token", loginResponse.access_token);
      }
    })();
  }, [region]);
  const onValid = ({ public_key, secret_key, region }: IForm) => {
    setPublicKey(public_key);
    setSecret(secret_key);
    setUserId(publicKey);
    setRegion(region);
    reset();
  };

  return (
    <Container>
      <LoginForm onSubmit={handleSubmit(onValid)}>
        <KeyInput
          {...register("public_key", {
            required: "필수 입력 항목입니다.",
          })}
          placeholder="public_key"
        />
        <ErrorMessage>{errors?.public_key?.message}</ErrorMessage>
        <KeyInput
          {...register("secret_key", {
            required: "필수 입력 항목입니다.",
          })}
          placeholder="secret_key"
        />
        <ErrorMessage>{errors?.secret_key?.message}</ErrorMessage>
        <KeyInput
          {...register("region", {
            required: "필수 입력 항목입니다.",
          })}
          placeholder="region"
        />
        <ErrorMessage>{errors?.region?.message}</ErrorMessage>
        <LoginButton>로그인</LoginButton>
      </LoginForm>
    </Container>
  );
};

export default Login;
