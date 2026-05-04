import { auth } from "../../lib/auth.js";

interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}

const RegisterSupporter = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      // role: Role.SUPPORTER,
    },
  });

  if (!data.user) {
    throw new Error("Failed to register patient");
  }

  return data;
};

export const AuthService = {
  RegisterSupporter,
};
