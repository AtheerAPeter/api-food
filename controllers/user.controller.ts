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

export default class UserController {
  static async register(req: Request, res: Response): Promise<object> {
    const body = req.body;
    let invalid = validate(body, Validator.register());
    if (invalid) return resError(res, parseErrors(invalid));
    try {
      const foundUser = await prisma.user.findFirst({
        where: { email: body.email },
      });
      if (foundUser) return resError(res, "User already exists");
      let hashedPass = await hashMe(body.password);

      let user: User = await prisma.user.create({
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

  static async login(req: Request, res: Response): Promise<object> {
    let body = req.body;
    const invalid = validate(body, Validator.login());
    if (invalid) return resError(res, parseErrors(invalid));
    try {
      const user: User = await prisma.user.findFirst({
        where: { email: body.email },
      });
      let validPassword = await comparePassword(body.password, user.password);
      if (!validPassword) return resError(res, "data is incorrect");

      const token = jwt.sign({ id: user.id }, process.env.JWTSECRET);

      user.password = "";
      return resData(res, { user, token });
    } catch (error) {
      console.log(error);
      return resError(res, "Error occured");
    }
  }

  static async getUser(req: Request, res: Response): Promise<object> {
    const id: number = parseInt(req.params.id, 10);

    try {
      const user: User = await prisma.user.findFirst({
        where: { id: id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          invoices: true,
        },
      });
      if (user) return resData(res, user);
      return resError(res, "user not found");
    } catch (error) {
      console.log(error);
      return resError(res, "Error occured");
    }
  }

  static async getAllUsers(req: Request, res: Response): Promise<object> {
    try {
      const users = await prisma.user.findMany();
      if (users) return resData(res, users);
    } catch (error) {
      console.log(error);
      resError(res, "Error Occured");
    }
  }
}
