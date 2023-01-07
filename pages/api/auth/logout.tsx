import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../../lib/session";
import { NextApiRequest, NextApiResponse } from "next";

function handler(request: NextApiRequest, response: NextApiResponse) {
  request.session.destroy();
  response.setHeader("location", "/");
  response.statusCode = 302;
  response.end();
}

export default withIronSessionApiRoute(handler, sessionOptions);
