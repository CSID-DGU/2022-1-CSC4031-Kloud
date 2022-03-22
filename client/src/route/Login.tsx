import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";
import { login } from "../api";

interface IForm {
  public_key: string;
  secret_key: string;
}

const Login = () => {
  const [publicKey, setPublicKey] = useState("");
  const [secret, setSecret] = useState("");
  const { register, handleSubmit, reset } = useForm<IForm>();
  const { isLoading, data } = useQuery<any>(["authentication"], () =>
    login(publicKey, secret)
  );
  console.log(data);

  const onValid = ({ public_key, secret_key }: IForm) => {
    setPublicKey(public_key);
    setSecret(secret_key);
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onValid)}>
        <input {...register("public_key")} placeholder="public_key"></input>
        <input {...register("secret_key")} placeholder="secret_key"></input>
        <button>로그인</button>
      </form>
    </div>
  );
};

export default Login;
