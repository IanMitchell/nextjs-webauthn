import { Fragment } from "react";
import Link from "next/link";

export default function Home() {
  return (
    <Fragment>
      <h1>Next.js Webauthn Demo</h1>
      <ul>
        <li>
          <Link href="/register">Register</Link>
        </li>
        <li>
          <Link href="/login">Login</Link>
        </li>
      </ul>
      <p>
        <a href="https://ianmitchell.dev/blog/nextjs-and-webauthn">
          Learn More
        </a>
      </p>
    </Fragment>
  );
}
