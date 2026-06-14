import AuthShell from "../../components/AuthShell";
import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <LoginForm />
    </AuthShell>
  );
}
