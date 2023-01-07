import { FormEvent, Fragment, useEffect, useState } from "react";
import { supported, create } from "@github/webauthn-json";
import { withIronSessionSsr } from "iron-session/next";
import { generateChallenge, isLoggedIn } from "../lib/auth";
import { sessionOptions } from "../lib/session";
import { useRouter } from "next/router";

export default function Register({ challenge }: { challenge: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsAvailable(available && supported());
    };

    checkAvailability();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const credential = await create({
      publicKey: {
        challenge: challenge,
        rp: {
          name: "next-webauthn",
          // TODO: Change
          id: "localhost",
        },
        user: {
          id: window.crypto.randomUUID(),
          name: email,
          displayName: username,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        timeout: 60000,
        attestation: "direct",
        authenticatorSelection: {
          residentKey: "required",
          userVerification: "required",
        },
      },
    });

    const result = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username, credential }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (result.ok) {
      router.push("/admin");
    } else {
      const { message } = await result.json();
      setError(message);
    }
  };

  return (
    <Fragment>
      <h1>Register Account</h1>
      {isAvailable ? (
        <form method="POST" onSubmit={onSubmit}>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input type="submit" value="Register" />
          {error != null ? <pre>{error}</pre> : null}
        </form>
      ) : (
        <p>Sorry, webauthn is not available.</p>
      )}
    </Fragment>
  );
}

export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
  if (isLoggedIn(req)) {
    return {
      redirect: {
        destination: "/admin",
        permanent: false,
      },
    };
  }

  const challenge = generateChallenge();
  req.session.challenge = challenge;
  await req.session.save();

  return { props: { challenge } };
},
sessionOptions);
