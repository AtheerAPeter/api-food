import { Request, Response } from "express";
import { prisma } from "../index";
import {
  comparePassword,
  hashMe,
  parseErrors,
  resData,
  resError,
} from "../Helpers/tools";
import Validator from "../Helpers/validators";
import validate from "validate.js";
import * as jwt from "jsonwebtoken";
import { User } from "./types";

export default class AdminController {
  static async createAccount(req: Request, res: Response): Promise<object> {
    const body = req.body;
    let invalid = validate(body, Validator.register());
    if (invalid) return resError(res, parseErrors(invalid));
    try {
      const foundUser = await prisma.admin.findFirst({
        where: { email: body.email },
      });
      if (foundUser) return resError(res, "Admin already exists");
      let hashedPass = await hashMe(body.password);

      let user: User = await prisma.admin.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPass,
        },
      });
      const token = jwt.sign({ id: user.id }, process.env.JWTSECRET);

      user.password = "";
      return resData(res, { user, token });
    } catch (error) {
      console.log(error);

      return resError(res, "Error occured");
    }
  }

  static async getAll(req: Request, res: Response): Promise<object> {
    try {
      const admins = await prisma.admin.findMany({ where: { active: true } });
      if (admins) return resData(res, admins);

      return resError(res, "error occured");
    } catch (error) {
      console.log(error);
      return resError(res, "error occured");
    }
  }

  static async login(req: Request, res: Response): Promise<object> {
    let body = req.body;

    const invalid = validate(body, Validator.login());
    if (invalid) return resError(res, parseErrors(invalid));
    try {
      const admin: User = await prisma.admin.findFirst({
        where: { email: body.email },
      });
      if (!admin) return resError(res, "Admin does not exist");
      let validPassword = await comparePassword(body.password, admin.password);
      if (!validPassword) return resError(res, "data is incorrect");

      const token = jwt.sign({ id: admin.id }, process.env.JWTSECRET);

      admin.password = "";
      return resData(res, { admin, token });
    } catch (error) {
      console.log(error);
      return resError(res, "Error occured");
    }
  }
}
