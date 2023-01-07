import { withIronSessionSsr } from "iron-session/next";
import { InferGetServerSidePropsType } from "next";
import { Fragment } from "react";
import { isLoggedIn } from "../../lib/auth";
import { sessionOptions } from "../../lib/session";

export default function Admin({
  userId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Fragment>
      <h1>Admin</h1>
      <span>User ID: {userId}</span>
      <form method="POST" action="/api/auth/logout">
        <button>Logout</button>
      </form>
    </Fragment>
  );
}

export const getServerSideProps = withIronSessionSsr(
  async ({ req: request, res: response }) => {
    if (!isLoggedIn(request)) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    return {
      props: {
        userId: request.session.userId ?? null,
      },
    };
  },
  sessionOptions
);
