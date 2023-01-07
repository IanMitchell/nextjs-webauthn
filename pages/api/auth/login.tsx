import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../../lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { login } from "../../../lib/auth";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const userId = await login(request);
    request.session.userId = userId;
    await request.session.save();

    response.json(userId);
  } catch (error) {
    response.status(500).json({ message: (error as Error).message });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
