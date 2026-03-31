"use client";
import { useSession, signIn, signOut } from "next-auth/react";
export default function Component() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button className="bg-red-500 px-2 py-3 m-0" onClick={() => signOut()}>
          Sign out
        </button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button className="bg-blue-500 cursor-pointer w-20 m-0" onClick={() => signIn()}>
        Sign in
      </button>
    </>
  );
}
