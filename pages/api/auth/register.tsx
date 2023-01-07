import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../../lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { register } from "../../../lib/auth";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const user = await register(request);
    request.session.userId = user.id;
    await request.session.save();

    response.json({ userId: user.id });
  } catch (error: unknown) {
    console.error((error as Error).message);
    response.status(500).json({ message: (error as Error).message });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
