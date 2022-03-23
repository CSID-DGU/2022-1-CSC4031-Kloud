import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../api";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { userIdAtom } from "../atoms";

interface IForm {
  public_key: string;
  secret_key: string;
}

const Login = () => {
  // User Id 생성

  const setUserId = useSetRecoilState(userIdAtom);
  const [publicKey, setPublicKey] = useState("");
  const [secret, setSecret] = useState("");
  const { register, handleSubmit, reset } = useForm<IForm>();

  useEffect(() => {
    (async () => {
      console.log(await login(publicKey, secret));
    })();
  }, [secret]);
  const onValid = ({ public_key, secret_key }: IForm) => {
    setPublicKey(public_key);
    setSecret(secret_key);
    setUserId(publicKey);
    reset();
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onValid)}>
        <input
          {...register("public_key", {
            required: "필수 입력 항목입니다.",
          })}
          placeholder="public_key"
        />
        <input
          {...register("secret_key", {
            required: "필수 입력 항목입니다.",
          })}
          placeholder="secret_key"
        />
        <button>로그인</button>
      </form>
    </div>
  );
};

export default Login;
