import prisma from "./database";
import type {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
} from "@simplewebauthn/server";
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  PublicKeyCredentialWithAssertionJSON,
  PublicKeyCredentialWithAttestationJSON,
} from "@github/webauthn-json";
import crypto from "crypto";
import { GetServerSidePropsContext, NextApiRequest } from "next";

type SessionRequest = NextApiRequest | GetServerSidePropsContext["req"];

const HOST_SETTINGS = {
  expectedOrigin: process.env.VERCEL_URL ?? "http://localhost:3000",
  expectedRPID: process.env.RPID ?? "localhost",
};

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function binaryToBase64url(bytes: Uint8Array) {
  let str = "";

  bytes.forEach((charCode) => {
    str += String.fromCharCode(charCode);
  });

  return btoa(str);
}

export function generateChallenge() {
  return clean(crypto.randomBytes(32).toString("base64"));
}

export function isLoggedIn(request: SessionRequest) {
  return request.session.userId != null;
}

export async function register(request: NextApiRequest) {
  const challenge = request.session.challenge ?? "";
  const credential = request.body
    .credential as PublicKeyCredentialWithAttestationJSON;
  const { email, username } = request.body;

  let verification: VerifiedRegistrationResponse;

  if (credential == null) {
    throw new Error("Invalid Credentials");
  }

  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }

  if (!verification.verified) {
    throw new Error("Registration verification failed");
  }

  const { credentialID, credentialPublicKey } =
    verification.registrationInfo ?? {};

  if (credentialID == null || credentialPublicKey == null) {
    throw new Error("Registration failed");
  }

  const user = await prisma.user.create({
    data: {
      email,
      username,
      credentials: {
        create: {
          externalId: clean(binaryToBase64url(credentialID)),
          publicKey: Buffer.from(credentialPublicKey),
        },
      },
    },
  });

  console.log(`Registered new user ${user.id}`);
  return user;
}

export async function login(request: NextApiRequest) {
  const challenge = request.session.challenge ?? "";
  const credential = request.body
    .credential as PublicKeyCredentialWithAssertionJSON;
  const email = request.body.email;

  if (credential?.id == null) {
    throw new Error("Invalid Credentials");
  }

  const userCredential = await prisma.credential.findUnique({
    select: {
      id: true,
      userId: true,
      externalId: true,
      publicKey: true,
      signCount: true,
      user: {
        select: {
          email: true,
        },
      },
    },
    where: {
      externalId: credential.id,
    },
  });

  if (userCredential == null) {
    throw new Error("Unknown User");
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      authenticator: {
        credentialID: userCredential.externalId,
        credentialPublicKey: userCredential.publicKey,
        counter: userCredential.signCount,
      },
      ...HOST_SETTINGS,
    });

    await prisma.credential.update({
      data: {
        signCount: verification.authenticationInfo.newCounter,
      },
      where: {
        id: userCredential.id,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }

  if (!verification.verified || email !== userCredential.user.email) {
    throw new Error("Login verification failed");
  }

  console.log(`Logged in as user ${userCredential.userId}`);
  return userCredential.userId;
}
