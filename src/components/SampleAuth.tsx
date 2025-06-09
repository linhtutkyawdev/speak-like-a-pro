import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

export function App() {
  return (
    <>
      <AuthLoading>Loading...</AuthLoading>
      <Unauthenticated>SignIn</Unauthenticated>
      <Authenticated>SignOut - Content</Authenticated>
    </>
  );
}
