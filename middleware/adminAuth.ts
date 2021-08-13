import * as jwt from "jsonwebtoken";
import { resError } from "../Helpers/tools";
import { prisma } from "../index";

let adminAuth: any;
export default adminAuth = async (req, res, next): Promise<object> => {
  const token = req.headers.token;
  //if no token
  if (!token) return resError(res, "Token is required");
  let payload: any;
  // decrypt the token
  try {
    payload = jwt.verify(token, process.env.JWTSECRET);
  } catch (error) {
    return resError(res, "invalid token");
  }
  try {
    let admin = await prisma.admin.findFirst({
      where: { id: payload.id, active: true },
    });
    if (!admin)
      return resError(res, "please complete the registeration process");
    req.admin = admin;
    return next();
  } catch (error) {
    return resError(res, error);
  }
};
